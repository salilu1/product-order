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

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/payment-status?tx_ref=${txRef}`);
        const data = await res.json();

        if (!isMounted) return;

        if (data.status === "SUCCESS") {
          clearCart();
          router.replace(`/order/success?tx_ref=${txRef}`);
          return; // Stop polling
        }

        if (data.status === "FAILED") {
          setStatus("failed");
          return; // Stop polling
        }

        // If still pending, schedule the next check in 2 seconds
        timeoutId = setTimeout(checkStatus, 2000);
      } catch (err) {
        console.error(err);
        // Even on error, try again after a delay
        timeoutId = setTimeout(checkStatus, 5000);
      }
    };

    checkStatus();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [txRef]); // Removed 'router' and 'clearCart' to prevent unnecessary resets

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
