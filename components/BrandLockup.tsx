"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import gsap from "gsap";
import { InlineSvg } from "./InlineSvg";
import { SocialLinks } from "./SocialLinks";

const LABELS = ["Nick Perkins", "@revdevnick"] as const;
const HOLD = 5;
const MOBILE = "(max-width: 767px)";

type BrandLockupProps = {
  homeHref: string;
  homeLabel: string;
  onHomeClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  onMenuClose?: () => void;
};

export function BrandLockup({ homeHref, homeLabel, onHomeClick, onMenuClose }: BrandLockupProps) {
  const root = useRef<HTMLSpanElement>(null);
  const [replay, setReplay] = useState(0);

  useEffect(() => {
    const replayHome = () => setReplay((n) => n + 1);
    window.addEventListener("nh:replay-home", replayHome);
    return () => window.removeEventListener("nh:replay-home", replayHome);
  }, []);

  useEffect(() => {
    const mark = root.current;
    if (!mark) return;

    const head = mark.querySelector<HTMLElement>("[data-nav-head]");
    const left = mark.querySelector<HTMLElement>("[data-nav-brace-left]");
    const right = mark.querySelector<HTMLElement>("[data-nav-brace-right]");
    const clip = mark.querySelector<HTMLElement>("[data-nav-name-clip]");
    const [primary, handle] = [...mark.querySelectorAll<HTMLElement>("[data-nav-name]")];
    const socials = mark.querySelector<HTMLElement>("[data-nav-socials]");
    const socialInner = mark.querySelector<HTMLElement>("[data-nav-socials-inner]");
    if (!head || !left || !right || !clip || !primary || !handle) return;

    const glyphs = [head, left, right];
    const phone = () => window.matchMedia(MOBILE).matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cancelled = false;
    let looping = false;
    let paused = false;
    let timer = 0;
    let watchdog = 0;
    let frame = 0;
    let restart: (() => void) | null = null;

    const slot = () => clip.offsetHeight || head.offsetHeight || 52;
    const shutSocials = { width: 0, height: "3.25rem", autoAlpha: 0 };
    const openSocials = () => ({
      width: socialInner ? Math.ceil(socialInner.scrollWidth) : 0,
      height: "3.25rem",
      autoAlpha: 1,
    });

    const setHandle = (open: boolean) => {
      mark.classList.toggle("is-handle", open);
      primary.setAttribute("aria-hidden", open ? "true" : "false");
      handle.setAttribute("aria-hidden", open ? "false" : "true");
      primary.tabIndex = open ? -1 : 0;
      handle.tabIndex = open ? 0 : -1;
      if (!socials) return;
      const reachable = open && !phone();
      socials.setAttribute("aria-hidden", reachable ? "false" : "true");
      socials.querySelectorAll("a").forEach((link) => {
        if (reachable) link.removeAttribute("tabindex");
        else link.setAttribute("tabindex", "-1");
      });
    };

    const settle = () => {
      gsap.set(glyphs, { x: 0, y: 0, rotate: 0, autoAlpha: 1 });
      gsap.set(primary, { x: 0, y: 0, autoAlpha: 1, pointerEvents: "auto" });
      gsap.set(handle, { x: 0, y: -slot(), autoAlpha: 0, pointerEvents: "none" });
      if (socials) gsap.set(socials, shutSocials);
      setHandle(false);
    };

    const swap = (incoming: HTMLElement, outgoing: HTMLElement, open: boolean) => {
      const distance = slot();
      const step = gsap.timeline({ defaults: { duration: 0.6, ease: "power2.inOut" } });
      step
        .add(() => {
          if (open) setHandle(true);
        }, 0)
        .set(incoming, { x: 0, y: -distance, autoAlpha: 1, pointerEvents: "auto" })
        .to(outgoing, { y: distance, autoAlpha: 0, pointerEvents: "none" }, 0)
        .to(incoming, { y: 0 }, 0)
        .add(() => {
          if (!open) setHandle(false);
        })
        .set(outgoing, { y: -distance, autoAlpha: 0, pointerEvents: "none" });
      if (socials && !phone()) step.to(socials, open ? openSocials() : shutSocials, 0);
    };

    const loop = () => {
      if (cancelled || looping) return;
      looping = true;
      window.clearTimeout(watchdog);
      let open = false;
      const tick = () => {
        if (paused) return;
        open = !open;
        if (reduce) {
          const [shown, hidden] = open ? [handle, primary] : [primary, handle];
          gsap.set(shown, { x: 0, y: 0, autoAlpha: 1, pointerEvents: "auto" });
          gsap.set(hidden, { autoAlpha: 0, pointerEvents: "none" });
          if (socials && !phone()) gsap.set(socials, open ? openSocials() : shutSocials);
          setHandle(open);
          return;
        }
        if (open) swap(handle, primary, true);
        else swap(primary, handle, false);
      };
      timer = window.setInterval(tick, HOLD * 1000);
      restart = () => {
        window.clearInterval(timer);
        timer = window.setInterval(tick, HOLD * 1000);
      };
    };

    const play = () => {
      if (cancelled) return;

      if (reduce) {
        settle();
        loop();
        return;
      }

      // Measure the gap each brace has to cross to sit against the head. Transforms are
      // cleared first so the boxes report their laid-out positions.
      gsap.set(glyphs, { x: 0, y: 0, rotate: 0 });
      const headBox = head.getBoundingClientRect();
      const leftGap = Math.max(0, headBox.left - left.getBoundingClientRect().right);
      const rightGap = Math.max(0, right.getBoundingClientRect().left - headBox.right);
      const wind = phone() ? 9 : 13;

      gsap.set(head, { y: -22, rotate: 0, autoAlpha: 0, transformOrigin: "50% 70%" });
      gsap.set(left, { x: -wind, autoAlpha: 0 });
      gsap.set(right, { x: wind, autoAlpha: 0 });
      gsap.set(primary, { x: -14, y: 0, autoAlpha: 0, pointerEvents: "auto" });
      gsap.set(handle, { x: 0, y: -slot(), autoAlpha: 0, pointerEvents: "none" });
      if (socials) gsap.set(socials, { ...shutSocials, minWidth: 0 });
      setHandle(false);

      const intro = gsap.timeline({ defaults: { ease: "power2.out" } });
      intro
        .to(head, { y: 0, autoAlpha: 1, duration: 0.44, ease: "back.out(1.7)" })
        .to(left, { x: leftGap, autoAlpha: 1, duration: 0.3, ease: "power2.in" }, "-=0.18")
        .to(right, { x: -rightGap, autoAlpha: 1, duration: 0.3, ease: "power2.in" }, "<")
        .to(head, { rotate: 7, duration: 0.07, ease: "power1.out" })
        .to(head, { rotate: -5.5, duration: 0.09, ease: "power1.inOut" })
        .to(head, { rotate: 3, duration: 0.08, ease: "power1.inOut" })
        .to(head, { rotate: 0, duration: 0.16, ease: "power2.out" })
        .to(left, { x: 0, duration: 0.66, ease: "power3.out" }, "-=0.06")
        .to(right, { x: 0, duration: 0.66, ease: "power3.out" }, "<")
        .to(primary, { x: 0, autoAlpha: 1, duration: 0.52, ease: "power2.out" }, "<+=0.12");

      intro.eventCallback("onComplete", loop);

      // If the intro is interrupted, the lockup still has to end up readable.
      watchdog = window.setTimeout(() => {
        if (looping) return;
        intro.kill();
        settle();
        loop();
      }, 3400);
    };

    const hold = () => {
      paused = true;
    };
    const release = (event: Event) => {
      const next = "relatedTarget" in event ? (event as MouseEvent | FocusEvent).relatedTarget : null;
      if (next && socials?.contains(next as Node)) return;
      paused = false;
      restart?.();
    };
    socials?.addEventListener("mouseenter", hold);
    socials?.addEventListener("mouseleave", release);
    socials?.addEventListener("focusin", hold);
    socials?.addEventListener("focusout", release);

    // Inline styles own opacity from here on, which switches off the CSS fallback.
    mark.classList.add("is-armed");
    if (!reduce) {
      gsap.set(glyphs, { autoAlpha: 0, x: 0, y: 0, rotate: 0 });
      gsap.set([primary, handle], { autoAlpha: 0, x: 0, y: 0 });
    }

    const started = performance.now();
    const waitForGlyphs = () => {
      if (cancelled) return;
      const ready = glyphs.every((node) => node.querySelector("svg"));
      if (!ready && performance.now() - started < 1200) {
        frame = requestAnimationFrame(waitForGlyphs);
        return;
      }
      try {
        play();
      } catch {
        settle();
        loop();
      }
    };
    waitForGlyphs();

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.clearTimeout(watchdog);
      cancelAnimationFrame(frame);
      socials?.removeEventListener("mouseenter", hold);
      socials?.removeEventListener("mouseleave", release);
      socials?.removeEventListener("focusin", hold);
      socials?.removeEventListener("focusout", release);
      gsap.killTweensOf([...glyphs, primary, handle, ...(socials ? [socials] : [])]);
    };
  }, [replay]);

  const onHandleNameClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onMenuClose?.();
    if (window.matchMedia(MOBILE).matches) {
      event.preventDefault();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.getElementById("site-footer")?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
      return;
    }
    onHomeClick?.(event);
  };

  return (
    <span ref={root} className="nav-mark">
      <span className="nav-mark-row">
        <span data-nav-brace-left className="nav-mark-brace" aria-hidden>
          <InlineSvg src="/bracket-left.svg" className="nh-nav-brace-left" />
        </span>
        <span className="nav-mark-core">
          <span className="nav-mark-lockup">
            <Link href={homeHref} className="nav-mark-head-link" aria-label={homeLabel} onClick={onHomeClick}>
              <span data-nav-head className="nav-mark-head" aria-hidden>
                <InlineSvg src="/NickCartoonHead.svg" className="nh-nav-head" />
              </span>
            </Link>
            <span data-nav-name-clip className="nav-mark-name-clip">
              <Link href={homeHref} data-nav-name className="nav-mark-name" onClick={onHomeClick}>
                {LABELS[0]}
              </Link>
              <a
                href="#site-footer"
                data-nav-name
                data-nav-handle
                className="nav-mark-name"
                aria-label="Jump to social links"
                tabIndex={-1}
                aria-hidden="true"
                onClick={onHandleNameClick}
              >
                {LABELS[1]}
              </a>
            </span>
          </span>
          <span data-nav-socials className="nav-mark-socials" aria-hidden="true">
            <span data-nav-socials-inner className="nav-mark-socials-inner">
              <SocialLinks />
            </span>
          </span>
        </span>
        <span data-nav-brace-right className="nav-mark-brace" aria-hidden>
          <InlineSvg src="/bracket-right.svg" className="nh-nav-brace-right" />
        </span>
      </span>
    </span>
  );
}
