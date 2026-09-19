export function youtubeId(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "") || null;
    }
    if (parsed.searchParams.get("v")) {
      return parsed.searchParams.get("v");
    }
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") {
      return parts[1] ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

/** Convention path for a stored YouTube still under `public/sermons/{slug}/{id}.jpg`. */
export function sermonYoutubeStillPath(slug: string, url: string) {
  const id = youtubeId(url);
  return id ? `/sermons/${slug}/${id}.jpg` : null;
}

/** Seconds from `t=` / `start=` so embeds open at the sermon start in a livestream. */
export function youtubeStartSeconds(url: string): number | null {
  try {
    const parsed = new URL(url);
    const raw = parsed.searchParams.get("t") ?? parsed.searchParams.get("start");
    if (!raw) return null;
    if (/^\d+$/.test(raw)) return Number(raw);
    const match = raw.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
    if (!match) return null;
    const hours = Number(match[1] ?? 0);
    const minutes = Number(match[2] ?? 0);
    const seconds = Number(match[3] ?? 0);
    const total = hours * 3600 + minutes * 60 + seconds;
    return total > 0 ? total : null;
  } catch {
    return null;
  }
}

export function youtubeEmbedSrc(url: string) {
  const id = youtubeId(url);
  if (!id) return null;
  const start = youtubeStartSeconds(url);
  const params = new URLSearchParams();
  if (start != null) params.set("start", String(start));
  const query = params.toString();
  return `https://www.youtube-nocookie.com/embed/${id}${query ? `?${query}` : ""}`;
}

export function vimeoId(url: string) {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    return parts[0] ?? null;
  } catch {
    return null;
  }
}
