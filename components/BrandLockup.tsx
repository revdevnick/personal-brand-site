"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import gsap from "gsap";
import { InlineSvg } from "./InlineSvg";
import { SocialLinks } from "./SocialLinks";

const LABELS = ["Nick Perkins", "@revdevnick"] as const;
const HOLD = 5;

type BrandLockupProps = {
  homeHref: string;
  homeLabel: string;
  onHomeClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export function BrandLockup({ homeHref, homeLabel, onHomeClick }: BrandLockupProps) {
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

    let cancelled = false;
    let revert = () => {};

    const start = () => {
      if (cancelled || !root.current) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const head = mark.querySelector<HTMLElement>("[data-nav-head]");
      const left = mark.querySelector<HTMLElement>("[data-nav-brace-left]");
      const right = mark.querySelector<HTMLElement>("[data-nav-brace-right]");
      const nameClip = mark.querySelector<HTMLElement>("[data-nav-name-clip]");
      const names = [...mark.querySelectorAll<HTMLElement>("[data-nav-name]")];
      const socials = mark.querySelector<HTMLElement>("[data-nav-socials]");
      const socialInner = mark.querySelector<HTMLElement>("[data-nav-socials-inner]");

      if (!head || !left || !right || !nameClip || names.length < 2 || !socials || !socialInner) return;

      nameClip.classList.remove("is-revealed");

      const measureSlot = () => Math.ceil(Math.max(...names.map((node) => node.scrollWidth)));
      const measureName = (node: HTMLElement) => Math.ceil(node.scrollWidth);
      const socialWidth = () => Math.ceil(socialInner.scrollWidth);
      const socialHeight = () => Math.ceil(socialInner.scrollHeight);
      const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

      const closedSocials = () =>
        isMobile()
          ? { width: "100%", height: 0, autoAlpha: 0, y: -8 }
          : { width: 0, height: "3.25rem", autoAlpha: 0, y: 0 };

      const openedSocials = () =>
        isMobile()
          ? { width: "100%", height: socialHeight(), autoAlpha: 1, y: 0 }
          : { width: socialWidth(), height: "3.25rem", autoAlpha: 1, y: 0 };

      const setSocialOpen = (open: boolean) => {
        mark.classList.toggle("is-handle", open);
        document.documentElement.classList.toggle("is-nav-handle", open && isMobile());
        socials.setAttribute("aria-hidden", open ? "false" : "true");
        socials.querySelectorAll("a").forEach((link) => {
          if (open) link.removeAttribute("tabindex");
          else link.setAttribute("tabindex", "-1");
        });
      };

      const revealSlot = () => {
        nameClip.classList.add("is-revealed");
        if (isMobile()) gsap.set(nameClip, { width: measureName(names[0]) });
        else gsap.set(nameClip, { clearProps: "width" });
      };

      let paused = false;
      let restartHold: (() => void) | null = null;
      const onSocialEnter = () => {
        paused = true;
      };
      const onSocialLeave = (event: Event) => {
        const next = "relatedTarget" in event ? (event as MouseEvent | FocusEvent).relatedTarget : null;
        if (next && socials.contains(next as Node)) return;
        paused = false;
        restartHold?.();
      };
      socials.addEventListener("mouseenter", onSocialEnter);
      socials.addEventListener("mouseleave", onSocialLeave);
      socials.addEventListener("focusin", onSocialEnter);
      socials.addEventListener("focusout", onSocialLeave);
      const dropSocialHold = () => {
        socials.removeEventListener("mouseenter", onSocialEnter);
        socials.removeEventListener("mouseleave", onSocialLeave);
        socials.removeEventListener("focusin", onSocialEnter);
        socials.removeEventListener("focusout", onSocialLeave);
        restartHold = null;
      };

      if (reduce) {
        gsap.set([head, left, right], { clearProps: "all" });
        revealSlot();
        gsap.set(names[0], { y: 0, autoAlpha: 1 });
        gsap.set(names[1], { y: 0, autoAlpha: 0 });
        gsap.set(socials, closedSocials());
        setSocialOpen(false);
        let index = 0;
        const tick = () => {
          if (paused) return;
          const next = (index + 1) % names.length;
          gsap.set(names[index], { autoAlpha: 0 });
          gsap.set(names[next], { autoAlpha: 1 });
          const show = next === 1;
          gsap.set(socials, show ? openedSocials() : closedSocials());
          if (isMobile()) gsap.set(nameClip, { width: measureName(names[next]) });
          setSocialOpen(show);
          index = next;
        };
        let id = window.setInterval(tick, HOLD * 1000);
        restartHold = () => {
          window.clearInterval(id);
          id = window.setInterval(tick, HOLD * 1000);
        };
        revert = () => {
          window.clearInterval(id);
          dropSocialHold();
          document.documentElement.classList.remove("is-nav-handle");
        };
        return;
      }

      const ctx = gsap.context(() => {
        const slotWidth = measureSlot();
        const slotHeight = () => nameClip.offsetHeight;
        const phone = isMobile();

        mark.classList.add("is-intro");
        gsap.set(head, { y: -28, autoAlpha: 0 });
        gsap.set(nameClip, { width: 0, minWidth: 0 });
        gsap.set(socials, { ...closedSocials(), minWidth: 0 });
        gsap.set(names[0], { y: 0, autoAlpha: 1 });
        gsap.set(names[1], { y: () => -slotHeight(), autoAlpha: 1 });
        setSocialOpen(false);
        void mark.offsetWidth;

        const braceMotion = () => {
          const bar = mark.closest(".site-header-bar");
          const view = (bar instanceof HTMLElement ? bar : mark).getBoundingClientRect();
          const menu = bar?.querySelector(".site-nav-toggle");
          const leftBox = left.getBoundingClientRect();
          const rightBox = right.getBoundingClientRect();
          const headBox = head.getBoundingClientRect();
          const edge = phone ? 4 : 8;
          const leftRoom = Math.max(6, leftBox.left - view.left - edge);
          const rightLimit = menu instanceof HTMLElement ? menu.getBoundingClientRect().left : view.right;
          const rightRoom = Math.max(6, rightLimit - rightBox.right - edge);
          const overlap = phone ? 8 : 8;
          return {
            fromLeft: -Math.min(phone ? 22 : 42, leftRoom),
            fromRight: Math.min(phone ? 24 : 48, rightRoom),
            hitLeft: headBox.left - leftBox.right + overlap,
            hitRight: -(rightBox.left - headBox.right + overlap),
          };
        };

        const motion = braceMotion();
        gsap.set(left, { x: motion.fromLeft, rotate: -12, autoAlpha: 0 });
        gsap.set(right, { x: motion.fromRight, rotate: 12, autoAlpha: 0 });

        mark.querySelectorAll<SVGSVGElement>(".nav-mark-brace svg").forEach((svg) => {
          svg.setAttribute("preserveAspectRatio", "none");
        });

        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        intro
          .to(head, { y: 0, autoAlpha: 1, duration: 0.48, ease: "back.out(1.7)" })
          .to(left, { x: motion.hitLeft, rotate: 0, autoAlpha: 1, duration: 0.34, ease: "power2.in" }, "-=0.16")
          .to(right, { x: motion.hitRight, rotate: 0, autoAlpha: 1, duration: 0.34, ease: "power2.in" }, "<")
          .to(head, {
            keyframes: [
              { x: 3, rotate: 6, duration: 0.05 },
              { x: -4, rotate: -7, duration: 0.05 },
              { x: 3, rotate: 4, duration: 0.05 },
              { x: -2, rotate: -3, duration: 0.05 },
              { x: 0, rotate: 0, duration: 0.09 },
            ],
            ease: "none",
          })
          .add(() => mark.classList.remove("is-intro"))
          .to(left, { x: 0, duration: 0.4, ease: "power3.out" }, "<")
          .to(right, { x: 0, duration: 0.4, ease: "power3.out" }, "<")
          .to(nameClip, { width: phone ? measureName(names[0]) : slotWidth, duration: 0.7, ease: "power3.inOut" }, "<");

        const swapTo = (incoming: HTMLElement, outgoing: HTMLElement, openSocials: boolean) => {
          const distance = slotHeight();
          const step = gsap.timeline({ defaults: { duration: 0.6, ease: "power2.inOut" } });
          step
            .add(() => {
              if (openSocials) setSocialOpen(true);
            }, 0)
            .set(incoming, { y: -distance, autoAlpha: 1 })
            .to(outgoing, { y: distance }, 0)
            .to(incoming, { y: 0 }, 0)
            .to(socials, openSocials ? openedSocials() : closedSocials(), 0)
            .add(() => {
              if (!openSocials) setSocialOpen(false);
            })
            .set(outgoing, { y: -distance });
          if (phone) {
            step.to(nameClip, { width: measureName(incoming), duration: 0.6, ease: "power2.inOut" }, 0);
          }
          return step;
        };

        intro.eventCallback("onComplete", () => {
          if (cancelled) return;
          revealSlot();
          let handle = false;
          const tick = () => {
            if (paused) return;
            handle = !handle;
            if (handle) swapTo(names[1], names[0], true);
            else swapTo(names[0], names[1], false);
          };
          let id = window.setInterval(tick, HOLD * 1000);
          restartHold = () => {
            window.clearInterval(id);
            id = window.setInterval(tick, HOLD * 1000);
          };
          revert = () => {
            window.clearInterval(id);
            dropSocialHold();
            document.documentElement.classList.remove("is-nav-handle");
            ctx.revert();
          };
        });
      }, mark);

      revert = () => {
        dropSocialHold();
        ctx.revert();
      };
    };

    const fonts = document.fonts?.ready ?? Promise.resolve();
    fonts.then(start);

    return () => {
      cancelled = true;
      mark.classList.remove("is-intro");
      document.documentElement.classList.remove("is-nav-handle");
      revert();
    };
  }, [replay]);

  return (
    <span ref={root} className="nav-mark">
      <span data-nav-brace-left className="nav-mark-brace" aria-hidden>
        <InlineSvg src="/bracket-left.svg" className="nh-nav-brace-left" />
      </span>
      <span className="nav-mark-main">
        <Link href={homeHref} className="nav-mark-lockup" aria-label={homeLabel} onClick={onHomeClick}>
          <span data-nav-head className="nav-mark-head" aria-hidden>
            <InlineSvg src="/NickCartoonHead.svg" className="nh-nav-head" />
          </span>
          <span data-nav-name-clip className="nav-mark-name-clip">
            {LABELS.map((label) => (
              <span key={label} data-nav-name className="nav-mark-name">
                {label}
              </span>
            ))}
          </span>
        </Link>
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
  );
}
