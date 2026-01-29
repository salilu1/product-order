"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditUser() {
  const params = useParams();
  const id = params.id!;
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER");

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setEmail(data.email);
        setRole(data.role);
      });
  }, [id]);

  const handleUpdate = async () => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });

    if (!res.ok) return alert("Update failed");
    router.push("/admin/users");
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (!res.ok) return alert("Delete failed");
    router.push("/admin/users");
  };

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-4">Edit User</h1>

      <div className="flex flex-col gap-4">
        <input
          type="email"
          value={email}
          disabled
          className="border p-2 rounded bg-gray-100"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Update Role
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
