import type { Metadata } from "next";
import { PaginatedArchive } from "@/components/PaginatedArchive";
import { ReadEntryRow } from "@/components/ReadEntryRow";
import { ReadShell } from "@/components/ReadShell";
import { getWritings } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Read",
  description: "Writing on Scripture, software, AI, and ordinary life — one stream.",
};

export default function WritingIndexPage() {
  const posts = getWritings();

  return (
    <ReadShell
      active="articles"
      archiveId="article-archive"
      archiveTitle="Articles on this site"
      countLabel={`${posts.length} ${posts.length === 1 ? "article" : "articles"}`}
    >
      <div className="border-b border-ink/15">
        <PaginatedArchive basePath="/read/">
          {posts.map((post) => (
            <ReadEntryRow
              key={post.slug}
              date={post.date}
              title={post.title}
              titleHref={`/read/${post.slug}/`}
              byline={`By ${site.name}`}
              excerpt={post.excerpt}
              topics={post.tags.map((tag) => ({
                label: tag,
                href: `/read/tags/${tag}/`,
              }))}
              asideLabel="On this site"
              asideMeta="Full essay"
              actionLabel="Read article"
              actionHref={`/read/${post.slug}/`}
            />
          ))}
        </PaginatedArchive>
      </div>
    </ReadShell>
  );
}
