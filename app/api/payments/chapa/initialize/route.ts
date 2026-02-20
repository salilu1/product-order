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

    // 3) Create tx_ref (<= 50 chars)
    const txRef = `ord_${order.id.slice(0, 8)}_${Date.now()}`;

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

    // 5) Call Chapa initialize (with timeout)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 100000);

    const chapaRes = await fetch(
      "https://api.chapa.co/v1/transaction/initialize",
      {
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

          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/chapa/return?tx_ref=${txRef}`,
        }),
        signal: controller.signal,
      },
    );

    clearTimeout(timeout);

    // 6) Read body ONCE
    const chapaText = await chapaRes.text();

    let chapaData: any = null;
    try {
      chapaData = chapaText ? JSON.parse(chapaText) : null;
    } catch {
      chapaData = { raw: chapaText };
    }

    console.log("CHAPA STATUS:", chapaRes.status);
    console.log("CHAPA BODY:", chapaData);

    // 7) Handle Chapa failure
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
        { status: 400 },
      );
    }

    // 8) Save checkout url
    const checkoutUrl = chapaData?.data?.checkout_url;

    if (!checkoutUrl) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          chapaRaw: chapaData,
        },
      });

      return NextResponse.json(
        { error: "Chapa did not return checkout_url" },
        { status: 400 },
      );
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        checkoutUrl,
        chapaRaw: chapaData,
      },
    });

    return NextResponse.json({ checkoutUrl });
  } catch (err: any) {
    console.error("CHAPA INIT ERROR:", err);

    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 },
    );
  }
}
