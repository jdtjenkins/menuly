export const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type PlanInput = { weekday: string; servings: string };
export type PlanServingInput = Pick<PlanInput, "servings">;
export type PlanErrors = { weekday?: string; servings?: string };

export function validatePlanServingInput(input: PlanServingInput): { ok: true; values: { servings: number } } | { ok: false; errors: PlanErrors } {
  const servings = Number(input.servings);
  if (!input.servings.trim() || !Number.isFinite(servings) || servings <= 0) {
    return { ok: false, errors: { servings: "Enter a positive serving quantity." } };
  }
  return { ok: true, values: { servings } };
}

export function validatePlanInput(input: PlanInput): { ok: true; values: { weekday: Weekday; servings: number } } | { ok: false; errors: PlanErrors } {
  const errors: PlanErrors = {};
  const weekday = Number(input.weekday);
  if (!/^[0-6]$/.test(input.weekday) || !Number.isInteger(weekday)) errors.weekday = "Choose a day from Monday through Sunday.";
  const servingResult = validatePlanServingInput(input);
  if (!servingResult.ok) {
    errors.servings = servingResult.errors.servings;
    return { ok: false, errors };
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, values: { weekday: weekday as Weekday, servings: servingResult.values.servings } };
}
