import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || undefined;
    const categoryId = url.searchParams.get("categoryId") || undefined;
    const minPrice = Number(url.searchParams.get("minPrice") || 0);
    const maxPrice = Number(url.searchParams.get("maxPrice") || Infinity);

    // Pagination params
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 20);
    const skip = (page - 1) * limit;

    // Sorting
    const sort = url.searchParams.get("sort") || "newest"; // "price_asc", "price_desc", "newest"
    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    else if (sort === "price_desc") orderBy = { price: "desc" };

    // Prisma query
    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        name: search ? { contains: search } : undefined, // Prisma 6 + MySQL collation handles case-insensitive
        categoryId,
        price: { gte: minPrice, lte: maxPrice },
      },
      include: { category: true },
      orderBy,
      skip,
      take: limit,
    });

    // Total count for pagination
    const total = await prisma.product.count({
      where: {
        status: "ACTIVE",
        name: search ? { contains: search } : undefined,
        categoryId,
        price: { gte: minPrice, lte: maxPrice },
      },
    });

    return NextResponse.json({
      data: products,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
