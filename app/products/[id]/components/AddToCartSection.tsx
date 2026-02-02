"use client"; 

import { signIn, useSession } from "next-auth/react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

type Props = {
  productId: string;
  stock: number;
  name: string;
  price: number;
  imageUrl: string;
};

export default function AddToCartSection({ productId, stock, name, price, imageUrl }: Props) {
  const { data: session } = useSession();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  const isOutOfStock = stock === 0;
  const isAdmin = session?.user?.role === "ADMIN"; // check if admin

  const handleAdd = async () => {
    if (!session) {
      signIn(); // redirect to login
      return;
    }

    if (isAdmin) {
      alert("Admins cannot add items to cart.");
      return;
    }

    if (isOutOfStock) return;

    setLoading(true);

    try {
      await addToCart({ productId, name, price, quantity: qty, imageUrl });
      alert(`Added ${qty} item(s) to cart`);
    } catch (error) {
      console.error("Add to cart failed:", error);
      alert("Failed to add to cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-6">
      {/* Quantity selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-600">Quantity</label>
        <select
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          disabled={isOutOfStock || loading || isAdmin}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          {Array.from({ length: Math.min(stock, 10) }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAdd}
        disabled={isOutOfStock || loading || isAdmin}
        className={`w-full md:w-max px-12 py-4 bg-slate-900 text-white rounded-2xl font-bold
                   hover:bg-blue-600 disabled:bg-gray-300 transition-all
                   shadow-xl shadow-slate-200 active:scale-95`}
      >
        {loading
          ? "Adding..."
          : isOutOfStock
          ? "Out of Stock"
          : isAdmin
          ? "Admins cannot add to cart"
          : "Add to Cart"}
      </button>

      {/* Notices */}
      {!session && (
        <p className="text-xs text-gray-500">
          You must be logged in to add items to cart
        </p>
      )}
      {isAdmin && (
        <p className="text-xs text-red-500 font-semibold">
          Admins cannot add items to cart
        </p>
      )}
    </div>
  );
}
