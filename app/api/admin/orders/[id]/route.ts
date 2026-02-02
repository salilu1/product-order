import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

const VALID_STATUSES = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
];

// 🔐 ADMIN — Fetch current order status for the edit form
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Params is a Promise in Next.js 15
) {
  const auth = await requireAuth("ADMIN");
  if (auth instanceof Response) return auth;

  const { id } = await params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      select: { 
        id: true,
        status: true 
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 🔐 ADMIN — Update order status
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Params is a Promise in Next.js 15
) {
  const auth = await requireAuth("ADMIN");
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const { status } = await req.json();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "Invalid status" },
      { status: 400 }
    );
  }

  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}