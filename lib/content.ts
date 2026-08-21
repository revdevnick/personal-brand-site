import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { load as loadYaml } from "js-yaml";
import type { Experience, Recording, Sermon, WorkCase, Writing, WritingTag } from "./types";

const root = path.join(process.cwd(), "content");

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

export function getSermons(): Sermon[] {
  const items = readDir("sermons").map(({ slug, data, body }) => ({
    slug,
    title: String(data.title),
    date: String(data.date),
    venue: String(data.venue),
    location: data.location ? String(data.location) : undefined,
    series: data.series ? String(data.series) : undefined,
    scripture: data.scripture ? String(data.scripture) : undefined,
    excerpt: data.excerpt ? String(data.excerpt) : undefined,
    recordings: (Array.isArray(data.recordings) ? data.recordings : []) as Recording[],
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
    date: String(data.date),
    tags: (Array.isArray(data.tags) ? data.tags : []) as WritingTag[],
    excerpt: String(data.excerpt ?? ""),
    body,
  }));
  return byDateDesc(items);
}

export function getWriting(slug: string) {
  return getWritings().find((item) => item.slug === slug);
}

export function getWork(): WorkCase[] {
  return readDir("work")
    .map(({ slug, data, body }) => ({
      slug,
      title: String(data.title),
      problem: String(data.problem),
      craft: String(data.craft),
      url: data.url ? String(data.url) : undefined,
      parent: data.parent ? String(data.parent) : undefined,
      order: Number(data.order ?? 99),
      body,
    }))
    .sort((a, b) => a.order - b.order);
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
