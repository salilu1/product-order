import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

export async function GET(req: Request) {
  const auth = await requireAuth("USER");
  if (auth instanceof NextResponse) return auth;

  try {
    const url = new URL(req.url);
    const txRef = url.searchParams.get("tx_ref");

    if (!txRef) {
      return NextResponse.json({ error: "Missing tx_ref" }, { status: 400 });
    }

    // 1) Find payment + order + items
    const payment = await prisma.payment.findUnique({
      where: { txRef },
      include: { order: { include: { items: true } } },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // 2) Security: user can only verify their own payment
    if (payment.userId !== auth.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 3) Idempotent: already successful
    if (payment.status === "SUCCESS") {
      return NextResponse.json({ success: true, alreadyVerified: true });
    }

    // 4) Verify with Chapa
    const chapaRes = await fetch(
      `https://api.chapa.co/v1/transaction/verify/${txRef}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      }
    );

    const chapaData = await chapaRes.json();
    const chapaStatus = chapaData?.data?.status;
    const chapaAmount = Number(chapaData?.data?.amount || 0);

    // Helper to fail payment + cancel order
    const failPayment = async (reason: string) => {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", failureReason: reason, chapaRaw: chapaData },
      });
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "CANCELLED" },
      });
    };

    // 5) Handle failed verification
    if (!chapaRes.ok || chapaStatus !== "success") {
      await failPayment(chapaData?.message || "Verification failed");
      return NextResponse.json({ success: false, message: "Payment failed" });
    }

    // 6) Validate amount
    const expectedTotal = payment.order.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    if (Math.abs(chapaAmount - expectedTotal) > 0.01) {
      await failPayment("Amount mismatch. Payment rejected.");
      return NextResponse.json({
        success: false,
        message: "Amount mismatch. Payment rejected.",
      });
    }

    // 7) Success: update payment + order + decrement stock
    await prisma.$transaction(async (tx) => {
      // Update payment
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCESS",
          verifiedAt: new Date(),
          chapaTxnId: chapaData?.data?.id?.toString() || null,
          chapaRaw: chapaData,
        },
      });

      // Update order
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: "PROCESSING" },
      });

      // Decrement stock
      for (const item of payment.order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
