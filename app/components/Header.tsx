"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Header() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  return (
    <header className="border-b mb-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
        <Link href="/" className="text-xl font-bold">
          Product Order App
        </Link>

        <nav className="flex gap-4 items-center">
          {!session && (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}

          {session && (
            <>
              <Link href="/orders">My Orders</Link>

              {session.user.role === "ADMIN" && (
                <Link href="/dashboard">Dashboard</Link>
              )}

              <button
                onClick={() => signOut()}
                className="text-red-500"
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
