import { site } from "./site";
import type { Sermon, Writing } from "./types";

function xmlEscape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function buildRssXml(sermons: Sermon[], writings: Writing[]) {
  const items = [
    ...sermons.map((sermon) => ({
      title: sermon.title,
      date: sermon.date,
      url: `${site.url}/sermons/${sermon.slug}/`,
      description: sermon.excerpt ?? sermon.scripture ?? sermon.venue,
    })),
    ...writings.map((post) => ({
      title: post.title,
      date: post.date,
      url: `${site.url}/writing/${post.slug}/`,
      description: post.excerpt,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const itemXml = items
    .map(
      (item) => `    <item>
      <title>${xmlEscape(item.title)}</title>
      <link>${xmlEscape(item.url)}</link>
      <guid>${xmlEscape(item.url)}</guid>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <description>${xmlEscape(item.description)}</description>
    </item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${xmlEscape(site.title)}</title>
    <link>${xmlEscape(site.url)}</link>
    <description>${xmlEscape(site.description)}</description>
${itemXml}
  </channel>
</rss>
`;
}
