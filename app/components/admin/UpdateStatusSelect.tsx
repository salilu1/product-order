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

interface UpdateStatusProps {
  orderId: string;
  currentStatus: string;
  disabled?: boolean; // Correctly defined to fix ts(2322)
}

export default function UpdateStatusSelect({
  orderId,
  currentStatus,
  disabled,
}: UpdateStatusProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;

    setLoading(true);
    try {
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
        disabled={loading || disabled}
        value={currentStatus}
        onChange={(e) => handleStatusChange(e.target.value)}
        className={`bg-white border border-slate-200 text-slate-900 text-sm font-bold rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none transition-all
          ${loading || disabled ? "opacity-50 cursor-not-allowed bg-slate-50 text-slate-400" : "opacity-100 cursor-pointer hover:border-blue-300"}
        `}
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
