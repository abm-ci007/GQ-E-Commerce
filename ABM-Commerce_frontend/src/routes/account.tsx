import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/stores/auth";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  component: AccountLayout,
});

const TABS = [
  { to: "/account", label: "Profile", exact: true },
  { to: "/account/orders", label: "Orders" },
  { to: "/account/wishlist", label: "Wishlist" },
];

function AccountLayout() {
  const user = useAuth((s) => s.user);
  const updateProfile = useAuth((s) => s.updateProfile);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [form, setForm] = useState({
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? "",
    address: user?.address ?? "",
    city: user?.city ?? "",
    country: user?.country ?? "",
    birthdate: user?.birthdate ?? "",
    mobile_phone: user?.mobile_phone ?? "",
  });

  if (!user) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4 text-center">
        <div>
          <h1 className="text-display text-4xl">Sign in to view your account.</h1>
          <Link to="/auth/login" className="surface-ink text-micro mt-6 inline-flex rounded-full px-6 py-3">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-10 md:px-8">
      <header className="bento-lg surface-ink flex flex-col justify-between gap-6 p-8 text-cream md:flex-row md:items-end md:p-12">
        <div>
          <div className="text-micro text-terracotta-soft">Account</div>
          <h1 className="text-display mt-2 text-5xl md:text-7xl">
            {user.first_name}
            <span className="text-script text-terracotta-soft ml-2">{user.last_name}.</span>
          </h1>
          <p className="text-cream/60">{user.email}</p>
        </div>
        <div className="flex gap-2">
          {TABS.map((t) => {
            const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`text-micro rounded-full px-4 py-2 ${
                  active ? "bg-cream text-ink" : "border border-cream/30 text-cream"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </header>

      {pathname === "/account" ? (
        <section className="bento-lg surface-cream-deep mt-8 p-6 md:p-10">
          <h2 className="text-display text-3xl">Personal ledger</h2>
          <p className="mt-1 text-sm text-ink/60">Email cannot be edited.</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try { await updateProfile(form); toast.success("Profile updated"); }
              catch (err: any) { toast.error(err.message); }
            }}
            className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <PField label="First name" value={form.first_name} onChange={(v) => setForm({ ...form, first_name: v })} />
            <PField label="Last name" value={form.last_name} onChange={(v) => setForm({ ...form, last_name: v })} />
            <PField label="Mobile phone" value={form.mobile_phone} onChange={(v) => setForm({ ...form, mobile_phone: v })} />
            <PField label="Birthdate" type="date" value={form.birthdate} onChange={(v) => setForm({ ...form, birthdate: v })} />
            <PField label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} className="md:col-span-2" />
            <PField label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <PField label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
            <div className="md:col-span-2">
              <button className="surface-ink text-micro rounded-full px-6 py-3">Save changes</button>
            </div>
          </form>
        </section>
      ) : (
        <Outlet />
      )}
    </div>
  );
}

function PField({ label, value, onChange, type = "text", className = "" }: { label: string; value: string; onChange: (v: string) => void; type?: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <div className="text-micro mb-1 text-ink/60">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-ink/15 bg-cream px-4 py-3 text-sm outline-none focus:border-terracotta"
      />
    </label>
  );
}
