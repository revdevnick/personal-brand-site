import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { load as loadYaml } from "js-yaml";
import { sermonYoutubeStillPath } from "./media";
import type {
  Appearance,
  Experience,
  ReadLinkEntry,
  Recording,
  RecordingSource,
  Sermon,
  SolveEntry,
  SolveQuote,
  Writing,
  WritingTag,
} from "./types";

function mapRecording(entry: Record<string, unknown>, sermonSlug: string): Recording {
  const url = entry.url ? String(entry.url) : undefined;
  const source = (entry.source ? String(entry.source) : "other") as RecordingSource;
  const imageRaw = entry.image ?? entry.thumbnail;
  let image = imageRaw ? String(imageRaw) : undefined;
  if (!image && url && source === "youtube") {
    const convention = sermonYoutubeStillPath(sermonSlug, url);
    if (convention) {
      const disk = path.join(process.cwd(), "public", convention.replace(/^\//, ""));
      if (fs.existsSync(disk)) image = convention;
    }
  }
  return {
    label: String(entry.label ?? "Recording"),
    url,
    source,
    duration: entry.duration ? String(entry.duration) : undefined,
    image,
  };
}

const root = path.join(process.cwd(), "content");

/** Normalize gray-matter / js-yaml Date objects to YYYY-MM-DD for stable sort + display. */
function asDateString(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^\d{4}(-\d{2}){0,2}$/.test(trimmed)) return trimmed;
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
    return trimmed;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value).toISOString().slice(0, 10);
  }
  return String(value ?? "");
}

function readDir(dir: string) {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.mdx?$/, "");
      const raw = fs.readFileSync(path.join(full, file), "utf8");
      const parsed = matter(raw);
      return { slug, data: parsed.data, body: parsed.content.trim() };
    });
}

function byDateDesc<T extends { date: string }>(items: T[]) {
  return [...items].sort((a, b) => b.date.localeCompare(a.date));
}

function readLinkCollection(file: string): ReadLinkEntry[] {
  const full = path.join(root, "reading", file);
  if (!fs.existsSync(full)) return [];
  const raw = fs.readFileSync(full, "utf8");
  const parsed = loadYaml(raw) as { entries?: Record<string, unknown>[] };
  const items = (parsed.entries ?? []).map((entry) => ({
    slug: String(entry.slug),
    title: String(entry.title),
    date: asDateString(entry.date),
    excerpt: entry.excerpt ? String(entry.excerpt) : undefined,
    author: entry.author ? String(entry.author) : undefined,
    source: entry.source ? String(entry.source) : undefined,
    url: entry.url ? String(entry.url) : undefined,
    topics: Array.isArray(entry.topics) ? entry.topics.map(String) : undefined,
    body: entry.body ? String(entry.body) : undefined,
  }));
  return byDateDesc(items);
}

export function getSermons(): Sermon[] {
  const items = readDir("sermons").map(({ slug, data, body }) => ({
    slug,
    title: String(data.title),
    date: asDateString(data.date),
    venue: String(data.venue),
    location: data.location ? String(data.location) : undefined,
    series: data.series ? String(data.series) : undefined,
    // `scripture` remains a read fallback for older entries; `passage` is canonical.
    passage: data.passage
      ? String(data.passage)
      : data.scripture
        ? String(data.scripture)
        : undefined,
    topics: Array.isArray(data.topics) ? data.topics.map(String) : undefined,
    bibleBook: data.bibleBook ? String(data.bibleBook) : undefined,
    excerpt: data.excerpt ? String(data.excerpt) : undefined,
    recordings: (Array.isArray(data.recordings) ? data.recordings : []).map((entry) =>
      mapRecording((entry ?? {}) as Record<string, unknown>, slug),
    ),
    body,
  }));
  return byDateDesc(items);
}

export function getSermon(slug: string) {
  return getSermons().find((item) => item.slug === slug);
}

export function getWritings(): Writing[] {
  const items = readDir("writing").map(({ slug, data, body }) => ({
    slug,
    title: String(data.title),
    date: asDateString(data.date),
    tags: (Array.isArray(data.tags) ? data.tags : []) as WritingTag[],
    excerpt: String(data.excerpt ?? ""),
    body,
  }));
  return byDateDesc(items);
}

export function getWriting(slug: string) {
  return getWritings().find((item) => item.slug === slug);
}

export function getResources(): ReadLinkEntry[] {
  return readLinkCollection("resources.yml");
}

export function getPublications(): ReadLinkEntry[] {
  return readLinkCollection("publications.yml");
}

