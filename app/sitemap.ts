import type { MetadataRoute } from "next";
import { getSermons, getSolveEntries, getWritings } from "@/lib/content";
import { LISTEN_FORMAT_FLAGS } from "@/lib/listen-formats";
import { READ_FORMAT_FLAGS } from "@/lib/read-formats";
import { site } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = false;

export default function sitemap(): MetadataRoute.Sitemap {
  const readFormatRoutes = [
    READ_FORMAT_FLAGS.resources ? "/read/resources/" : null,
    READ_FORMAT_FLAGS.publications ? "/read/publications/" : null,
  ].filter((path): path is string => Boolean(path));

  const listenFormatRoutes = [
    LISTEN_FORMAT_FLAGS.appearances ? "/listen/appearances/" : null,
  ].filter((path): path is string => Boolean(path));

  const staticRoutes = [
    "",
    "/listen/",
    ...listenFormatRoutes,
    "/read/",
    ...readFormatRoutes,
    "/about/",
    "/solve/",
    "/contact/",
  ].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
  }));

  const sermons = getSermons().map((sermon) => ({
    url: `${site.url}/listen/${sermon.slug}/`,
    lastModified: new Date(sermon.date),
  }));

  const writings = getWritings().map((post) => ({
    url: `${site.url}/read/${post.slug}/`,
    lastModified: new Date(post.date),
  }));

  const solve = getSolveEntries().map((entry) => ({
    url: `${site.url}/solve/${entry.slug}/`,
    lastModified: new Date(entry.date.length === 4 ? `${entry.date}-01-01` : entry.date),
  }));

  const tags = ["faith", "tech", "ai", "engineering", "life"].map((tag) => ({
    url: `${site.url}/read/tags/${tag}/`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...sermons, ...writings, ...solve, ...tags];
}
