"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function ChapaReturnPage() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const txRef = searchParams.get("tx_ref");

  const [status, setStatus] = useState<"loading" | "failed">("loading");

  useEffect(() => {
    if (!txRef) return;

    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    let attempts = 0;

    const checkStatus = async () => {
      attempts++;

      try {
        const res = await fetch(`/api/payments/chapa/verify?tx_ref=${txRef}`);
        const data = await res.json();

        if (!isMounted) return;

        if (data.status === "SUCCESS") {
          clearCart();
          router.replace(`/order/success?tx_ref=${txRef}`);
          return;
        }

        if (data.status === "FAILED") {
          setStatus("failed");
          return;
        }

        if (attempts < 15) {
          // Retry after 2s
          timeoutId = setTimeout(checkStatus, 2000);
        } else {
          setStatus("failed");
        }
      } catch (err) {
        console.error(err);
        timeoutId = setTimeout(checkStatus, 5000);
      }
    };

    checkStatus();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [txRef, router, clearCart]);

  if (!txRef) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Invalid payment reference.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      {status === "loading" && (
        <p className="text-lg font-semibold">Confirming your payment...</p>
      )}

      {status === "failed" && (
        <p className="text-lg font-semibold text-red-600">
          Payment failed. Please try again.
        </p>
      )}
    </div>
  );
}
