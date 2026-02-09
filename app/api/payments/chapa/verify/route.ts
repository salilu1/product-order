import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const txRef = url.searchParams.get("tx_ref");

    if (!txRef) {
      return NextResponse.json({ error: "Missing tx_ref" }, { status: 400 });
    }

    // 1) find payment
    const payment = await prisma.payment.findUnique({
      where: { txRef },
      include: { order: true },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // 2) verify with Chapa
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

    if (!chapaRes.ok) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          chapaRaw: chapaData,
        },
      });

      return NextResponse.json({ error: "Verification failed" }, { status: 400 });
    }

    const status = chapaData?.data?.status; // usually "success"

    if (status === "success") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCESS",
          chapaTxnId: chapaData?.data?.id?.toString(),
          chapaRaw: chapaData,
        },
      });

      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: "PROCESSING",
        },
      });

      return NextResponse.json({ success: true });
    }

    // not successful
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        chapaRaw: chapaData,
      },
    });

    return NextResponse.json({ success: false });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
