import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { getCurrentAccount } from "../../lib/auth/current-account";
import { normalizeFoodPage } from "../../lib/food/full-catalog";
import { normalizePublicFoodTerm } from "../../lib/food/public-search";
import { readAuthenticatedFoodCatalog, searchPublicFoodCatalog } from "../../lib/food/server";
import { listCurrentPersonalFoods } from "../../lib/food/personal-server";
import { ArchiveFoodControl } from "./personal/archive-food-control";

type FoodPageProps = { searchParams: Promise<{ q?: string | string[]; page?: string | string[]; personalPage?: string | string[]; view?: string | string[] }> };

export default function FoodPage({ searchParams }: FoodPageProps) {
  return <div className="space-y-8">
    <div className="max-w-2xl space-y-3">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Your kitchen, organised</p>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Food</h1>
      <p className="text-lg text-base-content/75">Find a food in the shared catalog.</p>
    </div>
    <Suspense fallback={<p className="text-base-content/75">Loading foods…</p>}>
      <FoodContents searchParams={searchParams} />
    </Suspense>
  </div>;
}

async function FoodContents({ searchParams }: FoodPageProps) {
  await connection();
  const [params, account] = await Promise.all([searchParams, getCurrentAccount()]);
  if (account && params.view !== "global") return <PersonalFoods searchParams={searchParams} />;
  return <div className="space-y-4">
    {account && <Link href="/food#personal-foods" className="btn btn-outline">My foods</Link>}
    <FoodSearch searchParams={searchParams} />
  </div>;
}

function nutrition(value: number | null, unit: string): string {
  return value === null ? "Unavailable" : `${value} ${unit}`;
}

async function FoodSearch({ searchParams }: FoodPageProps) {
  await connection();
  const params = await searchParams;
  const query = normalizePublicFoodTerm(typeof params.q === "string" ? params.q : undefined);
  const page = normalizeFoodPage(typeof params.page === "string" ? params.page : undefined);
  const account = await getCurrentAccount();
  const full = account ? await readAuthenticatedFoodCatalog(query, page) : null;
  const publicFoods = !account && query ? await searchPublicFoodCatalog(query) : [];
  const pageUrl = (nextPage: number) => `/food?${new URLSearchParams({ ...(account ? { view: "global" } : {}), ...(query ? { q: query } : {}), page: String(nextPage) })}`;

  return <section className="card border border-base-300 bg-base-100 shadow-sm" aria-labelledby="food-search-title">
    <div className="card-body gap-5 p-7 sm:p-10">
      <div>
        <h2 id="food-search-title" className="card-title text-2xl">Search foods</h2>
        <p className="mt-2 text-base-content/75">{account ? "Browse foods and their reference nutrition." : "Search by name to see calories. Use Sign in with Google in the navigation for full nutrition."}</p>
      </div>
      <form action="/food" method="get" role="search" className="flex flex-col gap-3 sm:flex-row">
        {account && <input type="hidden" name="view" value="global" />}
        <label htmlFor="food-query" className="sr-only">Food name</label>
        <input id="food-query" name="q" type="search" maxLength={100} defaultValue={query}
          placeholder="Try apple or rice" className="input input-bordered w-full sm:max-w-md" />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>
      <div aria-live="polite">
        {account && full ? full.foods.length === 0 ? <p className="text-base-content/75">No foods found{query ? ` for “${query}”` : ""}.</p> : <div className="space-y-4">
          <p className="text-sm text-base-content/75">Page {full.page} · Showing {full.foods.length} foods</p>
          <ul className="space-y-3" aria-label="Full food catalog">
            {full.foods.map((food) => <li key={food.id} className="rounded-xl border border-base-300 p-4">
              <h3 className="font-semibold">{food.name}</h3>
              <p className="text-sm text-base-content/75">Per {food.referenceAmount} {food.unit}</p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <div><dt>Calories</dt><dd>{nutrition(food.calories, "kcal")}</dd></div>
                <div><dt>Protein</dt><dd>{nutrition(food.protein, "g")}</dd></div>
                <div><dt>Carbohydrates</dt><dd>{nutrition(food.carbohydrates, "g")}</dd></div>
                <div><dt>Fat</dt><dd>{nutrition(food.fat, "g")}</dd></div>
              </dl>
            </li>)}
          </ul>
          <nav aria-label="Catalog pages" className="flex gap-3">
            {full.page > 1 && <a className="btn btn-outline" href={pageUrl(full.page - 1)}>Previous</a>}
            {full.hasNext && <a className="btn btn-outline" href={pageUrl(full.page + 1)}>Next</a>}
          </nav>
        </div> : !query ? <p className="text-base-content/75">Enter a food name to search the catalog.</p>
          : publicFoods.length === 0 ? <p className="text-base-content/75">No foods found for “{query}”.</p>
          : <div className="space-y-3">
            <p className="text-sm text-base-content/75">Showing {publicFoods.length} result{publicFoods.length === 1 ? "" : "s"} for “{query}”.</p>
            <ul className="divide-y divide-base-300 rounded-xl border border-base-300" aria-label="Food search results">
              {publicFoods.map((food, index) => <li key={`${food.name}-${index}`} className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="font-medium">{food.name}</span>
                <span className="shrink-0 text-base-content/75">{food.calories === null ? "Calories unavailable" : `${food.calories} kcal`}</span>
              </li>)}
            </ul>
          </div>}
      </div>
    </div>
  </section>;
}

