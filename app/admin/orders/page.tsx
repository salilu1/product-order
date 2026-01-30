import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminOrdersPage() {
  const auth = await requireAuth("ADMIN");
  if (auth instanceof Response) return auth;

  const orders = await prisma.order.findMany({
    include: {
      user: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      {orders.length === 0 ? (
        <div className="border rounded p-6 text-gray-500">
          No orders found.
        </div>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Order</th>
              <th className="border p-2">User</th>
              <th className="border p-2">Items</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td className="border p-2 font-mono text-sm">
                  {order.id.slice(0, 8)}…
                </td>
                <td className="border p-2">
                  {order.user.email}
                </td>
                <td className="border p-2">
                  {order.items.length}
                </td>
                <td className="border p-2">
                  {order.status}
                </td>
                <td className="border p-2">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Manage
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
