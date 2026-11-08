import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, MapPin, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/stores/cart";
import { useAuth } from "@/stores/auth";
import { useI18n } from "@/stores/i18n";

const NAV = [
  { to: "/shop", label: "All deals", ar: "كل العروض" },
  { to: "/shop?category=technology", label: "Electronics", ar: "إلكترونيات" },
  { to: "/shop?category=fashion", label: "Fashion", ar: "أزياء" },
  { to: "/shop?category=home-living", label: "Home", ar: "المنزل" },
  { to: "/shop?category=beauty", label: "Beauty", ar: "الجمال" },
  { to: "/shop?category=gourmet", label: "Grocery", ar: "بقالة" },
];

export function SiteHeader() {
  const cart = useCart();
  const { user } = useAuth();
  const { locale, setLocale, t } = useI18n();
  const navigate = useNavigate();
  const [mobile, setMobile] = useState(false);
  const [query, setQuery] = useState("");

  function search(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: "/shop", search: { search: query.trim() || undefined } as never });
  }

  return (
    <header className="market-header sticky top-0 z-40 shadow-sm">
      <div className="market-topbar px-4 py-2 text-xs md:px-8">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3">
          <span className="hidden sm:inline">Everyday prices. Delivered to your door.</span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Deliver to <b>Egypt</b>
          </span>
          <button
            onClick={() => setLocale(locale === "en" ? "ar" : "en")}
            className="font-semibold"
          >
            {locale === "en" ? "العربية" : "English"}
          </button>
        </div>
      </div>

      <div className="market-mainbar px-4 py-3 md:px-8">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-8">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobile((v) => !v)}
              className="market-icon md:hidden"
              aria-label="Toggle menu"
            >
              {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link to="/" className="market-wordmark" aria-label="ABM Market home">
              ABM<span>market</span>
            </Link>
          </div>

          <form onSubmit={search} className="market-search hidden md:flex">
            <Search className="h-5 w-5 shrink-0 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, brands and more"
              aria-label="Search products"
            />
            <button type="submit">Search</button>
          </form>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link to={user ? "/account" : "/auth/login"} className="market-action hidden sm:flex">
              <UserRound className="h-5 w-5" />
              <span>{user ? user.first_name || "Account" : "Sign in"}</span>
            </Link>
            <Link
              to="/account/wishlist"
              className="market-icon hidden sm:grid"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </Link>
            <button
              onClick={() => cart.toggle()}
              className="market-cart"
              aria-label={`Shopping bag, ${cart.count()} items`}
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="hidden sm:inline">Cart</span>
              {cart.count() > 0 && <b>{cart.count()}</b>}
            </button>
          </div>
        </div>
        <form onSubmit={search} className="market-search mt-3 flex md:hidden">
          <Search className="h-5 w-5 shrink-0 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products and brands"
            aria-label="Search products"
          />
          <button type="submit" aria-label="Search">
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>

      <nav className="market-categories hidden overflow-x-auto px-4 md:block md:px-8">
        <div className="mx-auto flex max-w-[1440px] items-center gap-8 whitespace-nowrap">
          {NAV.map((item) => (
            <Link key={item.label} to={item.to as never} className="market-category">
              {t(item.label, item.ar)}
            </Link>
          ))}
          <Link to="/seller" className="market-category ml-auto">
            {user?.role === "seller" ? "Seller Studio" : "Sell with us"}
          </Link>
        </div>
      </nav>

      {mobile && (
        <nav className="grid gap-1 border-t border-slate-200 p-3 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to as never}
              onClick={() => setMobile(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-slate-100"
            >
              {t(item.label, item.ar)}
            </Link>
          ))}
          <Link
            to="/seller"
            onClick={() => setMobile(false)}
            className="rounded-xl bg-[#f5e85b] px-3 py-2.5 text-sm font-extrabold text-[#321344]"
          >
            {user?.role === "seller" ? "Seller Studio" : "Become a seller"}
          </Link>
          <Link
            to="/account/wishlist"
            onClick={() => setMobile(false)}
            className="rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-slate-100"
          >
            Saved items
          </Link>
          {!user && (
            <Link
              to="/auth/login"
              onClick={() => setMobile(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-slate-100"
            >
              Sign in
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
