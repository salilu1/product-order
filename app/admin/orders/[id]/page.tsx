"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function UpdateOrder() {
  const params = useParams();
  const id = params.id!;
  const router = useRouter();

  const [status, setStatus] = useState("PENDING");

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((res) => res.json())
      .then((data) => setStatus(data.status));
  }, [id]);

  const handleUpdate = async () => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) return alert("Update failed");
    router.push("/admin/orders");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Update Order Status</h1>
      <div className="flex flex-col gap-4 max-w-md">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button
          onClick={handleUpdate}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Update Status
        </button>
      </div>
    </div>
  );
}
