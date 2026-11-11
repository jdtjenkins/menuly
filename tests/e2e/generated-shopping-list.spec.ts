import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

test("shopping quantities follow saved cards and meal edits", async ({ page }) => {
  test.setTimeout(60_000);
  const mealName = `Shopping meal ${randomUUID().slice(0, 8)}`;
  await page.goto("/meal-plan");
  await expect(page.getByRole("region", { name: "Shopping list" })).toHaveCount(0);
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("button", { name: "Sign in with Google" }).click();
  await page.getByRole("link", { name: "Continue as Test User" }).click();
  await page.goto("/meal-plan");
  const shopping = page.getByRole("region", { name: "Shopping list" });
  await expect(shopping).toContainText("Add a meal to your plan");

  await page.goto("/meals/new");
  await page.getByRole("form", { name: "Create meal" }).locator('input[name="name"]').fill(mealName);
  await page.locator('input[name="servingYield"]').fill("4");
  await page.getByRole("combobox", { name: "Find ingredient" }).fill("Test food 01");
  await page.getByRole("option", { name: "Test food 01 (global, g)" }).click();
  await page.getByRole("spinbutton", { name: "Amount for Test food 01" }).fill("300");
  await page.getByRole("button", { name: "Create meal" }).click();
  await expect(page.getByRole("heading", { name: mealName })).toBeVisible();
  const mealUrl = page.url();

  await page.goto("/meal-plan");
  const monday = page.getByRole("table", { name: "Weekly meal plan" }).getByRole("cell").first();
  await monday.getByRole("combobox", { name: "Add meal to Monday" }).fill(mealName);
  await monday.getByRole("option", { name: `${mealName} (makes 4 servings)` }).click();
  await expect(shopping.getByRole("listitem")).toContainText(["Test food 01 (global)75 g"]);

  const servings = monday.getByRole("group", { name: `Edit planned ${mealName}` }).getByRole("spinbutton", { name: "Servings" });
  await servings.fill("2");
  await expect(shopping.getByRole("listitem")).toContainText(["Test food 01 (global)150 g"]);

  await page.goto(`${mealUrl}/edit`);
  await page.getByRole("spinbutton", { name: "Amount for Test food 01" }).fill("200");
  await page.getByRole("button", { name: "Save meal" }).click();
  await page.goto("/meal-plan");
  await expect(shopping.getByRole("listitem")).toContainText(["Test food 01 (global)100 g"]);

  await monday.getByRole("button", { name: `Remove ${mealName} from Monday` }).click();
  await expect(shopping.getByRole("listitem")).toHaveCount(0);
  await expect(shopping).toContainText("Add a meal to your plan");
});
