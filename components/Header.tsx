"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { BrandLockup } from "./BrandLockup";

const links = [
  { href: "/sermons/", label: "Listen" },
  { href: "/writing/", label: "Read" },
  { href: "/work/", label: "Work" },
  { href: "/about/", label: "About" },
];

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const navRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuWordRef = useRef<HTMLSpanElement>(null);
  const closeWordRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [slotWidth, setSlotWidth] = useState(0);
  const [follow, setFollow] = useState({ x: 0, y: 0, width: 0, height: 0, ready: false });

  const hideFollow = () => setFollow((current) => ({ ...current, ready: false }));

  const moveFollow = (el: HTMLElement | null) => {
    const nav = navRef.current;
    if (!nav || !el) {
      hideFollow();
      return;
    }
    const navBox = nav.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    setFollow({
      x: box.left - navBox.left,
      y: box.top - navBox.top,
      width: box.width,
      height: box.height,
      ready: true,
    });
  };

  const activeItem = () =>
    itemRefs.current.find((node, index) => node && pathname.startsWith(links[index].href)) ?? null;

  useLayoutEffect(() => {
    const place = () => moveFollow(activeItem());
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [pathname]);

  useLayoutEffect(() => {
    const measure = () => {
      const menu = menuWordRef.current?.scrollWidth ?? 0;
      const close = closeWordRef.current?.scrollWidth ?? 0;
      setSlotWidth(open ? close : menu);
    };
    measure();
    void document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const lockScroll = (event: Event) => {
      const target = event.target as Node | null;
      if (drawerRef.current && target && drawerRef.current.contains(target)) return;
      event.preventDefault();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("wheel", lockScroll, { passive: false });
    document.addEventListener("touchmove", lockScroll, { passive: false });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("wheel", lockScroll);
      document.removeEventListener("touchmove", lockScroll);
    };
  }, [open]);

  const drawerLinks = [...links, { href: "/contact/", label: "Contact" }];

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 overflow-visible border-b backdrop-blur-md ${
          isHome
            ? "border-white/10 bg-field/40 text-study"
            : "border-ink/10 bg-study/85 text-ink"
        }`}
      >
        <div className="site-header-bar mx-auto flex max-w-6xl items-center justify-between gap-4 overflow-visible px-5 py-5 sm:px-6">
        <BrandLockup
          homeHref="/"
          homeLabel={isHome ? "Back to top" : "Home"}
          onHomeClick={(event) => {
            setOpen(false);
            if (!isHome) return;
            event.preventDefault();
            window.scrollTo(0, 0);
            window.dispatchEvent(new Event("nh:replay-home"));
          }}
        />

          <nav
            ref={navRef}
            aria-label="Primary"
            className="site-nav-desktop"
            onMouseLeave={() => moveFollow(activeItem())}
          >
            <span
              className="site-nav-follow"
              aria-hidden
              style={{
                transform: `translate(${follow.x}px, ${follow.y}px)`,
                width: follow.width,
                height: follow.height,
                opacity: follow.ready ? 1 : 0,
              }}
            >
              <span>{"{"}</span>
              <span>{"}"}</span>
            </span>
            {links.map((link, index) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  className={`site-nav-link ${active ? "is-active" : ""}`}
                  onMouseEnter={(event) => moveFollow(event.currentTarget)}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className={`site-nav-toggle ${open ? "is-open" : ""}`}
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="site-nav-brace" aria-hidden>
              {"{"}
            </span>
            <span
              className={`site-nav-toggle-slot ${slotWidth ? "is-ready" : ""}`}
              style={{ width: slotWidth ? `${slotWidth}px` : undefined }}
            >
              <span ref={menuWordRef} className="site-nav-toggle-word is-menu" aria-hidden>
                menu
              </span>
              <span ref={closeWordRef} className="site-nav-toggle-word is-close" aria-hidden>
                close
              </span>
            </span>
            <span className="site-nav-brace" aria-hidden>
              {"}"}
            </span>
          </button>
        </div>
      </header>

      <div
        ref={drawerRef}
        id={menuId}
        className={`site-nav-drawer ${open ? "is-open" : ""} ${isHome ? "on-dark" : "on-light"}`}
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        <nav aria-label="Mobile" className="site-nav-drawer-list">
          {drawerLinks.map((link) => {
            const active = pathname.startsWith(link.href);
            const quiet = link.href === "/contact/";
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`site-nav-drawer-link ${active ? "is-active" : ""} ${quiet ? "is-quiet" : ""}`}
                tabIndex={open ? 0 : -1}
                onClick={() => {
                  if (pathname.startsWith(link.href)) setOpen(false);
                }}
              >
                {active ? (
                  <>
                    <span className="site-nav-brace" aria-hidden>
                      {"{"}
                    </span>
                    {link.label}
                    <span className="site-nav-brace" aria-hidden>
                      {"}"}
                    </span>
                  </>
                ) : (
                  link.label
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
