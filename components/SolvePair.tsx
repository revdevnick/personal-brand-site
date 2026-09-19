"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatDate } from "@/lib/format";
import { getSolvePrimaryVisual } from "@/lib/solve";
import type { SolveEntry } from "@/lib/types";

type Props = {
  item: SolveEntry;
  index: number;
};

export function SolvePair({ item, index }: Props) {
  const ref = useRef<HTMLElement>(null);
  const flip = index % 2 === 1;
  const typeLabel = item.type.replace(/^\w/, (c) => c.toUpperCase());
  const n = String(index + 1).padStart(2, "0");
  const href = `/solve/${item.slug}/`;
  const visual = getSolvePrimaryVisual(item);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.22, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <article
      ref={ref}
      className={`solve-pair${flip ? " solve-pair--flip" : ""}`}
      data-solve-pair
    >
      <div className="solve-pair-problem">
        <p className="solve-pair-index" aria-hidden>
          {n}
        </p>
        <p className="solve-pair-problem-text">{item.problem}</p>
      </div>

      <div className="solve-pair-bridge" aria-hidden>
        <span className="solve-pair-arrow">→</span>
      </div>

      <div className="solve-pair-answer">
        <p className="solve-pair-meta">
          <span>{formatDate(item.date)}</span>
          <span aria-hidden className="solve-pair-meta-dot">
            ·
          </span>
          <span>{typeLabel}</span>
        </p>
        <h2 className="solve-pair-title">
          <Link href={href} className="solve-pair-title-link">
            {item.title}
          </Link>
        </h2>
        <p className="solve-pair-solution">{item.solution}</p>

        {visual ? (
          visual.mode === "icon" ? (
            <Link href={href} className="solve-pair-icon" tabIndex={-1}>
              <Image
                src={visual.src}
                alt=""
                width={512}
                height={512}
                className="solve-pair-icon-img"
                sizes="(max-width: 900px) 7rem, 7.25rem"
              />
            </Link>
          ) : (
            <Link href={href} className="solve-pair-frame" tabIndex={-1}>
              <div className="solve-pair-frame-chrome" aria-hidden>
                <span />
                <span />
                <span />
              </div>
              <Image
                src={visual.src}
                alt=""
                width={960}
                height={640}
                className="solve-pair-frame-img"
                sizes="(max-width: 900px) 100vw, 28rem"
              />
            </Link>
          )
        ) : null}

        {item.stack?.length ? (
          <ul className="solve-pair-stack">
            {item.stack.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        ) : null}

        {item.note ? <p className="solve-pair-note">{item.note}</p> : null}

        <Link href={href} className="solve-pair-link">
          Read more <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}
