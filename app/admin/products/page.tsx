import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

export default async function AdminProducts() {
  const auth = await requireAuth("ADMIN");
  if (auth instanceof Response) return auth;

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link
          href="/admin/products/create"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Product
        </Link>
      </div>

      {/* EMPTY STATE */}
      {products.length === 0 ? (
        <div className="border rounded p-8 text-center text-gray-500">
          <p className="mb-4">No products found.</p>
          <Link
            href="/admin/products/create"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create your first product
          </Link>
        </div>
      ) : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Name</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Stock</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td className="border p-2">{p.name}</td>
                <td className="border p-2">{p.category?.name || "-"}</td>
                <td className="border p-2">${Number(p.price).toFixed(2)}</td>
                <td className="border p-2">{p.stock}</td>
                <td className="border p-2">{p.status}</td>
                <td className="border p-2">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
