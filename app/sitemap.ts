import type { MetadataRoute } from "next";
import { getSermons, getWritings } from "@/lib/content";
import { site } from "@/lib/site";

export const dynamic = "force-static";
export const revalidate = false;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/sermons/", "/writing/", "/about/", "/work/", "/contact/"].map(
    (path) => ({
      url: `${site.url}${path}`,
      lastModified: new Date(),
    }),
  );

  const sermons = getSermons().map((sermon) => ({
    url: `${site.url}/sermons/${sermon.slug}/`,
    lastModified: new Date(sermon.date),
  }));

  const writings = getWritings().map((post) => ({
    url: `${site.url}/writing/${post.slug}/`,
    lastModified: new Date(post.date),
  }));

  const tags = ["faith", "tech", "ai", "engineering", "life"].map((tag) => ({
    url: `${site.url}/writing/tags/${tag}/`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...sermons, ...writings, ...tags];
}
