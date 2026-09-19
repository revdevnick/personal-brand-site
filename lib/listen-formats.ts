/**
 * Easy hide / easy enable for secondary Listen formats.
 * Flip a flag to false to remove that tab without changing Sermons layout.
 * Podcasts stays preview-only until a podcasts collection exists.
 */
export const LISTEN_FORMAT_FLAGS = {
  appearances: true,
  /** Shows a disabled “Podcasts · Coming later” tab when true. */
  podcastsPreview: true,
} as const;

export type ActiveListenFormat = "sermons" | "appearances";

export const LISTEN_FORMATS: {
  id: ActiveListenFormat;
  label: string;
  href: string;
  flag?: keyof typeof LISTEN_FORMAT_FLAGS;
}[] = [
  { id: "sermons", label: "Sermons", href: "/listen/" },
  {
    id: "appearances",
    label: "Appearances",
    href: "/listen/appearances/",
    flag: "appearances",
  },
];

export function visibleListenFormats() {
  return LISTEN_FORMATS.filter((format) => {
    if (!format.flag) return true;
    return LISTEN_FORMAT_FLAGS[format.flag];
  });
}
