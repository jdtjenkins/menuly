import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

test("dragging a saved meal adds separate occurrences without moving cards", async ({ page }) => {
  const mealName = `Drag dinner ${randomUUID().slice(0, 8)}`;
  await page.goto("/meal-plan");
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("button", { name: "Sign in with Google" }).click();
  await page.getByRole("link", { name: "Continue as Test User" }).click();
  await page.goto("/meals/new");
  await page.getByRole("form", { name: "Create meal" }).locator('input[name="name"]').fill(mealName);
  await page.locator('input[name="servingYield"]').fill("4");
  await page.getByRole("combobox", { name: "Find ingredient" }).fill("Test food 01");
  await page.getByRole("option", { name: "Test food 01 (global, g)" }).click();
  await page.getByRole("spinbutton", { name: "Amount for Test food 01" }).fill("100");
  await page.getByRole("button", { name: "Create meal" }).click();
  await expect(page.getByRole("heading", { name: mealName })).toBeVisible();

  await page.goto("/meal-plan");
  const source = page.getByRole("list", { name: "Saved meals" }).getByRole("listitem").filter({ hasText: mealName });
  const thursday = page.getByRole("table", { name: "Weekly meal plan" }).getByRole("cell").nth(3);
  await expect(source).toBeVisible();
  await expect(source).toHaveAttribute("draggable", "true");
  await source.dragTo(thursday, { targetPosition: { x: 8, y: 100 } });
  await expect(thursday.getByRole("listitem")).toHaveCount(1);
  await expect(source).toHaveAttribute("draggable", "true");
  await source.dragTo(thursday, { targetPosition: { x: 8, y: 100 } });
  await expect(thursday.locator('ul[aria-label="Thursday meals"] > li')).toHaveCount(2);
  await expect(thursday.getByText("1 serving")).toHaveCount(2);
  await expect(page.getByRole("region", { name: "Shopping list" })).toContainText("Test food 01");
  await expect(page.getByRole("button", { name: "Clear Week" })).toBeVisible();
  expect(await thursday.locator('ul[aria-label="Thursday meals"] > li').first().evaluate((card) => (card as HTMLElement).draggable)).toBe(false);
});
