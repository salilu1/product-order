import { prisma } from "@/lib/prisma";
import UpdateStatusSelect from "@/app/components/admin/UpdateStatusSelect";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingBag,
  User,
  CreditCard,
  ShieldCheck,
  ShieldAlert,
  Info,
  Calendar,
  Lock,
} from "lucide-react";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: { include: { product: true } },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) return notFound();

  // 1. Calculate the intended total cost from items
  const orderTotal = order.items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );

  // 2. Calculate the successful payments via Chapa
  const totalPaid = order.payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  // 3. Define the security gate
  const isPaid = totalPaid >= orderTotal && orderTotal > 0;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/admin/orders"
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition font-bold group"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Orders
        </Link>

        {/* Top Header & Security Control */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Order Management
            </h1>
            <div className="flex items-center gap-2 text-slate-500 mt-1 font-medium">
              <span className="bg-slate-200 px-2 py-0.5 rounded text-xs font-mono">
                ID: {order.id.slice(0, 8)}
              </span>
              <span className="text-xs">•</span>
              <Calendar size={14} />
              <span className="text-xs">
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          <div
            className={`p-4 rounded-3xl border flex items-center gap-4 shadow-sm transition-all ${isPaid ? "bg-white border-slate-200" : "bg-amber-50 border-amber-200"}`}
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Update Status
              </span>
              {!isPaid && (
                <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1 uppercase">
                  <Lock size={10} /> Locked
                </span>
              )}
            </div>

            {/* SECURITY GATE: Only allow status change if order is paid */}
            <UpdateStatusSelect
              orderId={order.id}
              currentStatus={order.status}
              disabled={!isPaid}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Summary Visual */}
            <div
              className={`rounded-[2.5rem] border p-8 text-white shadow-2xl relative overflow-hidden transition-colors duration-500 ${isPaid ? "bg-slate-900" : "bg-rose-600"}`}
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-xs font-bold uppercase opacity-70 tracking-widest mb-1">
                      Chapa Verified Total
                    </p>
                    <h2 className="text-5xl font-black">
                      ${totalPaid.toFixed(2)}
                    </h2>
                  </div>
                  {isPaid ? (
                    <div className="bg-emerald-500/20 p-3 rounded-2xl backdrop-blur-md">
                      <ShieldCheck size={32} className="text-emerald-400" />
                    </div>
                  ) : (
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                      <ShieldAlert size={32} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md border border-white/10">
                    <p className="text-[10px] font-bold uppercase opacity-60">
                      Order Goal
                    </p>
                    <p className="font-bold">${orderTotal.toFixed(2)}</p>
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md border border-white/10">
                    <p className="text-[10px] font-bold uppercase opacity-60">
                      Payment Status
                    </p>
                    <p className="font-bold uppercase italic">
                      {isPaid ? "Fully Paid" : "Unpaid / Pending"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            {/* Items Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
                  <ShoppingBag size={18} className="text-blue-600" /> Purchased
                  Items
                </h3>
              </div>
              <div className="divide-y divide-slate-100 px-6">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="py-6 flex items-center gap-5 group"
                  >
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden border bg-slate-50 flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-lg truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-slate-500 font-medium">
                        Qty: {item.quantity} • ${Number(item.price).toFixed(2)}{" "}
                        ea
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900 text-lg">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chapa Logs Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
              <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-tighter">
                <CreditCard size={18} className="text-blue-600" /> Transaction
                Logs
              </h3>
              <div className="space-y-4">
                {order.payments.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-sm text-slate-400 font-medium italic">
                      No payment record found.
                    </p>
                  </div>
                ) : (
                  order.payments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-white shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-lg ${p.status === "SUCCESS" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                        >
                          <CreditCard size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 truncate max-w-[150px] md:max-w-none">
                            {p.txRef}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {new Date(p.createdAt).toLocaleDateString()}{" "}
                            {new Date(p.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-black text-slate-900">
                          ${Number(p.amount).toFixed(2)}
                        </span>
                        <span
                          className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${
                            p.status === "SUCCESS"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* User Info Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-8">
              <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-tighter">
                <User size={18} className="text-blue-500" /> Customer
              </h3>
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Name
                  </p>
                  <p className="font-bold text-slate-900 text-lg leading-tight">
                    {order.user.firstName} {order.user.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Contact
                  </p>
                  <p className="font-bold text-slate-900 break-all">
                    {order.user.email}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100">
                <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-2xl text-blue-800 leading-relaxed shadow-sm">
                  <Info
                    size={16}
                    className="flex-shrink-0 mt-0.5 text-blue-600"
                  />
                  <p className="text-[11px] font-semibold">
                    Notice: Database rules prevent changing order status until
                    Chapa confirms a successful transaction matching the order
                    total.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
