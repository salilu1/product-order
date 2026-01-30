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
  async function loadCategory() {
    try {
      const res = await fetch(`/api/admin/catagories/${id}`);

      console.log("STATUS:", res.status);
      console.log("OK:", res.ok);
      console.log("HEADERS:", [...res.headers.entries()]);

      const rawText = await res.text();
      console.log("RAW RESPONSE:", rawText);

      if (!res.ok) {
        throw new Error(rawText || "Failed to fetch category");
      }

      const data = JSON.parse(rawText);

      setName(data.name);
      setDescription(data.description || "");
      setStatus(data.status);
    } catch (err) {
      console.error("LOAD CATEGORY ERROR:", err);
      alert("Failed to load category");
    }
  }

  loadCategory();
}, [id]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/admin/catagories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, status }),
    });
    if (!res.ok) return alert("Update failed");
    router.push("/admin/catagories");
  };

  const handleDelete = async () => {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/admin/catagories/${id}`, { method: "DELETE" });
    if (!res.ok) return alert("Delete failed");
    router.push("/admin/catagories");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Category</h1>
     <form onSubmit={handleUpdate} className="flex flex-col gap-5 max-w-md">
  {/* Category Name */}
  <div className="relative">
    <input
      type="text"
      value={name}
      onChange={(e) => setName(e.target.value)}
      required
      placeholder=" "
      className="peer w-full border border-gray-300 rounded px-3 py-3
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    <label
      className="absolute left-3 -top-2 bg-white px-1 text-sm text-gray-500
                 transition-all
                 peer-placeholder-shown:top-3
                 peer-placeholder-shown:text-base
                 peer-placeholder-shown:text-gray-400
                 peer-focus:-top-2
                 peer-focus:text-sm
                 peer-focus:text-blue-600"
    >
      Category Name
    </label>
  </div>

  {/* Description */}
  <div className="relative">
    <textarea
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      placeholder=" "
      className="peer w-full border border-gray-300 rounded px-3 py-3 min-h-[100px]
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    <label
      className="absolute left-3 -top-2 bg-white px-1 text-sm text-gray-500
                 transition-all
                 peer-placeholder-shown:top-3
                 peer-placeholder-shown:text-base
                 peer-placeholder-shown:text-gray-400
                 peer-focus:-top-2
                 peer-focus:text-sm
                 peer-focus:text-blue-600"
    >
      Description
    </label>
  </div>

  {/* Status */}
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium">Status</label>
    <select
      value={status}
      onChange={(e) => setStatus(e.target.value)}
      className="border p-2 rounded"
    >
      <option value="ACTIVE">Active</option>
      <option value="INACTIVE">Inactive</option>
    </select>
  </div>

  {/* Actions */}
  <button type="submit"  className="bg-blue-600 text-white px-4 py-2 rounded">
    Update
  </button>

  <button
    type="button"
    onClick={handleDelete}
    className="bg-red-600 text-white px-4 py-2 rounded"
  >
    Delete
  </button>
</form>


    </div>
  );
}
