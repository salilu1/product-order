import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function UserOrdersPage() {
  const auth = await requireAuth("USER");
  if (auth instanceof Response) return auth;

  const orders = await prisma.order.findMany({
    where: { userId: auth.user.id },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>

      {orders.length === 0 ? (
        <div className="border rounded p-6 text-gray-500">
          You have no orders yet.
        </div>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Order ID</th>
              <th className="border p-2">Items</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td className="border p-2 font-mono text-sm">
                  {order.id.slice(0, 8)}…
                </td>
                <td className="border p-2">
                  {order.items.length}
                </td>
                <td className="border p-2">
                  <span className="px-2 py-1 rounded bg-gray-200 text-sm">
                    {order.status}
                  </span>
                </td>
                <td className="border p-2">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
