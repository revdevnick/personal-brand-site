import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { getSolveEntries, getSolveEntry } from "@/lib/content";
import { formatDate } from "@/lib/format";

export function generateStaticParams() {
  return getSolveEntries().map((entry) => ({ slug: entry.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/solve/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const entry = getSolveEntry(slug);
  if (!entry) return {};
  return {
    title: entry.title,
    description: entry.solution,
  };
}

function isExternal(href: string) {
  return href.startsWith("http");
}

export default async function SolveDetailPage({
  params,
}: PageProps<"/solve/[slug]">) {
  const { slug } = await params;
  const entry = getSolveEntry(slug);
  if (!entry) notFound();

  const typeLabel = entry.type.replace(/^\w/, (c) => c.toUpperCase());
  const gallery = (() => {
    const shots = [...(entry.images ?? [])];
    if (entry.image && !shots.includes(entry.image)) {
      shots.unshift(entry.image);
    }
    return shots;
  })();

  const paragraphs = entry.body
    ? entry.body
        .split(/\n\s*\n/)
        .map((block) => block.replace(/\s+/g, " ").trim())
        .filter(Boolean)
    : [];

  return (
    <main className="solve-detail">
      <Breadcrumb
        items={[
          { label: "Solve", href: "/solve/" },
          { label: entry.title },
        ]}
      />

      <header className="solve-detail-hero">
        <p className="solve-detail-meta">
          <span>{formatDate(entry.date)}</span>
          <span aria-hidden className="solve-pair-meta-dot">
            ·
          </span>
          <span>{typeLabel}</span>
        </p>
        <h1 className="solve-detail-title">{entry.title}</h1>
      </header>

      <section className="solve-detail-pair" aria-label="Problem and solution">
        <div className="solve-detail-problem">
          <p className="solve-detail-label">Problem</p>
          <p className="solve-detail-problem-text">{entry.problem}</p>
        </div>
        <div className="solve-detail-solution">
          <p className="solve-detail-label">Solution</p>
          <p className="solve-detail-solution-text">{entry.solution}</p>
        </div>
      </section>

      {gallery.length > 0 || entry.video ? (
        <section className="solve-detail-media" aria-label="Screenshots">
          {entry.video ? (
            <div className="solve-detail-video-wrap">
              <video
                className="solve-detail-video"
                controls
                playsInline
                preload="metadata"
                poster={entry.image}
              >
                <source src={entry.video} type="video/mp4" />
              </video>
            </div>
          ) : null}
          {gallery.map((src) => (
            <figure key={src} className="solve-detail-shot">
              {/* GIFs and archival stills — unoptimized export already */}
              <Image
                src={src}
                alt=""
                width={1200}
                height={800}
                className="solve-detail-shot-img"
                sizes="(max-width: 900px) 100vw, 48rem"
                unoptimized={src.endsWith(".gif")}
              />
            </figure>
          ))}
        </section>
      ) : null}

      {paragraphs.length > 0 ? (
        <section className="solve-detail-body">
          {paragraphs.map((text) => (
            <p key={text.slice(0, 48)}>{text}</p>
          ))}
        </section>
      ) : null}

      {entry.stack?.length ? (
        <ul className="solve-detail-stack">
          {entry.stack.map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ul>
      ) : null}

      {entry.note ? <p className="solve-detail-note">{entry.note}</p> : null}

      {(entry.links?.length || entry.url) && (
        <ul className="solve-detail-links">
          {entry.links?.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                target={isExternal(link.url) ? "_blank" : undefined}
                rel={isExternal(link.url) ? "noopener noreferrer" : undefined}
                className="solve-pair-link"
              >
                {link.label} <span aria-hidden>→</span>
              </a>
            </li>
          ))}
          {!entry.links?.length && entry.url ? (
            <li>
              <a
                href={entry.url}
                target={isExternal(entry.url) ? "_blank" : undefined}
                rel={isExternal(entry.url) ? "noopener noreferrer" : undefined}
                className="solve-pair-link"
              >
                Open <span aria-hidden>→</span>
              </a>
            </li>
          ) : null}
        </ul>
      )}

      <p className="solve-detail-back">
        <Link href="/solve/" className="solve-pair-link">
          ← All problems
        </Link>
      </p>
    </main>
  );
}
