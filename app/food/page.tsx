import { Suspense } from "react";
import { normalizePublicFoodTerm } from "../../lib/food/public-search";
import { searchPublicFoodCatalog } from "../../lib/food/server";

type FoodPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default function FoodPage({ searchParams }: FoodPageProps) {
  return (
    <div className="space-y-8">
      <div className="max-w-2xl space-y-3">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Your kitchen, organised</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Food</h1>
        <p className="text-lg text-base-content/75">Find a food in the shared catalog.</p>
      </div>
      <Suspense fallback={<p className="text-base-content/75">Loading food search…</p>}>
        <FoodSearch searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function FoodSearch({ searchParams }: FoodPageProps) {
  const params = await searchParams;
  const query = normalizePublicFoodTerm(typeof params.q === "string" ? params.q : undefined);
  const foods = query ? await searchPublicFoodCatalog(query) : [];

  return (
    <section className="card border border-base-300 bg-base-100 shadow-sm" aria-labelledby="food-search-title">
        <div className="card-body gap-5 p-7 sm:p-10">
          <div>
            <h2 id="food-search-title" className="card-title text-2xl">Search foods</h2>
            <p className="mt-2 text-base-content/75">Search by name to see calories. Sign in for full nutrition once accounts are available.</p>
          </div>
          <form action="/food" method="get" role="search" className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="food-query" className="sr-only">Food name</label>
            <input
              id="food-query"
              name="q"
              type="search"
              maxLength={100}
              defaultValue={query}
              placeholder="Try apple or rice"
              className="input input-bordered w-full sm:max-w-md"
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
          <div aria-live="polite">
            {!query ? (
              <p className="text-base-content/75">Enter a food name to search the catalog.</p>
            ) : foods.length === 0 ? (
              <p className="text-base-content/75">No foods found for “{query}”.</p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-base-content/75">Showing {foods.length} result{foods.length === 1 ? "" : "s"} for “{query}”.</p>
                <ul className="divide-y divide-base-300 rounded-xl border border-base-300" aria-label="Food search results">
                  {foods.map((food, index) => (
                    <li key={`${food.name}-${index}`} className="flex items-center justify-between gap-4 px-4 py-3">
                      <span className="font-medium">{food.name}</span>
                      <span className="shrink-0 text-base-content/75">{food.calories === null ? "Calories unavailable" : `${food.calories} kcal`}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
    </section>
  );
}
