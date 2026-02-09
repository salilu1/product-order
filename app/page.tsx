import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SearchInput from "./components/SearchInput"; // Create this in your components folder

type SearchParams = Promise<{
  search?: string;
  categoryId?: string;
  page?: string;
}>;

export default async function Home(props: { searchParams: SearchParams }) {
  const search = await props.searchParams;
  const currentPage = Number(search.page) || 1;
  const pageSize = 6;

  // 1. Build Query
 const where = {
  status: "ACTIVE" as any,
  ...(search.search && {
    OR: [
      { name: { contains: search.search } }, // Removed mode: 'insensitive'
      { description: { contains: search.search } } // Removed mode: 'insensitive'
    ]
  }),
  ...(search.categoryId && { categoryId: search.categoryId }),
};

  // 2. Fetch Data
  const [rawProducts, totalCount, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ where: { status: "ACTIVE" } }),
  ]);

  const products = rawProducts.map(p => ({ ...p, price: Number(p.price) }));
  const lastPage = Math.ceil(totalCount / pageSize);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* SIDEBAR */}
        <aside className="w-full lg:w-72 space-y-8">
          <section>
            <h3 className="text-sm font-bold text-gray-400 tracking-widest mb-4 uppercase">Search</h3>
            <SearchInput />
          </section>

          <section>
            <h3 className="text-sm font-bold text-gray-400 tracking-widest mb-4 uppercase">Categories</h3>
            <div className="flex flex-wrap lg:flex-col gap-2">
              <Link href="/" className={`px-4 py-2 rounded-xl text-sm transition ${!search.categoryId ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200'}`}>
                All Products
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/?categoryId=${cat.id}`}
                  className={`px-4 py-2 rounded-xl text-sm transition ${search.categoryId === cat.id ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </section>
        </aside>

        {/* PRODUCT GRID */}
        <main className="flex-1">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-blue-600">Featured Store</h1>
            <p className="text-gray-500 mt-1">Found {totalCount} items</p>
          </div>

          {products.length === 0 ? (
            <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed">
              <p className="text-gray-400">No products found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link href={`/products/${product.id}`} key={product.id} className="group">
                  <div className="bg-white rounded-2xl border border-gray-100 p-3 hover:shadow-2xl transition-all duration-300">
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4">
                      <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover group-hover:scale-110 transition-duration-500" />
                    </div>
                    <h2 className="font-bold text-slate-900 line-clamp-1">{product.name}</h2>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-lg font-bold text-blue-600">${product.price.toFixed(2)}</span>
                      <span className="text-xs text-gray-400">{product.category.name}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {lastPage > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              {Array.from({ length: lastPage }, (_, i) => (
                <Link
                  key={i}
                  href={`/?page=${i + 1}${search.categoryId ? `&categoryId=${search.categoryId}` : ''}${search.search ? `&search=${search.search}` : ''}`}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold ${currentPage === i + 1 ? 'bg-slate-900 text-white' : 'bg-gray-100'}`}
                >
                  {i + 1}
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}