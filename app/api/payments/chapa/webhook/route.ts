import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const txRef = body?.tx_ref;
    if (!txRef) {
      return NextResponse.json({ error: "Missing tx_ref" }, { status: 400 });
    }
    console.log("WEBHOOK CALLED");
    console.log("BODY:", body);

    // Find payment
    const payment = await prisma.payment.findUnique({
      where: { txRef },
      include: { order: { include: { items: true } } },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Idempotent safety
    if (payment.status === "SUCCESS") {
      return NextResponse.json({ success: true });
    }

    // 🔐 Verify with Chapa directly (never trust webhook alone)
    const verifyRes = await fetch(
      `https://api.chapa.co/v1/transaction/verify/${txRef}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      },
    );

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || verifyData?.data?.status !== "success") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", chapaRaw: verifyData },
      });

      return NextResponse.json({ success: false });
    }

    // Validate amount
    const expectedTotal = payment.order.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );

    const chapaAmount = Number(verifyData?.data?.amount || 0);

    if (Math.abs(chapaAmount - expectedTotal) > 0.01) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", failureReason: "Amount mismatch" },
      });

      return NextResponse.json({ success: false });
    }

    // ✅ Everything valid → Update inside transaction
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCESS",
          verifiedAt: new Date(),
          chapaTxnId: verifyData?.data?.id?.toString() || null,
          chapaRaw: verifyData,
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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("WEBHOOK ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
