import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { Mdx } from "@/components/Mdx";
import { RecordingPlayer } from "@/components/RecordingPlayer";
import { getSermon, getSermons } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return getSermons().map((sermon) => ({ slug: sermon.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/listen/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const sermon = getSermon(slug);
  if (!sermon) return {};
  return {
    title: sermon.title,
    description: sermon.excerpt ?? sermon.passage ?? sermon.venue,
  };
}

export default async function SermonPage({ params }: PageProps<"/listen/[slug]">) {
  const { slug } = await params;
  const sermon = getSermon(slug);
  if (!sermon) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: sermon.title,
    datePublished: sermon.date,
    url: `${site.url}/listen/${sermon.slug}/`,
    author: { "@type": "Person", name: site.name },
    locationCreated: sermon.venue,
  };

  const videos = sermon.recordings
    .filter(
      (recording) =>
        Boolean(recording.url) &&
        (recording.source === "youtube" || recording.source === "vimeo"),
    )
    .map((recording) => ({
      "@type": "VideoObject",
      name: `${sermon.title} — ${recording.label}`,
      url: recording.url,
    }));

  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <JsonLd data={jsonLd} />
      {videos.length > 0 ? <JsonLd data={videos} /> : null}
      <Breadcrumb
        items={[
          { label: "Listen", href: "/listen/" },
          { label: "Sermons", href: "/listen/" },
          { label: sermon.title },
        ]}
      />
      {sermon.passage ? (
        <p className="font-ui text-xs tracking-[0.2em] text-scripture uppercase">{sermon.passage}</p>
      ) : null}
      <h1 className="mt-4 font-display text-5xl leading-tight sm:text-6xl">{sermon.title}</h1>
      <p className="mt-6 font-ui text-sm text-ink/60">
        By {site.name} · {formatDate(sermon.date)}
      </p>
      {sermon.topics?.length ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 font-ui text-xs text-ink/52">
          <span className="tracking-[0.14em] text-ink/38 uppercase">Topics</span>
          {sermon.topics.map((topic) => (
            <span key={topic} className="border-l border-scripture/60 pl-2">
              {topic}
            </span>
          ))}
        </div>
      ) : null}
      {sermon.recordings.length > 0 ? (
        <RecordingPlayer recordings={sermon.recordings} title={sermon.title} />
      ) : (
        <p className="mt-10 border-y border-ink/15 py-6 font-ui text-sm leading-relaxed text-ink/62">
          No recording available — read the manuscript.
        </p>
      )}
      <div className="study-measure drop-cap mt-12">
        <Mdx source={sermon.body} />
      </div>
    </article>
  );
}
