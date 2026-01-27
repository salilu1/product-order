import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { createOrderSchema } from "@/lib/validators/order";

export async function POST(req: Request) {
  const auth = await requireAuth("USER");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { items } = createOrderSchema.parse(body);

    const productIds = items.map(i => i.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "ACTIVE" },
    });

    if (products.length !== items.length) {
      return NextResponse.json(
        { error: "Some products are invalid or inactive" },
        { status: 400 }
      );
    }

    return await prisma.$transaction(async (tx) => {
      const orderItems = items.map(i => {
        const product = products.find(p => p.id === i.productId)!;

        if (i.quantity > product.stock) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        return {
          productId: product.id,
          quantity: i.quantity,
          price: product.price,
        };
      });

      // ✅ USE `items`, NOT `orderitem`
      const order = await tx.order.create({
        data: {
          userId: auth.user.id,
          items: { create: orderItems },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      // decrement stock
      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return NextResponse.json(order, { status: 201 });
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Order creation failed" },
      { status: 400 }
    );
  }
}

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const isAdmin = auth.user.role === "ADMIN";

  const orders = await prisma.order.findMany({
    where: isAdmin ? {} : { userId: auth.user.id },
    include: {
      items: {
        include: { product: true },
      },
      user: isAdmin,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
