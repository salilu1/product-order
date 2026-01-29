"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditProduct() {
  const router = useRouter();
  const { id } = useParams();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [categoryId, setCategoryId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  // Fetch product and categories on mount
  useEffect(() => {
    async function fetchData() {
      const prodRes = await fetch(`/api/admin/products/${id}`);
      const prod = await prodRes.json();
      setName(prod.name);
      setDescription(prod.description);
      setPrice(prod.price);
      setStock(prod.stock);
      setCategoryId(prod.categoryId);

      const catRes = await fetch("/api/admin/categories");
      const catData = await catRes.json();
      setCategories(catData);
    }
    fetchData();
  }, [id]);

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price.toString());
    formData.append("stock", stock.toString());
    formData.append("categoryId", categoryId);
    if (imageFile) formData.append("image", imageFile);

    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (!res.ok) return alert("Update failed");
    router.push("/admin/products");
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>

      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Product Name"
          className="border p-2 rounded"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="border p-2 rounded"
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          placeholder="Price"
          className="border p-2 rounded"
        />
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
          placeholder="Stock"
          className="border p-2 rounded"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Update Product
        </button>
      </div>
    </div>
  );
}