export function getAppearances(): Appearance[] {
  const full = path.join(root, "listening", "appearances.yml");
  if (!fs.existsSync(full)) return [];
  const raw = fs.readFileSync(full, "utf8");
  const parsed = loadYaml(raw) as { entries?: Record<string, unknown>[] };
  const items = (parsed.entries ?? []).map((entry) => {
    const imageRaw = entry.image ?? entry.thumbnail;
    return {
      slug: String(entry.slug),
      title: String(entry.title),
      date: asDateString(entry.date),
      excerpt: entry.excerpt ? String(entry.excerpt) : undefined,
      host: entry.host ? String(entry.host) : undefined,
      venue: entry.venue ? String(entry.venue) : undefined,
      url: entry.url ? String(entry.url) : undefined,
      source: entry.source ? (String(entry.source) as RecordingSource) : undefined,
      duration: entry.duration ? String(entry.duration) : undefined,
      image: imageRaw ? String(imageRaw) : undefined,
    };
  });
  return byDateDesc(items);
}

export function getSolveEntries(): SolveEntry[] {
  const full = path.join(root, "solving", "entries.yml");
  if (!fs.existsSync(full)) return [];
  const raw = fs.readFileSync(full, "utf8");
  const parsed = loadYaml(raw) as { entries?: Record<string, unknown>[] };
  const items = (parsed.entries ?? []).map((entry) => {
    const stackRaw = entry.stack ?? entry.topics;
    const imagesRaw = entry.images;
    const linksRaw = entry.links;
    return {
      slug: String(entry.slug),
      title: String(entry.title),
      problem: String(entry.problem),
      solution: String(entry.solution),
      type: String(entry.type ?? "app"),
      url: entry.url ? String(entry.url) : undefined,
      image: entry.image ? String(entry.image) : undefined,
      icon: entry.icon ? String(entry.icon) : undefined,
      display:
        entry.display === "icon" || entry.display === "screenshot"
          ? entry.display
          : undefined,
      images: Array.isArray(imagesRaw) ? imagesRaw.map(String) : undefined,
      video: entry.video ? String(entry.video) : undefined,
      body: entry.body ? String(entry.body).trim() : undefined,
      links: Array.isArray(linksRaw)
        ? linksRaw
            .map((link) => {
              if (!link || typeof link !== "object") return null;
              const row = link as Record<string, unknown>;
              if (!row.label || !row.url) return null;
              return { label: String(row.label), url: String(row.url) };
            })
            .filter((link): link is { label: string; url: string } => Boolean(link))
        : undefined,
      date: asDateString(entry.date ?? "1970"),
      stack: Array.isArray(stackRaw) ? stackRaw.map(String) : undefined,
      order: entry.order !== undefined ? Number(entry.order) : undefined,
      note: entry.note ? String(entry.note) : undefined,
    };
  });
  return items.sort((a, b) => {
    const byDate = b.date.localeCompare(a.date);
    if (byDate !== 0) return byDate;
    return (a.order ?? 99) - (b.order ?? 99);
  });
}

export function getSolveEntry(slug: string): SolveEntry | undefined {
  return getSolveEntries().find((entry) => entry.slug === slug);
}

function mapSolveQuote(entry: Record<string, unknown>): SolveQuote {
  const tagsRaw = entry.tags;
  return {
    id: String(entry.id),
    name: String(entry.name),
    role: String(entry.role ?? ""),
    quote: String(entry.quote ?? "")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/\s+/g, " ")
      .trim(),
    photo: String(entry.photo),
    app: entry.app ? String(entry.app) : undefined,
    tags: Array.isArray(tagsRaw) ? tagsRaw.map(String) : undefined,
  };
}

/** Quotes attached to Solve apps (`content/solving/quotes.yml`). */
export function getSolveQuotes(): SolveQuote[] {
  const full = path.join(root, "solving", "quotes.yml");
  if (!fs.existsSync(full)) return [];
  const raw = fs.readFileSync(full, "utf8");
  const parsed = loadYaml(raw) as { quotes?: Record<string, unknown>[] };
  return (parsed.quotes ?? []).map(mapSolveQuote);
}

export function getSolveQuotesForApp(slug: string): SolveQuote[] {
  return getSolveQuotes().filter((quote) => quote.app === slug);
}

/**
 * Codesmith / leadership quotes (+ unassigned archive).
 * Not shown on app detail pages — durable YAML for later use.
 */
export function getLeadershipQuotes(): SolveQuote[] {
  const full = path.join(root, "solving", "leadership-quotes.yml");
  if (!fs.existsSync(full)) return [];
  const raw = fs.readFileSync(full, "utf8");
  const parsed = loadYaml(raw) as { quotes?: Record<string, unknown>[] };
  return (parsed.quotes ?? []).map(mapSolveQuote);
}

/** @deprecated Prefer getSolveEntries(). */
export function getWork(): SolveEntry[] {
  return getSolveEntries();
}

export function getExperience(): Experience[] {
  const file = path.join(root, "experience.yml");
  const raw = fs.readFileSync(file, "utf8");
  const parsed = loadYaml(raw) as { roles?: Experience[] };
  return parsed.roles ?? [];
}

export function latestSermon() {
  return getSermons()[0];
}

export function latestWriting() {
  return getWritings()[0];
}
