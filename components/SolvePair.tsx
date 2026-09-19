"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { formatDate } from "@/lib/format";
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
        <h2 className="solve-pair-title">{item.title}</h2>
        <p className="solve-pair-solution">{item.solution}</p>

        {item.image ? (
          <div className="solve-pair-frame">
            <div className="solve-pair-frame-chrome" aria-hidden>
              <span />
              <span />
              <span />
            </div>
            <Image
              src={item.image}
              alt=""
              width={960}
              height={640}
              className="solve-pair-frame-img"
              sizes="(max-width: 900px) 100vw, 28rem"
            />
          </div>
        ) : null}

        {item.stack?.length ? (
          <ul className="solve-pair-stack">
            {item.stack.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        ) : null}

        {item.note ? <p className="solve-pair-note">{item.note}</p> : null}

        {item.url ? (
          <a
            href={item.url}
            target={item.url.startsWith("http") ? "_blank" : undefined}
            rel={item.url.startsWith("http") ? "noopener noreferrer" : undefined}
            className="solve-pair-link"
          >
            Open <span aria-hidden>→</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}
