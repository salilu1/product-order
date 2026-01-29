// app/page.tsx

type SearchParams = {
  search?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: {
    id: string;
    name: string;
  };
};

type ProductsResponse = {
  data: Product[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
};

async function getProducts(
  searchParams: SearchParams
): Promise<ProductsResponse> {
  const params = new URLSearchParams();

  if (searchParams.search) params.set("search", searchParams.search);
  if (searchParams.categoryId) params.set("categoryId", searchParams.categoryId);
  if (searchParams.minPrice) params.set("minPrice", searchParams.minPrice);
  if (searchParams.maxPrice) params.set("maxPrice", searchParams.maxPrice);
  if (searchParams.sort) params.set("sort", searchParams.sort);
  if (searchParams.page) params.set("page", searchParams.page);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products?${params.toString()}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
}

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  let products: Product[] = [];
  let meta = { total: 0, page: 1, lastPage: 1 };

  try {
    const res = await getProducts(searchParams);
    products = res.data || [];
    meta = res.meta || meta;
  } catch (err) {
    console.error("Failed to fetch products:", err);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      {/* Product Grid */}
      {products.length === 0 ? (
        <p className="text-gray-500">No products available yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-4 hover:shadow-md transition"
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-40 w-full object-cover rounded mb-3"
              />
              <h2 className="font-semibold text-lg">{product.name}</h2>
              <p className="text-gray-600 text-sm mb-1">
                {product.category.name}
              </p>
              <p className="font-bold">${product.price}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.lastPage > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <a
            href={`/?page=${Math.max(meta.page - 1, 1)}`}
            className={`px-4 py-2 border rounded ${
              meta.page === 1
                ? "pointer-events-none opacity-50"
                : "hover:bg-gray-100"
            }`}
          >
            Previous
          </a>

          <span className="text-sm text-gray-600">
            Page {meta.page} of {meta.lastPage}
          </span>

          <a
            href={`/?page=${Math.min(meta.page + 1, meta.lastPage)}`}
            className={`px-4 py-2 border rounded ${
              meta.page === meta.lastPage
                ? "pointer-events-none opacity-50"
                : "hover:bg-gray-100"
            }`}
          >
            Next
          </a>
        </div>
      )}
    </div>
  );
}

