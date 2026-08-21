import type { Metadata } from "next";
import Link from "next/link";
import { LedgerRow } from "@/components/LedgerRow";
import { getWritings } from "@/lib/content";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Read",
  description: "Writing on Scripture, software, AI, and ordinary life — one stream.",
};

export default function WritingIndexPage() {
  const posts = getWritings();

  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <p className="font-ui text-xs tracking-[0.2em] text-ink/50 uppercase">Read</p>
      <h1 className="mt-4 font-display text-5xl">Writing</h1>
      <p className="mt-4 max-w-xl text-ink/70">
        Faith, technology, software, AI, and the rest of a life. Not a magazine brand. Notes from the work.
      </p>
      <p className="mt-6 font-ui text-sm text-ink/55">
        {["faith", "tech", "ai", "engineering", "life"].map((tag, index) => (
          <span key={tag}>
            {index > 0 ? " · " : null}
            <Link href={`/writing/tags/${tag}/`} className="hover:text-accent">
              {tag}
            </Link>
          </span>
        ))}
      </p>
      <div className="mt-12">
        {posts.map((post) => (
          <LedgerRow
            key={post.slug}
            href={`/writing/${post.slug}/`}
            kicker={`${formatDate(post.date)} · ${post.tags.join(" · ")}`}
            title={post.title}
            meta={post.excerpt}
          />
        ))}
      </div>
    </div>
  );
}
