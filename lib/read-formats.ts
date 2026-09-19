import type { ReadFormat } from "./types";

/**
 * Easy hide / easy enable for secondary Read formats.
 * Flip a flag to false to remove that tab without changing layout of Articles.
 * Books stays preview-only until a books collection exists.
 */
export const READ_FORMAT_FLAGS = {
  resources: true,
  publications: true,
  /** Shows a disabled “Books · Coming later” tab when true. */
  booksPreview: true,
} as const;

export type ActiveReadFormat = Exclude<ReadFormat, "books">;

export const READ_FORMATS: {
  id: ActiveReadFormat;
  label: string;
  href: string;
  flag?: keyof typeof READ_FORMAT_FLAGS;
}[] = [
  { id: "articles", label: "Articles", href: "/read/" },
  { id: "resources", label: "Resources", href: "/read/resources/", flag: "resources" },
  {
    id: "publications",
    label: "Publications",
    href: "/read/publications/",
    flag: "publications",
  },
];

export function visibleReadFormats() {
  return READ_FORMATS.filter((format) => {
    if (!format.flag) return true;
    return READ_FORMAT_FLAGS[format.flag];
  });
}
