import { expect, test } from "@playwright/test";

test("visitor can search seeded food using the keyboard", async ({ page }) => {
  await page.goto("/food");
  await expect(page.getByText("Enter a food name to search the catalog.")).toBeVisible();
  await page.getByRole("searchbox", { name: "Food name" }).fill("aPpLe");
  await page.getByRole("searchbox", { name: "Food name" }).press("Enter");
  await expect(page).toHaveURL(/\/food\?q=aPpLe$/);
  await expect(page.getByRole("list", { name: "Food search results" }).getByText("Apple")).toBeVisible();
  await expect(page.getByText("52 kcal")).toBeVisible();
  await expect(page.getByText(/Use Sign in with Google in the navigation/)).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("button", { name: "Sign in with Google" })).toBeVisible();
});

test("anonymous results are capped and reveal no full nutrition or database settings", async ({ page }) => {
  const response = await page.goto("/food?q=Test+food");
  expect(response?.ok()).toBe(true);
  await expect(page.getByRole("list", { name: "Food search results" }).getByRole("listitem")).toHaveCount(20);
  await expect(page.getByText("Test food 01")).toBeVisible();
  await expect(page.getByText("Test food 21")).toHaveCount(0);
  const html = await response!.text();
  for (const secretField of ["protein", "carbohydrates", "reference_amount", "DATABASE_URL", "DATABASE_AUTH_TOKEN", "dev-apple"]) {
    expect(html).not.toContain(secretField);
  }
});

test("blank, unmatched, and mutation requests do not expose or change catalog entries", async ({ page }) => {
  await page.goto("/food?q=%20%20");
  await expect(page.getByText("Enter a food name to search the catalog.")).toBeVisible();
  const mutation = await page.request.post("/food", { data: { name: "Malicious food", calories: 10 } });
  expect(mutation.ok()).toBe(false);
  await page.goto("/food?q=Malicious+food");
  await expect(page.getByText(/No foods found/)).toBeVisible();
});
