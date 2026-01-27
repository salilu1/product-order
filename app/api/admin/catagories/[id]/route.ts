import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { updateCategorySchema } from "@/lib/validators/catagory";
import { requireAuth } from "@/lib/rbac";

type Params = {
  params: { id: string };
};

// 🔐 ADMIN ONLY — Update category
export async function PUT(req: Request, { params }: Params) {
  const auth = await requireAuth("ADMIN");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const data = updateCategorySchema.parse(body);

    const updateData: any = { ...data };

    if (data.name) {
      updateData.slug = slugify(data.name);
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Update failed" },
      { status: 400 }
    );
  }
}

// 🔐 ADMIN ONLY — Delete category
export async function DELETE(_: Request, { params }: Params) {
  const auth = await requireAuth("ADMIN");
  if (auth instanceof NextResponse) return auth;

  // ❗ Prevent deleting category with products
  const productCount = await prisma.product.count({
    where: { categoryId: params.id },
  });

  if (productCount > 0) {
    return NextResponse.json(
      { error: "Category has products" },
      { status: 409 }
    );
  }

  await prisma.category.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ message: "Category deleted" });
}
