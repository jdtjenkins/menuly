import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";

test("day-column plan supports per-day search, duplicate meals, fixed days, fractions, and current names", async ({ page }) => {
  test.setTimeout(60_000);
  page.setDefaultTimeout(8_000);
  const mealName = `Planned dinner ${randomUUID().slice(0, 8)}`;

  await page.goto("/meal-plan");
  await expect(page.getByText("Sign in with Google in the navigation to plan your private meals.")).toBeVisible();
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("button", { name: "Sign in with Google" }).click();
  await page.getByRole("link", { name: "Continue as Test User" }).click();
  await page.goto("/meal-plan");

  const savedMeals = page.getByRole("complementary", { name: "Saved meals for planning" });
  await expect(savedMeals).toContainText("No saved meals yet");
  await expect(savedMeals.getByRole("link", { name: "Create a meal" })).toBeVisible();
  const region = page.getByRole("region", { name: "Weekly plan table" });
  const table = region.getByRole("table", { name: "Weekly meal plan" });
  await expect(table.getByRole("columnheader")).toHaveText(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);
  await expect(table.getByRole("cell")).toHaveCount(7);
  await expect(page.getByRole("region", { name: "Weekly plan board" })).toBeVisible();
  await expect(region).toHaveCSS("border-top-width", "0px");
  await expect(region).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(table.getByRole("columnheader", { name: "Monday" })).toHaveCSS("border-bottom-width", "0px");
  await expect(savedMeals.getByRole("link", { name: "Create a meal" })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator("#weekly-plan-scroll-hint")).toBeHidden();
  expect(await table.evaluate((element) => getComputedStyle(element).flexGrow)).toBe("1");
  for (const [index, day] of ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].entries()) {
    await expect(table.getByRole("columnheader", { name: day })).toBeInViewport();
    await expect(table.getByRole("cell").nth(index).getByRole("combobox", { name: `Add meal to ${day}` })).toBeInViewport();
  }
  for (const width of [1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const desktopSize = await region.evaluate((element) => {
      const table = element.querySelector("table")!;
      return {
        bottom: table.getBoundingClientRect().bottom,
        cellBottoms: [...table.querySelectorAll("td")].map((cell) => cell.getBoundingClientRect().bottom),
        emptyDays: [...table.querySelectorAll("td")].filter((cell) => !cell.querySelector("li")).length,
        expectedBottom: innerHeight - parseFloat(getComputedStyle(document.querySelector("main")!).paddingBottom),
        regionHeight: element.clientHeight,
        regionScrollHeight: element.scrollHeight,
        pageWidth: document.documentElement.scrollWidth,
      };
    });
    expect(desktopSize.emptyDays).toBeGreaterThan(0);
    expect(desktopSize.bottom).toBeGreaterThanOrEqual(desktopSize.expectedBottom - 2);
    for (const bottom of desktopSize.cellBottoms) {
      expect(Math.abs(bottom - desktopSize.bottom)).toBeLessThanOrEqual(2);
    }
    expect(desktopSize.regionScrollHeight - desktopSize.regionHeight).toBeLessThanOrEqual(2);
    expect(desktopSize.pageWidth).toBeLessThanOrEqual(width);
  }
  await page.setViewportSize({ width: 1920, height: 900 });
  const wideLayout = await page.evaluate(() => {
    const source = document.querySelector('[aria-label="Saved meals for planning"]')!.getBoundingClientRect();
    const board = document.querySelector('[aria-label="Weekly plan board"]')!.getBoundingClientRect();
    return { sourceRight: source.right, boardLeft: board.left, pageWidth: document.documentElement.scrollWidth };
  });
  expect(wideLayout.sourceRight).toBeLessThanOrEqual(wideLayout.boardLeft);
  expect(wideLayout.pageWidth).toBeLessThanOrEqual(1920);
  for (const width of [360, 375]) {
    await page.setViewportSize({ width, height: 812 });
    await expect(savedMeals).toBeVisible();
    const sourceAndBoard = await page.evaluate(() => {
      const source = document.querySelector('[aria-label="Saved meals for planning"]')!.getBoundingClientRect();
      const board = document.querySelector('[aria-label="Weekly plan board"]')!.getBoundingClientRect();
      return { sourceBottom: source.bottom, boardTop: board.top };
    });
    expect(sourceAndBoard.sourceBottom).toBeLessThanOrEqual(sourceAndBoard.boardTop);
    await expect(page.locator("#weekly-plan-scroll-hint")).toBeVisible();
    const dimensions = await region.evaluate((element) => {
      const table = element.querySelector("table")!;
      return {
        board: element.clientWidth,
        day: table.querySelector("th")!.getBoundingClientRect().width,
        cell: table.querySelector("td")!.getBoundingClientRect().width,
        table: table.getBoundingClientRect().width,
        tableBottom: table.getBoundingClientRect().bottom,
        cellBottoms: [...table.querySelectorAll("td")].map((cell) => cell.getBoundingClientRect().bottom),
        expectedBottom: innerHeight - parseFloat(getComputedStyle(document.querySelector("main")!).paddingBottom),
        emptyDays: [...table.querySelectorAll("td")].filter((cell) => !cell.querySelector("li")).length,
        page: document.documentElement.scrollWidth,
        viewport: innerWidth,
      };
    });
    expect(Math.abs(dimensions.day - dimensions.board)).toBeLessThanOrEqual(2);
    expect(Math.abs(dimensions.cell - dimensions.board)).toBeLessThanOrEqual(2);
    expect(Math.abs(dimensions.table - dimensions.board * 7)).toBeLessThanOrEqual(3);
    expect(dimensions.emptyDays).toBeGreaterThan(0);
    expect(dimensions.tableBottom).toBeGreaterThanOrEqual(dimensions.expectedBottom - 2);
    for (const bottom of dimensions.cellBottoms) {
      expect(Math.abs(bottom - dimensions.tableBottom)).toBeLessThanOrEqual(2);
    }
    expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport);
    await region.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
    await expect(table.getByRole("columnheader", { name: "Sunday" })).toBeInViewport();
    await expect(table.getByRole("cell").nth(6).getByRole("combobox", { name: "Add meal to Sunday" })).toBeInViewport();
    await region.evaluate((element) => { element.scrollLeft = 0; });
  }
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
  const source = savedMeals.getByRole("list", { name: "Saved meals" }).getByRole("listitem").filter({ hasText: mealName });
  await expect(source).toBeVisible();
  await expect(source).toHaveAttribute("draggable", "true");
  const picker = wednesday.getByRole("combobox", { name: "Add meal to Wednesday" });
  await picker.fill(mealName);
  await expect(wednesday.getByRole("option", { name: `${mealName} (makes 4 servings)` })).toBeVisible();
  await picker.press("Enter");
  await expect(wednesday.getByRole("listitem")).toHaveCount(0);
  await picker.press("ArrowDown");
  await picker.press("Enter");
  await expect(wednesday.getByRole("listitem")).toHaveCount(1);
  await expect(page.getByRole("region", { name: "Shopping list" })).toContainText("Test food 01");
  await expect(page.getByRole("button", { name: "Clear Week" })).toBeVisible();
  const pickerBox = await picker.boundingBox();
  const cardBox = await wednesday.getByRole("listitem").first().boundingBox();
  expect(pickerBox).not.toBeNull();
  expect(cardBox).not.toBeNull();
  expect(pickerBox!.y + pickerBox!.height).toBeLessThan(cardBox!.y);
  await expect(wednesday.getByText("Add meal to Wednesday", { exact: true })).toHaveClass("sr-only");
  await expect(wednesday.getByText("1 serving")).toBeVisible();
  await expect(picker).toBeFocused();

  await picker.fill(mealName);
  await wednesday.getByRole("option", { name: `${mealName} (makes 4 servings)` }).click();
  await expect(wednesday.getByRole("listitem")).toHaveCount(2);
  const edit = wednesday.getByRole("listitem").first().getByRole("group", { name: `Edit planned ${mealName}` });
  await expect(edit.getByRole("button", { name: "Save card" })).toHaveCount(0);
  await expect(edit.getByRole("combobox", { name: "Day" })).toHaveCount(0);
  await edit.getByRole("spinbutton", { name: "Servings" }).fill("0");
  await expect(edit.getByText("Enter a positive serving quantity.")).toBeVisible();
  await expect(wednesday.getByRole("listitem").first().getByText("1 serving")).toBeVisible();
  await edit.getByRole("spinbutton", { name: "Servings" }).fill("0.5");
  await expect(edit.getByText("Saved")).toBeVisible();
  await expect(wednesday.getByRole("listitem").first().getByText("0.5 servings")).toBeVisible();
  await expect(wednesday.getByRole("listitem")).toHaveCount(2);
  for (const width of [360, 375]) {
    await page.setViewportSize({ width, height: 520 });
    const verticalSize = await region.evaluate((element) => ({
      regionHeight: element.clientHeight,
      regionScrollHeight: element.scrollHeight,
      pageHeight: document.documentElement.scrollHeight,
      tableBottom: element.querySelector("table")!.getBoundingClientRect().bottom,
    }));
    expect(verticalSize.pageHeight).toBeGreaterThan(520);
    expect(verticalSize.tableBottom).toBeGreaterThan(520);
    expect(verticalSize.regionScrollHeight - verticalSize.regionHeight).toBeLessThanOrEqual(2);
    await edit.getByRole("spinbutton", { name: "Servings" }).scrollIntoViewIfNeeded();
    await expect(edit.getByRole("spinbutton", { name: "Servings" })).toBeInViewport();
    await expect(edit.getByRole("combobox", { name: "Day" })).toHaveCount(0);
  }
  for (const width of [1024, 1440]) {
    await page.setViewportSize({ width, height: 360 });
    const desktopSize = await region.evaluate((element) => ({
      bottom: element.querySelector("table")!.getBoundingClientRect().bottom,
      cellBottoms: [...element.querySelectorAll("td")].map((cell) => cell.getBoundingClientRect().bottom),
      regionHeight: element.clientHeight,
      regionScrollHeight: element.scrollHeight,
      pageHeight: document.documentElement.scrollHeight,
    }));
    expect(desktopSize.bottom).toBeGreaterThan(360);
    expect(desktopSize.pageHeight).toBeGreaterThan(360);
    expect(desktopSize.regionScrollHeight - desktopSize.regionHeight).toBeLessThanOrEqual(2);
    for (const bottom of desktopSize.cellBottoms) {
      expect(Math.abs(bottom - desktopSize.bottom)).toBeLessThanOrEqual(2);
    }
    await edit.getByRole("spinbutton", { name: "Servings" }).scrollIntoViewIfNeeded();
    await expect(edit.getByRole("spinbutton", { name: "Servings" })).toBeInViewport();
  }
  await page.setViewportSize({ width: 1280, height: 800 });

  const mondayPicker = monday.getByRole("combobox", { name: "Add meal to Monday" });
  await mondayPicker.fill(mealName);
  await monday.getByRole("option", { name: `${mealName} (makes 4 servings)` }).click();
  await expect(monday.getByRole("listitem")).toHaveCount(1);
  const remove = monday.getByRole("button", { name: `Remove ${mealName} from Monday` });
  await expect(remove).toHaveClass(/btn-error/);
  await remove.click();
  await expect(monday.getByRole("listitem")).toHaveCount(0);
  await page.reload();
  await expect(wednesday.getByRole("listitem")).toHaveCount(2);
  await expect(wednesday.getByText("0.5 servings")).toBeVisible();

  await page.goto(`${mealUrl}/edit`);
  await page.getByRole("form", { name: "Edit meal" }).locator('input[name="name"]').fill(`${mealName} renamed`);
  await page.getByRole("button", { name: "Save meal" }).click();
  await page.goto("/meal-plan");
  await expect(wednesday.getByRole("link", { name: `${mealName} renamed` })).toHaveCount(2);
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("button", { name: "Sign in with Google" })).toBeVisible();
  await page.goto("/meal-plan");
  await expect(page.getByText("Sign in with Google in the navigation to plan your private meals.")).toBeVisible();
  await expect(page.getByText(`${mealName} renamed`)).toHaveCount(0);
});
