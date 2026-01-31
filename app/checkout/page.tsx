"use client";

import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { ShoppingCart } from "lucide-react";

export default function CheckoutPage() {
  const { cartItems, clearCart, updateCartItem, removeCartItem } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Calculate total price
  const totalPrice = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [cartItems]
  );

  // Place order API call
  const placeOrder = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Order failed");
      }

      const order = await res.json();

      await clearCart(); // clear cart on backend & frontend
      alert(`Order placed successfully! Order ID: ${order.id}`);
      router.push("/orders");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Order failed due to network error");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <div className="bg-slate-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="w-10 h-10 text-slate-300" />
        </div>
        <h1 className="text-3xl font-black mb-4">Your cart is empty</h1>
        <button
          onClick={() => router.push("/")}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-20 space-y-6">
      <h1 className="text-3xl font-black mb-6">Confirm Order</h1>

      {/* Cart Items */}
      <ul className="space-y-4 border rounded p-4">
        {cartItems.map((item) => (
          <li key={item.productId} className="flex justify-between items-center">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>

      {/* Total */}
      <div className="flex justify-between font-bold text-lg mt-4">
        <span>Subtotal ({cartItems.length} items)</span>
        <span>${totalPrice.toFixed(2)}</span>
      </div>

      {/* Place Order Button */}
      <button
        onClick={placeOrder}
        disabled={loading}
        className={`w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg mt-6 transition-all ${
          loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
        }`}
      >
        {loading ? "Processing..." : "Place Order"}
      </button>

      <p className="text-center text-slate-400 text-xs mt-4">
        Secure Checkout • 30 Day Returns
      </p>
    </div>
  );
}
