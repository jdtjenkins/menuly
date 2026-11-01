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
    for (const area of ["Food", "Meals", "Meal Plan"]) {
      await expect(page.getByRole("navigation").getByRole("link", { name: area })).toHaveCSS("font-weight", area === label ? "700" : "400");
    }
    if (label === "Food") await expect(page.getByRole("heading", { level: 2 })).toContainText("Search foods");
    if (label === "Meals") await expect(page.getByText("Sign in with Google in the navigation to make private meals.")).toBeVisible();
    if (label === "Meal Plan") await expect(page.getByRole("heading", { level: 2 })).toContainText("coming soon");
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

test("Google sign-in is branded, keyboard accessible, and right aligned in the navigation", async ({ page }) => {
  for (const width of [1280, 360]) {
    await page.setViewportSize({ width, height: 720 });
    await page.goto("/food");
    const navigation = page.getByRole("navigation", { name: "Primary navigation" });
    const signIn = navigation.getByRole("button", { name: "Sign in with Google" });
    await expect(signIn).toBeVisible();
    await expect(signIn.locator("svg path")).toHaveCount(4);
    await expect(navigation.getByRole("link", { name: "Food" })).toHaveCSS("font-weight", "700");
    await expect(navigation.getByRole("link", { name: "Meals" })).toHaveCSS("font-weight", "400");
    await expect(navigation.locator("ul")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(navigation.getByRole("link", { name: "Food" })).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    const navigationBox = await navigation.boundingBox();
    const buttonBox = await signIn.boundingBox();
    expect(navigationBox).not.toBeNull();
    expect(buttonBox).not.toBeNull();
    expect(Math.abs(buttonBox!.x + buttonBox!.width - navigationBox!.x - navigationBox!.width)).toBeLessThanOrEqual(2);
    expect(buttonBox!.x + buttonBox!.width).toBeLessThanOrEqual(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 1280) {
      const lastLink = await navigation.getByRole("link", { name: "Meal Plan" }).boundingBox();
      expect(buttonBox!.x).toBeGreaterThanOrEqual(lastLink!.x + lastLink!.width);
      expect(Math.abs(buttonBox!.y + buttonBox!.height / 2 - lastLink!.y - lastLink!.height / 2)).toBeLessThanOrEqual(1);
      await expect(signIn).toHaveCSS("background-color", "rgb(255, 255, 255)");
      await signIn.hover();
      await expect(signIn).toHaveCSS("background-color", "rgb(232, 240, 254)");
      await expect(signIn).toHaveCSS("border-top-color", "rgb(66, 133, 244)");
      for (let index = 0; index < 5; index++) await page.keyboard.press("Tab");
      await expect(signIn).toBeFocused();
      await expect(signIn).toHaveCSS("outline-style", "solid");
    }
  }
});
