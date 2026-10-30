import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { PrimaryNavigation } from "../../app/primary-navigation";
import FoodPage from "../../app/food/page";
import MealsPage from "../../app/meals/page";
import MealPlanPage from "../../app/meal-plan/page";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("primary navigation", () => {
  const areas = [
    { label: "Food", href: "/food" },
    { label: "Meals", href: "/meals" },
    { label: "Meal Plan", href: "/meal-plan" },
  ];

  test.each(areas)("identifies $label as current", ({ label, href }) => {
    vi.mocked(usePathname).mockReturnValue(href);
    render(<PrimaryNavigation />);

    const navigation = screen.getByRole("navigation", { name: "Primary navigation" });
    const links = navigation.querySelectorAll("a");
    expect(links).toHaveLength(3);

    for (const area of areas) {
      const link = screen.getByRole("link", { name: area.label });
      expect(link.getAttribute("href")).toBe(area.href);
      expect(link.getAttribute("aria-current")).toBe(area.href === href ? "page" : null);
    }
    expect(screen.getByRole("link", { name: label }).className).toContain("bg-primary");
  });
});

describe("unfinished areas", () => {
  test.each([
    { label: "Food", Page: FoodPage, empty: "Food search is coming soon" },
    { label: "Meals", Page: MealsPage, empty: "Meal building is coming soon" },
    { label: "Meal Plan", Page: MealPlanPage, empty: "Weekly planning is coming soon" },
  ])("shows an honest $label empty state", ({ label, Page, empty }) => {
    render(<Page />);

    expect(screen.getByRole("heading", { level: 1, name: label })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: empty })).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
