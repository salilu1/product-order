"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Hash,
  Clock,
  User,
  ShieldAlert,
  Loader2,
  Package,
  Calendar,
} from "lucide-react";

const STATUSES = ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"];

type Payment = {
  id: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  amount: number | string;
};

type ProductItem = {
  id: string;
  product: {
    id: string;
    name: string;
    imageUrl: string;
    price: number | string;
  };
  quantity: number;
  price: number | string;
};

type OrderData = {
  id: string;
  status: string;
  userEmail: string;
  items: ProductItem[];
  payments: Payment[];
  createdAt: string;
};

export default function AdminOrderEditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch order data
  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/orders/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch order");
        return res.json();
      })
      .then((data: OrderData) => {
        setOrder(data);
        setStatus(data.status);
      })
      .catch(() => alert("Error fetching order"))
      .finally(() => setLoading(false));
  }, [id]);

  async function updateStatus() {
    setIsSaving(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      alert("Status updated successfully");
      router.refresh();
    } else {
      alert("Failed to update status");
    }
    setIsSaving(false);
  }

  if (loading)
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );

  if (!order) return <p className="text-center text-red-500">Order not found</p>;

  const totalAmount = order.items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const totalPaid = order.payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-80px)] p-6 lg:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition mb-6"
        >
          <ArrowLeft size={16} />
          Back to Order Management
        </button>

        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden mb-6">
          <div className="bg-gray-50 border-b border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                <ShieldAlert size={14} /> Admin Console
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Order Overview</h1>
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm">
              <Hash size={16} className="text-slate-400" />
              <span className="font-mono font-medium text-slate-600">{id}</span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <p>
                <span className="font-bold">Customer:</span> {order.userEmail}
              </p>
              <p>
                <span className="font-bold">Created:</span>{" "}
                {new Date(order.createdAt).toLocaleString()}
              </p>
              <p>
                <span className="font-bold">Current Status:</span> {order.status}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">
                Update Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-12 pl-4 pr-10 bg-white border border-gray-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition cursor-pointer"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden mb-6 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Items
          </h2>
          <div className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="py-4 flex items-center gap-4 first:pt-0 last:pb-0"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden border bg-gray-50 flex-shrink-0">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{item.product.name}</p>
                  <p className="text-sm text-slate-500">
                    {item.quantity} × ${Number(item.price).toFixed(2)}
                  </p>
                </div>
                <p className="font-black text-slate-900">
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Payments */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden mb-6 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Payments
          </h2>
          {order.payments.length === 0 ? (
            <p className="text-slate-500">No payments yet.</p>
          ) : (
            <div className="space-y-2">
              {order.payments.map((p, idx) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center p-3 rounded-lg border"
                >
                  <span>Payment #{idx + 1}</span>
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
                  <span>${Number(p.amount).toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-4 mt-2 border-t flex justify-between font-bold">
                <span>Total Paid:</span>
                <span>${totalPaid.toFixed(2)}</span>
              </div>
            </div>
          )}
        </section>

        {/* Footer Actions */}
        <div className="flex flex-col md:flex-row gap-4 justify-end">
          <button
            onClick={() => router.back()}
            className="px-6 h-12 rounded-lg font-bold text-slate-600 hover:bg-gray-100 transition w-full md:w-auto"
          >
            Discard
          </button>
          <button
            onClick={updateStatus}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 h-12 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md w-full md:w-auto"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {isSaving ? "Saving..." : "Update Status"}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
          <User size={14} />
          Internal Admin Tool • Secure Connection
        </div>
      </div>
    </div>
  );
}
