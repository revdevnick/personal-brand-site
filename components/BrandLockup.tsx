"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { InlineSvg } from "./InlineSvg";

const LABELS = ["Nick Perkins", "@revdevnick"] as const;
const HOLD = 5;

export function BrandLockup() {
  const root = useRef<HTMLSpanElement>(null);

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

      if (!head || !left || !right || !nameClip || names.length < 2) return;

      const slotWidth = Math.max(...names.map((node) => node.scrollWidth));
      const slotHeight = () => nameClip.offsetHeight;

      if (reduce) {
        gsap.set([head, left, right], { clearProps: "all" });
        gsap.set(nameClip, { width: slotWidth });
        gsap.set(names[0], { y: 0, autoAlpha: 1 });
        gsap.set(names[1], { y: 0, autoAlpha: 0 });
        let index = 0;
        const id = window.setInterval(() => {
          const next = (index + 1) % names.length;
          gsap.set(names[index], { autoAlpha: 0 });
          gsap.set(names[next], { autoAlpha: 1 });
          index = next;
        }, HOLD * 1000);
        revert = () => window.clearInterval(id);
        return;
      }

      const roll = (outgoing: HTMLElement, incoming: HTMLElement) => {
        const distance = slotHeight();
        const step = gsap.timeline();
        step
          .set(incoming, { y: -distance, autoAlpha: 1 })
          .to(outgoing, { y: distance, duration: 0.6, ease: "power2.inOut" }, 0)
          .to(incoming, { y: 0, duration: 0.6, ease: "power2.inOut" }, 0)
          .set(outgoing, { y: -distance });
        return step;
      };

      const ctx = gsap.context(() => {
        gsap.set(head, { y: -28, autoAlpha: 0 });
        gsap.set(left, { x: -42, rotate: -12, autoAlpha: 0 });
        gsap.set(right, { x: 48, rotate: 12, autoAlpha: 0 });
        gsap.set(nameClip, { width: 0 });
        gsap.set(names[0], { y: 0, autoAlpha: 1 });
        gsap.set(names[1], { y: () => -slotHeight(), autoAlpha: 1 });

        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        intro
          .to(head, { y: 0, autoAlpha: 1, duration: 0.48, ease: "back.out(1.7)" })
          .to(left, { x: 7, rotate: 0, autoAlpha: 1, duration: 0.34, ease: "power2.in" }, "-=0.16")
          .to(right, { x: -7, rotate: 0, autoAlpha: 1, duration: 0.34, ease: "power2.in" }, "<")
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
          .to(left, { x: 0, duration: 0.4, ease: "power3.out" }, "-=0.06")
          .to(right, { x: 0, duration: 0.4, ease: "power3.out" }, "<")
          .to(nameClip, { width: slotWidth, duration: 0.7, ease: "power3.inOut" });

        const loop = gsap.timeline({ repeat: -1, paused: true });
        loop
          .to({}, { duration: HOLD })
          .add(roll(names[0], names[1]))
          .to({}, { duration: HOLD })
          .add(roll(names[1], names[0]));

        intro.eventCallback("onComplete", () => {
          loop.play(0);
        });
      }, mark);

      revert = () => ctx.revert();
    };

    const fonts = document.fonts?.ready ?? Promise.resolve();
    fonts.then(start);

    return () => {
      cancelled = true;
      revert();
    };
  }, []);

  return (
    <span ref={root} className="nav-mark">
      <span className="nav-mark-lockup">
        <span data-nav-brace-left className="nav-mark-brace" aria-hidden>
          <InlineSvg src="/bracket-left.svg" className="nh-nav-brace-left" />
        </span>
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
        <span data-nav-brace-right className="nav-mark-brace" aria-hidden>
          <InlineSvg src="/bracket-right.svg" className="nh-nav-brace-right" />
        </span>
      </span>
    </span>
  );
}
