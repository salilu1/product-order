"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, LayoutDashboard } from "lucide-react";

export default function Header() {
  const { data: session, status } = useSession();
  const { totalItems } = useCart();

  if (status === "loading") return null;

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="border-b mb-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600">
          Product Order App
        </Link>

        <nav className="flex gap-4 items-center">
          {!session && (
            <>
              <Link href="/login" className="hover:text-blue-600 transition-colors">
                Login
              </Link>
              <Link href="/register" className="hover:text-blue-600 transition-colors">
                Register
              </Link>
            </>
          )}

          {session && (
            <>
              {/* Only show My Orders & Cart for non-admin users */}
              {!isAdmin && (
                <>
                  <Link href="/orders" className="hover:text-blue-600 transition-colors">
                    My Orders
                  </Link>

                <Link
  href="/cart"
  className="relative flex items-center justify-center p-2 rounded-xl hover:bg-slate-100 transition-colors"
>
  {/* Cart count badge */}
  {totalItems > 0 && (
    <span
      className="
        absolute
        -top-2
        -right-2
        min-w-[22px]
        h-[22px]
        px-1
        bg-white
        text-blue-600
        text-xs
        font-extrabold
        rounded-full
        flex
        items-center
        justify-center
        border-2
        border-white
        shadow-md
      "
    >
      {totalItems}
    </span>
  )}

  {/* Cart icon */}
  <ShoppingCart className="w-6 h-6 text-slate-700 transition-colors group-hover:text-blue-600" />
</Link>

                </>
              )}

              {/* Admin Dashboard Link */}
              {isAdmin && (
                <Link
                  href="../admin"
                  className="hover:text-blue-600 transition-colors flex items-center gap-1"
                >
                  <LayoutDashboard className="w-5 h-5" /> Dashboard
                </Link>
              )}

              {/* Logout */}
              <button
                onClick={() => signOut()}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
