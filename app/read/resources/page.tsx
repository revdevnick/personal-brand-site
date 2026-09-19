import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaginatedArchive } from "@/components/PaginatedArchive";
import { ReadEntryRow } from "@/components/ReadEntryRow";
import { ReadShell } from "@/components/ReadShell";
import { getResources } from "@/lib/content";
import { READ_FORMAT_FLAGS } from "@/lib/read-formats";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Resources · Read",
  description: "Helpful resources Nick recommends — his or others’.",
};

export default function ResourcesPage() {
  if (!READ_FORMAT_FLAGS.resources) notFound();

  const entries = getResources();

  return (
    <ReadShell
      active="resources"
      archiveId="resource-archive"
      archiveTitle="Helpful resources"
      countLabel={`${entries.length} ${entries.length === 1 ? "resource" : "resources"}`}
    >
      <div className="border-b border-ink/15">
        {entries.length === 0 ? (
          <p className="border-t border-ink/15 py-10 text-ink/60">No resources listed yet.</p>
        ) : (
          <PaginatedArchive basePath="/read/resources/">
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
                  asideLabel="Resource"
                  asideMeta={entry.source ?? "Recommended"}
                  actionLabel={entry.url ? "Open resource" : "Link forthcoming"}
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
