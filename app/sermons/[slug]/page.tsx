import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
}: PageProps<"/sermons/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const sermon = getSermon(slug);
  if (!sermon) return {};
  return {
    title: sermon.title,
    description: sermon.excerpt ?? sermon.scripture ?? sermon.venue,
  };
}

export default async function SermonPage({ params }: PageProps<"/sermons/[slug]">) {
  const { slug } = await params;
  const sermon = getSermon(slug);
  if (!sermon) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: sermon.title,
    datePublished: sermon.date,
    url: `${site.url}/sermons/${sermon.slug}/`,
    author: { "@type": "Person", name: site.name },
    locationCreated: sermon.venue,
  };

  const videos = sermon.recordings
    .filter((recording) => recording.source === "youtube" || recording.source === "vimeo")
    .map((recording) => ({
      "@type": "VideoObject",
      name: `${sermon.title} — ${recording.label}`,
      url: recording.url,
    }));

  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <JsonLd data={jsonLd} />
      {videos.length > 0 ? <JsonLd data={videos} /> : null}
      {sermon.scripture ? (
        <p className="font-ui text-xs tracking-[0.2em] text-scripture uppercase">{sermon.scripture}</p>
      ) : null}
      <h1 className="mt-4 font-display text-5xl leading-tight sm:text-6xl">{sermon.title}</h1>
      <p className="mt-6 font-ui text-sm text-ink/60">
        {formatDate(sermon.date)} · {sermon.venue}
        {sermon.location ? ` · ${sermon.location}` : ""}
      </p>
      {sermon.series ? <p className="mt-2 font-ui text-sm text-ink/45">{sermon.series}</p> : null}
      <RecordingPlayer recordings={sermon.recordings} />
      <div className="study-measure drop-cap mt-12">
        <Mdx source={sermon.body} />
      </div>
    </article>
  );
}
