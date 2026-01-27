import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createProductSchema } from "@/lib/validators/product";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import { requireAuth } from "@/lib/rbac";

// Disable body parser for file upload
export const config = {
  api: { bodyParser: false },
};

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
  // 🔒 RBAC CHECK FIRST
  const auth = await requireAuth("ADMIN");
  if (auth instanceof NextResponse) return auth;

  const form = new IncomingForm({ multiples: false });

  return new Promise((resolve) => {
    form.parse(req as any, async (err, fields, files) => {
      if (err) {
        return resolve(
          NextResponse.json({ error: "Upload failed" }, { status: 400 })
        );
      }

      try {
        const data = createProductSchema.parse({
          ...fields,
          price: Number(fields.price),
          stock: Number(fields.stock),
        });

        // ✅ Ensure category is ACTIVE
        const category = await prisma.category.findFirst({
          where: {
            id: data.categoryId,
            status: "ACTIVE",
          },
        });

        if (!category) {
          return resolve(
            NextResponse.json(
              { error: "Category is inactive or not found" },
              { status: 400 }
            )
          );
        }

        // 🖼 Image upload
        const imageFile = files.image as any;
        if (!imageFile) {
          return resolve(
            NextResponse.json(
              { error: "Image file is required" },
              { status: 400 }
            )
          );
        }

        const uploadsDir = path.join(process.cwd(), "public/uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filename = `${Date.now()}_${imageFile.originalFilename}`;
        const filePath = path.join(uploadsDir, filename);

        fs.copyFileSync(imageFile.filepath, filePath);

        // 📦 Create product
        const product = await prisma.product.create({
          data: {
            ...data,
            imageUrl: `/uploads/${filename}`,
          },
        });

        resolve(NextResponse.json(product, { status: 201 }));
      } catch (e) {
        console.error(e);
        resolve(
          NextResponse.json({ error: "Invalid input" }, { status: 400 })
        );
      }
    });
  });
}
