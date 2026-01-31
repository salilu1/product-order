"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, LayoutDashboard } from "lucide-react";

export default function Header() {
  const { data: session, status } = useSession();
  const { totalItems } = useCart();

  if (status === "loading") return null;

  return (
    <header className="border-b mb-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold">
          Product Order App
        </Link>

        <nav className="flex gap-4 items-center">
          {!session && (
            <>
              <Link href="/login" className="hover:text-blue-600 transition-colors">Login</Link>
              <Link href="/register" className="hover:text-blue-600 transition-colors">Register</Link>
            </>
          )}

          {session && (
            <>
              {/* Orders Link */}
              <Link href="/orders" className="hover:text-blue-600 transition-colors">
                My Orders
              </Link>

              {/* Cart Button with Live Badge */}
              <Link
                href="/cart"
                className="relative group p-2 hover:bg-slate-50 rounded-lg transition-all"
              >
                <ShoppingCart className="w-6 h-6 text-slate-700 group-hover:text-blue-600 transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-in zoom-in">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Admin Dashboard */}
              {session.user.role === "ADMIN" && (
                <Link
                  href="/dashboard"
                  className="hover:text-blue-600 transition-colors"
                >
                  Dashboard
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
