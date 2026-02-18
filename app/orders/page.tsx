import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import RetryPaymentButton from "@/app/components/RetryPaymentButton";
import Link from "next/link";
import Image from "next/image";
import { Package, ChevronRight, Calendar, Receipt } from "lucide-react";
// Import the new client component

type OrderWithItems = {
  id: string;
  status: string;
  createdAt: Date;
  payments: {
    id: string;
    status: string;
    checkoutUrl?: string;
  }[];
  items: {
    id: string;
    quantity: number;
    price: number;
    product: { id: string; name: string; imageUrl: string };
  }[];
};

export default async function OrdersPage() {
  const auth = await requireAuth("USER");
  if (auth instanceof Response) return auth;

  const rawOrders = await prisma.order.findMany({
    where: { userId: auth.user.id },
    include: { items: { include: { product: true } }, payments: true },
    orderBy: { createdAt: "desc" },
  });

  const orders: OrderWithItems[] = rawOrders.map((order) => ({
    id: order.id,
    status: order.status,
    createdAt: order.createdAt,
    payments: order.payments.map((p) => ({
      id: p.id,
      status: p.status,
      checkoutUrl: p.checkoutUrl || undefined,
    })),
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price),
      product: {
        id: item.product.id,
        name: item.product.name,
        imageUrl: item.product.imageUrl,
      },
    })),
  }));

  const statusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "PROCESSING":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-100";
      case "FAILED":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col gap-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            My Orders
          </h1>
          <p className="text-slate-500 font-medium">
            View your order history and track current purchases
          </p>
        </header>

        {orders.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-dashed border-slate-300 py-20 text-center">
            <Package className="mx-auto mb-5 text-slate-300" size={56} />
            <p className="text-lg font-bold text-slate-600">No orders yet</p>
            <p className="text-sm text-slate-400 mt-1">
              Looks like you haven’t purchased anything
            </p>
            <Link
              href="/"
              className="inline-block mt-6 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-sm hover:bg-blue-600 transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => {
              const total = order.items.reduce(
                (sum, i) => sum + i.price * i.quantity,
                0,
              );
              const itemCount = order.items.reduce(
                (sum, i) => sum + i.quantity,
                0,
              );

              const latestPayment = order.payments[order.payments.length - 1];

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition"
                >
                  <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/60 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-start gap-6">
                      <div className="bg-blue-50 text-blue-600 rounded-xl p-3">
                        <Receipt className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                          Order
                        </p>
                        <p className="font-black text-slate-900">
                          #{order.id.slice(0, 8)}
                        </p>
                        <div className="mt-2 flex items-center gap-3 text-sm text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(order.createdAt).toLocaleDateString(
                              undefined,
                              { dateStyle: "medium" },
                            )}
                          </span>
                          <span>•</span>
                          <span>
                            {itemCount} item{itemCount > 1 && "s"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase border ${statusStyle(order.status)}`}
                      >
                        {order.status}
                      </span>

                      {/* CLIENT COMPONENT USED HERE */}
                      {latestPayment && latestPayment.status === "FAILED" && (
                        <RetryPaymentButton orderId={order.id} />
                      )}

                      <p className="text-lg font-black text-slate-900">
                        ${total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="px-8 py-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border">
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {item.quantity} × ${item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex justify-between items-center">
                      <p className="text-xs text-slate-400">
                        {order.items.length > 3 &&
                          `+${order.items.length - 3} more items`}
                      </p>
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700 transition"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
