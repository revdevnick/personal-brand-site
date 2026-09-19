import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaginatedArchive } from "@/components/PaginatedArchive";
import { ReadEntryRow } from "@/components/ReadEntryRow";
import { ReadShell } from "@/components/ReadShell";
import { getPublications } from "@/lib/content";
import { READ_FORMAT_FLAGS } from "@/lib/read-formats";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Publications · Read",
  description: "Writing published elsewhere — guest posts, magazines, church materials, and other off-site articles.",
};

export default function PublicationsPage() {
  if (!READ_FORMAT_FLAGS.publications) notFound();

  const entries = getPublications();

  return (
    <ReadShell
      active="publications"
      archiveId="publication-archive"
      archiveTitle="Writing elsewhere"
      countLabel={`${entries.length} ${entries.length === 1 ? "piece" : "pieces"}`}
    >
      <div className="border-b border-ink/15">
        {entries.length === 0 ? (
          <p className="border-t border-ink/15 py-10 text-ink/60">
            No off-site articles listed yet.
          </p>
        ) : (
          <PaginatedArchive basePath="/read/publications/">
            {entries.map((entry) => {
              const byline = [entry.author ?? site.name, entry.source].filter(Boolean).join(" · ");
              return (
                <ReadEntryRow
                  key={entry.slug}
                  date={entry.date}
                  title={entry.title}
                  titleHref={entry.url}
                  byline={byline}
                  excerpt={entry.excerpt}
                  topics={entry.topics?.map((topic) => ({ label: topic }))}
                  asideLabel="Publication"
                  asideMeta={entry.source ?? "Off this site"}
                  actionLabel={entry.url ? "Read off-site" : "Link forthcoming"}
                  actionHref={entry.url}
                  actionExternal={Boolean(entry.url)}
                />
              );
            })}
          </PaginatedArchive>
        )}
      </div>
    </ReadShell>
  );
}
