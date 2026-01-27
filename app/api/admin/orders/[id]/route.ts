import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { z } from "zod";

type Params = { params: { id: string } };

const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"]),
});

export async function PATCH(req: Request, { params }: Params) {
  const auth = await requireAuth("ADMIN");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { status } = updateOrderStatusSchema.parse(body);

    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status },
      include: {
        items: {               // ✅ MATCHES SCHEMA
          include: { product: true },
        },
        user: true,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 400 }
    );
  }
}