async function PersonalFoods({ searchParams }: FoodPageProps) {
  await connection();
  if (!await getCurrentAccount()) return null;
  const params = await searchParams;
  const page = normalizeFoodPage(typeof params.personalPage === "string" ? params.personalPage : undefined);
  const result = await listCurrentPersonalFoods(page);
  const pageHref = (next: number) => `/food?personalPage=${next}#personal-foods`;

  return <section id="personal-foods" aria-labelledby="personal-foods-title" className="card border border-base-300 bg-base-100 shadow-sm">
    <div className="card-body gap-5 p-7 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h2 id="personal-foods-title" className="card-title text-2xl">My foods</h2><p className="mt-2 text-base-content/75">Foods you create are private to your account.</p></div>
        <Link href="/food/personal/new" className="btn btn-primary">Create personal food</Link>
      </div>
      <Link href="/food?view=global" className="btn btn-outline w-fit">See global foods</Link>
      {result.foods.length === 0 ? <p className="text-base-content/75">No personal foods yet. Create one to get started.</p> : <>
        <ul className="space-y-3" aria-label="My foods">
          {result.foods.map((food) => <li key={food.id} className="rounded-xl border border-base-300 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h3 className="font-semibold">{food.name}</h3><p className="text-sm text-base-content/75">Per {food.referenceAmount} {food.unit}</p></div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/food/personal/${encodeURIComponent(food.id)}/edit`} className="btn btn-outline btn-sm" aria-label={`Edit ${food.name}`}>Edit</Link>
                <ArchiveFoodControl id={food.id} name={food.name} />
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <div><dt>Calories</dt><dd>{food.calories} kcal</dd></div>
              <div><dt>Protein</dt><dd>{nutrition(food.protein, "g")}</dd></div>
              <div><dt>Carbohydrates</dt><dd>{nutrition(food.carbohydrates, "g")}</dd></div>
              <div><dt>Fat</dt><dd>{nutrition(food.fat, "g")}</dd></div>
            </dl>
          </li>)}
        </ul>
        <nav aria-label="My foods pages" className="flex gap-3">
          {result.page > 1 && <Link href={pageHref(result.page - 1)} className="btn btn-outline">Previous my foods</Link>}
          {result.hasNext && <Link href={pageHref(result.page + 1)} className="btn btn-outline">Next my foods</Link>}
        </nav>
      </>}
    </div>
  </section>;
}
