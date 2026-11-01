import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { encode } from "next-auth/jwt";

test("Google callback establishes a minimal account session and sign-out restores anonymous access", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/food");
  const navigation = page.getByRole("navigation", { name: "Primary navigation" });
  const signIn = navigation.getByRole("button", { name: "Sign in with Google" });
  const signOut = navigation.getByRole("button", { name: "Sign out" });
  await expect(signIn).toBeVisible();
  await expect(signOut).toHaveCount(0);
  const signInBox = await signIn.boundingBox();
  expect(signInBox).not.toBeNull();
  await expect(page.getByRole("region", { name: "Search foods" }).getByRole("button", { name: "Sign in with Google" })).toHaveCount(0);
  await signIn.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Local test identity" })).toBeVisible();
  await page.getByRole("link", { name: "Continue as Test User" }).click();
  await expect(page).toHaveURL(/\/food$/);
  await expect(signIn).toHaveCount(0);
  await expect(signOut).toBeVisible();
  await expect(page.getByRole("region", { name: "Search foods" }).getByRole("button", { name: "Sign out" })).toHaveCount(0);
  const signOutBox = await signOut.boundingBox();
  expect(signOutBox).not.toBeNull();
  expect(Math.abs(signOutBox!.x + signOutBox!.width - signInBox!.x - signInBox!.width)).toBeLessThanOrEqual(2);
  await page.reload();
  await expect(signOut).toBeVisible();
  for (const [label, path] of [["Meals", "/meals"], ["Meal Plan", "/meal-plan"], ["Food", "/food"]] as const) {
    await navigation.getByRole("link", { name: label }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(signOut).toBeVisible();
    await expect(signIn).toHaveCount(0);
    const buttonBox = await signOut.boundingBox();
    expect(buttonBox).not.toBeNull();
    expect(Math.abs(buttonBox!.x + buttonBox!.width - signInBox!.x - signInBox!.width)).toBeLessThanOrEqual(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await expect(page.getByRole("list", { name: "Full food catalog" })).toHaveCount(0);
  await page.getByRole("link", { name: "See global foods" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/view=global/);
  await expect(page.getByRole("list", { name: "Full food catalog" }).getByRole("listitem")).toHaveCount(20);
  await expect(page.getByRole("list", { name: "Full food catalog" })).not.toContainText("ID:");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole("link", { name: "Next" })).toBeVisible();
  await page.getByRole("link", { name: "Next" }).click();
  await expect(page).toHaveURL(/view=global/);
  await expect(page.getByText("Page 2")).toBeVisible();
  await page.getByRole("searchbox", { name: "Food name" }).fill("Apple");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/view=global/);
  await expect(page.getByRole("list", { name: "Full food catalog" })).toContainText("Apple");
  await page.getByRole("link", { name: "My foods" }).click();
  await expect(page.getByRole("heading", { name: "My foods" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Full food catalog" })).toHaveCount(0);
  const session = await page.request.get("/api/auth/session");
  const sessionText = await session.text();
  expect(sessionText).toContain("user");
  for (const secret of ["private@example.com", "Private Test Name", "fixture-access-token", "picture"]) {
    expect(sessionText).not.toContain(secret);
  }
  await signOut.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/food$/);
  await expect(signIn).toBeVisible();
  await expect(signOut).toHaveCount(0);
  const anonymous = await page.request.get("/food?q=Apple");
  const html = await anonymous.text();
  for (const privateField of ["protein", "carbohydrates", "reference_amount", "stable-local-subject", "Private Test Name"]) {
    expect(html).not.toContain(privateField);
  }
});

test("cancelled provider sign-in creates no session", async ({ page }) => {
  await page.goto("/food");
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("button", { name: "Sign in with Google" }).click();
  await page.getByRole("link", { name: "Cancel" }).click();
  expect(await (await page.request.get("/api/auth/session")).json()).toBeNull();
  await page.goto("/food");
  await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("button", { name: "Sign in with Google" })).toBeVisible();
});

test("tampered, expired, and orphaned sessions cannot read full nutrition", async ({ page }) => {
  const secret = "playwright-only-session-secret-with-sufficient-length";
  const cookieName = "authjs.session-token";
  const orphaned = await encode({ token: { userId: randomUUID() }, secret, salt: cookieName, maxAge: 3600 });
  const expired = await encode({ token: { userId: randomUUID() }, secret, salt: cookieName, maxAge: -60 });
  for (const value of ["tampered-session", expired, orphaned]) {
    await page.context().addCookies([{ name: cookieName, value, url: "http://localhost:3100" }]);
    const response = await page.goto("/food?q=Apple");
    await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("button", { name: "Sign in with Google" })).toBeVisible();
    const html = await response!.text();
    expect(html).not.toContain("reference_amount");
    expect(html).not.toContain("protein");
  }
});
