// "use client";

// import Link from "next/link";
// import { useCart } from "@/context/CartContext";
// import { useRouter } from "next/navigation";
// import { useState, useMemo } from "react";
// import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from "lucide-react";

// export default function CartPage() {
//   const { cartItems, updateCartItem, removeCartItem, clearCart } = useCart();
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);

//   const totalPrice = useMemo(
//     () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
//     [cartItems]
//   );

//   const totalItems = useMemo(
//     () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
//     [cartItems]
//   );

//   // Update quantity using CartContext method (handles backend)
//   const handleQuantityChange = async (productId: string, newQty: number) => {
//     if (newQty < 1) return; // prevent zero or negative quantity
//     await updateCartItem(productId, newQty);
//   };

//   // Remove item using CartContext method (handles backend)
//   const handleRemoveItem = async (productId: string) => {
//     await removeCartItem(productId);
//   };

//   // Checkout using CartContext clearCart and backend API
//   const handleCheckout = async () => {
//     if (cartItems.length === 0) return;
//     setLoading(true);
//     try {
//       const res = await fetch("/api/orders", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           items: cartItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
//         }),
//       });

//       if (!res.ok) {
//         const data = await res.json();
//         throw new Error(data.error || "Order failed");
//       }

//       const order = await res.json();
//       await clearCart(); // clear cart after successful order
//       alert(`Order placed successfully! Order ID: ${order.id}`);
//       router.push("/orders");
//     } catch (error: any) {
//       console.error(error);
//       alert(error.message || "Failed to place order");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (cartItems.length === 0)
//     return (
//       <div className="max-w-7xl mx-auto px-6 py-20 text-center">
//         <div className="bg-slate-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
//           <ShoppingBag className="w-10 h-10 text-slate-300" />
//         </div>
//         <h1 className="text-3xl font-black text-slate-900 mb-2">Your cart is empty</h1>
//         <p className="text-slate-500 mb-8">Looks like you haven't added anything yet.</p>
//         <Link
//           href="/"
//           className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95"
//         >
//           <ArrowLeft className="w-4 h-4" />
//           Continue Shopping
//         </Link>
//       </div>
//     );

//   return (
//     <div className="max-w-7xl mx-auto px-6 py-10">
//          <Link
//         href="/"
//         className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-6"
//       >
//         <ArrowLeft className="w-4 h-4" />
//         Back to Shopping
//       </Link>
//       <h1 className="text-4xl font-black text-slate-900 mb-8">Shopping Cart</h1>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
//         {/* ITEM LIST */}
//         <div className="lg:col-span-2 space-y-4">
//           {cartItems.map((item) => (
//             <div
//               key={item.productId}
//               className="group flex flex-col sm:flex-row items-center gap-6 bg-white border border-slate-100 p-4 rounded-2xl hover:shadow-md transition-all"
//             >
//               {/* Product Image */}
//               <div className="relative w-full max-w-[180px] sm:w-48 aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-slate-100 shadow-sm flex-shrink-0">
//                 <img
//                   src={item.imageUrl}
//                   alt={item.name}
//                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
//                   loading="lazy"
//                 />
//                 <div className="absolute inset-0 bg-black/[0.02] pointer-events-none" />
//               </div>

//               {/* Product Info */}
//               <div className="flex-1 text-center sm:text-left">
//                 <h2 className="text-lg font-bold text-slate-900">{item.name}</h2>
//                 <p className="text-blue-600 font-bold mb-4">${item.price.toFixed(2)}</p>

//                 {/* Quantity Controls */}
//                 <div className="flex items-center justify-center sm:justify-start gap-1">
//                   <button
//                     onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
//                     className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
//                   >
//                     <Minus className="w-4 h-4 text-slate-600" />
//                   </button>
//                   <span className="w-10 text-center font-bold text-slate-900">{item.quantity}</span>
//                   <button
//                     onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
//                     className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
//                   >
//                     <Plus className="w-4 h-4 text-slate-600" />
//                   </button>
//                 </div>
//               </div>

//               {/* Price & Remove */}
//               <div className="flex flex-col items-end gap-2 pr-2">
//                 <span className="text-xl font-black text-slate-900">
//                   ${(item.price * item.quantity).toFixed(2)}
//                 </span>
//                 <button
//                   onClick={() => handleRemoveItem(item.productId)}
//                   className="flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors text-sm font-medium"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                   Remove
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* ORDER SUMMARY */}
//         <div className="lg:col-span-1">
//           <div className="bg-slate-50 rounded-3xl p-8 sticky top-24">
//             <h2 className="text-xl font-black text-slate-900 mb-6">Order Summary</h2>

