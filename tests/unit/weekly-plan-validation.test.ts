import { expect, test } from "vitest";
import { validatePlanInput } from "../../lib/plan/validation";

test("weekly plan accepts seven days and fractional servings", () => {
  expect(validatePlanInput({ weekday: "0", servings: "0.5" })).toEqual({ ok: true, values: { weekday: 0, servings: 0.5 } });
  expect(validatePlanInput({ weekday: "6", servings: "2" })).toEqual({ ok: true, values: { weekday: 6, servings: 2 } });
});

test.each(["", "0", "-1", "Infinity", "NaN", "abc"])("invalid servings %s are rejected", (servings) => {
  expect(validatePlanInput({ weekday: "2", servings })).toEqual({ ok: false, errors: { servings: "Enter a positive serving quantity." } });
});

test.each(["", "-1", "7", "1.5", "Monday"])("invalid day %s is rejected", (weekday) => {
  expect(validatePlanInput({ weekday, servings: "1" })).toEqual({ ok: false, errors: { weekday: "Choose a day from Monday through Sunday." } });
});
