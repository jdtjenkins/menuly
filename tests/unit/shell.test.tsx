import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { PrimaryNavigation } from "../../app/primary-navigation";

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
      expect(link.className).toContain(area.href === href ? "font-bold" : "font-normal");
    }
    expect(screen.getByRole("link", { name: label }).className).not.toContain("bg-primary");
  });
});
