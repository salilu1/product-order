import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateProductSchema } from "@/lib/validators/product";
import { requireAuth } from "@/lib/rbac";
import fs from "fs/promises";
import path from "path";

type RouteProps = {
  params: Promise<{ id: string }>;
};

// ✅ GET single product
export async function GET(_: Request, { params }: RouteProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

// ✅ PUT update product (Admin only)
export async function PUT(req: Request, { params }: RouteProps) {
  const auth = await requireAuth("ADMIN");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    const formData = await req.formData();
    
    // Extract data from FormData
    const name = formData.get("name") as string | null;
    const description = formData.get("description") as string | null;
    const price = formData.get("price") ? Number(formData.get("price")) : undefined;
    const stock = formData.get("stock") ? Number(formData.get("stock")) : undefined;
    const categoryId = formData.get("categoryId") as string | null;
    const image = formData.get("image") as File | null;

    // Validate with Zod (allow partial updates)
    const validatedData = updateProductSchema.parse({
      ...(name && { name }),
      ...(description && { description }),
      ...(price !== undefined && { price }),
      ...(stock !== undefined && { stock }),
      ...(categoryId && { categoryId }),
    });

    // If category is being updated, check if it's active
    if (validatedData.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: validatedData.categoryId, status: "ACTIVE" },
      });
      if (!category) {
        return NextResponse.json({ error: "Inactive category" }, { status: 400 });
      }
    }

    // Prepare update payload
    let updatePayload: any = { ...validatedData };

    // Handle image update if a new file was provided
    if (image && typeof image !== "string" && image.size > 0) {
      const uploadsDir = path.join(process.cwd(), "public/uploads");
      await fs.mkdir(uploadsDir, { recursive: true });

      const filename = `${Date.now()}_${image.name}`;
      const filePath = path.join(uploadsDir, filename);
      
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await fs.writeFile(filePath, buffer);

      updatePayload.imageUrl = `/uploads/${filename}`;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updatePayload,
      include: { category: true },
    });

    return NextResponse.json(updatedProduct);
  } catch (e: any) {
    console.error("UPDATE ERROR:", e);
    return NextResponse.json({ error: e.message || "Update failed" }, { status: 400 });
  }
}

// ✅ DELETE product (Admin only)
export async function DELETE(_: Request, { params }: RouteProps) {
  const auth = await requireAuth("ADMIN");
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    // Optional: You might want to delete the actual image file from /public/uploads here too
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}