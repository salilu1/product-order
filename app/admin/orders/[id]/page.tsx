import { prisma } from "@/lib/prisma";
import UpdateStatusSelect from "@/app/components/admin/UpdateStatusSelect";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  Calendar,
  User,
  Receipt,
  ArrowLeft,
  ShoppingBag,
  Settings,
} from "lucide-react";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id: id },
    include: {
      user: true,
      items: { include: { product: true } },
      payments: true,
    },
  });

  if (!order) return notFound();

  const orderItems = order.items || [];
  const totalAmount = orderItems.reduce((sum, item) => {
    return sum + Number(item.price) * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/admin/orders"
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition mb-6"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-bold">Back to Orders</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">
              Order Details
            </h1>
            <p className="text-slate-500 font-medium">#{order.id}</p>
          </div>

          {/* Status Update Control */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <span className="text-xs font-black uppercase text-slate-400 flex items-center gap-1">
              <Settings size={14} /> Change Status:
            </span>
            <UpdateStatusSelect
              orderId={order.id}
              currentStatus={order.status}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Items Table */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="font-black flex items-center gap-2 text-slate-800">
                  <ShoppingBag size={20} className="text-blue-600" />
                  Purchased Items
                </h2>
              </div>
              <div className="p-6">
                <div className="divide-y divide-slate-100">
                  {orderItems.map((item) => (
                    <div key={item.id} className="py-4 flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border bg-slate-50">
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {item.quantity} x ${Number(item.price).toFixed(2)}
                        </p>
                      </div>
                      <p className="font-black">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-6 bg-slate-900 rounded-2xl text-white flex justify-between items-center">
                  <p className="font-bold">Total Amount</p>
                  <p className="text-2xl font-black">
                    ${totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Customer Details */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
              <h2 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                <User size={18} className="text-blue-500" /> Customer
              </h2>
              <p className="font-bold text-slate-900">{order.user.firstName}</p>
              <p className="text-sm text-slate-500">{order.user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
