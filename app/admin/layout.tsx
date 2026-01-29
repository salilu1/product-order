import { ReactNode } from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/rbac";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const auth = await requireAuth("ADMIN");
  if (auth instanceof Response) return auth;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-6">
        <h1 className="text-xl font-bold mb-6">Admin Dashboard</h1>
        <nav className="flex flex-col gap-3">
          <Link href="/admin/products" className="hover:underline">Products</Link>
          <Link href="/admin/categories" className="hover:underline">Categories</Link>
          <Link href="/admin/orders" className="hover:underline">Orders</Link>
          <Link href="/admin/users" className="hover:underline">Users</Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 bg-gray-100">{children}</main>
    </div>
  );
}
