import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

export default async function AdminHome() {
  const auth = await requireAuth("ADMIN");
  if (auth instanceof Response) return auth;

  const [productsCount, categoriesCount, ordersCount, usersCount] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.user.count(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-4 bg-white rounded shadow">
          <h2 className="text-sm text-gray-500">Products</h2>
          <p className="text-xl font-bold">{productsCount}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h2 className="text-sm text-gray-500">Categories</h2>
          <p className="text-xl font-bold">{categoriesCount}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h2 className="text-sm text-gray-500">Orders</h2>
          <p className="text-xl font-bold">{ordersCount}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h2 className="text-sm text-gray-500">Users</h2>
          <p className="text-xl font-bold">{usersCount}</p>
        </div>
      </div>
    </div>
  );
}
