"use client";

import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";

export default function CreateOrder() {
  const params = useSearchParams();
  const router = useRouter();
  const productId = params.get("productId");

  async function submit(e: any) {
    e.preventDefault();

    await axios.post("/api/orders", {
      items: [{ productId, quantity: Number(e.target.quantity.value) }],
    });

    router.push("/orders");
  }

  return (
    <form onSubmit={submit} className="max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold">Order Product</h1>

      <input name="quantity" type="number" min={1} className="input" />

      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Place Order
      </button>
    </form>
  );
}
