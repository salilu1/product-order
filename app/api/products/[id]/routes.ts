import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

export async function GET(_: Request, { params }: Params) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true },
  });

  if (!product || product.status !== "ACTIVE") {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}
