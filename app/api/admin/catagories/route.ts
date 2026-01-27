import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { createCategorySchema } from "@/lib/validators/catagory";
import { requireAuth } from "@/lib/rbac";

// 🔓 Public: list categories
export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(categories);
}

// 🔐 Admin only: create category
export async function POST(req: Request) {
  // 🔒 RBAC CHECK
  const auth = await requireAuth("ADMIN");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const data = createCategorySchema.parse(body);

    const slug = slugify(data.name);

    const exists = await prisma.category.findUnique({
      where: { slug },
    });

    if (exists) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        status: data.status ?? "ACTIVE",
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Invalid input" },
      { status: 400 }
    );
  }
}
