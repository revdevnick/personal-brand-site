import type { Metadata } from "next";
import Link from "next/link";
import { Mdx } from "@/components/Mdx";
import { getWork } from "@/lib/content";

export const metadata: Metadata = {
  title: "Work",
  description: "A few problems I was given — ScoreboardTV, Story Rocket, and selected software.",
};

export default function WorkPage() {
  const cases = getWork();

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="font-ui text-xs tracking-[0.2em] text-ink/50 uppercase">Work</p>
      <h1 className="mt-4 font-display text-5xl">Problems I was given</h1>
      <p className="mt-4 max-w-xl text-ink/70">
        Not a resume wall. A few pieces of craft, named as problems. The rest of the record is on LinkedIn.
      </p>
      <div className="mt-16 space-y-20">
        {cases.map((item) => (
          <article key={item.slug} className="border-t border-ink/15 pt-10">
            {item.parent ? (
              <p className="font-ui text-xs tracking-[0.2em] text-ink/45 uppercase">{item.parent}</p>
            ) : null}
            <h2 className="mt-2 font-display text-4xl">{item.title}</h2>
            <p className="mt-4 text-lg">{item.problem}</p>
            <p className="mt-2 font-ui text-sm text-ink/55">{item.craft}</p>
            <div className="study-measure mt-6 text-ink/80">
              <Mdx source={item.body} />
            </div>
            {item.url ? (
              <p className="mt-6 font-ui text-sm">
                <Link className="underline decoration-accent/40 underline-offset-4" href={item.url}>
                  {item.url.replace(/^https?:\/\//, "")}
                </Link>
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
