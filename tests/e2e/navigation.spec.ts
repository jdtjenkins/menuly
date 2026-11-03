import { expect, test } from "@playwright/test";

test("entry opens the Food area", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/food$/);
  await expect(page.getByRole("heading", { name: "Food", level: 1 })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByText("Workspace")).toHaveCount(0);
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
    if (label === "Meal Plan") await expect(page.getByText("Sign in with Google in the navigation to plan your private meals.")).toBeVisible();
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
  const toggle = page.getByRole("button", { name: "Open navigation menu" });
  await expect(toggle).toBeVisible();

  for (const [label, path] of [
    ["Food", "/food"],
    ["Meals", "/meals"],
    ["Meal Plan", "/meal-plan"],
  ] as const) {
    await toggle.click();
    const dialog = page.getByRole("dialog", { name: "Navigation menu" });
    await expect(dialog.getByText("Workspace")).toHaveCount(0);
    const link = dialog.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: label });
    await expect(link).toBeInViewport({ ratio: 1 });
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(dialog).not.toBeVisible();
  }
});

test("mobile panel closes through keyboard, backdrop, and close control", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 720 });
  await page.goto("/food");
  const toggle = page.getByRole("button", { name: "Open navigation menu" });
  const dialog = page.getByRole("dialog", { name: "Navigation menu" });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Close navigation menu" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("link", { name: "Food" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(toggle).toBeFocused();
  await toggle.click();
  await dialog.getByRole("button", { name: "Close navigation menu" }).click();
  await expect(toggle).toBeFocused();
  await toggle.click();
  await dialog.click({ position: { x: 350, y: 100 } });
  await expect(dialog).not.toBeVisible();
  await expect(toggle).toBeFocused();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await toggle.click();
  await expect(dialog.locator(".mobile-nav-panel")).toHaveCSS("animation-name", "none");
  await page.keyboard.press("Escape");
});

test("sidebar and canvas use the available width without page overflow", async ({ page }) => {
  for (const width of [1920, 1440, 768, 360]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/food", "/meals", "/meal-plan"]) {
      await page.goto(path);
      const main = page.locator("#main-content");
      const mainBox = await main.boundingBox();
      expect(mainBox).not.toBeNull();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (width >= 1024) {
        const sidebar = page.locator(".workspace-sidebar").first();
        const sidebarBox = await sidebar.boundingBox();
        expect(sidebarBox).not.toBeNull();
        expect(sidebarBox!.width).toBeGreaterThanOrEqual(220);
        expect(Math.abs(mainBox!.x - sidebarBox!.width)).toBeLessThanOrEqual(1);
        expect(Math.abs(mainBox!.width + sidebarBox!.width - width)).toBeLessThanOrEqual(1);
        await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
      } else {
        expect(mainBox!.width).toBe(width);
        await expect(page.getByRole("button", { name: "Open navigation menu" })).toBeInViewport();
      }
    }
  }
});

