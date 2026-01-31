import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import OrderClientActions from "./OrderClientActions";
import { Package, Calendar, User, DollarSign } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const auth = await requireAuth();
  if (auth instanceof Response) redirect("/login");

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      user: true,
    },
  });

  if (!order) notFound();

  const isOwner = order.userId === auth.user.id;
  const isAdmin = auth.user.role === "ADMIN";
  if (!isOwner && !isAdmin) notFound();

  const total = order.items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Order Details</h1>
          <p className="text-slate-500 font-medium mt-1">ID: <span className="text-slate-900 select-all">{order.id}</span></p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl border border-blue-100 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span className="font-bold">{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <section className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" /> Items Summary
            </h2>
            <div className="divide-y divide-slate-50">
              {order.items.map((item) => (
                <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex items-center gap-6">
                  <div className="w-24 h-24 bg-slate-50 rounded-2xl overflow-hidden border border-slate-50 flex-shrink-0">
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-lg">{item.product.name}</h3>
                    <p className="text-slate-500 font-medium">{item.quantity} Unit{item.quantity > 1 ? 's' : ''} • ${Number(item.price).toFixed(2)} ea</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900 text-xl">${(Number(item.price) * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Admin/User Actions (The Client Component) */}
          <OrderClientActions orderId={order.id} currentStatus={order.status} isAdmin={isAdmin} isOwner={isOwner} />
        </div>

        {/* Sidebar Summary */}
        <aside className="space-y-6">
          <div className="bg-slate-900 text-white rounded-[2rem] p-8 shadow-xl shadow-slate-200">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
               Payment Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span className="text-green-400">Calculated at checkout</span>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800 flex justify-between items-end">
                <span className="font-medium">Total Paid</span>
                <span className="text-3xl font-black text-blue-400">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[2rem] p-8">
            <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" /> Customer Info
            </h2>
            <div className="space-y-1">
            {/* <p className="font-bold text-slate-900">{order.user.name}</p> */}
              <p className="text-slate-500 text-sm">{order.user.email}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}