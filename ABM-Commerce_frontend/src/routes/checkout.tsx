import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, LockKeyhole, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/stores/cart";
import { ordersApi } from "@/lib/api/services";
import { tokens } from "@/lib/api/client";
import { useAuth } from "@/stores/auth";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

const STEPS = ["Shipping", "Payment", "Review"] as const;

function CheckoutPage() {
  const cart = useCart();
  const user = useAuth((state) => state.user);
  const authStatus = useAuth((state) => state.status);
  const navigate = useNavigate();
  const [checkingSession, setCheckingSession] = useState(true);
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState({
    full_name: "",
    line1: "",
    city: "",
    country: "EG",
    phone: "",
  });
  const [payment, setPayment] = useState<"cod">("cod");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    let active = true;
    async function checkSession() {
      if (!tokens.access) {
        if (active) setCheckingSession(false);
        return;
      }
      await useAuth.getState().refreshMe();
      if (active) setCheckingSession(false);
    }
    void checkSession();
    return () => {
      active = false;
    };
  }, []);

  const subtotal = cart.subtotal();
  const shipping = subtotal >= 500 ? 0 : 25;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = subtotal + shipping + tax;

  if (checkingSession) {
    return <div className="grid min-h-[60vh] place-items-center text-sm text-slate-500">Checking your account…</div>;
  }

  if (!user || authStatus !== "authenticated") {
    return (
      <section className="mx-auto grid min-h-[65vh] max-w-2xl place-items-center px-4 py-14 text-center">
        <div className="bento-lg surface-cream-deep w-full p-8 sm:p-12">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white text-slate-800 shadow-sm">
            <LockKeyhole className="h-6 w-6" />
          </span>
          <p className="market-kicker mt-5">Your bag is saved</p>
          <h1 className="text-display mt-2 text-4xl sm:text-5xl">Sign in to continue</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-600">
            Create an account or sign in to place your order, keep your delivery details together, and track it later.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/auth/login" search={{ next: "/checkout" }} className="surface-ink rounded-full px-7 py-3 text-sm font-semibold text-white">
              Sign in
            </Link>
            <Link to="/auth/register" search={{ next: "/checkout" }} className="rounded-full border border-slate-300 bg-white px-7 py-3 text-sm font-semibold text-slate-800">
              Create account
            </Link>
          </div>
          <p className="mt-5 text-xs text-slate-500">{cart.items.length} item{cart.items.length === 1 ? "" : "s"} in your bag. It will stay here while you sign in.</p>
        </div>
      </section>
    );
  }

  async function placeOrder() {
    setPlacing(true);
    try {
      const order = await ordersApi.create({
        items: cart.items,
        shipping_address: address,
        payment_method: payment,
      });
      cart.clear();
      toast.success("Order placed");
      navigate({ to: "/orders/$id", params: { id: String(order.id) } });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="px-4 py-10 md:px-8">
      <h1 className="text-display text-5xl md:text-7xl">
        Checkout
        <span className="text-script text-terracotta ml-2">— composed.</span>
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div>
          {/* stepper */}
          <ol className="flex flex-wrap items-center gap-3">
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-center gap-3">
                <div
                  className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold ${
                    i <= step ? "surface-terracotta" : "border border-ink/20 text-ink/40"
                  }`}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`text-micro ${i === step ? "text-ink" : "text-ink/50"}`}>{s}</span>
                {i < STEPS.length - 1 && <span className="h-px w-8 bg-ink/20" />}
              </li>
            ))}
          </ol>

          <div className="bento-lg surface-cream-deep mt-8 p-6 md:p-10">
            {step === 0 && (
              <form className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="Full name"
                  value={address.full_name}
                  onChange={(v) => setAddress({ ...address, full_name: v })}
                  className="md:col-span-2"
                />
                <Field
                  label="Address"
                  value={address.line1}
                  onChange={(v) => setAddress({ ...address, line1: v })}
                  className="md:col-span-2"
                />
                <Field
                  label="City"
                  value={address.city}
                  onChange={(v) => setAddress({ ...address, city: v })}
                />
                <Field
                  label="Country"
                  value={address.country}
                  onChange={(v) => setAddress({ ...address, country: v })}
                />
                <Field
                  label="Phone"
                  value={address.phone}
                  onChange={(v) => setAddress({ ...address, phone: v })}
                  className="md:col-span-2"
                />
              </form>
            )}
            {step === 1 && (
              <div className="grid grid-cols-1 gap-3">
                {(["cod"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setPayment(m)}
                    className={`bento p-5 text-left ${payment === m ? "surface-ink text-cream" : "surface-cream border border-ink/15"}`}
                  >
                    <div className="flex items-center gap-3">
                      <WalletCards className="h-6 w-6" />
                      <span>
                        <span className="block text-sm font-bold">Cash on delivery</span>
                        <span className="mt-1 block text-xs opacity-70">
                          Pay when your order arrives
                        </span>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <ReviewBlock title="Ship to">
                  <div className="text-display text-xl">{address.full_name || "—"}</div>
                  <div className="text-sm text-ink/70">
                    {address.line1}, {address.city}, {address.country}
                  </div>
                  <div className="text-sm text-ink/70">{address.phone}</div>
                </ReviewBlock>
                <ReviewBlock title="Payment">
                  <div className="text-display text-xl capitalize">{payment}</div>
                </ReviewBlock>
                <ReviewBlock title="Bag">
                  <ul className="space-y-1 text-sm">
                    {cart.items.map((i) => (
                      <li key={i.product.id} className="flex justify-between">
                        <span>
                          {i.product.name} × {i.qty}
                        </span>
                        <span>
                          {((i.product.discount_price ?? i.product.price) * i.qty).toLocaleString(
                            "en-EG",
                          )}{" "}
                          EGP
                        </span>
                      </li>
                    ))}
                  </ul>
                </ReviewBlock>
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="text-micro rounded-full border border-ink/20 px-6 py-3 disabled:opacity-40"
              >
                Back
              </button>
              {step < 2 ? (
                <button
                  onClick={() => {
                    if (step === 0 && Object.values(address).some((value) => !value.trim())) {
                      toast.error("Complete your delivery address to continue.");
                      return;
                    }
                    setStep((s) => s + 1);
                  }}
                  className="surface-ink text-micro rounded-full px-6 py-3"
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={placeOrder}
                  disabled={placing || cart.items.length === 0}
                  className="surface-terracotta text-micro rounded-full px-8 py-3 disabled:opacity-50"
                >
                  {placing ? "Placing…" : "Place order"}
                </button>
              )}
            </div>
          </div>
        </div>

        <aside className="bento-lg surface-ink h-fit p-8 text-cream">
          <div className="text-micro text-terracotta-soft">Order summary</div>
          <ul className="mt-6 space-y-3 text-sm">
            {cart.items.map((i) => (
              <li key={i.product.id} className="flex justify-between text-cream/80">
                <span className="truncate">
                  {i.product.name} × {i.qty}
                </span>
                <span>
                  {((i.product.discount_price ?? i.product.price) * i.qty).toLocaleString("en-EG")}{" "}
                  EGP
                </span>
              </li>
            ))}
          </ul>
          <div className="hairline my-6" />
          <div className="space-y-2 text-sm">
            <Row label="Subtotal" value={`${subtotal.toLocaleString("en-EG")} EGP`} />
            <Row label="Shipping" value={shipping ? `${shipping} EGP` : "Free"} />
            <Row label="Tax" value={`${tax.toLocaleString("en-EG")} EGP`} />
          </div>
          <div className="mt-6 flex items-baseline justify-between">
            <span className="text-micro text-cream/60">Total</span>
            <span className="text-display text-4xl">{total.toLocaleString("en-EG")} EGP</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <div className="text-micro mb-1 text-ink/60">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-ink/15 bg-cream px-4 py-3 text-sm outline-none focus:border-terracotta"
      />
    </label>
  );
}

function ReviewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bento surface-cream border border-ink/10 p-4">
      <div className="text-micro text-ink/60">{title}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-cream/70">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
