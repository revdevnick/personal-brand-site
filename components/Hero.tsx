"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { InlineSvg } from "./InlineSvg";
import { Logo } from "./Logo";

gsap.registerPlugin(ScrollTrigger);

const CODE_OK = `declare function craft(need: string): string;

type Neighbor = { need: string };

function help(neighbor: Neighbor): string {
  return craft(neighbor.need);
}`;

const CODE_FAIL = `type Soul = { grief: string };

function help(soul: Soul): Peace {
  return me.fix(soul.grief);
}`;

const CODE_FIX = `type Soul = { grief: string };
type Peace = { with: "God" };

declare const Jesus: {
  reconcile(soul: Soul): Peace;
};

function help(soul: Soul): Peace {
  return Jesus.reconcile(soul);
}`;

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

function setTyped(el: HTMLElement | null, source: string, amount: number) {
  if (!el) return;
  const count = Math.max(0, Math.min(source.length, Math.floor(source.length * amount)));
  el.textContent = source.slice(0, count);
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const headSvg = useRef<SVGSVGElement | null>(null);
  const bookSvg = useRef<SVGSVGElement | null>(null);
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const coarse = useMediaQuery("(pointer: coarse)");
  const [headReady, setHeadReady] = useState(false);
  const [bookReady, setBookReady] = useState(false);

  const onHeadReady = useCallback((svg: SVGSVGElement) => {
    headSvg.current = svg;
    setHeadReady(true);
  }, []);

  const onBookReady = useCallback((svg: SVGSVGElement) => {
    bookSvg.current = svg;
    const paths = [...svg.querySelectorAll("path")];
    paths.slice(1).forEach((path, index) => {
      path.setAttribute("data-leaf", String(index));
    });
    setBookReady(true);
  }, []);

  useEffect(() => {
    const stage = root.current;
    if (!stage || reduce || !headReady || !bookReady) return;

    const ctx = gsap.context(() => {
      const paths = headSvg.current?.querySelectorAll("path, polygon, rect") ?? [];
      const leaves = bookSvg.current?.querySelectorAll("[data-leaf]") ?? [];
      const book = stage.querySelector<HTMLElement>("[data-bible]");
      const slot = stage.querySelector<HTMLElement>("[data-brace-left]");
      const cluster = stage.querySelector<HTMLElement>(".story-cluster");
      const doors = stage.querySelector<HTMLElement>("[data-doors]");
      const codeOk = stage.querySelector<HTMLElement>("[data-code-ok]");
      const codeFail = stage.querySelector<HTMLElement>("[data-code-fail]");
      const codeFix = stage.querySelector<HTMLElement>("[data-code-fix]");
      const clusterCraft = () => (window.innerWidth < 768 ? "14svh" : "16svh");
      const clusterClear = () => (window.innerWidth < 768 ? "10svh" : "12svh");
      const clusterVerse = () => (window.innerWidth < 768 ? "24svh" : "28svh");
      const clusterFinale = () => (window.innerWidth < 768 ? "9svh" : window.innerHeight < 800 ? "11svh" : "13svh");
      const captionSize = () => (window.innerWidth < 768 ? "1.7rem" : "3.15rem");
      const finaleA = () => (window.innerWidth < 768 ? "2.15rem" : window.innerHeight < 800 ? "3.4rem" : "4.35rem");
      const finaleB = () => (window.innerWidth < 768 ? "1.85rem" : window.innerHeight < 800 ? "3rem" : "3.85rem");
      const finaleC = () => (window.innerWidth < 768 ? "2.65rem" : window.innerHeight < 800 ? "4.6rem" : "6.1rem");

      const bookUnderY = () => {
        if (!cluster) return 80;
        return cluster.getBoundingClientRect().height * 0.34;
      };

      const bookDockX = () => {
        if (!book || !slot || !cluster) return 0;
        const clusterBox = cluster.getBoundingClientRect();
        const slotBox = slot.getBoundingClientRect();
        const clusterCenter = clusterBox.left + clusterBox.width / 2;
        const targetCenter = slotBox.right - book.offsetWidth / 2;
        return targetCenter - clusterCenter;
      };

      if (paths.length) gsap.set(paths, { autoAlpha: 1 });
      gsap.set(
        "[data-brace-right],[data-brace-left],[data-bible],[data-terminal],[data-word],[data-compiled],[data-error],[data-compiled-faith],[data-output],[data-phrase-b],[data-phrase-c]",
        { autoAlpha: 0 },
      );
      gsap.set("[data-phrase]", { autoAlpha: 1 });
      gsap.set("[data-phrase-a]", { autoAlpha: 1 });
      gsap.set("[data-phrase-b]", { autoAlpha: 0, height: 0, overflow: "hidden", marginTop: 0, y: 18 });
      gsap.set("[data-phrase-c]", { autoAlpha: 0, height: 0, overflow: "hidden", marginTop: 0 });
      gsap.set("[data-deep-word]", { autoAlpha: 0, y: 18 });
      gsap.set("[data-code-ok],[data-code-fail],[data-code-fix]", { textContent: "" });
      gsap.set("[data-pane-fail],[data-pane-fix]", { display: "none" });
      gsap.set("[data-pane-craft]", { display: "block" });
      gsap.set("[data-output]", { autoAlpha: 0, maxHeight: 0, paddingTop: 0, paddingBottom: 0 });
      gsap.set(".story-cluster", { height: 0, autoAlpha: 0, overflow: "hidden", scale: 0.92 });
      gsap.set("[data-term-slot]", { gridTemplateRows: "0fr" });
      gsap.set("[data-terminal]", { autoAlpha: 0 });
      gsap.set("[data-doors]", { autoAlpha: 0, height: 0, overflow: "hidden", pointerEvents: "none" });
      gsap.set(".story-stack", { gap: 0 });
      if (leaves.length) {
        gsap.set(leaves, { transformOrigin: "0% 50%", transformBox: "fill-box" });
      }

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.65,
          invalidateOnRefresh: true,
        },
      });

      tl.addLabel("intro")
        .to({ hold: 0 }, { hold: 1, duration: 0.7 });

      tl.addLabel("craft")
        .to("[data-cue]", { autoAlpha: 0, duration: 0.35 })
        .to(".hero-motes", { autoAlpha: 0, duration: 0.35 }, "<")
        .to(".hero-glow-code", { autoAlpha: 0.45, duration: 0.5 }, "<")
        .to("[data-phrase-a]", { fontSize: captionSize, duration: 0.7 }, "<")
        .to(".story-stack", { gap: "0.7rem", duration: 0.7 }, "<")
        .to(
          ".story-cluster",
          { height: clusterCraft, autoAlpha: 1, overflow: "visible", scale: 1, duration: 0.7 },
          "<",
        )
        .fromTo(
          "[data-brace-right]",
          { autoAlpha: 0, x: 28 },
          { autoAlpha: 1, x: 0, duration: 0.4 },
          ">-0.15",
        )
        .fromTo("[data-phrase-b]", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, height: "auto", overflow: "visible", marginTop: "0.28em", duration: 0.35 })
        .to("[data-term-slot]", { gridTemplateRows: "1fr", duration: 0.3 }, "<")
        .to("[data-terminal]", { autoAlpha: 1, duration: 0.3 }, "<")
        .to(
          { t: 0 },
          {
            t: 1,
            duration: 1.05,
            onUpdate() {
              setTyped(codeOk, CODE_OK, this.progress());
            },
          },
        )
        .fromTo("[data-compiled]", { autoAlpha: 0, x: -8 }, { autoAlpha: 1, x: 0, duration: 0.2 })
        .to({ hold: 0 }, { hold: 1, duration: 0.18 });

      tl.addLabel("soulFail")
        .set("[data-pane-craft]", { display: "none" })
        .set("[data-pane-fail]", { display: "block" })
        .to(
          { t: 0 },
          {
            t: 1,
            duration: 1.1,
            onUpdate() {
              setTyped(codeFail, CODE_FAIL, this.progress());
            },
          },
        )
        .fromTo("[data-error]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 })
        .to({ hold: 0 }, { hold: 1, duration: 0.9 });

      tl.addLabel("soulFix")
        .set("[data-pane-fail]", { display: "none" })
        .set("[data-pane-fix]", { display: "block" })
        .to(
          { t: 0 },
          {
            t: 1,
            duration: 1.3,
            onUpdate() {
              setTyped(codeFix, CODE_FIX, this.progress());
            },
          },
        )
        .fromTo("[data-compiled-faith]", { autoAlpha: 0, x: -8 }, { autoAlpha: 1, x: 0, duration: 0.25 })
        .to(".story-cluster", { height: clusterClear, duration: 0.4 })
        .fromTo(
          "[data-output]",
          { autoAlpha: 0, maxHeight: 0, paddingTop: 0, paddingBottom: 0 },
          { autoAlpha: 1, maxHeight: "22rem", paddingTop: "1.15em", paddingBottom: "1.25em", duration: 0.45 },
        )
        .to({ hold: 0 }, { hold: 1, duration: 0.75 });

      tl.addLabel("verse")
        .to("[data-terminal]", { autoAlpha: 0, duration: 0.3 })
        .to("[data-term-slot]", { gridTemplateRows: "0fr", duration: 0.35 }, "<")
        .to(".story-stack", { gap: "1.1rem", duration: 0.45 }, "<")
        .to(".story-cluster", { height: clusterVerse, duration: 0.55 }, "<")
        .fromTo("[data-word]", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.55 })
        .fromTo(
          "[data-bible]",
          { autoAlpha: 0, rotate: -90, x: 0, y: bookUnderY, scale: 0.9, xPercent: -50, yPercent: -50 },
          { autoAlpha: 1, rotate: -90, x: 0, y: bookUnderY, scale: 0.9, xPercent: -50, yPercent: -50, duration: 0.4 },
        )
        .fromTo(
          leaves,
          { rotateY: 12, scaleX: 1 },
          { rotateY: -128, scaleX: 0.08, autoAlpha: 0, stagger: 0.11, duration: 0.75 },
        )
        .to("[data-bible]", { rotate: 0, x: bookDockX, y: 0, scale: 1, duration: 0.8 })
        .fromTo("[data-brace-left]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 })
        .to("[data-bible]", { autoAlpha: 0, duration: 0.28 }, "<")
        .to("[data-word]", { autoAlpha: 0, y: -10, duration: 0.35 }, "<");

      tl.addLabel("finale")
        .to(".story-cluster", { height: clusterFinale, duration: 0.7 })
        .to(".story-stack", { gap: "1.25rem", duration: 0.7 }, "<")
        .to("[data-phrase-a]", { fontSize: finaleA, duration: 0.7 }, "<")
        .to("[data-phrase-b]", { fontSize: finaleB, duration: 0.7 }, "<")
        .to("[data-phrase-c]", { autoAlpha: 1, height: "auto", overflow: "visible", marginTop: "0.22em", duration: 0.4 }, "<")
        .to(
          "[data-deep-word]",
          { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.06 },
          "<0.05",
        )
        .to("[data-phrase-c]", { fontSize: finaleC, duration: 0.7 }, "<")
        .to(
          "[data-doors]",
          {
            autoAlpha: 1,
            height: () => doors?.scrollHeight ?? 140,
            overflow: "visible",
            pointerEvents: "auto",
            duration: 0.4,
          },
        )
        .to({ hold: 0 }, { hold: 1, duration: 1.8 });
    }, root);

    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => {
      window.clearTimeout(refresh);
      ctx.revert();
    };
  }, [headReady, bookReady, reduce]);

  useEffect(() => {
    const stage = root.current;
    if (!stage || reduce) return;

    const ctx = gsap.context(() => {
      gsap.set("[data-phrase-a]", { autoAlpha: 1 });
      gsap.set("[data-title-word]", { autoAlpha: 0, y: 36, rotateX: 18, filter: "blur(10px)" });
      gsap.set("[data-title-dot]", { autoAlpha: 0, y: 8 });
      gsap.set("[data-cue]", { autoAlpha: 0, y: 14 });

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .to("[data-title-word]", {
          autoAlpha: 1,
          y: 0,
          rotateX: 0,
          filter: "blur(0px)",
          duration: 0.85,
          stagger: 0.16,
        })
        .to("[data-title-dot]", { autoAlpha: 1, y: 0, duration: 0.28 }, "-=0.35")
        .to("[data-emphasis]", { color: "var(--color-accent)", duration: 0.7, ease: "power2.inOut" }, "-=0.45")
        .to("[data-cue]", { autoAlpha: 1, y: 0, duration: 0.55 }, "-=0.2");
    }, root);

    return () => ctx.revert();
  }, [reduce]);

  if (reduce) {
    return (
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center gap-6 bg-field px-5 py-16 text-center text-study">
        <Logo className="h-16 w-auto sm:h-20" />
        <div className="max-w-5xl font-display leading-tight">
          <p className="text-3xl sm:text-5xl lg:text-6xl">
            I love solving <span className="text-accent">problems</span>.
          </p>
          <p className="mt-3 text-3xl sm:text-5xl lg:text-6xl">Some of them take code.</p>
          <p className="mt-5 text-4xl text-scripture sm:text-6xl lg:text-7xl">The deepest ones take Jesus.</p>
        </div>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link href="/sermons/" className="magnetic door door-loud">Listen</Link>
          <Link href="/writing/" className="magnetic door door-loud">Read</Link>
        </div>
        <Link href="/work/" className="font-ui text-sm tracking-wide text-study/55 hover:text-accent">
          or see the work
        </Link>
      </section>
    );
  }

  return (
    <section ref={root} className="story-root relative bg-field text-study">
      <div className="story-track">
        <div className="story-stage">
          <div className="hero-field" aria-hidden>
            <div className="hero-glow-code" />
            <div className="hero-glow-word" />
            <div className="hero-grid" />
            <div className="hero-motes">
              <span className="hero-mote" style={{ left: "46%", top: "58%", animationDelay: "0s" }} />
              <span className="hero-mote" style={{ left: "52%", top: "62%", animationDelay: "-3s" }} />
              <span className="hero-mote" style={{ left: "41%", top: "54%", animationDelay: "-6s" }} />
              <span className="hero-mote" style={{ left: "57%", top: "50%", animationDelay: "-9s" }} />
              <span className="hero-mote" style={{ left: "49%", top: "66%", animationDelay: "-12s" }} />
              <span className="hero-mote" style={{ left: "38%", top: "48%", animationDelay: "-4s" }} />
              <span className="hero-mote" style={{ left: "61%", top: "56%", animationDelay: "-8s" }} />
              <span className="hero-mote" style={{ left: "44%", top: "44%", animationDelay: "-1s" }} />
            </div>
          </div>

          <div className="story-cast">
            <div className="story-stack">
              <div className="story-cluster">
                <div data-brace-left className="story-brace story-brace-left">
                  <InlineSvg src="/bracket-left.svg" className="nh-brace-left" />
                </div>
                <div data-head className="story-head">
                  <InlineSvg
                    src="/NickCartoonHead.svg"
                    className="nh-head"
                    title="Nick Perkins"
                    onReady={onHeadReady}
                  />
                </div>
                <div data-brace-right className="story-brace story-brace-right">
                  <InlineSvg src="/bracket-right.svg" className="nh-brace-right" />
                </div>
                <div data-bible className="story-bible" aria-hidden>
                  <InlineSvg src="/bracket-book-left.svg" className="nh-book" onReady={onBookReady} />
                </div>
              </div>

              <div data-phrase className="story-phrase">
                <h1 data-phrase-a className="story-phrase-a">
                  <span data-title-word>I</span> <span data-title-word>love</span>{" "}
                  <span data-title-word>solving</span>{" "}
                  <span data-title-word data-emphasis>
                    problems
                  </span>
                  <span data-title-dot>.</span>
                </h1>
                <p data-phrase-b className="story-phrase-b">
                  Some of them take code.
                </p>
                <p data-phrase-c className="story-phrase-c">
                  <span data-deep-word>The</span> <span data-deep-word>deepest</span>{" "}
                  <span data-deep-word>ones</span> <span data-deep-word>take</span>{" "}
                  <span data-deep-word>Jesus.</span>
                </p>
              </div>

              <div data-term-slot className="story-term-slot">
                <div className="story-term-slot-inner">
                  <div data-terminal className="story-terminal">
                    <div className="story-terminal-window">
                      <article data-pane data-pane-craft>
                        <p className="story-terminal-file">craft.ts</p>
                        <pre data-code-ok className="story-code" />
                        <p data-compiled className="story-terminal-status text-accent">
                          compiled
                        </p>
                      </article>
                      <article data-pane data-pane-fail>
                        <p className="story-terminal-file">soul.ts</p>
                        <pre data-code-fail className="story-code" />
                        <pre data-error className="story-code story-terminal-error">
                          {`error TS2304: Cannot find name 'me'.
error TS2304: Cannot find name 'Peace'.`}
                        </pre>
                      </article>
                      <article data-pane data-pane-fix>
                        <p className="story-terminal-file">soul.ts</p>
                        <pre data-code-fix className="story-code" />
                        <p data-compiled-faith className="story-terminal-status text-scripture">
                          compiled
                        </p>
                      </article>
                    </div>
                    <div data-output className="story-terminal-output">
                      <p className="font-display leading-snug text-scripture">
                        “Therefore, since we have been justified by faith, we have peace with God through our Lord Jesus Christ.”
                      </p>
                      <p className="font-ui tracking-[0.28em] text-scripture/70 uppercase">
                        Romans 5:1
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div data-doors className="story-doors">
              <div className="flex w-[min(92vw,28rem)] flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link href="/sermons/" className="magnetic door door-loud w-full sm:w-auto">Listen</Link>
                <Link href="/writing/" className="magnetic door door-loud w-full sm:w-auto">Read</Link>
              </div>
              <Link href="/work/" className="mt-5 font-ui text-sm tracking-wide text-study/55 hover:text-accent">
                or see the work
              </Link>
            </div>
          </div>

          <p
            data-word
            className="story-word pointer-events-none absolute left-1/2 top-[min(5.5rem,10.5svh)] z-[21] w-[min(90vw,40rem)] -translate-x-1/2 text-center font-display text-[clamp(1.05rem,2.7vw,1.85rem)] leading-snug text-scripture"
          >
            “Come to me, all who labor and are heavy laden, and I will give you rest.”
            <span className="mt-3 block font-ui text-[0.65rem] tracking-[0.28em] text-scripture/70 uppercase">
              Matthew 11:28
            </span>
          </p>

          <div data-cue className="story-cue" aria-hidden>
            {coarse ? (
              <>
                <span className="hero-chevron text-xl text-study/70">↑</span>
                <span className="mt-2 font-ui text-[0.65rem] tracking-[0.32em] text-study/55 uppercase">
                  Swipe up
                </span>
              </>
            ) : (
              <>
                <span className="scroll-mouse">
                  <span className="scroll-wheel" />
                </span>
                <span className="mt-2 font-ui text-[0.65rem] tracking-[0.32em] text-study/55 uppercase">
                  Scroll
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
