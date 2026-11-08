import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { authApi } from "@/lib/api/services";
import { AuthShell } from "@/components/site/auth-shell";

export const Route = createFileRoute("/auth/reset")({
  component: ResetPage,
});

function ResetPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [stage, setStage] = useState<"request" | "verify">("request");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (stage === "request") {
        const result = await authApi.resetPassword(email);
        if (result.development_code) setCode(result.development_code);
        setStage("verify");
        toast.success(result.detail);
        return;
      }
      if (password !== confirm) {
        toast.error("Passwords do not match.");
        return;
      }
      const result = await authApi.confirmPasswordReset({ email, code, password });
      toast.success(result.detail);
      setStage("request");
      setCode("");
      setPassword("");
      setConfirm("");
    } catch (err: any) {
      toast.error(err.message);
    }
  }
  return (
    <AuthShell eyebrow="Reset" title="Password reset" script="a fresh start." subtitle="We'll email you a secure link to set a new password." side="Editing your own ledger, discreetly.">
      {stage === "verify" ? (
        <div className="bento surface-cream border border-ink/10 p-6 text-center">
          <p className="mb-4 text-sm">If an active account exists for <b>{email}</b>, a reset code has been sent. It expires in 10 minutes.</p>
          <form onSubmit={submit} className="space-y-4 text-left">
            <ResetField label="Six digit code" value={code} onChange={setCode} />
            <ResetField label="New password" type="password" value={password} onChange={setPassword} />
            <ResetField label="Confirm new password" type="password" value={confirm} onChange={setConfirm} />
            <button className="surface-ink w-full rounded-full px-6 py-4 text-sm font-semibold uppercase tracking-widest">Update password</button>
          </form>
          <button type="button" className="mt-3 text-sm underline" onClick={() => { setStage("request"); setCode(""); }}>Send another code</button>
          <Link to="/auth/login" className="surface-ink text-micro mt-4 inline-flex rounded-full px-5 py-2">Back to sign in</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <div className="text-micro mb-1 text-ink/60">Email</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full rounded-2xl border border-ink/15 bg-cream px-4 py-3 text-sm outline-none focus:border-terracotta"
            />
          </label>
          <button className="surface-ink w-full rounded-full px-6 py-4 text-sm font-semibold uppercase tracking-widest">
            Send reset link
          </button>
        </form>
      )}
    </AuthShell>
  );
}

function ResetField({ label, type = "text", value, onChange }: { label: string; type?: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <div className="text-micro mb-1 text-ink/60">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        className="w-full rounded-2xl border border-ink/15 bg-cream px-4 py-3 text-sm outline-none focus:border-terracotta"
      />
    </label>
  );
}
