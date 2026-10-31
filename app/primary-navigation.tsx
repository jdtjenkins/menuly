"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const areas = [
  { label: "Food", href: "/food" },
  { label: "Meals", href: "/meals" },
  { label: "Meal Plan", href: "/meal-plan" },
] as const;

export function PrimaryNavigation({ authControl }: { authControl?: ReactNode }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
      <ul className="flex flex-wrap items-center justify-between gap-x-5 gap-y-1 sm:justify-start">
        {areas.map(({ label, href }) => {
          const current = pathname === href;

          return (
            <li key={href} className="min-w-0">
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={`inline-flex min-h-11 items-center px-0.5 text-sm leading-tight text-base-content transition-colors hover:text-primary focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:text-base ${current ? "font-bold" : "font-normal"}`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="self-end sm:ml-auto">{authControl}</div>
    </nav>
  );
}
