import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { ShoppingList } from "../../app/meal-plan/shopping-list";

afterEach(cleanup);

test("shows an empty shopping list without stale items", () => {
  render(<ShoppingList items={[]} />);
  expect(screen.getByRole("region", { name: "Shopping list" }).textContent).toContain("Add a meal to your plan");
  expect(screen.queryByRole("listitem")).toBeNull();
});

test("shows quantities, units, and sources for same-named foods", () => {
  render(<ShoppingList items={[
    { source: "global", foodId: "a", name: "Oats", unit: "g", amount: 150.5 },
    { source: "personal", foodId: "b", name: "Oats", unit: "ml", amount: 0.3 },
  ]} />);
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
  expect(screen.getByText("150.5 g")).toBeTruthy();
  expect(screen.getByText("0.3 ml")).toBeTruthy();
  expect(screen.getByText("(global)")).toBeTruthy();
  expect(screen.getByText("(personal)")).toBeTruthy();
});
