import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

test("day-column plan supports per-day search, duplicate meals, fractions, moves, and current names", async ({ page }) => {
  test.setTimeout(60_000);
  page.setDefaultTimeout(8_000);
  const mealName = `Planned dinner ${randomUUID().slice(0, 8)}`;

  await page.goto("/meal-plan");
  await expect(page.getByText("Sign in with Google in the navigation to plan your private meals.")).toBeVisible();
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("button", { name: "Sign in with Google" }).click();
  await page.getByRole("link", { name: "Continue as Test User" }).click();
  await page.goto("/meal-plan");

  const region = page.getByRole("region", { name: "Weekly plan table" });
  const table = region.getByRole("table", { name: "Weekly meal plan" });
  await expect(table.getByRole("columnheader")).toHaveText(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);
  await expect(table.getByRole("cell")).toHaveCount(7);
  await expect(page.getByRole("link", { name: "Create a meal" })).toBeVisible();
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await region.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  await region.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
  await expect(table.getByRole("cell").nth(6).getByRole("combobox", { name: "Add meal to Sunday" })).toBeInViewport();
  await page.setViewportSize({ width: 1280, height: 800 });

  await page.goto("/meals/new");
  await page.getByRole("form", { name: "Create meal" }).locator('input[name="name"]').fill(mealName);
  await page.locator('input[name="servingYield"]').fill("4");
  await page.getByRole("combobox", { name: "Find ingredient" }).fill("Test food 01");
  await page.getByRole("option", { name: "Test food 01 (global, g)" }).click();
  await page.getByRole("spinbutton", { name: "Amount for Test food 01" }).fill("100");
  await page.getByRole("button", { name: "Create meal" }).click();
  await expect(page.getByRole("heading", { name: mealName })).toBeVisible();
  const mealUrl = page.url();

  await page.goto("/meal-plan");
  const cells = table.getByRole("cell");
  const monday = cells.nth(0);
  const wednesday = cells.nth(2);
  const friday = cells.nth(4);
  const picker = wednesday.getByRole("combobox", { name: "Add meal to Wednesday" });
  await picker.fill(mealName);
  await expect(wednesday.getByRole("option", { name: `${mealName} (makes 4 servings)` })).toBeVisible();
  await picker.press("Enter");
  await expect(wednesday.getByRole("listitem")).toHaveCount(0);
  await picker.press("ArrowDown");
  await picker.press("Enter");
  await expect(wednesday.getByRole("listitem")).toHaveCount(1);
  await expect(wednesday.getByText("1 serving")).toBeVisible();
  await expect(picker).toBeFocused();

  await picker.fill(mealName);
  await wednesday.getByRole("option", { name: `${mealName} (makes 4 servings)` }).click();
  await expect(wednesday.getByRole("listitem")).toHaveCount(2);
  const edit = wednesday.getByRole("listitem").first().getByRole("group", { name: `Edit planned ${mealName}` });
  await expect(edit.getByRole("button", { name: "Save card" })).toHaveCount(0);
  await edit.getByRole("spinbutton", { name: "Servings" }).fill("0");
  await expect(edit.getByText("Enter a positive serving quantity.")).toBeVisible();
  await expect(wednesday.getByRole("listitem").first().getByText("1 serving")).toBeVisible();
  await edit.getByRole("spinbutton", { name: "Servings" }).fill("0.5");
  await expect(edit.getByText("Saved")).toBeVisible();
  await expect(wednesday.getByRole("listitem").first().getByText("0.5 servings")).toBeVisible();
  await edit.getByRole("combobox", { name: "Day" }).selectOption("4");
  await expect(wednesday.getByRole("listitem")).toHaveCount(1);
  await expect(friday.getByText("0.5 servings")).toBeVisible();

  const mondayPicker = monday.getByRole("combobox", { name: "Add meal to Monday" });
  await mondayPicker.fill(mealName);
  await monday.getByRole("option", { name: `${mealName} (makes 4 servings)` }).click();
  await expect(monday.getByRole("listitem")).toHaveCount(1);
  await monday.getByRole("button", { name: `Remove ${mealName} from Monday` }).click();
  await expect(monday.getByRole("listitem")).toHaveCount(0);
  await page.reload();
  await expect(wednesday.getByRole("listitem")).toHaveCount(1);
  await expect(friday.getByText("0.5 servings")).toBeVisible();

  await page.goto(`${mealUrl}/edit`);
  await page.getByRole("form", { name: "Edit meal" }).locator('input[name="name"]').fill(`${mealName} renamed`);
  await page.getByRole("button", { name: "Save meal" }).click();
  await page.goto("/meal-plan");
  await expect(friday.getByRole("link", { name: `${mealName} renamed` })).toBeVisible();
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("button", { name: "Sign in with Google" })).toBeVisible();
  await page.goto("/meal-plan");
  await expect(page.getByText("Sign in with Google in the navigation to plan your private meals.")).toBeVisible();
  await expect(page.getByText(`${mealName} renamed`)).toHaveCount(0);
});
