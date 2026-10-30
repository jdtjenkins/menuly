import { AreaEmptyState } from "../area-empty-state";

export default function MealPlanPage() {
  return (
    <AreaEmptyState
      title="Meal Plan"
      intro="A simple place to shape your week and prepare for shopping."
      emptyTitle="Weekly planning is coming soon"
      emptyDescription="Your Monday-to-Sunday plan and shopping list are not available yet. They will appear here once planning is ready."
    />
  );
}
