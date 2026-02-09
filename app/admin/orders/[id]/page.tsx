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
} from "lucide-react";

const STATUSES = ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"];

export default function AdminOrderEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setStatus(data.status);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function updateStatus() {
    setIsSaving(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      router.push("/admin/orders");
      router.refresh();
    } else {
      alert("Failed to update status");
      setIsSaving(false);
    }
  }

  if (loading)
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-80px)] p-6 lg:p-12 font-sans">
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb / Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition mb-6"
        >
          <ArrowLeft size={16} />
          Back to Order Management
        </button>

        {/* Main Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 border-b border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                <ShieldAlert size={14} /> Admin Console
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Update Order Status
              </h1>
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm">
              <Hash size={16} className="text-slate-400" />
              <span className="font-mono font-medium text-slate-600">{id}</span>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Status Selector */}
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700">
                  Assign New Status
                </label>
                <div className="relative">
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
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDownIcon size={18} />
                  </div>
                </div>
                <p className="text-xs text-slate-500 italic">
                  Changing status will trigger an automated email notification to the customer.
                </p>
              </div>

              {/* Order Info */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3 text-sm">
                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Clock size={16} /> Order Metadata
                </h3>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Progress</span>
                  <span className="font-bold text-slate-700">{status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">User Role Permissions</span>
                  <span className="text-green-600 font-bold bg-green-100 px-2 rounded text-[10px]">
                    VERIFIED ADMIN
                  </span>
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center md:justify-end gap-4">
              <button
                onClick={() => router.back()}
                className="px-6 h-12 rounded-lg font-bold text-slate-600 hover:bg-gray-100 transition w-full md:w-auto"
              >
                Discard Changes
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
          </div>
        </div>

        {/* Footer / Audit */}
        <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
          <User size={14} />
          Internal Admin Tool v2.0 • Secure Connection
        </div>
      </div>
    </div>
  );
}

// Helper icon
function ChevronDownIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
