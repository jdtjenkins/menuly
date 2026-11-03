import type { Metadata } from "next";
import { Geist } from "next/font/google";
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
    <html lang="en" data-theme="Menuly" className={geistSans.variable}>
      <body className="min-h-dvh bg-base-200 font-sans text-base-content antialiased">
        <div className="flex min-h-dvh min-w-0 flex-col lg:flex-row">
          <Suspense fallback={null}>
            <PrimaryNavigation authControl={
              <Suspense fallback={null}>
                <NavigationAuth />
              </Suspense>
            } />
          </Suspense>
          <main id="main-content" className="workspace-canvas min-w-0 flex-1 px-4 py-7 sm:px-6 sm:py-9 xl:px-8">
            <div className="workspace-inner">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
