import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

// 🔐 ADMIN — Get all orders
export async function GET() {
  const auth = await requireAuth("ADMIN");
  if (auth instanceof NextResponse) return auth;

  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: { id: true, email: true },
      },
      items: {
        include: {
          product: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
