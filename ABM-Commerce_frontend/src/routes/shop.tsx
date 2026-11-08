import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { productsApi, categoriesApi } from "@/lib/api/services";
import { ProductCard } from "@/components/site/product-card";

interface ShopSearch {
  search?: string;
  category?: string;
  min_price?: string;
  max_price?: string;
  brand?: string;
  in_stock?: string;
  ordering?: string;
  page?: number;
}

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): ShopSearch => ({
    search: s.search as string | undefined,
    category: s.category as string | undefined,
    min_price: s.min_price as string | undefined,
    max_price: s.max_price as string | undefined,
    brand: s.brand as string | undefined,
    in_stock: s.in_stock as string | undefined,
    ordering: s.ordering as string | undefined,
    page: Number(s.page) || 1,
  }),
  component: ShopPage,
});

function ShopPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [min, setMin] = useState(search.min_price ?? "");
  const [max, setMax] = useState(search.max_price ?? "");
  const [brand, setBrand] = useState(search.brand ?? "");
  const [inStock, setInStock] = useState(search.in_stock === "true");
  useEffect(() => { setMin(search.min_price ?? ""); setMax(search.max_price ?? ""); setBrand(search.brand ?? ""); setInStock(search.in_stock === "true"); }, [search.min_price, search.max_price, search.brand, search.in_stock]);
  const query = Object.fromEntries(
    Object.entries(search).filter(([, value]) => value != null && value !== ""),
  ) as Record<string, string>;
  const { data, isLoading } = useQuery({
    queryKey: ["products", query],
    queryFn: () => productsApi.list(query),
  });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.list });
  const categoryList = Array.isArray(categories) ? categories : [];
  const products = data?.results ?? [];
  const pages = Math.max(1, Math.ceil((data?.count ?? 0) / 24));

  function patchSearch(patch: Partial<ShopSearch>) {
    navigate({ search: (current: ShopSearch) => ({ ...current, ...patch }) });
  }

  return (
    <div className="market-page min-h-[65vh]">
      <div className="mx-auto max-w-[1440px] px-4 py-7 md:px-8 md:py-9">
        <div className="mb-6">
          <p className="market-kicker">ABM Market</p>
          <h1 className="market-heading">
            {search.search
              ? `Results for “${search.search}”`
              : search.category
                ? (categoryList.find((c) => c.slug === search.category)?.name ?? "Shop by category")
                : "Shop all products"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{data?.count ?? 0} items to explore</p>
        </div>
        <div className="mb-5 flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
          <Chip
            label="All"
            active={!search.category}
            onClick={() => patchSearch({ category: undefined, page: 1 })}
          />
          {categoryList.map((category) => (
            <Chip
              key={category.id}
              label={category.name}
              active={search.category === category.slug}
              onClick={() => patchSearch({ category: category.slug, page: 1 })}
            />
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="market-filter-panel h-fit">
            <div className="mb-4 flex items-center gap-2 font-bold text-slate-900">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                patchSearch({ min_price: min || undefined, max_price: max || undefined, brand: brand.trim() || undefined, in_stock: inStock ? "true" : undefined, page: 1 });
              }}
            >
              <label className="market-label">Price range (EGP)</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  className="market-input"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  placeholder="Min"
                  value={min}
                  onChange={(e) => setMin(e.target.value)}
                />
                <input
                  className="market-input"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  placeholder="Max"
                  value={max}
                  onChange={(e) => setMax(e.target.value)}
                />
              </div>
              <button className="market-filter-button mt-3">Apply filters</button>
            </form>
            <label className="market-label mt-5 block">Brand</label>
            <input className="market-input mt-2" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Search by brand" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); patchSearch({ brand: brand.trim() || undefined, page: 1 }); } }} />
            <button type="button" className="market-filter-button mt-2" onClick={() => patchSearch({ brand: brand.trim() || undefined, page: 1 })}>Apply brand</button>
            <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={inStock} onChange={(e) => { setInStock(e.target.checked); patchSearch({ in_stock: e.target.checked ? "true" : undefined, page: 1 }); }} /> Available now</label>
            {(search.min_price || search.max_price || search.brand || search.in_stock) && (
              <button
                className="mt-3 text-xs font-bold text-blue-700"
                onClick={() => {
                  setMin("");
                  setMax("");
                  patchSearch({ min_price: undefined, max_price: undefined, brand: undefined, in_stock: undefined, page: 1 });
                  setBrand("");
                  setInStock(false);
                }}
              >
                Clear all filters
              </button>
            )}
          </aside>

          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <span className="text-sm text-slate-600">
                Showing {products.length ? (search.page! - 1) * 24 + 1 : 0}–
                {Math.min((search.page! - 1) * 24 + products.length, data?.count ?? 0)} of{" "}
                {data?.count ?? 0}
              </span>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                Sort by{" "}
                <select
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800"
                  value={search.ordering ?? "-created_at"}
                  onChange={(e) => patchSearch({ ordering: e.target.value, page: 1 })}
                >
                  <option value="-created_at">Newest arrivals</option>
                  <option value="effective_price">Price: low to high</option>
                  <option value="-effective_price">Price: high to low</option>
                </select>
              </label>
            </div>
            {isLoading ? (
              <div className="market-empty">Loading products…</div>
            ) : products.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="market-empty">
                No products match these filters. Try another search.
              </div>
            )}
            {pages > 1 && (
              <div className="mt-7 flex items-center justify-center gap-3">
                <button
                  className="market-page-button"
                  disabled={search.page! <= 1}
                  onClick={() => patchSearch({ page: search.page! - 1 })}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <span className="text-sm font-semibold text-slate-600">
                  Page {search.page} of {pages}
                </span>
                <button
                  className="market-page-button"
                  disabled={search.page! >= pages}
                  onClick={() => patchSearch({ page: search.page! + 1 })}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`market-chip ${active ? "active" : ""}`}>
      {label}
    </button>
  );
}
