"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
  type ReactNode,
  type TransitionEvent,
} from "react";

type FormatItem = {
  id: string;
  label: string;
  href: string;
};

type Indicator = {
  left: number;
  width: number;
};

type Props = {
  ariaLabel: string;
  /** Isolates slide continuity between Listen vs Read (sessionStorage backup). */
  navKey: string;
  active: string;
  formats: FormatItem[];
  preview?: ReactNode;
  /** Fires when a primary-click slide starts (true) so the archive can show a skeleton. */
  onTransitionPending?: (pending: boolean) => void;
};

const SLIDE_MS = 360;
const SLIDE_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

function readStoredIndicator(navKey: string): Indicator | null {
  try {
    const raw = sessionStorage.getItem(`format-nav:${navKey}`);
    if (!raw) return null;
    sessionStorage.removeItem(`format-nav:${navKey}`);
    const parsed = JSON.parse(raw) as Indicator;
    if (
      typeof parsed?.left === "number" &&
      typeof parsed?.width === "number" &&
      Number.isFinite(parsed.left) &&
      Number.isFinite(parsed.width)
    ) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function storeIndicator(navKey: string, indicator: Indicator) {
  try {
    sessionStorage.setItem(`format-nav:${navKey}`, JSON.stringify(indicator));
  } catch {
    /* ignore */
  }
}

function measureTab(tab: HTMLElement | undefined | null): Indicator | null {
  if (!tab) return null;
  return { left: tab.offsetLeft, width: tab.offsetWidth };
}

function sameIndicator(a: Indicator | null, b: Indicator | null) {
  if (!a || !b) return false;
  return a.left === b.left && a.width === b.width;
}

export function FormatComingSoon({ label }: { label: string }) {
  return (
    <span
      aria-disabled="true"
      className="flex cursor-not-allowed flex-col items-start justify-center px-4 py-3 font-ui text-sm leading-tight text-ink/38 sm:px-6"
    >
      {label}
      <span className="mt-1 text-[0.52rem] tracking-[0.14em] uppercase">Coming later</span>
    </span>
  );
}

/**
 * Sliding format underline.
 *
 * Primary path: on primary-click, animate the indicator on the current page,
 * then router.push after the slide — so remounting route shells cannot kill
 * the motion mid-flight.
 *
 * Backup: sessionStorage from→to on mount (modified clicks / back-forward).
 */
export function FormatNav({
  ariaLabel,
  navKey,
  active,
  formats,
  preview,
  onTransitionPending,
}: Props) {
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);
  const tabRefs = useRef(new Map<string, HTMLAnchorElement>());
  const indicatorRef = useRef<Indicator | null>(null);
  const entranceLockRef = useRef(false);
  const navTimerRef = useRef<number | null>(null);
  const pendingHrefRef = useRef<string | null>(null);
  const onPendingRef = useRef(onTransitionPending);
  onPendingRef.current = onTransitionPending;

  const [indicator, setIndicator] = useState<Indicator | null>(null);
  const [animate, setAnimate] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const reduceMotion = usePrefersReducedMotion();

  const visualActive = pendingId ?? active;

  const applyIndicator = useCallback((next: Indicator, withAnimation: boolean) => {
    indicatorRef.current = next;
    setAnimate(withAnimation);
    setIndicator(next);
  }, []);

  const measureId = useCallback((id: string) => measureTab(tabRefs.current.get(id)), []);

  useLayoutEffect(() => {
    // After a click-driven slide+navigate, land on the active tab with no motion.
    if (pendingId) return;

    const next = measureId(active);
    if (!next) return;

    const from = reduceMotion ? null : readStoredIndicator(navKey);
    if (from && !sameIndicator(from, next)) {
      entranceLockRef.current = true;
      indicatorRef.current = from;
      setAnimate(false);
      setIndicator(from);
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          applyIndicator(next, true);
          window.setTimeout(() => {
            entranceLockRef.current = false;
          }, SLIDE_MS + 40);
        });
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }

    applyIndicator(next, false);
  }, [active, applyIndicator, measureId, navKey, pendingId, reduceMotion]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const sync = () => {
      if (entranceLockRef.current || pendingHrefRef.current) return;
      const next = measureId(visualActive);
      if (next) applyIndicator(next, false);
    };

    const ro = new ResizeObserver(sync);
    ro.observe(nav);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [applyIndicator, measureId, visualActive]);

  useEffect(() => {
    return () => {
      if (navTimerRef.current != null) window.clearTimeout(navTimerRef.current);
    };
  }, []);

  const finishNavigation = useCallback(() => {
    const href = pendingHrefRef.current;
    if (!href) return;
    pendingHrefRef.current = null;
    if (navTimerRef.current != null) {
      window.clearTimeout(navTimerRef.current);
      navTimerRef.current = null;
    }
    router.push(href);
  }, [router]);

  const onIndicatorTransitionEnd = (event: TransitionEvent<HTMLSpanElement>) => {
    if (event.propertyName !== "transform") return;
    if (!pendingHrefRef.current) return;
    finishNavigation();
  };

  const onTabClick = (event: MouseEvent<HTMLAnchorElement>, format: FormatItem) => {
    const isCurrent = format.id === visualActive;
    if (isCurrent) {
      event.preventDefault();
      return;
    }

    // Modified clicks / non-left button: native navigation; stash geometry for mount slide.
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      const current = indicatorRef.current ?? measureId(visualActive);
      if (current && !reduceMotion) storeIndicator(navKey, current);
      return;
    }

    event.preventDefault();

    if (reduceMotion) {
      router.push(format.href);
      return;
    }

    const next = measureId(format.id);
    if (!next) {
      router.push(format.href);
      return;
    }

    // Already mid-flight to this tab.
    if (pendingHrefRef.current === format.href) return;

    // Slide on this page, then navigate so remount cannot cancel the motion.
    pendingHrefRef.current = format.href;
    setPendingId(format.id);
    onPendingRef.current?.(true);
    applyIndicator(next, true);

    if (navTimerRef.current != null) window.clearTimeout(navTimerRef.current);
    navTimerRef.current = window.setTimeout(() => {
      finishNavigation();
    }, SLIDE_MS + 50);
  };

  return (
    <nav
      ref={navRef}
      aria-label={ariaLabel}
      className="relative flex flex-wrap items-stretch border-b border-ink/15"
    >
      {formats.map((format) => {
        const isActive = format.id === visualActive;
        return (
          <Link
            key={format.id}
            href={format.href}
            aria-current={isActive ? "page" : undefined}
            ref={(node) => {
              if (node) tabRefs.current.set(format.id, node);
              else tabRefs.current.delete(format.id);
            }}
            onClick={(event) => onTabClick(event, format)}
            className={
              isActive
                ? `px-4 py-4 font-ui text-sm font-medium text-ink sm:px-6${
                    indicator ? "" : " border-b-2 border-accent"
                  }`
                : "px-4 py-4 font-ui text-sm text-ink/55 transition-colors hover:text-ink sm:px-6"
            }
          >
            {format.label}
          </Link>
        );
      })}
      {preview}
      {indicator ? (
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 h-0.5 bg-accent will-change-[transform,width]"
          onTransitionEnd={onIndicatorTransitionEnd}
          style={{
            width: indicator.width,
            transform: `translate3d(${indicator.left}px, 0, 0)`,
            transition:
              animate && !reduceMotion
                ? `transform ${SLIDE_MS}ms ${SLIDE_EASE}, width ${SLIDE_MS}ms ${SLIDE_EASE}`
                : "none",
          }}
        />
      ) : null}
    </nav>
  );
}
