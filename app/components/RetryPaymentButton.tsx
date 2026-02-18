"use client";

import { useState } from "react";

export default function RetryPaymentButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);

  const handleRetryPayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/chapa/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Payment failed");
      if (!data.checkoutUrl) throw new Error("Missing checkout URL");

      window.location.href = data.checkoutUrl;
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        alert(err.message || "Payment retry failed");
      } else {
        alert("Payment retry failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRetryPayment}
      disabled={loading}
      className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition disabled:opacity-50"
    >
      {loading ? "Processing..." : "Retry Payment"}
    </button>
  );
}
