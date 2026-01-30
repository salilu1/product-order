import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { updateCategorySchema } from "@/lib/validators/catagory";
import { requireAuth } from "@/lib/rbac";

// Corrected Type for Next.js 15/16
type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const auth = await requireAuth("ADMIN");
  if (auth instanceof NextResponse) return auth;

  // 1. Await params
  const { id } = await params; 

  try {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("GET CATEGORY ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteProps) {
  const auth = await requireAuth("ADMIN");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    const body = await req.json();
    const data = updateCategorySchema.parse(body);

    const updateData: any = { ...data };
    if (data.name) updateData.slug = slugify(data.name);

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("UPDATE CATEGORY ERROR:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: RouteProps) {
  const auth = await requireAuth("ADMIN");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    // Check for existing products
    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      return NextResponse.json(
        { error: "Category has products. Delete or reassign them first." },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}