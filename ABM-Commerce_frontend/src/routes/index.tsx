import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  ArrowRight,
  BadgePercent,
  Coffee,
  CookingPot,
  Footprints,
  Headphones,
  House,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Truck,
} from "lucide-react";
import { productsApi, categoriesApi } from "@/lib/api/services";
import { ProductCard } from "@/components/site/product-card";

export const Route = createFileRoute("/")({ component: HomePage });

const categoryArt = [Smartphone, Footprints, House, Sparkles, CookingPot, Coffee];

function HomePage() {
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>(".market-scroll-reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -36px 0px" },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const { data } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.list({ page_size: "24" }),
  });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.list });
  const categoryList = Array.isArray(categories) ? categories : [];
  const products = data?.results ?? [];
  const deals = products.filter((product) => product.discount_price != null);
  const featured = deals.length ? deals.slice(0, 8) : products.slice(0, 8);

  return (
    <div className="market-page">
      <section className="mx-auto max-w-[1440px] px-4 pt-4 md:px-8 md:pt-7">
        <div className="market-hero market-editorial-hero">
          <div className="market-hero-copy">
            <span className="market-pill mb-6 w-fit">
              <BadgePercent className="h-4 w-4" /> The ABM edit · Made for everyday
            </span>
            <p className="market-hero-overline">A little color for your everyday</p>
            <h1 className="text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
              Find your
              <br />
              <em>happy place.</em>
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-white/75 sm:text-lg">
              Fresh finds, bright ideas, and everyday favorites — all together in one happy place.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/shop" className="market-button-yellow">
                Explore the edit <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/categories" className="market-hero-secondary">
                Browse categories
              </Link>
            </div>
            <div className="market-hero-note">
              <Truck className="h-4 w-4" /> Delivered with care across Egypt
            </div>
          </div>
          <div className="market-hero-visual">
            <img
              src="https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&auto=format&fit=crop&q=85"
              alt="A colorful collection of carefully chosen finds"
            />
            <div className="market-hero-stamp">
              <span>Good<br />things<br />live here.</span>
              <Sparkles />
            </div>
            <div className="market-hero-caption">
              <span>01 / 04</span>
              <span>Everyday, with extra joy</span>
            </div>
          </div>
        </div>
        <div className="market-ribbon" aria-label="ABM marketplace benefits">
          <div className="market-ribbon-track" aria-hidden="true">
            {[0, 1].map((loop) => (
              <div className="market-ribbon-group" key={loop}>
                <span>GOOD FINDS, EVERY DAY</span><i>✳</i><span>ONE PLACE, MANY POSSIBILITIES</span><i>✳</i><span>MADE FOR YOUR EVERYDAY</span><i>✳</i>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="market-scroll-reveal mx-auto max-w-[1440px] px-4 pt-10 md:px-8 md:pt-14">
        <div className="market-section-head">
          <div>
            <p className="market-kicker">Pick your kind of happy</p>
            <h2 className="market-heading">A world of good things</h2>
          </div>
          <Link to="/categories" className="market-text-link">
            All categories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          {categoryList.slice(0, 6).map((category, index) => {
            const Icon = categoryArt[index % categoryArt.length];
            return (
              <Link
                key={category.id}
                to="/shop"
                search={{ category: category.slug } as never}
                className={`market-category-tile market-category-tile-${index % 6} group`}
              >
                <span className="market-category-art"><Icon strokeWidth={1.4} /></span>
                <span className="market-category-name">{category.name}</span>
                <span className="market-category-explore">Explore <ArrowRight className="h-3 w-3" /></span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="market-scroll-reveal mx-auto max-w-[1440px] px-4 pt-12 md:px-8 md:pt-16">
        <div className="market-section-head">
          <div>
            <p className="market-kicker">Little joys, big favorites</p>
            <h2 className="market-heading">Meet your new favorites</h2>
          </div>
          <Link to="/shop" className="market-text-link">
            See all products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {featured.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {featured.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="market-empty">Products are on their way. Check back soon.</div>
        )}
      </section>

      <section className="market-scroll-reveal mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
        <div className="market-story-banner">
          <div className="market-story-copy">
            <p className="market-kicker">Good mood. Good finds.</p>
            <h2>Everyday things,<br /><em>extra joyful.</em></h2>
            <p>From little home upgrades to your next favorite accessory, find something that makes an ordinary day feel special.</p>
            <Link to="/shop" className="market-story-link">Find your happy place <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="market-story-art" aria-hidden="true">
            <span>ABM<br />MARKET</span><Sparkles className="h-8 w-8" />
            <i className="market-story-orbit market-story-orbit-one" />
            <i className="market-story-orbit market-story-orbit-two" />
          </div>
        </div>
      </section>

      <section className="market-scroll-reveal mx-auto max-w-[1440px] px-4 pb-12 md:px-8 md:pb-16">
        <div className="market-promise-grid">
          <Promise icon={<Truck />} title="Fast delivery" detail="Across Egypt, to your door" />
          <Promise icon={<ShieldCheck />} title="Shop with confidence" detail="Secure checkout and support" />
          <Promise icon={<RotateCcw />} title="Easy returns" detail="Simple help when you need it" />
          <Promise icon={<Headphones />} title="Here to help" detail="Friendly customer care" />
        </div>
      </section>

      {deals.length > 8 && (
        <section className="mx-auto max-w-[1440px] px-4 pb-12 md:px-8">
          <h2 className="market-heading mb-4">More to discover</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {deals.slice(8, 13).map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function Promise({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="market-promise-icon">{icon}</span>
      <span>
        <strong className="block text-sm text-slate-900">{title}</strong>
        <small className="text-xs text-slate-500">{detail}</small>
      </span>
    </div>
  );
}
