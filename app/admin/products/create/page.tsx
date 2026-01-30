"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };

export default function CreateProduct() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState(""); // Added description state
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [image, setImage] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/admin/catagories")
      .then((res) => res.json())
      .then((data) => setCategories(data || []))
      .catch((err) => console.error("Failed to fetch categories", err));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!image) return alert("Image is required");
    if (!categoryId) return alert("Category is required");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description); // append description
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("categoryId", categoryId);
    formData.append("status", status);
    formData.append("image", image);

    const res = await fetch("/api/admin/products", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      return alert("Failed to create product: " + errorText);
    }

    router.push("/admin/products");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create Product</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-md">
        {/* Name */}
        <div className="relative">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder=" "
            required
            className="peer w-full border border-gray-300 rounded px-3 py-3
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="absolute left-3 -top-2 bg-white px-1 text-sm text-gray-500
                            transition-all
                            peer-placeholder-shown:top-3
                            peer-placeholder-shown:text-base
                            peer-placeholder-shown:text-gray-400
                            peer-focus:-top-2
                            peer-focus:text-sm
                            peer-focus:text-blue-600">
            Product Name
          </label>
        </div>

        {/* Description */}
        <div className="relative">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder=" "
            required
            className="peer w-full border border-gray-300 rounded px-3 py-3 min-h-[100px]
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="absolute left-3 -top-2 bg-white px-1 text-sm text-gray-500
                            transition-all
                            peer-placeholder-shown:top-3
                            peer-placeholder-shown:text-base
                            peer-placeholder-shown:text-gray-400
                            peer-focus:-top-2
                            peer-focus:text-sm
                            peer-focus:text-blue-600">
            Description
          </label>
        </div>

        {/* Price */}
        <div className="relative">
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder=" "
            required
            step="0.01"
            className="peer w-full border border-gray-300 rounded px-3 py-3
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="absolute left-3 -top-2 bg-white px-1 text-sm text-gray-500
                            transition-all
                            peer-placeholder-shown:top-3
                            peer-placeholder-shown:text-base
                            peer-placeholder-shown:text-gray-400
                            peer-focus:-top-2
                            peer-focus:text-sm
                            peer-focus:text-blue-600">
            Price
          </label>
        </div>

        {/* Stock */}
        <div className="relative">
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder=" "
            required
            className="peer w-full border border-gray-300 rounded px-3 py-3
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="absolute left-3 -top-2 bg-white px-1 text-sm text-gray-500
                            transition-all
                            peer-placeholder-shown:top-3
                            peer-placeholder-shown:text-base
                            peer-placeholder-shown:text-gray-400
                            peer-focus:-top-2
                            peer-focus:text-sm
                            peer-focus:text-blue-600">
            Stock
          </label>
        </div>

        {/* Category */}
        <div className="relative">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="peer w-full border border-gray-300 rounded px-3 py-3
                       focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <label className="absolute left-3 -top-2 bg-white px-1 text-sm text-gray-500
                            transition-all
                            peer-focus:-top-2
                            peer-focus:text-sm
                            peer-focus:text-blue-600">
            Category
          </label>
        </div>

        {/* Status */}
        <div className="relative">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="peer w-full border border-gray-300 rounded px-3 py-3
                       focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <label className="absolute left-3 -top-2 bg-white px-1 text-sm text-gray-500
                            transition-all
                            peer-focus:-top-2
                            peer-focus:text-sm
                            peer-focus:text-blue-600">
            Status
          </label>
        </div>

        {/* Image */}
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && setImage(e.target.files[0])}
            required
            className="border p-2 rounded w-full"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Product
        </button>
      </form>
    </div>
  );
}
