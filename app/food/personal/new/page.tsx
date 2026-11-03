import { Suspense } from "react";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import { getCurrentAccount } from "../../../../lib/auth/current-account";
import { getCurrentGlobalCloneDraft } from "../../../../lib/food/clone-server";
import { createGlobalCloneAction, createPersonalFoodAction } from "../actions";
import { PersonalFoodForm } from "../personal-food-form";

type NewPersonalFoodPageProps = { searchParams: Promise<{ clone?: string | string[] }> };

export default function NewPersonalFoodPage({ searchParams }: NewPersonalFoodPageProps) {
  return <Suspense fallback={<p>Loading food form…</p>}><NewPersonalFood searchParams={searchParams} /></Suspense>;
}

async function NewPersonalFood({ searchParams }: NewPersonalFoodPageProps) {
  await connection();
  if (!await getCurrentAccount()) redirect("/food");
  const { clone } = await searchParams;
  if (clone !== undefined && (typeof clone !== "string" || !clone)) notFound();
  const sourceId = typeof clone === "string" ? clone : null;
  const initial = sourceId ? await getCurrentGlobalCloneDraft(sourceId) : undefined;
  if (sourceId && !initial) notFound();
  return <div className="w-full min-w-0 space-y-6">
    <div><h1 className="page-heading">{sourceId ? "Copy global food" : "Create personal food"}</h1>
      <p className="page-lead">{sourceId ? "Review these values before saving an independent food in My foods." : "Add your own food and reference nutrition."}</p>
      {sourceId && initial?.calories === "" && <p className="mt-2 text-sm text-warning">The global food has no calories. Enter calories before saving your copy.</p>}
    </div>
    <PersonalFoodForm key={sourceId ?? "new"} action={sourceId ? createGlobalCloneAction.bind(null, sourceId) : createPersonalFoodAction}
      initial={initial ?? undefined} cancelHref={sourceId ? "/food?view=global" : undefined} submitLabel={sourceId ? "Create copy" : undefined} />
  </div>;
}
