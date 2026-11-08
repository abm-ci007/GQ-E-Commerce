import type { ReactNode } from "react";

export function AuthShell({
  eyebrow, title, script, subtitle, side, children,
}: {
  eyebrow: string; title: string; script: string; subtitle: string; side: string; children: ReactNode;
}) {
  return (
    <div className="px-4 py-10 md:px-8">
      <div className="bento-lg mx-auto grid max-w-6xl grid-cols-1 overflow-hidden md:grid-cols-2">
        <aside className="surface-ink relative hidden flex-col justify-between p-10 md:flex">
          <div>
            <div className="text-micro text-terracotta-soft">ABM · commerce</div>
            <h2 className="text-display mt-4 text-5xl text-cream">
              Composure
              <span className="text-script text-terracotta-soft block">is a discipline.</span>
            </h2>
          </div>
          <p className="text-sm text-cream/60">{side}</p>
        </aside>
        <section className="surface-cream-deep p-8 md:p-12">
          <div className="text-micro text-terracotta">{eyebrow}</div>
          <h1 className="text-display mt-2 text-4xl md:text-5xl">
            {title}
            <span className="text-script text-ink/60 ml-2">{script}</span>
          </h1>
          <p className="mt-2 text-sm text-ink/60">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </section>
      </div>
    </div>
  );
}
