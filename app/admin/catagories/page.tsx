import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

export default async function AdminCategories() {
  const auth = await requireAuth("ADMIN");
  if (auth instanceof Response) return auth;

  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Link
          href="/admin/categories/create"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Category
        </Link>
      </div>

      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Slug</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              <td className="border p-2">{c.name}</td>
              <td className="border p-2">{c.slug}</td>
              <td className="border p-2">{c.status}</td>
              <td className="border p-2">
                <Link
                  href={`/admin/categories/${c.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
