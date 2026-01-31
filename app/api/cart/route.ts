import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

// GET user's cart
export async function GET() {
  const auth = await requireAuth("USER");
  if (auth instanceof NextResponse) return auth;

  let cart = await prisma.cart.findUnique({
    where: { userId: auth.user.id },
    include: { items: { include: { product: true } } },
  });

  // create cart if not exists
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: auth.user.id },
      include: { items: { include: { product: true } } },
    });
  }

  return NextResponse.json(cart);
}

// POST add/update item in cart
export async function POST(req: Request) {
  const auth = await requireAuth("USER");
  if (auth instanceof NextResponse) return auth;

  const { productId, quantity } = await req.json();

  // fetch product for price & validation
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "ACTIVE") {
    return NextResponse.json({ error: "Product not found or inactive" }, { status: 404 });
  }

  // create cart if not exists
  let cart = await prisma.cart.findUnique({ where: { userId: auth.user.id } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: auth.user.id } });
  }

  // check if item exists in cart
  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (existingItem) {
    // update quantity
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    // create new cart item with price snapshot
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        price: product.price,
      },
    });
  }

  const updatedCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true } } },
  });

  return NextResponse.json(updatedCart);
}

// DELETE remove item from cart
export async function DELETE(req: Request) {
  const auth = await requireAuth("USER");
  if (auth instanceof NextResponse) return auth;

  const { productId } = await req.json();

  const cart = await prisma.cart.findUnique({ where: { userId: auth.user.id } });
  if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });

  // remove specific item
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, productId },
  });

  const updatedCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true } } },
  });

  return NextResponse.json(updatedCart);
}
