import { expect, test } from "@playwright/test";

test("entry opens the Food area", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/food$/);
  await expect(page.getByRole("heading", { name: "Food", level: 1 })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
});

test("visitors can move among all three areas", async ({ page }) => {
  await page.goto("/food");

  for (const [label, path] of [
    ["Meals", "/meals"],
    ["Meal Plan", "/meal-plan"],
    ["Food", "/food"],
  ] as const) {
    await page.getByRole("navigation").getByRole("link", { name: label }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.getByRole("heading", { name: label, level: 1 })).toBeVisible();
    await expect(page.getByRole("navigation").getByRole("link", { name: label })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("heading", { level: 2 })).toContainText(label === "Food" ? "Search foods" : "coming soon");
  }
});

test("keyboard users can see focus and activate navigation", async ({ page }) => {
  await page.goto("/food");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("navigation").getByRole("link", { name: "Food" })).toBeFocused();
  await page.keyboard.press("Tab");

  const mealsLink = page.getByRole("navigation").getByRole("link", { name: "Meals" });
  await expect(mealsLink).toBeFocused();
  await expect(mealsLink).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/meals$/);
  await expect(page.getByRole("heading", { name: "Meals", level: 1 })).toBeVisible();
});

test("all navigation links stay usable at a narrow width", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 720 });
  await page.goto("/food");

  for (const [label, path] of [
    ["Food", "/food"],
    ["Meals", "/meals"],
    ["Meal Plan", "/meal-plan"],
  ] as const) {
    const link = page.getByRole("navigation").getByRole("link", { name: label });
    await expect(link).toBeVisible();
    const box = await link.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(360);
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
  }
});