test("primary pages share the dark Menuly hierarchy and forms stay readable", async ({ page }) => {
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/food", "/meals", "/meal-plan"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveClass(/page-heading/);
      await expect(page.locator(".page-lead").first()).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "Menuly");
      await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
      await expect(page.locator("#main-content")).toHaveCSS("background-image", /radial-gradient/);
      const colors = await page.evaluate(() => {
        const main = getComputedStyle(document.querySelector("#main-content")!);
        const panel = getComputedStyle(document.querySelector(".surface-panel, .surface-row") ?? document.querySelector(".workspace-sidebar")!);
        return [main.backgroundColor, panel.backgroundColor];
      });
      expect(colors[0]).not.toBe("rgb(255, 255, 255)");
      expect(colors[1]).not.toBe("rgb(255, 255, 255)");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/food");
  await expect(page.getByRole("region", { name: "Search foods" })).toHaveClass(/surface-panel/);
  await page.getByRole("button", { name: "Sign in with Google" }).click();
  await page.getByRole("link", { name: "Continue as Test User" }).click();
  for (const width of [360, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/food/personal/new", "/meals/new"]) {
      await page.goto(path);
      const formBox = await page.locator("#main-content .workspace-inner > div").first().boundingBox();
      const innerBox = await page.locator("#main-content .workspace-inner").boundingBox();
      expect(formBox).not.toBeNull();
      expect(innerBox).not.toBeNull();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (path === "/food/personal/new") {
        expect(formBox!.width).toBeGreaterThanOrEqual(innerBox!.width - 1);
      } else if (width >= 1440) {
        expect(formBox!.width).toBeLessThan(innerBox!.width * 0.75);
      }
    }
  }
  await page.goto("/meal-plan");
  await expect(page.getByRole("region", { name: "Weekly plan board" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Weekly plan table" })).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await page.emulateMedia({ forcedColors: "active" });
  await expect(page.locator("#main-content")).toHaveCSS("background-image", "none");
});

test("form actions use a clear hierarchy with visible focus and disabled states", async ({ page }) => {
  await page.goto("/food");
  await page.getByRole("button", { name: "Sign in with Google" }).click();
  await page.getByRole("link", { name: "Continue as Test User" }).click();
  await page.goto("/food/personal/new");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "Menuly");
  const primary = page.getByRole("button", { name: "Create food" });
  const secondary = page.getByRole("link", { name: "Cancel" });
  await expect(primary).toHaveClass(/btn-primary/);
  await expect(secondary).toHaveClass(/btn-outline/);
  const initial = await primary.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(initial).not.toBe(await secondary.evaluate((element) => getComputedStyle(element).backgroundColor));
  await primary.hover();
  await expect(primary).not.toHaveCSS("background-color", initial);
  await primary.focus();
  await expect(primary).toHaveCSS("outline-style", "solid");
  await primary.evaluate((element: HTMLButtonElement) => { element.disabled = true; });
  await expect(primary).toBeDisabled();
  await expect(primary).not.toHaveCSS("background-color", initial);
  const name = page.getByRole("textbox", { name: "Name *" });
  await name.focus();
  await expect(name).toHaveCSS("outline-style", "solid");
  const defaultBorder = await name.evaluate((element) => getComputedStyle(element).borderTopColor);
  await name.evaluate((element) => element.setAttribute("aria-invalid", "true"));
  await expect(name).not.toHaveCSS("border-top-color", defaultBorder);
});

test("opening the mobile drawer then widening the viewport restores desktop navigation", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 720 });
  await page.goto("/food");
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await expect(page.getByRole("dialog", { name: "Navigation menu" })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.getByRole("dialog", { name: "Navigation menu" })).not.toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
});

test("Google sign-in is branded, keyboard accessible, and placed in the account footer", async ({ page }) => {
  for (const width of [1280, 360]) {
    await page.setViewportSize({ width, height: 720 });
    await page.goto("/food");
    if (width === 360) await page.getByRole("button", { name: "Open navigation menu" }).click();
    const navigation = width === 360
      ? page.getByRole("dialog", { name: "Navigation menu" }).getByRole("navigation", { name: "Primary navigation" })
      : page.getByRole("navigation", { name: "Primary navigation" });
    const signIn = navigation.getByRole("button", { name: "Sign in with Google" });
    await expect(signIn).toBeVisible();
    await expect(signIn.locator("svg path")).toHaveCount(4);
    await expect(navigation.getByRole("link", { name: "Food" })).toHaveCSS("font-weight", "700");
    await expect(navigation.getByRole("link", { name: "Meals" })).toHaveCSS("font-weight", "400");
    await expect(navigation.locator("ul")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(navigation.getByRole("link", { name: "Food" })).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 1280) {
      const navigationBox = await navigation.boundingBox();
      const buttonBox = await signIn.boundingBox();
      expect(navigationBox).not.toBeNull();
      expect(buttonBox).not.toBeNull();
      expect(buttonBox!.x).toBeGreaterThan(navigationBox!.x);
      expect(buttonBox!.x + buttonBox!.width).toBeLessThan(navigationBox!.x + navigationBox!.width);
      const lastLink = await navigation.getByRole("link", { name: "Meal Plan" }).boundingBox();
      expect(buttonBox!.y).toBeGreaterThan(lastLink!.y);
      const initial = await signIn.evaluate((element) => getComputedStyle(element).backgroundColor);
      await signIn.hover();
      await expect(signIn).not.toHaveCSS("background-color", initial);
      await signIn.focus();
      await expect(signIn).toBeFocused();
      await expect(signIn).toHaveCSS("outline-style", "solid");
    } else {
      await expect(signIn).toBeInViewport();
      await signIn.focus();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Shift+Tab");
      await expect(signIn).toBeFocused();
      await expect(signIn).toHaveCSS("outline-style", "solid");
    }
  }
});
