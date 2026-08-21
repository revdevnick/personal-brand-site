"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ReadingRibbon } from "@/components/ReadingRibbon";

const FIELD = "#0b0b0c";
const STUDY = "#f4efe4";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const chrome = isHome ? FIELD : STUDY;
  const scheme = isHome ? "dark" : "light";

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.style.backgroundColor = chrome;
    root.style.colorScheme = scheme;
    document.body.style.backgroundColor = chrome;

    const themeTags = document.querySelectorAll('meta[name="theme-color"]');
    if (themeTags.length === 0) {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
      meta.setAttribute("content", chrome);
    } else {
      themeTags.forEach((meta) => meta.setAttribute("content", chrome));
    }

    let schemeMeta = document.querySelector('meta[name="color-scheme"]');
    if (!schemeMeta) {
      schemeMeta = document.createElement("meta");
      schemeMeta.setAttribute("name", "color-scheme");
      document.head.appendChild(schemeMeta);
    }
    schemeMeta.setAttribute("content", scheme);
  }, [chrome, scheme]);

  return (
    <div
      className={`flex min-h-svh flex-1 flex-col ${
        isHome ? "bg-field text-study" : "bg-study text-ink"
      }`}
    >
      <ReadingRibbon />
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-accent focus:px-3 focus:py-2 focus:text-field"
      >
        Skip to content
      </a>
      <Header />
      {!isHome ? (
        <div className="h-[var(--site-header)] shrink-0" aria-hidden />
      ) : null}
      <main id="content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
