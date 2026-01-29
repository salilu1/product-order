"use client";

import Link from "next/link";

export default function ProductCard({ product }: any) {
  return (
    <div className="border rounded p-4">
      <img src={product.imageUrl} className="h-40 w-full object-cover" />
      <h3 className="font-semibold mt-2">{product.name}</h3>
      <p>${product.price}</p>
      <Link
        href={`/orders/create?productId=${product.id}`}
        className="block mt-2 text-blue-600"
      >
        Order
      </Link>
    </div>
  );
}
