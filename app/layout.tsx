import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { PrimaryNavigation } from "./primary-navigation";
import { NavigationAuth } from "./navigation-auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Menuly",
  description: "A simpler place to plan meals and shopping.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="cupcake" className={geistSans.variable}>
      <body className="min-h-screen bg-base-200 font-sans text-base-content antialiased">
        <header className="border-b border-base-300 bg-base-100">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 lg:flex-row lg:items-center lg:justify-between sm:px-6">
            <Link
              href="/food"
              className="inline-flex w-fit items-center gap-2 rounded-lg text-2xl font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              <span aria-hidden="true" className="text-primary">✳</span>
              Menuly
            </Link>
            <PrimaryNavigation authControl={
              <Suspense fallback={null}>
                <NavigationAuth />
              </Suspense>
            } />
          </div>
        </header>
        <main id="main-content" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          {children}
        </main>
      </body>
    </html>
  );
}
