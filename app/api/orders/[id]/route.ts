import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth-options"; // Adjusted path to be cleaner

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }, // Updated for Next.js 15
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Await the params
    const { id } = await params;

    const { status } = await req.json();

    // 2. Included "FAILED" in the validation list
    const validStatuses = [
      "PENDING",
      "PROCESSING",
      "COMPLETED",
      "CANCELLED",
      "FAILED",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id: id },
      data: { status },
      include: { items: { include: { product: true } }, user: true },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Order Update Error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}
