import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/stores/cart";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const subtotal = cart.subtotal();
  const shipping = subtotal > 500 || subtotal === 0 ? 0 : 25;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = subtotal + shipping + tax;

  return (
    <div className="px-4 py-10 md:px-8">
      <h1 className="text-display text-5xl md:text-7xl">
        Your bag
        <span className="text-script text-terracotta ml-2">edited.</span>
      </h1>

      {cart.items.length === 0 ? (
        <div className="bento surface-cream-deep mt-8 grid place-items-center p-16 text-center">
          <div>
            <div className="text-display text-4xl">The bag is empty.</div>
            <Link to="/shop" className="surface-ink text-micro mt-6 inline-flex rounded-full px-6 py-3">
              Discover the shop
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.5fr_1fr]">
          <ul className="space-y-4">
            {cart.items.map((i) => {
              const price = i.product.discount_price ?? i.product.price;
              return (
                <li
                  key={i.product.id}
                  className="bento surface-cream-deep grid grid-cols-[100px_1fr_auto] items-center gap-4 p-4 md:grid-cols-[140px_1fr_auto_auto]"
                >
                  <img
                    src={i.product.images?.[0]?.url}
                    alt={i.product.name}
                    className="h-24 w-full rounded-2xl object-cover md:h-32"
                  />
                  <div className="min-w-0">
                    <div className="text-micro text-ink/60">{i.product.brand}</div>
                    <div className="text-display truncate text-xl">{i.product.name}</div>
                    <div className="text-xs text-ink/60">SKU {i.product.sku}</div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-ink/20 px-2 py-1">
                    <button onClick={() => cart.update(i.product.id, i.qty - 1)}>
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-semibold">{i.qty}</span>
                    <button onClick={() => cart.update(i.product.id, i.qty + 1)}>
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-display text-xl">${(price * i.qty).toFixed(0)}</div>
                    <button
                      onClick={() => cart.remove(i.product.id)}
                      className="text-micro mt-1 inline-flex items-center gap-1 text-ink/50 hover:text-terracotta"
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="bento-lg surface-ink h-fit p-8 text-cream">
            <div className="text-micro text-terracotta-soft">Summary</div>
            <div className="mt-6 space-y-3 text-sm">
              <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
              <Row label="Shipping" value={shipping === 0 ? "Free" : `$${shipping}`} />
              <Row label="Tax (5%)" value={`$${tax.toFixed(2)}`} />
              <div className="hairline my-4" />
              <div className="flex items-baseline justify-between">
                <span className="text-micro text-cream/60">Total</span>
                <span className="text-display text-4xl">${total.toFixed(2)}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="surface-terracotta mt-6 grid place-items-center rounded-full px-6 py-4 text-sm font-semibold uppercase tracking-widest"
            >
              Proceed to checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-cream/70">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
