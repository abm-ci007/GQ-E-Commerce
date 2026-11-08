import { Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/stores/cart";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function CartDrawer() {
  const cart = useCart();
  return (
    <Sheet open={cart.isOpen} onOpenChange={(v) => (v ? cart.open() : cart.close())}>
      <SheetContent side="right" className="w-full max-w-md rounded-l-[2rem] surface-cream p-0">
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b border-ink/10 p-6">
            <SheetTitle className="text-display text-2xl">Your bag</SheetTitle>
            <p className="text-micro text-ink/50">{cart.count()} items</p>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6">
            {cart.items.length === 0 ? (
              <div className="grid h-full place-items-center text-center">
                <div>
                  <p className="text-display text-3xl">Empty.</p>
                  <p className="mt-2 text-sm text-ink/60">
                    Composure begins with one considered piece.
                  </p>
                  <Link
                    to="/shop"
                    onClick={() => cart.close()}
                    className="surface-ink text-micro mt-6 inline-flex rounded-full px-5 py-3"
                  >
                    Discover the shop
                  </Link>
                </div>
              </div>
            ) : (
              <ul className="space-y-4">
                {cart.items.map((i) => {
                  const price = i.product.discount_price ?? i.product.price;
                  return (
                    <li
                      key={i.product.id}
                      className="grid grid-cols-[80px_1fr_auto] items-center gap-4 rounded-3xl bg-card p-3"
                    >
                      <img
                        src={i.product.images?.[0]?.url}
                        alt={i.product.name}
                        className="h-20 w-20 rounded-2xl object-cover"
                      />
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{i.product.name}</div>
                        <div className="text-micro text-ink/60">{i.product.brand}</div>
                        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-ink/15 px-2 py-1">
                          <button onClick={() => cart.update(i.product.id, i.qty - 1)}>
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-semibold">{i.qty}</span>
                          <button onClick={() => cart.update(i.product.id, i.qty + 1)}>
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {(price * i.qty).toLocaleString("en-EG")} EGP
                        </div>
                        <button
                          onClick={() => cart.remove(i.product.id)}
                          className="mt-1 text-ink/40 hover:text-terracotta"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {cart.items.length > 0 && (
            <div className="border-t border-ink/10 p-6">
              <div className="flex items-baseline justify-between">
                <span className="text-micro text-ink/60">Subtotal</span>
                <span className="text-display text-2xl">
                  {cart.subtotal().toLocaleString("en-EG")} EGP
                </span>
              </div>
              <Link
                to="/checkout"
                onClick={() => cart.close()}
                className="surface-terracotta mt-4 grid place-items-center rounded-full px-6 py-4 text-sm font-semibold uppercase tracking-widest"
              >
                Proceed to checkout
              </Link>
              <Link
                to="/cart"
                onClick={() => cart.close()}
                className="text-micro mt-3 grid place-items-center rounded-full border border-ink/15 px-6 py-3"
              >
                View full cart
              </Link>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
