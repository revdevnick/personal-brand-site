import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { Mdx } from "@/components/Mdx";
import { getWriting, getWritings } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return getWritings().map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/writing/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getWriting(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function WritingPage({ params }: PageProps<"/writing/[slug]">) {
  const { slug } = await params;
  const post = getWriting(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          datePublished: post.date,
          url: `${site.url}/writing/${post.slug}/`,
          author: { "@type": "Person", name: site.name },
          description: post.excerpt,
        }}
      />
      <p className="font-ui text-xs tracking-[0.2em] text-ink/50 uppercase">
        {formatDate(post.date)}
        {post.tags.map((tag) => (
          <span key={tag}>
            {" · "}
            <Link href={`/writing/tags/${tag}/`} className="hover:text-accent">
              {tag}
            </Link>
          </span>
        ))}
      </p>
      <h1 className="mt-4 font-display text-5xl leading-tight sm:text-6xl">{post.title}</h1>
      <div className="study-measure drop-cap mt-12">
        <Mdx source={post.body} />
      </div>
    </article>
  );
}
