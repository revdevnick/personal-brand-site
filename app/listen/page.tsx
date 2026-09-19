import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ListenShell } from "@/components/ListenShell";
import { PaginatedArchive } from "@/components/PaginatedArchive";
import { getSermons } from "@/lib/content";
import { formatDate, splitPassage } from "@/lib/format";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Listen",
  description: "Preach the word — in season and out of season. Sermons · 2 Timothy 4:2.",
};

export default function SermonsPage() {
  const sermons = getSermons();

  return (
    <ListenShell
      active="sermons"
      archiveId="sermon-archive"
      archiveTitle="Latest sermons"
      countLabel={`${sermons.length} ${sermons.length === 1 ? "message" : "messages"}`}
    >
      <div className="border-b border-ink/15">
        <PaginatedArchive
          basePath="/listen/"
          searchTexts={sermons.map((sermon) =>
            [sermon.title, sermon.passage, ...(sermon.topics ?? [])].filter(Boolean).join(" "),
          )}
          searchLabel="Search sermons"
          searchPlaceholder="Search title, passage, or topics"
          emptyMessage="No sermons match that search."
        >
          {sermons.map((sermon) => {
            const still =
              sermon.recordings.find((recording) => recording.image)?.image ??
              sermon.recordings[0]?.image;
            const href = `/listen/${sermon.slug}/`;
            const scripture = sermon.passage ? splitPassage(sermon.passage) : null;

            return (
              <article
                key={sermon.slug}
                className="group grid gap-5 border-t border-ink/15 py-8 md:grid-cols-[10rem_minmax(0,1fr)_11rem] md:gap-8"
              >
                {still ? (
                  <Link
                    href={href}
                    className="order-1 mx-auto block w-full max-w-md overflow-hidden ring-1 ring-ink/10 transition-[box-shadow] group-hover:ring-accent/35 md:hidden"
                    aria-label={`Watch ${sermon.title}`}
                  >
                    <Image
                      src={still}
                      alt=""
                      width={640}
                      height={360}
                      className="aspect-video w-full object-cover"
                      sizes="(max-width: 767px) 100vw, 9.5rem"
                    />
                  </Link>
                ) : null}

                <div className="order-3 md:order-none">
                  <p className="hidden font-ui text-xs tracking-[0.08em] text-ink/48 uppercase md:block">
                    {formatDate(sermon.date)}
                  </p>
                  {scripture ? (
                    <div className="mt-4 flex flex-col gap-2 md:mt-5">
                      <p className="font-display text-[clamp(2.1rem,1.5rem+2.2vw,3.15rem)] leading-[0.88] tracking-[0.01em] text-scripture uppercase [overflow-wrap:anywhere]">
                        {scripture.book}
                      </p>
                      {scripture.reference ? (
                        <p className="font-ui text-base leading-snug tracking-[0.08em] text-scripture sm:text-lg">
                          {scripture.reference}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="order-2 md:order-none">
                  <p className="mb-2 font-ui text-xs tracking-[0.08em] text-ink/48 uppercase md:hidden">
                    {formatDate(sermon.date)}
                  </p>
                  <h3 className="font-display text-3xl leading-tight sm:text-4xl">
                    <Link href={href} className="transition-colors group-hover:text-accent">
                      {sermon.title}
                    </Link>
                  </h3>
                  <p className="mt-2 font-ui text-sm text-ink/55">By {site.name}</p>
                  {sermon.excerpt ? (
                    <p className="mt-3 max-w-xl leading-relaxed text-ink/62">{sermon.excerpt}</p>
                  ) : null}
                  {sermon.topics?.length ? (
                    <div className="mt-4 flex flex-wrap items-center gap-2 font-ui text-xs text-ink/52">
                      <span className="tracking-[0.14em] text-ink/38 uppercase">Topics</span>
                      {sermon.topics.map((topic) => (
                        <span key={topic} className="border-l border-scripture/60 pl-2">
                          {topic}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="order-4 self-start md:order-none md:self-center md:border-l md:border-ink/12 md:pl-4">
                  {still ? (
                    <Link
                      href={href}
                      className="mb-3 hidden max-w-[9.5rem] overflow-hidden ring-1 ring-ink/10 transition-[box-shadow] group-hover:ring-accent/35 md:block"
                      aria-label={`Watch ${sermon.title}`}
                    >
                      <Image
                        src={still}
                        alt=""
                        width={320}
                        height={180}
                        className="aspect-video w-full object-cover"
                        sizes="9.5rem"
                      />
                    </Link>
                  ) : sermon.recordings.length === 0 ? (
                    <p className="mb-3 font-ui text-sm text-ink/42">No recording</p>
                  ) : null}
                  <Link
                    href={href}
                    className="inline-flex items-center gap-2 font-ui text-xs font-medium tracking-[0.12em] text-accent uppercase"
                  >
                    {sermon.recordings.length === 0 ? "Read" : "Watch"}{" "}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </PaginatedArchive>
      </div>
    </ListenShell>
  );
}
