import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { createOrderSchema } from "@/lib/validators/order";

// 🛒 CREATE ORDER — USER ONLY
export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  if (auth.user.role !== "USER") {
    return NextResponse.json(
      { error: "Only users can create orders" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { items } = createOrderSchema.parse(body);

    const productIds = items.map(i => i.productId);

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: "ACTIVE",
      },
    });

    if (products.length !== items.length) {
      return NextResponse.json(
        { error: "Some products are invalid or inactive" },
        { status: 400 }
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      const orderItems = items.map(i => {
        const product = products.find(p => p.id === i.productId)!;

        if (i.quantity > product.stock) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        return {
          productId: product.id,
          quantity: i.quantity,
          price: product.price, // snapshot price
        };
      });

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

      return order;
    });

    return NextResponse.json(order, { status: 201 });

  } catch (error: any) {
    console.error("ORDER CREATE ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Order creation failed" },
      { status: 400 }
    );
  }
}

// 📦 GET MY ORDERS — USER ONLY
export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  if (auth.user.role !== "USER") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403 }
    );
  }

  const orders = await prisma.order.findMany({
    where: { userId: auth.user.id },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
