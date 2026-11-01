import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getCurrentAccount } from "../../../../lib/auth/current-account";
import { createPersonalFoodAction } from "../actions";
import { PersonalFoodForm } from "../personal-food-form";

export default function NewPersonalFoodPage() {
  return <Suspense fallback={<p>Loading food form…</p>}><NewPersonalFood /></Suspense>;
}

async function NewPersonalFood() {
  await connection();
  if (!await getCurrentAccount()) redirect("/food");
  return <div className="mx-auto max-w-2xl space-y-6">
    <div><h1 className="text-3xl font-bold">Create personal food</h1><p className="mt-2 text-base-content/70">Add your own food and reference nutrition.</p></div>
    <PersonalFoodForm action={createPersonalFoodAction} />
  </div>;
}
