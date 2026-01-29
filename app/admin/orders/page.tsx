import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";

export default async function AdminOrders() {
  const auth = await requireAuth("ADMIN");
  if (auth instanceof Response) return auth;

  const orders = await prisma.order.findMany({
    include: {
      items: { include: { product: true } },
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Order ID</th>
            <th className="border p-2">User</th>
            <th className="border p-2">Items</th>
            <th className="border p-2">Total</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const total = o.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

            return (
              <tr key={o.id}>
                <td className="border p-2">{o.id}</td>
                <td className="border p-2">{o.user.email}</td>
                <td className="border p-2">
                  {o.items.map((i) => (
                    <div key={i.id}>
                      {i.product.name} x {i.quantity}
                    </div>
                  ))}
                </td>
                <td className="border p-2">${total.toFixed(2)}</td>
                <td className="border p-2">{o.status}</td>
                <td className="border p-2">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Update
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
