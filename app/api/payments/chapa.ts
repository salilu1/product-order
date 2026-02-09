// pages/api/payments/chapa.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { orderId, amount, email } = await req.json();

    // Create payment request
    const res = await fetch("https://api.chapa.co/v1/transaction/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount,
        currency: "ETB",
        email,
        first_name: "Customer",
        last_name: "",
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderId}/verify`,
        tx_ref: orderId,
      }),
    });

    const data = await res.json();

    if (!res.ok) return NextResponse.json({ error: data.message }, { status: 400 });

    // Return the checkout URL
    return NextResponse.json({ checkout_url: data.data.checkout_url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Payment initiation failed" }, { status: 500 });
  }
}
