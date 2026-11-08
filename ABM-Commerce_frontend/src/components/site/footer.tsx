import { Link } from "@tanstack/react-router";
import { Headphones, ShieldCheck, Truck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-14 bg-[#101d35] text-white">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:px-8 md:py-16">
        <div>
          <Link to="/" className="market-wordmark market-footer-wordmark">
            ABM<span className="!text-[#ffe500]">market</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
            A better way to shop for the things you use every day. Great finds, fair prices and
            helpful service.
          </p>
          <div className="mt-6 space-y-3 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-[#ffe500]" /> Delivery across Egypt
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#ffe500]" /> Secure account and checkout
            </div>
            <div className="flex items-center gap-2">
              <Headphones className="h-4 w-4 text-[#ffe500]" /> Customer support when you need us
            </div>
          </div>
        </div>
        <FooterCol
          title="Shop"
          links={[
            ["All products", "/shop"],
            ["Electronics", "/shop?category=technology"],
            ["Fashion", "/shop?category=fashion"],
            ["Home & living", "/shop?category=home-living"],
            ["Beauty", "/shop?category=beauty"],
          ]}
        />
        <FooterCol
          title="Your account"
          links={[
            ["Sign in", "/auth/login"],
            ["Create account", "/auth/register"],
            ["My orders", "/account/orders"],
            ["Saved items", "/account/wishlist"],
          ]}
        />
        <FooterCol
          title="Our marketplace"
          links={[
            ["Sell with us", "/seller"],
            ["Delivery information", "/shop"],
            ["Returns & refunds", "/account/orders"],
            ["Order help", "/account/orders"],
          ]}
        />
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-xs text-slate-400">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-2 sm:flex-row">
          <span>© {new Date().getFullYear()} ABM Market. All rights reserved.</span>
          <span>Shop smart. Live well.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-white">{title}</h2>
      <ul className="mt-4 space-y-3">
        {links.map(([label, to]) => (
          <li key={label}>
            {to.startsWith("mailto:") ? (
              <a className="text-sm text-slate-300 hover:text-white" href={to}>
                {label}
              </a>
            ) : (
              <Link className="text-sm text-slate-300 hover:text-white" to={to as never}>
                {label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
