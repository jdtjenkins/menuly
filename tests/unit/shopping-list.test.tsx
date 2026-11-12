import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
const mocks = vi.hoisted(() => ({ save: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
vi.mock("../../app/meal-plan/actions", () => ({ setShoppingCheckedAction: mocks.save }));
import { ShoppingList } from "../../app/meal-plan/shopping-list";

afterEach(cleanup);

test("shows an empty shopping list without stale items", () => {
  render(<ShoppingList items={[]} />);
  expect(screen.getByRole("region", { name: "Shopping list" }).textContent).toContain("Add a meal to your plan");
  expect(screen.queryByRole("listitem")).toBeNull();
});

test("reverts a stale check request and explains the failure", async () => {
  mocks.save.mockResolvedValue(false);
  render(<ShoppingList items={[{ source: "global", foodId: "a", name: "Oats", unit: "g", amount: 20, checked: false }]} />);
  const checkbox = screen.getByRole("checkbox", { name: "Bought Oats (global)" }) as HTMLInputElement;
  fireEvent.click(checkbox);
  await waitFor(() => expect(checkbox.checked).toBe(false));
  expect(screen.getByRole("alert").textContent).toContain("no longer in your plan");
  expect(mocks.refresh).toHaveBeenCalled();
});

test("shows quantities, units, and sources for same-named foods", () => {
  render(<ShoppingList items={[
    { source: "global", foodId: "a", name: "Oats", unit: "g", amount: 150.5, checked: true },
    { source: "personal", foodId: "b", name: "Oats", unit: "ml", amount: 0.3, checked: false },
  ]} />);
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
  expect(screen.getByText("150.5 g")).toBeTruthy();
  expect(screen.getByText("0.3 ml")).toBeTruthy();
  expect(screen.getByText("(global)")).toBeTruthy();
  expect(screen.getByText("(personal)")).toBeTruthy();
  expect((screen.getByRole("checkbox", { name: "Bought Oats (global)" }) as HTMLInputElement).checked).toBe(true);
  expect((screen.getByRole("checkbox", { name: "Bought Oats (personal)" }) as HTMLInputElement).checked).toBe(false);
});
