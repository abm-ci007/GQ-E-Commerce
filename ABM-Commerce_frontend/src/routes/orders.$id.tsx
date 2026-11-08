import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/lib/api/services";
import { OrderStatusTimeline } from "@/components/site/order-status";

export const Route = createFileRoute("/orders/$id")({
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { id } = Route.useParams();
  const { data: order } = useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersApi.detail(Number(id)),
  });

  if (!order) return <div className="p-16 text-center">Loading order…</div>;

  return (
    <div className="px-4 py-10 md:px-8">
      <div className="bento-lg surface-terracotta grid grid-cols-1 gap-6 p-8 text-cream md:grid-cols-[1.5fr_1fr] md:p-12">
        <div>
          <div className="text-micro">Confirmed · order #{order.id}</div>
          <h1 className="text-display mt-2 text-5xl md:text-7xl">
            Thank you
            <span className="text-script block">— it's composed.</span>
          </h1>
          <p className="mt-4 max-w-md text-cream/85">
            You'll receive shipping updates by email. Track progress below.
          </p>
        </div>
        <div className="bento surface-cream text-ink flex flex-col justify-between p-6">
          <div className="text-micro">Order total</div>
          <div className="text-display text-5xl">
            {Number(order.total).toLocaleString("en-EG")} EGP
          </div>
          <div className="text-xs text-ink/60">
            Placed {new Date(order.created_at).toLocaleString()}
          </div>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-display text-3xl">Tracking</h2>
        <div className="mt-4">
          <OrderStatusTimeline status={order.status} />
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="bento surface-cream-deep p-6">
          <h3 className="text-display text-2xl">Items</h3>
          <ul className="mt-4 space-y-3">
            {order.items.map((i, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between border-b border-ink/10 pb-3 last:border-none"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={i.product.images?.[0]?.url}
                    className="h-14 w-14 rounded-2xl object-cover"
                    alt=""
                  />
                  <div>
                    <div className="font-semibold">{i.product.name}</div>
                    <div className="text-micro text-ink/60">× {i.qty}</div>
                  </div>
                </div>
                <div className="font-semibold">
                  {(Number(i.price) * i.qty).toLocaleString("en-EG")} EGP
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="bento surface-cream border border-ink/10 p-6">
          <h3 className="text-display text-2xl">Shipping</h3>
          <div className="mt-3 text-sm">
            <div className="font-semibold">{order.shipping_address.full_name}</div>
            <div>{order.shipping_address.line1}</div>
            <div>
              {order.shipping_address.city}, {order.shipping_address.country}
            </div>
            <div>{order.shipping_address.phone}</div>
          </div>
          <div className="hairline my-4" />
          <div className="text-micro text-ink/60">Payment</div>
          <div className="capitalize">{order.payment_method}</div>
          <Link
            to="/shop"
            className="surface-ink text-micro mt-6 inline-flex rounded-full px-5 py-2"
          >
            Continue shopping
          </Link>
        </div>
      </section>
    </div>
  );
}
