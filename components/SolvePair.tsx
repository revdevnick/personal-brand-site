"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatDate } from "@/lib/format";
import { getSolvePrimaryVisual } from "@/lib/solve";
import type { SolveEntry, SolveQuote } from "@/lib/types";

type Props = {
  item: SolveEntry;
  index: number;
  /**
   * Compact quotes for listing cards with no more-details path.
   * Never shown alongside Read more or outbound links.
   */
  listQuotes?: SolveQuote[];
};

function compactQuoteText(text: string, max = 160): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  const slice = trimmed.slice(0, max);
  const breakAt = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf(" "));
  const cut = breakAt > 48 ? slice.slice(0, breakAt + (slice[breakAt] === "." ? 1 : 0)) : slice;
  return `${cut.trimEnd().replace(/[,:;–—-]+$/, "")}…`;
}

/** App Store / GitHub / live URL — outbound more-details. */
function hasOutboundMoreDetails(item: SolveEntry): boolean {
  return Boolean(item.links?.length || item.url);
}

/**
 * Prefer Read more (no list quote) when the card has a more-details path:
 * outbound links, gallery/video, or the detail copy already carries the reference.
 */
function hasMoreDetailsPath(item: SolveEntry, quotes: SolveQuote[]): boolean {
  if (hasOutboundMoreDetails(item)) return true;
  if (item.images?.length || item.video) return true;
  const haystack = `${item.body ?? ""}\n${item.note ?? ""}`;
  return quotes.some((quote) => haystack.includes(quote.name));
}

export function SolvePair({ item, index, listQuotes = [] }: Props) {
  const ref = useRef<HTMLElement>(null);
  const flip = index % 2 === 1;
  const typeLabel = item.type.replace(/^\w/, (c) => c.toUpperCase());
  const n = String(index + 1).padStart(2, "0");
  const href = `/solve/${item.slug}/`;
  const visual = getSolvePrimaryVisual(item);
  // Strict: list quote only when there is no Read more / more-details path.
  const showListQuotes =
    listQuotes.length > 0 && !hasMoreDetailsPath(item, listQuotes);
  const showReadMore = !showListQuotes;

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

        {showListQuotes ? (
          <ul className="solve-pair-quotes" aria-label="Reference">
            {listQuotes.map((quote) => (
              <li key={quote.id} className="solve-pair-quote">
                <blockquote className="solve-pair-quote-text">
                  <p>{compactQuoteText(quote.quote)}</p>
                </blockquote>
                <footer className="solve-pair-quote-byline">
                  {quote.photo ? (
                    <Image
                      src={quote.photo}
                      alt=""
                      width={40}
                      height={40}
                      className="solve-pair-quote-photo"
                    />
                  ) : null}
                  <cite className="solve-pair-quote-name">{quote.name}</cite>
                </footer>
              </li>
            ))}
          </ul>
        ) : null}

        {showReadMore ? (
          <Link href={href} className="solve-pair-link">
            <span className="solve-pair-link-label">Read more</span>
            <span className="solve-pair-link-arrow" aria-hidden>
              →
            </span>
          </Link>
        ) : null}
      </div>
    </article>
  );
}
