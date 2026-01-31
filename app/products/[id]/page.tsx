import { prisma } from "@/lib/prisma";
import { notFound} from "next/navigation";
import Link from "next/link";
import AddToCartSection from "./components/AddToCartSection"; // Make sure path is correct

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  // 1. Fetch current product and its category
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) notFound();

  // 2. Fetch related products (same category, excluding current product)
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: id },
      status: "ACTIVE" as any,
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  const price = Number(product.price);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <Link
        href="/"
        className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-2 mb-8 transition-colors"
      >
        ← Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        {/* Product Image */}
        <div className="rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover aspect-square hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-center">
          <span className="text-blue-600 font-bold tracking-widest text-xs uppercase mb-2">
            {product.category.name}
          </span>
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
            {product.name}
          </h1>

          <div className="text-3xl font-bold text-slate-900 mb-6">
            ${price.toFixed(2)}
          </div>

          <div className="prose prose-slate mb-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">
              Description
            </h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              {product.description}
            </p>
          </div>

          <div className="flex items-center gap-4 py-6 border-t border-gray-100">
            <div
              className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                product.stock > 0
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {product.stock > 0
                ? `In Stock (${product.stock})`
                : "Out of Stock"}
            </div>
          </div>

          {/* ✅ AddToCartSection with all required props */}
          <AddToCartSection
            productId={product.id}
            name={product.name}
            price={price}
            stock={product.stock}
            imageUrl={product.imageUrl}
          />
        </div>
      </div>

      {/* --- RELATED PRODUCTS SECTION --- */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-gray-100 pt-16">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Related Products
              </h2>
              <p className="text-gray-500">
                More from the {product.category.name} category
              </p>
            </div>
            <Link
              href={`/?categoryId=${product.categoryId}`}
              className="text-sm font-bold text-blue-600 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((item) => (
              <Link key={item.id} href={`/products/${item.id}`} className="group">
                <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4 border border-gray-50">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors truncate">
                  {item.name}
                </h3>
                <p className="text-slate-500 font-bold mt-1">
                  ${Number(item.price).toFixed(2)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
