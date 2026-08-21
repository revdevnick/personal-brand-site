import type { Metadata } from "next";
import Link from "next/link";
import { LedgerRow } from "@/components/LedgerRow";
import { getWritings } from "@/lib/content";
import { formatDate } from "@/lib/format";
import type { WritingTag } from "@/lib/types";

const tags: WritingTag[] = ["faith", "tech", "ai", "engineering", "life"];

export function generateStaticParams() {
  return tags.map((tag) => ({ tag }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/writing/tags/[tag]">): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `Writing · ${tag}`,
    description: `Notes tagged ${tag}.`,
  };
}

export default async function WritingTagPage({ params }: PageProps<"/writing/tags/[tag]">) {
  const { tag } = await params;
  const posts = getWritings().filter((post) => post.tags.includes(tag as WritingTag));

  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <p className="font-ui text-xs tracking-[0.2em] text-ink/50 uppercase">Read · {tag}</p>
      <h1 className="mt-4 font-display text-5xl">{tag}</h1>
      <p className="mt-4 font-ui text-sm">
        <Link href="/writing/" className="hover:text-accent">
          All writing
        </Link>
      </p>
      <div className="mt-12">
        {posts.length === 0 ? (
          <p className="text-ink/60">Nothing tagged {tag} yet.</p>
        ) : (
          posts.map((post) => (
            <LedgerRow
              key={post.slug}
              href={`/writing/${post.slug}/`}
              kicker={`${formatDate(post.date)} · ${post.tags.join(" · ")}`}
              title={post.title}
              meta={post.excerpt}
            />
          ))
        )}
      </div>
    </div>
  );
}
