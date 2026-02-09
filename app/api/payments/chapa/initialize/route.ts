import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

export async function POST(req: Request) {
  const auth = await requireAuth("USER");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { orderId } = body;

    // 1) Find order + items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true },
    });

    if (!order || order.userId !== auth.user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 2) Calculate total
    const total = order.items.reduce((sum, item) => {
      return sum + Number(item.price) * item.quantity;
    }, 0);

    if (total <= 0) {
      return NextResponse.json({ error: "Invalid total" }, { status: 400 });
    }

    // 3) Create tx_ref
    const txRef = `order_${order.id}_${Date.now()}`;

    // 4) Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        userId: auth.user.id,
        txRef,
        amount: total,
        currency: "ETB",
        status: "PENDING",
      },
    });

    // 5) Call Chapa initialize
    const chapaRes = await fetch("https://api.chapa.co/v1/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: total.toFixed(2),
        currency: "ETB",
        email: order.user.email,
        first_name: "Customer",
        last_name: "User",
        tx_ref: txRef,

        // where Chapa redirects user after payment
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/chapa/return?tx_ref=${txRef}`,

        // optional: webhook (we can add later)
        // callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/chapa/webhook`,
      }),
    });

    const chapaData = await chapaRes.json();

    if (!chapaRes.ok) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          chapaRaw: chapaData,
        },
      });

      return NextResponse.json(
        { error: chapaData?.message || "Chapa initialize failed" },
        { status: 400 }
      );
    }

    // 6) Save checkout url
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        checkoutUrl: chapaData.data.checkout_url,
        chapaRaw: chapaData,
      },
    });

    return NextResponse.json({
      checkoutUrl: chapaData.data.checkout_url,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
