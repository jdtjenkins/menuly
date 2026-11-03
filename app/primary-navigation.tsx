"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const areas = [
  { label: "Food", href: "/food" },
  { label: "Meals", href: "/meals" },
  { label: "Meal Plan", href: "/meal-plan" },
] as const;

function Brand({ compact = false }: { compact?: boolean }) {
  return <Link
    href="/food"
    className={`inline-flex w-fit items-center gap-2 rounded-md font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${compact ? "text-lg" : "text-xl"}`}
  >
    <span aria-hidden="true" className="text-primary">✳</span>
    Menuly
  </Link>;
}

export function PrimaryNavigation({ authControl }: { authControl?: ReactNode }) {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  function closePanel() {
    if (dialogRef.current?.open) dialogRef.current.close();
    toggleRef.current?.focus();
  }

  useEffect(() => {
    if (dialogRef.current?.open) dialogRef.current.close();
  }, [pathname]);

  useEffect(() => {
    if (!window.matchMedia) return;
    const desktop = window.matchMedia("(min-width: 64rem)");
    const closeOnDesktop = () => {
      if (desktop.matches && dialogRef.current?.open) dialogRef.current.close();
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  function links(mobile: boolean) {
    return areas.map(({ label, href }) => {
      const current = pathname === href || pathname.startsWith(`${href}/`);
      return <li key={href}>
        <Link
          href={href}
          aria-current={current ? "page" : undefined}
          onClick={mobile ? closePanel : undefined}
          className={`flex min-h-11 w-full items-center rounded-md px-3 text-sm leading-tight transition-colors hover:bg-base-300/50 hover:text-base-content focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${current ? "bg-base-300/70 font-bold text-base-content" : "font-normal text-base-content/75"}`}
        >{label}</Link>
      </li>;
    });
  }

  function backdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) closePanel();
  }

  return <>
    <aside className="workspace-sidebar sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-base-300 lg:flex">
      <div className="border-b border-base-300 px-5 py-5"><Brand /></div>
      <nav aria-label="Primary navigation" className="flex flex-1 flex-col">
        <div className="px-3 py-5">
          <ul className="space-y-1">{links(false)}</ul>
        </div>
        <div className="mt-auto border-t border-base-300 px-4 py-4">
          <p className="mb-3 px-1 text-xs font-semibold tracking-wide text-base-content/55">Account</p>
          {authControl}
        </div>
      </nav>
    </aside>
    <header className="workspace-sidebar flex min-h-16 items-center justify-between border-b border-base-300 px-4 sm:px-6 lg:hidden">
      <Brand compact />
      <button
      ref={toggleRef}
      type="button"
      aria-label="Open navigation menu"
      aria-haspopup="dialog"
      onClick={() => dialogRef.current?.showModal()}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-base-300 bg-base-100 text-base-content hover:bg-base-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
    </header>
    <dialog ref={dialogRef} aria-label="Navigation menu" onClick={backdropClick} onCancel={(event) => { event.preventDefault(); closePanel(); }} className="mobile-nav-dialog lg:hidden">
      <div className="mobile-nav-panel">
        <div className="flex items-center justify-between border-b border-base-300 px-5 py-4">
          <span className="text-sm font-semibold tracking-wide">Menu</span>
          <button type="button" autoFocus aria-label="Close navigation menu" onClick={closePanel} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-base-300 hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-2" strokeLinecap="round"><path d="M5 5l14 14M19 5L5 19" /></svg>
          </button>
        </div>
        <nav aria-label="Primary navigation" className="flex min-h-[calc(100%-5rem)] flex-col">
          <div className="px-3 py-5">
            <ul className="space-y-1">{links(true)}</ul>
          </div>
          <div className="mt-auto border-t border-base-300 px-4 py-5">
            <p className="mb-3 px-1 text-xs font-semibold tracking-wide text-base-content/55">Account</p>
            {authControl}
          </div>
        </nav>
      </div>
    </dialog>
  </>;
}
