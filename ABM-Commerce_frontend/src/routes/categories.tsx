import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { categoriesApi, productsApi } from "@/lib/api/services";

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data: cats } = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.list });
  const { data: products } = useQuery({ queryKey: ["products"], queryFn: () => productsApi.list() });
  const categoryList = Array.isArray(cats) ? cats : [];

  return (
    <div className="px-4 py-10 md:px-8">
      <h1 className="text-display text-5xl md:text-7xl">
        Categories
        <span className="text-script text-terracotta ml-2">— the map.</span>
      </h1>
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categoryList.map((c, i) => {
          const bgs = ["surface-ink text-cream", "surface-terracotta", "surface-cream-deep", "bg-olive text-cream", "bg-ochre", "bg-plum text-cream"];
          const catProducts = (products?.results ?? []).filter((p) => p.categories.some((item) => item.slug === c.slug)).slice(0, 3);
          return (
            <Link
              key={c.id}
              to="/shop"
              search={{ category: c.slug } as any}
              className={`bento-lg group relative flex min-h-[320px] flex-col justify-between p-6 ${bgs[i % bgs.length]}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-micro opacity-70">0{i + 1}</div>
                  <div className="text-display mt-2 text-4xl">{c.name}</div>
                  <div className="text-script text-lg opacity-80">{c.name_ar}</div>
                </div>
                <div className="text-micro opacity-70">{catProducts.length}+ items</div>
              </div>
              <div className="flex gap-3">
                {catProducts.map((p) => (
                  <img
                    key={p.id}
                    src={p.images?.[0]?.url}
                    alt={p.name}
                    className="h-24 w-20 rounded-2xl object-cover"
                  />
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
