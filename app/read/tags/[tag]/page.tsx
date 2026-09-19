import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ReadEntryRow } from "@/components/ReadEntryRow";
import { getWritings } from "@/lib/content";
import { site } from "@/lib/site";
import type { WritingTag } from "@/lib/types";

const tags: WritingTag[] = ["faith", "tech", "ai", "engineering", "life"];

export function generateStaticParams() {
  return tags.map((tag) => ({ tag }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/read/tags/[tag]">): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `Writing · ${tag}`,
    description: `Notes tagged ${tag}.`,
  };
}

export default async function WritingTagPage({ params }: PageProps<"/read/tags/[tag]">) {
  const { tag } = await params;
  const posts = getWritings().filter((post) => post.tags.includes(tag as WritingTag));

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <header className="border-b border-ink/15 pb-10">
        <Breadcrumb
          items={[
            { label: "Read", href: "/read/" },
            { label: "Articles", href: "/read/" },
            { label: tag },
          ]}
        />
        <h1 className="font-display text-5xl leading-[0.98] sm:text-7xl">{tag}</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/68">
          Articles on this site tagged {tag}.
        </p>
      </header>

      <section className="pt-12" aria-labelledby="tag-archive">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 id="tag-archive" className="font-display text-3xl">
            Tagged {tag}
          </h2>
          <p className="font-ui text-xs tracking-[0.15em] text-ink/45 uppercase">
            {posts.length} {posts.length === 1 ? "article" : "articles"}
          </p>
        </div>

        <div className="border-b border-ink/15">
          {posts.length === 0 ? (
            <p className="border-t border-ink/15 py-10 text-ink/60">Nothing tagged {tag} yet.</p>
          ) : (
            posts.map((post) => (
              <ReadEntryRow
                key={post.slug}
                date={post.date}
                title={post.title}
                titleHref={`/read/${post.slug}/`}
                byline={`By ${site.name}`}
                excerpt={post.excerpt}
                topics={post.tags.map((item) => ({
                  label: item,
                  href: `/read/tags/${item}/`,
                }))}
                asideLabel="On this site"
                asideMeta="Full essay"
                actionLabel="Read article"
                actionHref={`/read/${post.slug}/`}
              />
            ))
          )}
        </div>
      </section>
    </main>
  );
}
