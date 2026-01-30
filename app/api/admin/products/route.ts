import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createProductSchema } from "@/lib/validators/product";
import fs from "fs/promises";
import path from "path";
import { requireAuth } from "@/lib/rbac";


// 🔓 Optional: Admin product list
export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

// 🔐 Admin only
export async function POST(req: Request) {
  const auth = await requireAuth("ADMIN");
  if (auth instanceof NextResponse) return auth;

  try {
    // 2. Use native formData() instead of formidable
    const formData = await req.formData();
    
    // Extract fields
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));
    const stock = Number(formData.get("stock"));
    const categoryId = formData.get("categoryId") as string;
    const image = formData.get("image") as File;

    // 3. Validate with Zod
    const data = createProductSchema.parse({
      name,
      description,
      price,
      stock,
      categoryId,
    });

    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, status: "ACTIVE" },
    });

    if (!category) {
      return NextResponse.json({ error: "Category is inactive or not found" }, { status: 400 });
    }

    if (!image || typeof image === "string") {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    // 4. Handle Image Saving
    const uploadsDir = path.join(process.cwd(), "public/uploads");
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    const filename = `${Date.now()}_${image.name}`;
    const filePath = path.join(uploadsDir, filename);
    
    // Convert File to Buffer and save
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(filePath, buffer);

    // 5. Create Product
    const product = await prisma.product.create({
      data: {
        ...data,
        imageUrl: `/uploads/${filename}`,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (e: any) {
    console.error("UPLOAD ERROR:", e);
    return NextResponse.json({ error: e.message || "Invalid input" }, { status: 400 });
  }
}
