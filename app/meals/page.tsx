import { AreaEmptyState } from "../area-empty-state";

export default function MealsPage() {
  return (
    <AreaEmptyState
      title="Meals"
      intro="Keep your favourite ingredient-only meals together."
      emptyTitle="Meal building is coming soon"
      emptyDescription="There are no meals to create or browse yet. This area will hold saved meals and their nutrition details."
    />
  );
}
