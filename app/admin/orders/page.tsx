import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import Link from "next/link";
import Image from "next/image";
import OrderSearch from "@/app/components/admin/OrderSearch";
import {
  ChevronRight,
  Calendar,
  Receipt,
  ShieldCheck,
  ShieldAlert,
  Package,
  ChevronLeft,
  SearchX,
} from "lucide-react";

function FormattedDate({ date }: { date: Date }) {
  return (
    <span className="flex items-center gap-1">
      <Calendar size={12} />
      {new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}
    </span>
  );
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; query?: string }>;
}) {
  const auth = await requireAuth("ADMIN");
  if (auth instanceof Response) return auth;

  const params = await searchParams;
  const query = params.query || "";
  const currentPage = Number(params.page) || 1;
  const pageSize = 10;
  const skip = (currentPage - 1) * pageSize;

  // Define search filter
  const whereClause = query
    ? {
        OR: [
          { id: { contains: query } },
          { user: { email: { contains: query } } },
          { user: { firstName: { contains: query } } },
          { user: { lastName: { contains: query } } },
        ],
      }
    : {};

  const [orders, totalOrders] = await Promise.all([
    prisma.order.findMany({
      where: whereClause,
      take: pageSize,
      skip: skip,
      include: {
        user: true,
        items: { include: { product: true } },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalOrders / pageSize);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "PROCESSING":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-100";
      default:
        return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">
                Store Orders
              </h1>
              <p className="text-slate-500 font-medium">
                {query
                  ? `Found ${totalOrders} results for "${query}"`
                  : `Managing ${totalOrders} total orders`}
              </p>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm self-start">
                <Link
                  href={`?page=${currentPage - 1}${query ? `&query=${query}` : ""}`}
                  className={`p-2 rounded-xl transition ${currentPage <= 1 ? "pointer-events-none opacity-30" : "hover:bg-slate-100"}`}
                >
                  <ChevronLeft size={20} />
                </Link>
                <span className="text-sm font-bold px-4">
                  Page {currentPage} / {totalPages}
                </span>
                <Link
                  href={`?page=${currentPage + 1}${query ? `&query=${query}` : ""}`}
                  className={`p-2 rounded-xl transition ${currentPage >= totalPages ? "pointer-events-none opacity-30" : "hover:bg-slate-100"}`}
                >
                  <ChevronRight size={20} />
                </Link>
              </div>
            )}
          </div>

          {/* SEARCH BAR SECTION */}
          <div className="flex items-center gap-4">
            <OrderSearch />
          </div>
        </header>

        {orders.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-dashed border-slate-300 py-24 text-center">
            {query ? (
              <>
                <SearchX className="mx-auto mb-5 text-slate-300" size={56} />
                <p className="text-lg font-bold text-slate-600">
                  No results for &quot;{query}&quot;
                </p>
                <Link
                  href="/admin/orders"
                  className="text-blue-600 font-bold mt-2 inline-block hover:underline italic"
                >
                  Clear search filters
                </Link>
              </>
            ) : (
              <>
                <Package className="mx-auto mb-5 text-slate-300" size={56} />
                <p className="text-lg font-bold text-slate-600">
                  No orders found
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const orderTotal = order.items.reduce(
                (sum, i) => sum + Number(i.price) * i.quantity,
                0,
              );
              const totalPaid = order.payments
                .filter((p) => p.status === "SUCCESS")
                .reduce((sum, p) => sum + Number(p.amount), 0);
              const isPaid = totalPaid >= orderTotal && orderTotal > 0;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all group"
                >
                  <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div
                        className={`rounded-2xl p-4 transition-colors ${isPaid ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}
                      >
                        <Receipt size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                          Order Reference
                        </p>
                        <p className="font-black text-slate-900 text-lg">
                          #{order.id.slice(0, 8)}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 font-bold uppercase">
                          <FormattedDate date={order.createdAt} />
                          <span>•</span>
                          <span className="truncate max-w-[150px]">
                            {order.user.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right mr-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase">
                          Grand Total
                        </p>
                        <p className="text-xl font-black text-slate-900">
                          ${orderTotal.toFixed(2)}
                        </p>
                      </div>
                      <div
                        className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-black text-[10px] uppercase tracking-wider ${
                          isPaid
                            ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                            : "bg-rose-50 border-rose-100 text-rose-700"
                        }`}
                      >
                        {isPaid ? (
                          <ShieldCheck size={14} />
                        ) : (
                          <ShieldAlert size={14} />
                        )}
                        {isPaid ? "Paid" : "Unpaid"}
                      </div>
                      <div
                        className={`px-4 py-2 rounded-xl border font-black text-[10px] uppercase tracking-wider ${getStatusStyle(order.status)}`}
                      >
                        {order.status}
                      </div>
                    </div>
                  </div>

                  <div className="px-8 py-4 flex justify-between items-center">
                    <div className="flex -space-x-3 overflow-hidden">
                      {order.items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 relative overflow-hidden"
                        >
                          <Image
                            src={item.product.imageUrl}
                            alt="product"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-slate-900 font-black text-xs uppercase flex items-center gap-1 group-hover:text-blue-600 transition-colors"
                    >
                      Process Order <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls Bottom */}
            {totalPages > 1 && (
              <div className="flex justify-center pt-8">
                <nav className="flex items-center gap-1 bg-white p-2 rounded-[1.5rem] border border-slate-200 shadow-sm">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Link
                        key={page}
                        href={`?page=${page}${query ? `&query=${query}` : ""}`}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm transition ${
                          currentPage === page
                            ? "bg-slate-900 text-white shadow-md"
                            : "hover:bg-slate-100 text-slate-600"
                        }`}
                      >
                        {page}
                      </Link>
                    ),
                  )}
                </nav>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
