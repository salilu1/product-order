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

    const productIds = items.map((i) => i.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "ACTIVE" },
    });

    if (products.length !== items.length) {
      return NextResponse.json(
        { error: "Some products are invalid or inactive" },
        { status: 400 }
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      const orderItems = items.map((i) => {
        const product = products.find((p) => p.id === i.productId)!;

        if (i.quantity > product.stock) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        return {
          productId: product.id,
          quantity: i.quantity,
          price: product.price,
        };
      });

      const order = await tx.order.create({
        data: {
          userId: auth.user.id,
          items: { create: orderItems },
        },
        include: {
          items: { include: { product: true } },
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

// 📦 GET ORDERS — USER: own orders; ADMIN: all orders
export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const isAdmin = auth.user.role === "ADMIN";

  const orders = await prisma.order.findMany({
    where: isAdmin ? {} : { userId: auth.user.id },
    include: {
      items: { include: { product: true } },
      user: isAdmin ? true : undefined, // include user info only for admin
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

// ⚡ UPDATE ORDER STATUS — Admin or user cancel pending orders
export async function PUT(req: Request) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const { orderId, status } = body;

  const validStatuses = ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"];
  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // USER restrictions
  if (auth.user.role !== "ADMIN") {
    if (order.userId !== auth.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (status !== "CANCELLED" || order.status !== "PENDING") {
      return NextResponse.json(
        { error: "Cannot update this order" },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  return NextResponse.json(updated);
}
