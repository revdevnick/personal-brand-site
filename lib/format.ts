export function formatDate(value: string) {
  if (/^\d{4}$/.test(value)) return value;
  const monthOnly = /^\d{4}-\d{2}$/.test(value);
  const iso = monthOnly ? `${value}-01` : value;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return value;
  // Include day unless the source was year-only or month-only (YYYY / YYYY-MM).
  // Full ISO dates and Date.toString() values from gray-matter both get a day.
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: monthOnly ? undefined : "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatRange(start: string, end: string) {
  if (end.toLowerCase() === "present") {
    return `${formatDate(start)} — Present`;
  }
  return `${formatDate(start)} — ${formatDate(end)}`;
}

/** Split "Mark 6:30-46" → { book: "Mark", reference: "6:30–46" }. */
export function splitPassage(passage: string): { book: string; reference?: string } {
  const trimmed = passage.trim();
  const match = trimmed.match(/^(.+?)\s+(\d+:[\d\-–—,.\s]+)$/);
  if (!match) return { book: trimmed };
  const reference = match[2].replace(/(\d)-(\d)/g, "$1–$2").replace(/\s+/g, " ").trim();
  return { book: match[1].trim(), reference };
}
