import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateProductSchema } from "@/lib/validators/product";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";

export const config = { api: { bodyParser: false } };

type Params = { params: { id: string } };

export async function GET(_: Request, { params }: Params) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(req: Request, { params }: Params) {
  const form = new IncomingForm({ multiples: false });

  return new Promise((resolve) => {
    form.parse(req as any, async (err, fields, files) => {
      if (err) {
        return resolve(NextResponse.json({ error: "Upload failed" }, { status: 400 }));
      }

      try {
        const data = updateProductSchema.parse({
          ...fields,
          price: fields.price ? Number(fields.price) : undefined,
          stock: fields.stock ? Number(fields.stock) : undefined,
        });

        // If category updated, ensure ACTIVE
        if (data.categoryId) {
          const category = await prisma.category.findFirst({
            where: { id: data.categoryId, status: "ACTIVE" },
          });
          if (!category) {
            return resolve(
              NextResponse.json({ error: "Inactive category" }, { status: 400 })
            );
          }
        }

        // Handle image update
        if (files.image) {
          const imageFile = files.image as any;
          const uploadsDir = path.join(process.cwd(), "public/uploads");
          if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
          const filename = `${Date.now()}_${imageFile.originalFilename}`;
          const filePath = path.join(uploadsDir, filename);
          fs.copyFileSync(imageFile.filepath, filePath);
          (data as any).imageUrl = `/uploads/${filename}`;
        }

        const product = await prisma.product.update({
          where: { id: params.id },
          data,
        });

        resolve(NextResponse.json(product));
      } catch (e) {
        console.error(e);
        resolve(NextResponse.json({ error: "Update failed" }, { status: 400 }));
      }
    });
  });
}

export async function DELETE(_: Request, { params }: Params) {
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Product deleted" });
}
