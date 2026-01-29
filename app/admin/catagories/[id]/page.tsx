"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditCategory() {
  const router = useRouter();
  const params = useParams();
  const id = params.id!;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  useEffect(() => {
    fetch(`/api/admin/categories/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setName(data.name);
        setDescription(data.description || "");
        setStatus(data.status);
      });
  }, [id]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, status }),
    });
    if (!res.ok) return alert("Update failed");
    router.push("/admin/categories");
  };

  const handleDelete = async () => {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (!res.ok) return alert("Delete failed");
    router.push("/admin/categories");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Category</h1>
      <form onSubmit={handleUpdate} className="flex flex-col gap-4 max-w-md">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border p-2 rounded">
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Update
        </button>
        <button type="button" onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">
          Delete
        </button>
      </form>
    </div>
  );
}
