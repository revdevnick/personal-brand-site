import type { Metadata } from "next";
import { SolvePair } from "@/components/SolvePair";
import { getSolveEntries } from "@/lib/content";

export const metadata: Metadata = {
  title: "Solve",
  description:
    "Mostly apps and websites. Someone brings an idea or a problem — Nick tries to solve it in code.",
};

export default function SolvePage() {
  const entries = getSolveEntries();

  return (
    <main className="solve-page">
      <header className="solve-hero">
        <p className="solve-hero-kicker">Solve</p>
        <h1 className="solve-hero-title">
          <span className="solve-hero-line">Problem.</span>
          <span className="solve-hero-line solve-hero-line--accent">Solution.</span>
        </h1>
        <p className="solve-hero-lede">
          Mostly apps and websites. Someone brings an idea or a problem. I try to
          solve it in code.
        </p>
      </header>

      <section className="solve-pairs" aria-label="Problems and solutions">
        {entries.map((item, index) => (
          <SolvePair key={item.slug} item={item} index={index} />
        ))}
      </section>

      <p className="solve-foot">
        The long professional record lives on LinkedIn. This page is only the
        problems worth naming — and what got built.
      </p>
    </main>
  );
}
