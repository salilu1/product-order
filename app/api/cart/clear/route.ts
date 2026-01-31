// app/api/cart/clear/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

export async function POST() {
  const auth = await requireAuth("USER");
  if (auth instanceof NextResponse) return auth;

  try {
    // find the user's cart
    const cart = await prisma.cart.findUnique({ where: { userId: auth.user.id } });
    if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });

    // delete all cart items
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    // return empty cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true } } },
    });

    return NextResponse.json(updatedCart);
  } catch (err) {
    console.error("Clear cart error:", err);
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 });
  }
}
