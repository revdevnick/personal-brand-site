import type { SolveEntry, SolveImageDisplay } from "@/lib/types";

/** Filename looks like an app icon asset (`icon.png`, `icon-photo.jpg`, …). */
const ICON_FILE = /(?:^|\/)icon(?:[-.][^/]*)?\.(?:png|jpe?g|webp|gif)$/i;

export type SolveVisualMode = "icon" | "frame";

export type SolveVisual = {
  src: string;
  mode: SolveVisualMode;
};

export function isSolveApp(entry: Pick<SolveEntry, "type">): boolean {
  return entry.type.trim().toLowerCase() === "app";
}

export function isSolveIconPath(src: string): boolean {
  return ICON_FILE.test(src);
}

function resolveDisplay(
  entry: SolveEntry,
  fallback: SolveImageDisplay,
): SolveImageDisplay {
  return entry.display ?? fallback;
}

/**
 * Primary still for list cards: apps prefer a dedicated icon / logo mark
 * with squircle treatment; websites keep the browser frame.
 */
export function getSolvePrimaryVisual(entry: SolveEntry): SolveVisual | null {
  const iconSrc =
    entry.icon ?? entry.images?.find((src) => isSolveIconPath(src));
  const fallback: SolveImageDisplay =
    iconSrc || isSolveApp(entry) ? "icon" : "screenshot";
  const display = resolveDisplay(entry, fallback);

  if (display === "icon") {
    const src = iconSrc ?? entry.image;
    return src ? { src, mode: "icon" } : null;
  }

  if (!entry.image) return null;
  return { src: entry.image, mode: "frame" };
}

/**
 * Detail gallery: lead with the app icon when applicable; keep real
 * screenshots / GIFs as full frames. Skip redundant logo marks.
 */
export function getSolveGalleryItems(entry: SolveEntry): SolveVisual[] {
  const primary = getSolvePrimaryVisual(entry);
  const pool = [...(entry.images ?? [])];
  if (entry.image && !pool.includes(entry.image)) {
    pool.unshift(entry.image);
  }
  if (entry.icon && !pool.includes(entry.icon)) {
    pool.unshift(entry.icon);
  }

  const items: SolveVisual[] = [];
  const seen = new Set<string>();

  if (primary) {
    items.push(primary);
    seen.add(primary.src);
  }

  for (const src of pool) {
    if (seen.has(src)) continue;

    // Dedicated icon files are only for the primary mark.
    if (primary?.mode === "icon" && isSolveIconPath(src)) {
      seen.add(src);
      continue;
    }

    // When the list uses icon.png, don't also show feature.png as a second logo.
    if (
      primary?.mode === "icon" &&
      entry.image &&
      src === entry.image &&
      primary.src !== entry.image &&
      isSolveApp(entry)
    ) {
      seen.add(src);
      continue;
    }

    seen.add(src);
    const mode: SolveVisualMode =
      resolveDisplay(entry, isSolveIconPath(src) ? "icon" : "screenshot") ===
        "icon" && isSolveIconPath(src)
        ? "icon"
        : "frame";
    items.push({ src, mode });
  }

  return items;
}
