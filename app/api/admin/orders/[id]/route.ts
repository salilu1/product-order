import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

const VALID_STATUSES = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
];

// 🔐 ADMIN — Update order status
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth("ADMIN");
  if (auth instanceof NextResponse) return auth;

  const { status } = await req.json();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "Invalid status" },
      { status: 400 }
    );
  }

  const order = await prisma.order.update({
    where: { id: params.id },
    data: { status },
  });

  return NextResponse.json(order);
}
