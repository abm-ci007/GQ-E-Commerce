import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/lib/api/services";
import { OrderStatusBadge } from "@/components/site/order-status";

export const Route = createFileRoute("/account/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const { data } = useQuery({ queryKey: ["orders"], queryFn: ordersApi.list });
  const orders = data ?? [];
  return (
    <section className="mt-8 space-y-4">
      {orders.length === 0 && (
        <div className="bento surface-cream-deep p-16 text-center">
          <p className="text-display text-3xl">No orders yet.</p>
          <p className="mt-2 text-sm text-ink/60">Your future orders will live here.</p>
        </div>
      )}
      {orders.map((o) => (
        <Link
          key={o.id}
          to="/orders/$id"
          params={{ id: String(o.id) }}
          className="bento surface-cream-deep flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <div className="text-micro text-ink/50">Order #{o.id}</div>
            <div className="text-display text-2xl">
              {Number(o.total).toLocaleString("en-EG")} EGP
            </div>
            <div className="text-xs text-ink/60">
              {new Date(o.created_at).toLocaleDateString()} · {o.items.length} items
            </div>
          </div>
          <OrderStatusBadge status={o.status} />
        </Link>
      ))}
    </section>
  );
}
