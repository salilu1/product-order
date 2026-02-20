import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const txRef = searchParams.get("tx_ref");

  const payment = await prisma.payment.findUnique({
    where: { txRef: txRef ?? undefined },
  });

  if (!payment) return NextResponse.json({ status: "NOT_FOUND" });

  // If DB already says SUCCESS, return immediately (Fastest path)
  if (payment.status === "SUCCESS") {
    return NextResponse.json({ status: "SUCCESS" });
  }

  // If it's still PENDING, don't wait for the webhook!
  // Call Chapa's verify endpoint directly from here.
  const verifyRes = await fetch(
    `https://api.chapa.co/v1/transaction/verify/${txRef}`,
    {
      headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
    },
  );

  const verifyData = await verifyRes.json();

  if (verifyData?.data?.status === "success") {
    // Optional: Trigger your internal "success" logic here too
    // to ensure the DB is updated even if the webhook fails.
    return NextResponse.json({ status: "SUCCESS" });
  }

  return NextResponse.json({ status: "PENDING" });
}
