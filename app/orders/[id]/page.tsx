import Link from "next/link";
import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import OrderClientActions from "./OrderClientActions";
import { Package, Calendar, User, ArrowLeft } from "lucide-react";

// Inline helper for formatting numbers as currency
function formatCurrency(amount: number) {
  return `$${amount.toFixed(2)}`;
}

type Props = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;

  // Authenticate user
  const auth = await requireAuth();
  if (auth instanceof Response) redirect("/login");

  // Fetch order with items, user, and payments
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      user: true,
      payments: true,
    },
  });

  if (!order) notFound();

  const isOwner = order.userId === auth.user.id;
  const isAdmin = auth.user.role === "ADMIN";
  if (!isOwner && !isAdmin) notFound();

  // Total order amount
  const total = order.items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  // Total paid
  const totalPaid = order.payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      {/* Back Link */}
      <Link
        href="/orders"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Order Details
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            ID:{" "}
            <span className="text-slate-900 select-all">{order.id}</span>
          </p>
        </div>

        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl border border-blue-100 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span className="font-bold">
            {new Date(order.createdAt).toLocaleDateString(undefined, {
              dateStyle: "long",
            })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Summary */}
          <section className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Items Summary
            </h2>
            <div className="divide-y divide-slate-50">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="py-6 first:pt-0 last:pb-0 flex items-center gap-6"
                >
                  <div className="w-24 h-24 bg-slate-50 rounded-2xl overflow-hidden border flex-shrink-0">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-lg">
                      {item.product.name}
                    </h3>
                    <p className="text-slate-500 font-medium">
                      {item.quantity} Unit{item.quantity > 1 ? "s" : ""} •{" "}
                      {formatCurrency(Number(item.price))} ea
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-slate-900 text-xl">
                      {formatCurrency(Number(item.price) * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Client Actions */}
          <OrderClientActions
            orderId={order.id}
            currentStatus={order.status}
            isAdmin={isAdmin}
            isOwner={isOwner}
            payments={order.payments}
          />
        </div>

        {/* Right Sidebar */}
        <aside className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-slate-900 text-white rounded-[2rem] p-8 shadow-xl shadow-slate-200">
            <h2 className="text-xl font-bold mb-6 border-b border-slate-800 pb-4">
              Payment Summary
            </h2>

            {order.payments.length === 0 ? (
              <p className="text-slate-400">No payment attempts yet.</p>
            ) : (
              <div className="space-y-4">
                {order.payments.map((p, idx) => (
                  <div
                    key={p.id}
                    className="flex justify-between items-center bg-slate-800 p-3 rounded-xl"
                  >
                    <span className="font-medium">Payment #{idx + 1}</span>
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full ${
                        p.status === "SUCCESS"
                          ? "bg-emerald-50 text-emerald-700"
                          : p.status === "FAILED"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                ))}

                <div className="pt-4 mt-4 border-t border-slate-800 flex justify-between items-end">
                  <span className="font-medium">Total Paid</span>
                  <span className="text-3xl font-black text-blue-400">
                    {formatCurrency(totalPaid)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-8">
            <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Customer Info
            </h2>

            <p className="text-slate-500 text-sm">{order.user.email}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
