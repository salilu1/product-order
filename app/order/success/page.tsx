import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{
    tx_ref?: string;
  }>;
}

export default async function OrderSuccessPage({ searchParams }: Props) {
  // 1️⃣ Resolve search params
  const resolvedParams = await searchParams;
  const txRef = resolvedParams.tx_ref;

  if (!txRef) {
    notFound();
  }

  // 2️⃣ Fetch payment + order + items + product
  const payment = await prisma.payment.findUnique({
    where: { txRef },
    include: {
      order: {
        include: {
          items: {
            include: { product: true },
          },
        },
      },
    },
  });

  if (!payment) {
    notFound();
  }

  // 3️⃣ Handle PENDING / FAILED
  if (payment.status === "PENDING") {
    // Let the return page poll verify route
    redirect(`/payment/chapa/return?tx_ref=${txRef}`);
  }

  if (payment.status === "FAILED") {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-black text-red-600 mb-4">
          Payment Failed
        </h1>
        <p>There was an issue processing your transaction. Please try again.</p>
      </div>
    );
  }

  const order = payment.order;

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-green-600 mb-2">
          🎉 Payment Successful!
        </h1>
        <p className="text-slate-600">
          Thank you for your purchase. Your order is now being processed.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Order ID
            </p>
            <p className="font-mono text-sm">{order.id}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Transaction Ref
            </p>
            <p className="font-mono text-sm">{payment.txRef}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold border-b pb-2">Order Summary</h2>
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-slate-800">
                {item.product.name}
              </p>
              <p className="text-sm text-slate-500">
                Quantity: {item.quantity}
              </p>
            </div>
            <p className="font-medium">
              {(Number(item.price) * item.quantity).toLocaleString()} ETB
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t-2 border-slate-100 flex justify-between items-center">
        <span className="text-xl font-bold text-slate-800">Total Paid</span>
        <span className="text-3xl font-black text-green-600">
          {order.items
            .reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
            .toLocaleString()}{" "}
          ETB
        </span>
      </div>
    </div>
  );
}
