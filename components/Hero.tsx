"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { InlineSvg } from "./InlineSvg";
import { HeroGlobe } from "./HeroGlobe";
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

const HERO_STARS = [
  [4, 7, 1, 0, 0.48],
  [11, 12, 1.4, 1.2, 0.92],
  [18, 5, 1, 2.4, 0.58],
  [27, 14, 1.6, 0.6, 1],
  [35, 8, 1, 3.1, 0.5],
  [42, 18, 1.2, 1.8, 0.7],
  [8, 22, 1, 4.2, 0.42],
  [15, 31, 1.5, 0.4, 0.88],
  [6, 41, 1.1, 2.8, 0.55],
  [13, 52, 1, 1.5, 0.46],
  [5, 63, 1.3, 3.6, 0.8],
  [9, 74, 1, 0.9, 0.5],
  [21, 68, 1.4, 2.1, 0.74],
  [72, 6, 1.2, 0.3, 0.62],
  [81, 11, 1, 2.7, 0.44],
  [89, 8, 1.6, 1.1, 0.96],
  [94, 16, 1, 3.4, 0.52],
  [78, 21, 1.3, 0.7, 0.78],
  [86, 28, 1, 4, 0.4],
  [93, 36, 1.5, 1.9, 0.86],
  [97, 48, 1, 2.5, 0.5],
  [91, 58, 1.2, 0.2, 0.66],
  [88, 69, 1, 3.8, 0.45],
  [96, 77, 1.4, 1.4, 0.82],
  [74, 4, 1, 2.2, 0.54],
  [48, 6, 1.3, 3, 0.9],
  [55, 11, 1, 0.8, 0.48],
  [63, 5, 1.5, 4.4, 0.84],
  [31, 4, 1, 1.6, 0.56],
  [2, 88, 1.2, 2.9, 0.6],
  [16, 84, 1, 0.5, 0.42],
  [84, 86, 1.3, 3.3, 0.72],
] as const;

const STAR_TINTS = ["", "is-cool", "is-warm"] as const;

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

