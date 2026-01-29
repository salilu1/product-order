"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function CreateProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!image) return alert("Image is required");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("categoryId", categoryId);
    formData.append("image", image);

    const res = await fetch("/api/admin/products", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) return alert("Failed to create product");
    router.push("/admin/products");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create Product</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          className="border p-2 rounded"
        >
          <option value="">Select Category</option>
          {/* TODO: fetch categories via API */}
        </select>
        <input
          type="file"
          onChange={(e) => e.target.files && setImage(e.target.files[0])}
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Create
        </button>
      </form>
    </div>
  );
}
