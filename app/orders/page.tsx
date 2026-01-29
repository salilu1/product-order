async function getOrders() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
    cache: "no-store",
    credentials: "include",
  });
  return res.json();
}

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>

      {orders.map((o: any) => (
        <div key={o.id} className="border p-4 mb-4">
          <p>Status: {o.status}</p>
          {o.items.map((i: any) => (
            <p key={i.id}>
              {i.product.name} × {i.quantity}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
