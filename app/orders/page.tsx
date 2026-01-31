import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

type OrderWithItems = {
  id: string;
  status: string;
  createdAt: Date;
  items: {
    id: string;
    quantity: number;
    price: number; // number, not Decimal
    product: {
      id: string;
      name: string;
      imageUrl: string;
    };
  }[];
};

export default async function OrdersPage() {
  const auth = await requireAuth("USER");
  if (auth instanceof Response) return auth;

  // fetch orders
  const rawOrders = await prisma.order.findMany({
    where: { userId: auth.user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  // convert Decimal → number
  const orders: OrderWithItems[] = rawOrders.map((order) => ({
    id: order.id,
    status: order.status,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price), // ✅ convert Decimal to number
      product: {
        id: item.product.id,
        name: item.product.name,
        imageUrl: item.product.imageUrl,
      },
    })),
  }));

  return (
    <div className="max-w-6xl mx-auto py-12">
      <h1 className="text-3xl font-black mb-8">My Orders</h1>

      {orders.length === 0 && (
        <p className="text-gray-500">You have not placed any orders yet.</p>
      )}

      {orders.map((order) => {
        const totalPrice = order.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        return (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="border rounded-xl p-6 mb-6 bg-white block hover:shadow-md transition"
          >
            {/* Status & Date */}
            <div className="flex justify-between mb-4">
              <span className="font-bold text-blue-600">{order.status}</span>
              <span className="text-gray-500">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Items */}
            <div className="space-y-1">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.product.name}</span>
                  <span>
                    {item.quantity} × ${item.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-2 font-bold text-right">
              Total: ${totalPrice.toFixed(2)}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