//             <div className="space-y-4 mb-8">
//               <div className="flex justify-between text-slate-600">
//                 <span>Subtotal ({totalItems} items)</span>
//                 <span className="font-medium">${totalPrice.toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between text-slate-600">
//                 <span>Shipping</span>
//                 <span className="text-green-600 font-medium">Free</span>
//               </div>
//               <div className="h-[1px] bg-slate-200 my-4" />
//               <div className="flex justify-between text-xl font-black text-slate-900">
//                 <span>Total</span>
//                 <span>${totalPrice.toFixed(2)}</span>
//               </div>
//             </div>

//             <button
//               onClick={handleCheckout}
//               disabled={loading}
//               className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all active:scale-[0.98] shadow-xl shadow-blue-100 disabled:bg-slate-300 disabled:shadow-none"
//             >
//               {loading ? "Processing..." : "Place Order Now"}
//             </button>

//             <p className="text-center text-slate-400 text-xs mt-6">
//               Secure Checkout • 30 Day Returns
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { cartItems, updateCartItem, removeCartItem } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const totalPrice = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  // Update quantity using CartContext method (handles backend)
  const handleQuantityChange = async (productId: string, newQty: number) => {
    if (newQty < 1) return;
    await updateCartItem(productId, newQty);
  };

  // Remove item using CartContext method (handles backend)
  const handleRemoveItem = async (productId: string) => {
    await removeCartItem(productId);
  };

  // Checkout -> Create Order -> Init Chapa -> Redirect to checkout_url
  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setLoading(true);
    try {
      // 1) Create Order
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || "Order failed");
      }

      // 2) Initialize Chapa Payment
      const payRes = await fetch("/api/payments/chapa/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData.id }),
      });

      const payData = await payRes.json();

      if (!payRes.ok) {
        throw new Error(payData.error || "Payment initialization failed");
      }

      // 3) Redirect to Chapa Checkout
      if (!payData.checkoutUrl) {
        throw new Error("Missing checkout URL from Chapa");
      }

      window.location.href = payData.checkoutUrl;
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0)
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="bg-slate-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-slate-300" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">
          Your cart is empty
        </h1>
        <p className="text-slate-500 mb-8">
          Looks like you haven't added anything yet.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Shopping
      </Link>

      <h1 className="text-4xl font-black text-slate-900 mb-8">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* ITEM LIST */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.productId}
              className="group flex flex-col sm:flex-row items-center gap-6 bg-white border border-slate-100 p-4 rounded-2xl hover:shadow-md transition-all"
            >
              {/* Product Image */}
              <div className="relative w-full max-w-[180px] sm:w-48 aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-slate-100 shadow-sm flex-shrink-0">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/[0.02] pointer-events-none" />
              </div>

              {/* Product Info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-lg font-bold text-slate-900">{item.name}</h2>
                <p className="text-blue-600 font-bold mb-4">
                  ${item.price.toFixed(2)}
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center justify-center sm:justify-start gap-1">
                  <button
                    onClick={() =>
                      handleQuantityChange(item.productId, item.quantity - 1)
                    }
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    <Minus className="w-4 h-4 text-slate-600" />
                  </button>

                  <span className="w-10 text-center font-bold text-slate-900">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      handleQuantityChange(item.productId, item.quantity + 1)
                    }
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    <Plus className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Price & Remove */}
              <div className="flex flex-col items-end gap-2 pr-2">
                <span className="text-xl font-black text-slate-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>

                <button
                  onClick={() => handleRemoveItem(item.productId)}
                  className="flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors text-sm font-medium disabled:opacity-50"
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ORDER SUMMARY */}
        <div className="lg:col-span-1">
          <div className="bg-slate-50 rounded-3xl p-8 sticky top-24">
            <h2 className="text-xl font-black text-slate-900 mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-medium">${totalPrice.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>

              <div className="h-[1px] bg-slate-200 my-4" />

              <div className="flex justify-between text-xl font-black text-slate-900">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-600 transition-all active:scale-[0.98] shadow-xl shadow-slate-200 disabled:bg-slate-300 disabled:shadow-none"
            >
              {loading ? "Redirecting to payment..." : "Pay with Chapa"}
            </button>

            <p className="text-center text-slate-400 text-xs mt-6">
              Secure Checkout • Powered by Chapa
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

