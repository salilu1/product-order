"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const STATUSES = ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"];

export default function AdminOrderEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then(res => res.json())
      .then(data => {
        setStatus(data.status);
        setLoading(false);
      });
  }, [id]);

  async function updateStatus() {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      alert("Invalid status update");
      return;
    }

    router.push("/admin/orders");
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-4">Update Order</h1>

      <label className="block mb-2 font-medium">Status</label>
      <select
        value={status}
        onChange={e => setStatus(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      >
        {STATUSES.map(s => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <button
        onClick={updateStatus}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Update Status
      </button>
    </div>
  );
}
