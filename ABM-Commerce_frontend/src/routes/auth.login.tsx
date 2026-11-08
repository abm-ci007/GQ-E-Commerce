import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/stores/auth";
import { AuthShell } from "@/components/site/auth-shell";
import { safeReturnPath } from "@/lib/auth/navigation";

export const Route = createFileRoute("/auth/login")({
  validateSearch: (search: Record<string, unknown>) => {
    const next = typeof search.next === "string" ? safeReturnPath(search.next) : undefined;
    return next ? { next } : {};
  },
  component: LoginPage,
});

function LoginPage() {
  const login = useAuth((s) => s.login);
  const acceptSession = useAuth((s) => s.acceptSession);
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) return;
    const script = document.createElement("script"); script.src = "https://accounts.google.com/gsi/client"; script.async = true; script.onload = () => {
      const google = (window as any).google;
      google.accounts.id.initialize({ client_id: clientId, callback: async ({ credential }: { credential: string }) => {
        try { const { authApi } = await import("@/lib/api/services"); const result = await authApi.google(credential); acceptSession(result); toast.success("Welcome back"); navigate({ to: (next ?? "/account") as never }); } catch (err: any) { toast.error(err.message); }
      }}); google.accounts.id.renderButton(document.getElementById("google-signin"), { theme: "outline", size: "large", width: 320 }); setGoogleReady(true);
    }; document.head.appendChild(script); return () => { script.remove(); };
  }, [acceptSession, navigate, next]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      navigate({ to: (next ?? "/account") as never });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Session"
      title="Sign in"
      script="welcome."
      subtitle="Only accounts activated via email may sign in."
      side="You are entering a curated marketplace."
    >
      <form onSubmit={submit} className="space-y-4">
        <AuthField label="Email" type="email" value={email} onChange={setEmail} />
        <AuthField label="Password" type="password" value={password} onChange={setPassword} />
        <button
          disabled={loading}
          className="surface-ink w-full rounded-full px-6 py-4 text-sm font-semibold uppercase tracking-widest disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-ink/15" />
          <span className="text-micro text-ink/50">or</span>
          <span className="h-px flex-1 bg-ink/15" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div id="google-signin" className="col-span-2 flex justify-center" />
          {!googleReady && <p className="col-span-2 text-center text-xs text-ink/50">Google sign-in is available when configured by the administrator.</p>}
        </div>
        <p className="text-xs text-ink/60">
          <Link to="/auth/reset" className="underline">Forgot password?</Link>
          <span className="mx-2">·</span>
          <Link to="/auth/register" search={{ next }} className="underline">Create account</Link>
        </p>
      </form>
    </AuthShell>
  );
}

function AuthField({ label, type, value, onChange }: { label: string; type: string; value: string; onChange: (v: string) => void }) {
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


