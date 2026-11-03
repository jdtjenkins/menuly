import { Suspense } from "react";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import { getCurrentAccount } from "../../../../../lib/auth/current-account";
import { getCurrentPersonalFood } from "../../../../../lib/food/personal-server";
import { updatePersonalFoodAction } from "../../actions";
import { PersonalFoodForm } from "../../personal-food-form";

type Props = { params: Promise<{ id: string }> };

export default function EditPersonalFoodPage({ params }: Props) {
  return <Suspense fallback={<p>Loading food…</p>}><EditPersonalFood params={params} /></Suspense>;
}

async function EditPersonalFood({ params }: Props) {
  await connection();
  if (!await getCurrentAccount()) redirect("/food");
  const { id } = await params;
  const food = await getCurrentPersonalFood(id);
  if (!food) notFound();
  return <div className="w-full min-w-0 space-y-6">
    <div><h1 className="page-heading">Edit personal food</h1><p className="page-lead">The unit stays fixed after creation.</p></div>
    <PersonalFoodForm action={updatePersonalFoodAction.bind(null, id)} edit initial={{
      name: food.name, unit: food.unit, referenceAmount: String(food.referenceAmount), calories: String(food.calories),
      protein: food.protein === null ? "" : String(food.protein), carbohydrates: food.carbohydrates === null ? "" : String(food.carbohydrates),
      fat: food.fat === null ? "" : String(food.fat),
    }} />
  </div>;
}