function StatusCheck() {
  return (
    <svg viewBox="0 0 24 24" className="story-terminal-glyph" aria-hidden>
      <circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M7.4 12.2l3.2 3.3 6-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatusStop() {
  return (
    <svg viewBox="0 0 24 24" className="story-terminal-glyph" aria-hidden>
      <path
        d="M8.1 2.6h7.8L21.4 8.1v7.8L15.9 21.4H8.1L2.6 15.9V8.1L8.1 2.6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M8.2 8.2l7.6 7.6M15.8 8.2l-7.6 7.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const headSvg = useRef<SVGSVGElement | null>(null);
  const bookSvg = useRef<SVGSVGElement | null>(null);
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const coarse = useMediaQuery("(pointer: coarse)");
  const [headReady, setHeadReady] = useState(false);
  const [bookReady, setBookReady] = useState(false);
  const [replay, setReplay] = useState(0);
  const [marksOn, setMarksOn] = useState(false);

  const onHeadReady = useCallback((svg: SVGSVGElement) => {
    headSvg.current = svg;
    setHeadReady(true);
  }, []);

  const onBookReady = useCallback((svg: SVGSVGElement) => {
    bookSvg.current = svg;
    setBookReady(true);
  }, []);

  useEffect(() => {
    const replayHome = () => setReplay((n) => n + 1);
    window.addEventListener("nh:replay-home", replayHome);
    return () => window.removeEventListener("nh:replay-home", replayHome);
  }, []);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [replay]);

  useEffect(() => {
    const stage = root.current;
    if (!stage || reduce || !headReady || !bookReady) return;

    const ctx = gsap.context(() => {
      const paths = headSvg.current?.querySelectorAll("path, polygon, rect") ?? [];
      const book = stage.querySelector<HTMLElement>("[data-bible]");
      const slot = stage.querySelector<HTMLElement>("[data-brace-left]");
      const cluster = stage.querySelector<HTMLElement>(".story-cluster");
      const doors = stage.querySelector<HTMLElement>("[data-doors]");
      const cue = stage.querySelector<HTMLElement>("[data-cue]");
      const codeOk = stage.querySelector<HTMLElement>("[data-code-ok]");
      const codeFail = stage.querySelector<HTMLElement>("[data-code-fail]");
      const codeFix = stage.querySelector<HTMLElement>("[data-code-fix]");
      const sheet = (id: string) => [...(bookSvg.current?.querySelectorAll(`[data-sheet="${id}"]`) ?? [])];
      const sheets = [sheet("1"), sheet("2"), sheet("3")];
      const leaves = sheets.flat();

      const clusterCraft = () => (window.innerWidth < 768 ? "14svh" : "16svh");
      const clusterClear = () => (window.innerWidth < 768 ? "10svh" : "12svh");
      const clusterFinale = () => (window.innerWidth < 768 ? "9svh" : window.innerHeight < 800 ? "11svh" : "13svh");
      const captionSize = () => (window.innerWidth < 768 ? "1.7rem" : "3.15rem");
      const finaleA = () => (window.innerWidth < 768 ? "2.15rem" : window.innerHeight < 800 ? "3.4rem" : "4.35rem");
      const finaleB = () => (window.innerWidth < 768 ? "1.85rem" : window.innerHeight < 800 ? "3rem" : "3.85rem");
      const finaleC = () => (window.innerWidth < 768 ? "2.65rem" : window.innerHeight < 800 ? "4.6rem" : "6.1rem");

      const bookDockX = () => {
        if (!book || !slot || !cluster) return 0;
        const clusterBox = cluster.getBoundingClientRect();
        const slotBox = slot.getBoundingClientRect();
        const clusterCenter = clusterBox.left + clusterBox.width / 2;
        const targetCenter = slotBox.right - book.offsetWidth / 2;
        return targetCenter - clusterCenter;
      };

      const typeCode = (el: HTMLElement | null, source: string, duration = Math.min(2.6, Math.max(1.4, source.length * 0.016))) =>
        gsap.to(
          { t: 0 },
          {
            t: 1,
            duration,
            ease: "none",
            onUpdate() {
              setTyped(el, source, this.progress());
            },
          },
        );

      const showCue = () => {
        if (!cue) return;
        gsap.to(cue, { autoAlpha: 1, y: 0, duration: 0.4, overwrite: "auto" });
      };

      const hideCue = () => {
        if (!cue) return;
        gsap.to(cue, { autoAlpha: 0, duration: 0.25, overwrite: "auto" });
      };

      if (paths.length) gsap.set(paths, { autoAlpha: 1 });
      gsap.set(
        "[data-brace-right],[data-brace-left],[data-bible],[data-terminal],[data-word],[data-compiled],[data-failed],[data-error],[data-compiled-faith],[data-output],[data-phrase-b],[data-phrase-c]",
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
      gsap.set("[data-bible]", { autoAlpha: 0, x: 0, y: 0, xPercent: -50, yPercent: -50, rotate: 0, scale: 1.08 });
      if (leaves.length) {
        gsap.set(leaves, { transformOrigin: "0% 50%", transformBox: "fill-box", rotateY: 0, scaleX: 1, autoAlpha: 1 });
      }

      const story = { scrub: null as gsap.core.Timeline | null };

      const craftPlay = gsap.timeline({ paused: true });
      craftPlay
        .add(typeCode(codeOk, CODE_OK))
        .fromTo("[data-compiled]", { autoAlpha: 0, x: -8 }, { autoAlpha: 1, x: 0, duration: 0.22 })
        .to({ hold: 0 }, { hold: 1, duration: 0.2 })
        .add(() => {
          const next = story.scrub?.labels.book;
          if (next == null || (story.scrub?.time() ?? 0) < next) showCue();
        });

      const bookPlay = gsap.timeline({ paused: true });
      bookPlay
        .add(() => hideCue())
        .to("[data-terminal]", { autoAlpha: 0, duration: 0.28 })
        .to("[data-term-slot]", { gridTemplateRows: "0fr", duration: 0.3 }, "<")
        .set(leaves, { rotateY: 0, scaleX: 1, autoAlpha: 1 })
        .fromTo(
          "[data-bible]",
          { autoAlpha: 0, scale: 0.92, x: 0 },
          { autoAlpha: 1, scale: 1.08, duration: 0.4, ease: "power2.out" },
        );

      sheets.forEach((pair, index) => {
        if (!pair.length) return;
        bookPlay.fromTo(
          pair,
          { rotateY: 10, scaleX: 1, autoAlpha: 1 },
          {
            rotateY: -158,
            scaleX: 0.08,
            autoAlpha: 0,
            duration: 0.48,
            ease: "power2.in",
            stagger: 0.05,
          },
          index === 0 ? "+=0.12" : "-=0.18",
        );
      });

      bookPlay
        .to("[data-bible]", { x: bookDockX, scale: 1, duration: 0.75, ease: "power3.inOut" })
        .fromTo("[data-brace-left]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.32 })
        .to("[data-bible]", { autoAlpha: 0, duration: 0.28 }, "<")
        .add(() => {
          const next = story.scrub?.labels.soul;
          if (next == null || (story.scrub?.time() ?? 0) < next) showCue();
        });

      const soulPlay = gsap.timeline({ paused: true });
      soulPlay
        .add(() => hideCue())
        .set("[data-pane-craft]", { display: "none" })
        .set("[data-pane-fail]", { display: "block" })
        .set("[data-pane-fix]", { display: "none" })
        .add(typeCode(codeFail, CODE_FAIL))
        .fromTo("[data-failed]", { autoAlpha: 0, x: -8 }, { autoAlpha: 1, x: 0, duration: 0.22 })
        .fromTo("[data-error]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.22 }, "<")
        .to({ hold: 0 }, { hold: 1, duration: 0.85 })
        .set("[data-pane-fail]", { display: "none" })
        .set("[data-pane-fix]", { display: "block" })
        .add(typeCode(codeFix, CODE_FIX, Math.min(3.1, Math.max(1.8, CODE_FIX.length * 0.015))))
        .fromTo("[data-compiled-faith]", { autoAlpha: 0, x: -8 }, { autoAlpha: 1, x: 0, duration: 0.22 })
        .to(".story-cluster", { height: clusterClear, duration: 0.35 })
        .addLabel("peace")
        .fromTo(
          "[data-output]",
          { autoAlpha: 0, maxHeight: 0, paddingTop: 0, paddingBottom: 0 },
          { autoAlpha: 1, maxHeight: "22rem", paddingTop: "1.15em", paddingBottom: "1.25em", duration: 0.45 },
        )
        .to(
          "[data-phrase-c]",
          { autoAlpha: 1, height: "auto", overflow: "visible", marginTop: "0.22em", duration: 0.45 },
          "<",
        )
        .to("[data-deep-word]", { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05 }, "<")
        .to({ hold: 0 }, { hold: 1, duration: 0.55 })
        .add(() => {
          const next = story.scrub?.labels.finale;
          if (next == null || (story.scrub?.time() ?? 0) < next) showCue();
        });

      const catchUp = (tl: gsap.core.Timeline, local: number) => {
        if (tl.progress() >= 1) {
          tl.timeScale(1);
          return;
        }
        if (local >= 0.95) {
          tl.progress(1);
          return;
        }
        const behind = local - tl.progress();
        tl.timeScale(behind > 0.08 ? 1 + behind * 14 : 1).play();
      };

      const scrub = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.28,
          invalidateOnRefresh: true,
          onUpdate(self) {
            const anim = self.animation as gsap.core.Timeline;
            const t = anim.time();
            const craftAt = anim.labels.craftPlay ?? 0;
            const bookAt = anim.labels.book ?? 0;
            const soulAt = anim.labels.soul ?? 0;
            const soulPlayAt = anim.labels.soulPlay ?? 0;
            const finaleAt = anim.labels.finale ?? 0;

            if (t >= craftAt && t < bookAt) {
              catchUp(craftPlay, (t - craftAt) / Math.max(0.001, bookAt - craftAt));
            } else if (t >= bookAt && craftPlay.progress() < 1) {
              craftPlay.progress(1);
            }

            if (t >= bookAt && t < soulAt) {
              catchUp(bookPlay, (t - bookAt) / Math.max(0.001, soulAt - bookAt));
            } else if (t >= soulAt && bookPlay.progress() < 1) {
              bookPlay.progress(1);
            }

            if (t >= soulPlayAt && t < finaleAt) {
              if (craftPlay.progress() < 1) craftPlay.progress(1);
              if (bookPlay.progress() < 1) bookPlay.progress(1);
              catchUp(soulPlay, (t - soulPlayAt) / Math.max(0.001, finaleAt - soulPlayAt));
            } else if (t >= finaleAt) {
              if (craftPlay.progress() < 1) craftPlay.progress(1);
              if (bookPlay.progress() < 1) bookPlay.progress(1);
              if (soulPlay.progress() < 1) soulPlay.progress(1);
              hideCue();
            }
          },
        },
      });

      scrub
        .addLabel("craft")
        .to("[data-cue]", { autoAlpha: 0, duration: 0.18 })
        .to(".hero-motes", { autoAlpha: 0, duration: 0.18 }, "<")
        .to(".hero-glow-code", { autoAlpha: 0.45, duration: 0.35 }, "<")
        .to("[data-phrase-a]", { fontSize: captionSize, duration: 0.45 }, "<")
        .to(".story-stack", { gap: "0.7rem", duration: 0.45 }, "<")
        .to(
          ".story-cluster",
          { height: clusterCraft, autoAlpha: 1, overflow: "visible", scale: 1, duration: 0.45 },
          "<",
        )
        .fromTo("[data-brace-right]", { autoAlpha: 0, x: 28 }, { autoAlpha: 1, x: 0, duration: 0.28 }, ">-0.08")
        .fromTo(
          "[data-phrase-b]",
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, height: "auto", overflow: "visible", marginTop: "0.28em", duration: 0.24 },
        )
        .to("[data-term-slot]", { gridTemplateRows: "1fr", duration: 0.22 }, "<")
        .to("[data-terminal]", { autoAlpha: 1, duration: 0.22 }, "<")
        .addLabel("craftPlay")
        .to({ hold: 0 }, { hold: 1, duration: 0.7 })
        .addLabel("book")
        .to("[data-cue]", { autoAlpha: 0, duration: 0.15 })
        .to({ hold: 0 }, { hold: 1, duration: 0.7 })
        .addLabel("soul")
        .to("[data-cue]", { autoAlpha: 0, duration: 0.15 })
        .set("[data-pane-craft]", { display: "none" })
        .set("[data-pane-fail]", { display: "block" })
        .set("[data-code-ok]", { textContent: "" })
        .to("[data-term-slot]", { gridTemplateRows: "1fr", duration: 0.32 })
        .to("[data-terminal]", { autoAlpha: 1, duration: 0.32 }, "<")
        .addLabel("soulPlay")
        .to({ hold: 0 }, { hold: 1, duration: 0.75 })
        .addLabel("finale")
        .to("[data-cue]", { autoAlpha: 0, duration: 0.15 })
        .to("[data-terminal]", { autoAlpha: 0, duration: 0.24 })
        .to("[data-term-slot]", { gridTemplateRows: "0fr", duration: 0.28 }, "<")
        .to(".story-stack", { gap: "1.25rem", duration: 0.5 }, "<")
        .to(".story-cluster", { height: clusterFinale, duration: 0.5 }, "<")
        .to("[data-phrase-a]", { fontSize: finaleA, duration: 0.5 }, "<")
        .to("[data-phrase-b]", { fontSize: finaleB, duration: 0.5 }, "<")
        .to("[data-phrase-c]", { autoAlpha: 1, height: "auto", overflow: "visible", marginTop: "0.22em", duration: 0.28 }, "<")
        .to("[data-deep-word]", { autoAlpha: 1, y: 0, duration: 0.28 }, "<")
        .to("[data-phrase-c]", { fontSize: finaleC, duration: 0.5 }, "<")
        .to(
          "[data-doors]",
          {
            autoAlpha: 1,
            height: () => doors?.scrollHeight ?? 140,
            overflow: "visible",
            pointerEvents: "auto",
            duration: 0.32,
          },
        )
        .to({ hold: 0 }, { hold: 1, duration: 0.55 });

      story.scrub = scrub;
    }, root);

    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => {
      window.clearTimeout(refresh);
      ctx.revert();
    };
  }, [headReady, bookReady, reduce, replay]);

  useEffect(() => {
    const stage = root.current;
    if (!stage || reduce) return;

    let breath: gsap.core.Timeline | null = null;
    let loveSwap: gsap.core.Timeline | null = null;
    let markReveal: gsap.core.Timeline | null = null;
    let introDone = false;
    let idleOn = false;
    const word = () => stage.querySelector<HTMLElement>("[data-emphasis]");
    const glow = () => stage.querySelector<HTMLElement>(".hero-glow-code");
    const world = () => stage.querySelector<HTMLElement>("[data-hero-world]");
    const atTop = () => window.scrollY <= 4;

    const stopBreath = () => {
      if (breath) {
        breath.kill();
        breath = null;
      }
      const el = word();
      if (el) gsap.set(el, { y: 0, scale: 1 });
      const light = glow();
      if (light) gsap.set(light, { scale: 1, opacity: 1 });
    };

    const stopWorld = () => {
      const layer = world();
      if (!layer) return;
      gsap.killTweensOf(layer);
      gsap.to(layer, { autoAlpha: 0, duration: 0.4, overwrite: true });
    };

    const measureInk = (el: HTMLElement, text: string) => {
      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx) return null;
      const cs = getComputedStyle(el);
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const m = ctx.measureText(text);
      const fontSize = parseFloat(cs.fontSize) || 0;
      return {
        ascent: m.actualBoundingBoxAscent ?? 0,
        emAscent: m.fontBoundingBoxAscent || fontSize * 0.8,
      };
    };

    const scriptBody = (face: HTMLElement) => {
      const raw = (face.textContent ?? "").trim();
      if (face.closest(".story-love-hi")) {
        return raw.replace(/[\u0900-\u0903\u093A-\u094F\u0951-\u0957\u0962\u0963]/g, "") || raw;
      }
      if (face.closest(".story-love-th")) {
        return raw.replace(/[\u0E31\u0E34-\u0E37\u0E47-\u0E4E]/g, "") || raw;
      }
      return raw;
    };

    const isCompact = () => window.matchMedia("(max-width: 767px)").matches;
    const loveSlot = () => stage.querySelector<HTMLElement>("[data-love]");
    const loveEn = () => stage.querySelector<HTMLElement>("[data-love-en]");
    const loveFaces = ["[data-love-en]", "[data-love-sign]", "[data-love-zh]", "[data-love-hi]", "[data-love-th]"];

    const slotWidthFor = (sel: string) => {
      const en = loveEn();
      const enW = en ? Math.ceil(en.scrollWidth || en.getBoundingClientRect().width) : 0;
      if (isCompact() || (!sel.includes("love-hi") && !sel.includes("love-th"))) return enW;
      const face = stage.querySelector<HTMLElement>(`${sel} .story-love-face`);
      const faceW = face ? Math.ceil(face.scrollWidth || face.getBoundingClientRect().width) : 0;
      return Math.max(enW, faceW);
    };

    const visibleLoveSel = () => {
      for (const sel of loveFaces) {
        const el = stage.querySelector<HTMLElement>(sel);
        if (!el) continue;
        const style = getComputedStyle(el);
        if (Number(style.opacity) > 0.45 && style.visibility !== "hidden") return sel;
      }
      return loveFaces[0];
    };

    const applyLoveSlot = (sel = visibleLoveSel()) => {
      const slot = loveSlot();
      const width = slotWidthFor(sel);
      if (!slot || !width) return;
      gsap.set(slot, { width, overwrite: true });
    };

    const syncLoveLayout = () => {
      fitLoveScripts();
      applyLoveSlot();
    };

    const fitLoveScripts = () => {
      const solving = stage.querySelector<HTMLElement>("[data-solving]");
      const faces = stage.querySelectorAll<HTMLElement>(".story-love-hi .story-love-face, .story-love-th .story-love-face");
      if (!solving || !faces.length) return;
      const s = measureInk(solving, "s");
      if (!s?.ascent) return;
      faces.forEach((face) => {
        face.style.setProperty("--love-script-y", "1");
        face.style.setProperty("--love-script-shift", "0px");
        const body = measureInk(face, scriptBody(face));
        if (!body?.ascent) return;
        const y = Math.min(3.6, Math.max(0.7, s.ascent / body.ascent));
        face.style.setProperty("--love-script-y", y.toFixed(3));
        face.style.setProperty("--love-script-origin", `${body.emAscent}px`);
        face.style.setProperty("--love-script-shift", `${(s.emAscent - body.emAscent).toFixed(2)}px`);
      });
    };

    const stopLove = () => {
      loveSwap?.kill();
      loveSwap = null;
      gsap.killTweensOf("[data-love],[data-love-en],[data-love-sign],[data-love-zh],[data-love-hi],[data-love-th]");
      gsap.set("[data-love-en]", { autoAlpha: 1, y: 0, scale: 1, rotateX: 0 });
      gsap.set("[data-love-sign],[data-love-zh],[data-love-hi],[data-love-th]", { autoAlpha: 0, y: 0, scale: 1, rotateX: 0 });
      gsap.set("[data-love]", { width: "auto" });
      stage.querySelectorAll<HTMLElement>(".story-love-hi .story-love-face, .story-love-th .story-love-face").forEach((face) => {
        face.style.removeProperty("--love-script-y");
        face.style.removeProperty("--love-script-shift");
        face.style.removeProperty("--love-script-origin");
      });
    };

    const stopIdle = () => {
      if (!idleOn && !breath && !loveSwap) return;
      idleOn = false;
      markReveal?.kill();
      markReveal = null;
      gsap.killTweensOf("[data-title-dot]");
      gsap.set("[data-title-dot]", {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        scale: 1,
        rotate: 0,
        autoAlpha: 1,
        transformOrigin: "50% 100%",
      });
      setMarksOn(false);
      stopBreath();
      stopLove();
      stopWorld();
    };

    const startIdle = () => {
      if (idleOn || !introDone || !atTop()) return;
      idleOn = true;

      const layer = world();
      if (layer) {
        gsap.fromTo(
          layer,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 1.8, delay: 0.25, ease: "power1.out", overwrite: true },
        );
      }

      const el = word();
      const light = glow();
      if (el) gsap.set(el, { transformOrigin: "50% 90%", y: 0, scale: 1 });
      if (light) gsap.set(light, { xPercent: -50, yPercent: -50, scale: 0.78, opacity: 0.32, transformOrigin: "50% 50%" });
      breath = gsap.timeline({
        repeat: -1,
        yoyo: true,
        defaults: { duration: 2.65, ease: "sine.inOut" },
      });
      if (el) breath.to(el, { y: -4, scale: 1.012 }, 0);
      if (light) breath.to(light, { scale: 1.28, opacity: 0.52 }, 0);

      gsap.set("[data-title-dot]", {
        x: 0,
        y: 0,
        scale: 1,
        scaleX: 1,
        scaleY: 1,
        autoAlpha: 1,
        rotate: 0,
        transformOrigin: "50% 100%",
      });
      markReveal = gsap.timeline({ delay: 1.05, defaults: { ease: "power2.out" } });
      markReveal
        .to("[data-title-dot]", { y: "-0.38em", duration: 0.18 })
        .to("[data-title-dot]", { y: 0, duration: 0.14, ease: "power2.in" })
        .to("[data-title-dot]", { scaleY: 0.72, scaleX: 1.2, duration: 0.07 })
        .to("[data-title-dot]", { scaleY: 1, scaleX: 1, duration: 0.1 })
        .to("[data-title-dot]", { y: "-0.48em", duration: 0.2 })
        .to("[data-title-dot]", { y: 0, duration: 0.15, ease: "power2.in" })
        .to("[data-title-dot]", { scaleY: 0.7, scaleX: 1.22, duration: 0.07 })
        .to("[data-title-dot]", { scaleY: 1, scaleX: 1, duration: 0.1 })
        .set("[data-title-dot]", { transformOrigin: "50% 50%" })
        .addLabel("launch")
        .to("[data-title-dot]", { y: "-1.05em", duration: 0.28, ease: "power2.out" }, "launch")
        .to("[data-title-dot]", { x: "2.4em", rotate: 10, duration: 0.7, ease: "sine.out" }, "launch")
        .to(
          "[data-title-dot]",
          {
            y: "0.55em",
            scale: 0.08,
            autoAlpha: 0,
            duration: 0.42,
            ease: "power2.in",
          },
          "launch+=0.28",
        )
        .add(() => setMarksOn(true), "launch+=0.5")
        .to({}, { duration: 3 })
        .set("[data-title-dot]", {
          x: 0,
          y: 0,
          rotate: 0,
          scale: 0.45,
          scaleX: 1,
          scaleY: 1,
          transformOrigin: "50% 100%",
        })
        .to("[data-title-dot]", {
          autoAlpha: 1,
          scale: 1,
          duration: 0.5,
          ease: "power2.out",
        });

      syncLoveLayout();
      const slot = loveSlot();
      const hold = 2.4;
      gsap.set("[data-love-en]", { autoAlpha: 1, y: 0, scale: 1, rotateX: 0 });
      gsap.set("[data-love-sign],[data-love-zh],[data-love-hi],[data-love-th]", { autoAlpha: 0, y: 0, scale: 1, rotateX: 0 });

      const swap = (from: string, to: string) => {
        const step = gsap.timeline();
        step
          .to(from, { autoAlpha: 0, duration: 0.55, ease: "power1.inOut" })
          .to(to, { autoAlpha: 1, duration: 0.55, ease: "power1.inOut" }, "<");
        if (slot) {
          step.to(slot, { width: slotWidthFor(to), duration: 0.55, ease: "power2.inOut" }, "<");
        }
        return step;
      };

      loveSwap = gsap.timeline({ delay: 2.2, repeat: -1 });
      loveSwap
        .add(swap(loveFaces[0], loveFaces[1]))
        .to({}, { duration: hold })
        .add(swap(loveFaces[1], loveFaces[2]))
        .to({}, { duration: hold })
        .add(swap(loveFaces[2], loveFaces[3]))
        .to({}, { duration: hold })
        .add(swap(loveFaces[3], loveFaces[4]))
        .to({}, { duration: hold })
        .add(swap(loveFaces[4], loveFaces[0]))
        .to({}, { duration: hold });
    };

    const onScroll = () => {
      if (window.scrollY > 8) stopIdle();
      else if (introDone) startIdle();
    };

    const ctx = gsap.context(() => {
      gsap.set("[data-hero-world]", { autoAlpha: 0 });
      gsap.set("[data-phrase-a]", { autoAlpha: 1 });
      gsap.set("[data-title-word]", { autoAlpha: 0, y: 36, rotateX: 18, filter: "blur(10px)" });
      gsap.set("[data-title-dot]", { autoAlpha: 0, y: 8 });
      gsap.set("[data-cue]", { autoAlpha: 0, y: 14 });
      gsap.set("[data-love-sign],[data-love-zh],[data-love-hi],[data-love-th]", { autoAlpha: 0, y: 0, scale: 1, rotateX: 0 });
      gsap.set("[data-love-en]", { autoAlpha: 1, y: 0, scale: 1, rotateX: 0 });

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

      intro.eventCallback("onComplete", () => {
        introDone = true;
        if (atTop()) startIdle();
        else stopIdle();
      });
    }, root);

    window.addEventListener("scroll", onScroll, { passive: true });

    let resizeRaf = 0;
    const onResize = () => {
      if (!introDone || !idleOn) return;
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resizeRaf = 0;
          if (idleOn) syncLoveLayout();
        });
      });
    };

    const compactMq = window.matchMedia("(max-width: 767px)");
    compactMq.addEventListener("change", onResize);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    const phrase = stage.querySelector("[data-phrase-a]");
    const phraseWatch = new ResizeObserver(onResize);
    if (phrase) phraseWatch.observe(phrase);

    void document.fonts.ready.then(() => {
      if (idleOn) syncLoveLayout();
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      compactMq.removeEventListener("change", onResize);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      phraseWatch.disconnect();
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      stopIdle();
      ctx.revert();
    };
  }, [reduce, replay]);

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
            <div className="hero-grid" />
            <div className="hero-stars" aria-hidden>
              {HERO_STARS.map(([left, top, size, delay, mag], i) => (
                <span
                  key={`${left}-${top}`}
                  className={`hero-star ${STAR_TINTS[i % 3]} ${i % 3 === 1 ? "is-flutter" : ""}`.trim()}
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    ["--star-mag" as string]: mag,
                    ["--star-period" as string]: `${7.2 + (i % 5) * 1.6}s`,
                    animationDelay: `${delay}s`,
                  }}
                />
              ))}
            </div>
            <div className="hero-world" data-hero-world>
              <div className="hero-globe-stage">
                <div className="hero-globe">
                  <HeroGlobe marksOn={marksOn} />
                  <div className="hero-globe-atmos" />
                  <div className="hero-globe-flare" aria-hidden>
                    <span className="hero-globe-flare-glow" />
                    <span className="hero-globe-flare-core" />
                    <span className="hero-globe-flare-streak" />
                  </div>
                </div>
              </div>
            </div>
            <div className="hero-glow-code" />
            <div className="hero-glow-word" />
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
                  <span data-title-word>I</span>{" "}
                  <span data-title-word data-love className="story-love" aria-label="love">
                    <span data-love-en className="story-love-word" aria-hidden>
                      love
                    </span>
                    <span data-love-sign className="story-love-sign" aria-hidden>
                      <InlineSvg src="/love-sign-vector.svg" className="nh-love-sign" title="Love in American Sign Language" />
                    </span>
                    <span data-love-zh lang="zh-Hans" className="story-love-zh" aria-hidden>
                      <span className="story-love-strut">love</span>
                      <span className="story-love-face">爱</span>
                    </span>
                    <span data-love-hi lang="hi" className="story-love-hi" aria-hidden>
                      <span className="story-love-strut">love</span>
                      <span className="story-love-face">बहुत शौक है</span>
                    </span>
                    <span data-love-th lang="th" className="story-love-th" aria-hidden>
                      <span className="story-love-strut">love</span>
                      <span className="story-love-face">ชอบมาก</span>
                    </span>
                  </span>{" "}
                  <span className="story-phrase-tail">
                    <span data-title-word data-solving>solving</span>{" "}
                    <span data-title-word data-emphasis>
                      problems
                    </span>
                    <span data-title-dot>.</span>
                  </span>
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
                          <StatusCheck />
                          compiled
                        </p>
                      </article>
                      <article data-pane data-pane-fail>
                        <p className="story-terminal-file">soul.ts</p>
                        <pre data-code-fail className="story-code" />
                        <p data-failed className="story-terminal-status text-accent">
                          <StatusStop />
                          failed
                        </p>
                        <pre data-error className="story-code story-terminal-error">
                          {`error TS2304: Cannot find name 'me'.
error TS2304: Cannot find name 'Peace'.`}
                        </pre>
                      </article>
                      <article data-pane data-pane-fix>
                        <p className="story-terminal-file">soul.ts</p>
                        <pre data-code-fix className="story-code" />
                        <p data-compiled-faith className="story-terminal-status text-scripture">
                          <StatusCheck />
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
