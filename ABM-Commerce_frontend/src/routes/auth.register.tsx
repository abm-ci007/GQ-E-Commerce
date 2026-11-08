import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";
import { useAuth } from "@/stores/auth";
import { AuthShell } from "@/components/site/auth-shell";
import { safeReturnPath } from "@/lib/auth/navigation";

export const Route = createFileRoute("/auth/register")({
  validateSearch: (search: Record<string, unknown>) => {
    const next = typeof search.next === "string" ? safeReturnPath(search.next) : undefined;
    return next ? { next } : {};
  },
  component: RegisterPage,
});

function RegisterPage() {
  const register = useAuth((s) => s.register);
  const status = useAuth((s) => s.status);
  const acceptSession = useAuth((s) => s.acceptSession);
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", password: "", confirm: "", mobile_phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await register(form);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (status === "pending_activation") return (
    <AuthShell eyebrow="Verification" title="Check your inbox" script="one last step." subtitle="Enter the six digit code. It expires in 10 minutes." side="Your account is protected by email verification.">
      <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); setLoading(true); try { const { authApi } = await import("@/lib/api/services"); const result = await authApi.verifyEmail(form.email, verifyCode); acceptSession(result); toast.success("Email verified. Your account is ready."); navigate({ to: (next ?? "/account") as never }); } catch (err: any) { toast.error(err.message); } finally { setLoading(false); } }}>
        <RField label="Six digit code" value={verifyCode} onChange={setVerifyCode} />
        <button disabled={loading} className="surface-terracotta w-full rounded-full px-6 py-4">{loading ? "Verifying?" : "Verify email"}</button>
        <button type="button" disabled={loading} className="w-full text-sm underline disabled:opacity-50" onClick={async () => { setLoading(true); try { const { authApi } = await import("@/lib/api/services"); const result = await authApi.resendVerification(form.email); if (result.development_code) setVerifyCode(result.development_code); toast.success(result.detail); } catch (err: any) { toast.error(err.message); } finally { setLoading(false); } }}>Send a new code</button>
      </form>
    </AuthShell>
  );

  return (
    <AuthShell eyebrow="New account" title="Create" script="your account." subtitle="Registration requires a six digit email code (valid for 10 minutes)." side="Create your account to check out faster and track your orders.">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <RField label="First name" value={form.first_name} onChange={(v) => setForm({ ...form, first_name: v })} />
          <RField label="Last name" value={form.last_name} onChange={(v) => setForm({ ...form, last_name: v })} />
        </div>
        <RField label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <RField label="Mobile phone" value={form.mobile_phone} onChange={(v) => setForm({ ...form, mobile_phone: v })} />
        <div className="grid grid-cols-2 gap-3">
          <RField label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
          <RField label="Confirm" type="password" value={form.confirm} onChange={(v) => setForm({ ...form, confirm: v })} />
        </div>
        <label className="text-micro flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-ink/25 p-4 text-ink/60">
          <UploadCloud className="h-4 w-4" />
          Optional profile picture
          <input type="file" className="hidden" />
        </label>
        <button disabled={loading} className="surface-terracotta w-full rounded-full px-6 py-4 text-sm font-semibold uppercase tracking-widest disabled:opacity-50">
          {loading ? "Creating…" : "Create account"}
        </button>
        <p className="text-xs text-ink/60">
          Already a member? <Link to="/auth/login" search={{ next }} className="underline">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}

function RField({ label, type = "text", value, onChange }: { label: string; type?: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
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
