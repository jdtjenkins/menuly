"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const areas = [
  { label: "Food", href: "/food" },
  { label: "Meals", href: "/meals" },
  { label: "Meal Plan", href: "/meal-plan" },
] as const;

export function PrimaryNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className="w-full sm:w-auto">
      <ul className="grid grid-cols-3 gap-1 rounded-2xl bg-base-200 p-1 sm:flex sm:gap-2">
        {areas.map(({ label, href }) => {
          const current = pathname === href;

          return (
            <li key={href} className="min-w-0">
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={`flex min-h-11 items-center justify-center rounded-xl px-2 text-center text-sm font-semibold leading-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-5 sm:text-base ${
                  current
                    ? "bg-primary text-primary-content shadow-sm"
                    : "hover:bg-base-100"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
