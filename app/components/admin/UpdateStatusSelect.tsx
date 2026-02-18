"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const STATUS_OPTIONS = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
  "FAILED",
];

export default function UpdateStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;

    setLoading(true);
    try {
      // 1. Ensure the URL matches your file structure: /api/admin/orders/[id]
      // 2. Ensure the Method is "PUT" to match your route.ts
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }

      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center gap-2">
      {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
      <select
        disabled={loading}
        value={currentStatus}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="bg-white border border-slate-200 text-slate-900 text-sm font-bold rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none disabled:opacity-50"
      >
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>
  );
}
