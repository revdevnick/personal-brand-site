import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const matter = require("gray-matter");

const root = path.join(process.cwd(), "content");
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nickperkins.dev";

function xmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function readCollection(dir, kind) {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.mdx?$/, "");
      const parsed = matter(fs.readFileSync(path.join(full, file), "utf8"));
      return {
        title: parsed.data.title,
        date: String(parsed.data.date),
        url: `${siteUrl}/${kind}/${slug}/`,
        description:
          parsed.data.excerpt ?? parsed.data.scripture ?? parsed.data.venue ?? "",
      };
    });
}

const items = [...readCollection("sermons", "sermons"), ...readCollection("writing", "writing")].sort(
  (a, b) => b.date.localeCompare(a.date),
);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Nick Perkins — Pastor, Writer, Builder</title>
    <link>${xmlEscape(siteUrl)}</link>
    <description>A doorway to the Word, to Jesus, and to technical work in His service.</description>
${items
  .map(
    (item) => `    <item>
      <title>${xmlEscape(item.title)}</title>
      <link>${xmlEscape(item.url)}</link>
      <guid>${xmlEscape(item.url)}</guid>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <description>${xmlEscape(item.description)}</description>
    </item>`,
  )
  .join("\n")}
  </channel>
</rss>
`;

const publicDir = path.join(process.cwd(), "public");
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, "rss.xml"), xml);
console.log(`Wrote public/rss.xml (${items.length} items)`);
