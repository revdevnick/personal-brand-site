import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListenShell } from "@/components/ListenShell";
import { PaginatedArchive } from "@/components/PaginatedArchive";
import { ReadEntryRow } from "@/components/ReadEntryRow";
import { getAppearances } from "@/lib/content";
import { LISTEN_FORMAT_FLAGS } from "@/lib/listen-formats";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Appearances · Listen",
  description: "Interviews and other media appearances.",
};

export default function AppearancesPage() {
  if (!LISTEN_FORMAT_FLAGS.appearances) notFound();

  const entries = getAppearances();

  return (
    <ListenShell
      active="appearances"
      archiveId="appearance-archive"
      archiveTitle="Appearances"
      countLabel={`${entries.length} ${entries.length === 1 ? "appearance" : "appearances"}`}
    >
      <div className="border-b border-ink/15">
        {entries.length === 0 ? (
          <p className="border-t border-ink/15 py-10 text-ink/60">No appearances listed yet.</p>
        ) : (
          <PaginatedArchive
            basePath="/listen/appearances/"
            searchTexts={entries.map((entry) =>
              [entry.title, entry.host, entry.venue, entry.excerpt].filter(Boolean).join(" "),
            )}
            searchLabel="Search appearances"
            searchPlaceholder="Search title, host, or venue"
            emptyMessage="No appearances match that search."
          >
            {entries.map((entry) => {
              const byline = [entry.host ? `With ${entry.host}` : site.name, entry.venue]
                .filter(Boolean)
                .join(" · ");
              const watchLabel =
                entry.source === "youtube"
                  ? "Watch on YouTube"
                  : entry.source === "vimeo"
                    ? "Watch on Vimeo"
                    : "Watch appearance";
              return (
                <ReadEntryRow
                  key={entry.slug}
                  date={entry.date}
                  title={entry.title}
                  titleHref={entry.url}
                  byline={byline}
                  excerpt={entry.excerpt}
                  image={entry.image}
                  imageAlt={entry.image ? `Still from ${entry.title}` : undefined}
                  asideLabel="Watch"
                  asideMeta={entry.venue ?? entry.host ?? "External"}
                  actionLabel={entry.url ? watchLabel : "Link forthcoming"}
                  actionHref={entry.url}
                  actionExternal={Boolean(entry.url)}
                />
              );
            })}
          </PaginatedArchive>
        )}
      </div>
    </ListenShell>
  );
}
