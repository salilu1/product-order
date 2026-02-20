import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const txRef = url.searchParams.get("tx_ref");

    if (!txRef) {
      return NextResponse.json({ error: "Missing tx_ref" }, { status: 400 });
    }

    // Find payment + order + items
    const payment = await prisma.payment.findUnique({
      where: { txRef },
      include: { order: { include: { items: true } } },
    });

    if (!payment) {
      return NextResponse.json({
        status: "FAILED",
        error: "Payment not found",
      });
    }

    // Already verified
    if (payment.status === "SUCCESS") {
      return NextResponse.json({ status: "SUCCESS" });
    }

    // Verify with Chapa
    const chapaRes = await fetch(
      `https://api.chapa.co/v1/transaction/verify/${txRef}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      },
    );

    const chapaData = await chapaRes.json();
    const chapaStatus = chapaData?.data?.status;
    const chapaAmount = Number(chapaData?.data?.amount || 0);

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

    // Failed verification
    if (!chapaRes.ok || chapaStatus !== "success") {
      await failPayment(chapaData?.message || "Verification failed");
      return NextResponse.json({ status: "FAILED" });
    }

    // Validate amount
    const expectedTotal = payment.order.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );

    if (Math.abs(chapaAmount - expectedTotal) > 0.01) {
      await failPayment("Amount mismatch. Payment rejected.");
      return NextResponse.json({ status: "FAILED" });
    }

    // Success: update payment + order + decrement stock
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCESS",
          verifiedAt: new Date(),
          chapaTxnId: chapaData?.data?.id?.toString() || null,
          chapaRaw: chapaData,
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: "PROCESSING" },
      });

      for (const item of payment.order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    });

    return NextResponse.json({ status: "SUCCESS" });
  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return NextResponse.json({ status: "FAILED", error: "Server error" });
  }
}
