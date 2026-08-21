import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/Hero";
import { latestSermon, latestWriting } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
};

export default function HomePage() {
  const sermon = latestSermon();
  const writing = latestWriting();

  return (
    <>
      <Hero />
      <section id="latest" className="border-t border-white/10 bg-field px-6 py-28 text-study">
        <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-2">
          {sermon ? (
            <article className="group">
              <p className="font-ui text-xs tracking-[0.2em] text-accent uppercase">Listen</p>
              <h2 className="mt-4 font-display text-4xl transition-colors group-hover:text-accent sm:text-5xl">
                <Link href={`/sermons/${sermon.slug}/`}>{sermon.title}</Link>
              </h2>
              <p className="mt-3 font-ui text-sm text-study/60">
                {sermon.scripture ? `${sermon.scripture} · ` : ""}
                {sermon.venue}
              </p>
            </article>
          ) : null}
          {writing ? (
            <article className="group">
              <p className="font-ui text-xs tracking-[0.2em] text-accent uppercase">Read</p>
              <h2 className="mt-4 font-display text-4xl transition-colors group-hover:text-accent sm:text-5xl">
                <Link href={`/writing/${writing.slug}/`}>{writing.title}</Link>
              </h2>
              <p className="mt-3 max-w-md text-study/70">{writing.excerpt}</p>
            </article>
          ) : null}
        </div>
        <p className="mx-auto mt-20 max-w-6xl font-ui text-sm text-study/45">
          <Link className="hover:text-accent" href={site.church.url}>
            {site.church.name}
          </Link>
          {" · "}
          <Link className="hover:text-accent" href={site.storyRocket.url}>
            {site.storyRocket.name}
          </Link>
        </p>
      </section>
    </>
  );
}
