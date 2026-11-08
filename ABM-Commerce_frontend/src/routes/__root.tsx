import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  Link,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { CartDrawer } from "@/components/site/cart-drawer";
import { useI18n } from "@/stores/i18n";
import { useAuth } from "@/stores/auth";
import { tokens } from "@/lib/api/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="text-display text-[8rem] leading-none text-terracotta">404</div>
        <p className="text-script mt-2 text-2xl">Page not found</p>
        <p className="mt-4 text-sm text-ink/60">The page you are looking for could not be found.</p>
        <Link to="/" className="surface-ink text-micro mt-6 inline-flex rounded-full px-6 py-3">
          Return home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    console.error("Application error", error);
  }, [error]);
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 text-center">
      <div>
        <h1 className="text-display text-4xl">Something broke.</h1>
        <p className="mt-2 text-sm text-ink/60">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="surface-terracotta text-micro mt-6 rounded-full px-6 py-3"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ABM Market | Great prices, everyday" },
      {
        name: "description",
        content:
          "Shop electronics, fashion, home, beauty and everyday essentials at great prices across Egypt.",
      },
      { property: "og:title", content: "ABM Market" },
      { property: "og:description", content: "Everyday shopping, made easy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito+Sans:wght@400;500;600;700;800;900&family=Tajawal:wght@400;500;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const locale = useI18n((s) => s.locale);
  useEffect(() => {
    document.documentElement.setAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", locale);
  }, [locale]);
  useEffect(() => {
    if (tokens.access) void useAuth.getState().refreshMe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
      <CartDrawer />
      <Toaster position="top-center" toastOptions={{ style: { borderRadius: "1rem" } }} />
    </QueryClientProvider>
  );
}
