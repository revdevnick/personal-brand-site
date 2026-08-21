export function formatDate(value: string) {
  if (/^\d{4}$/.test(value)) return value;
  const iso = /^\d{4}-\d{2}$/.test(value) ? `${value}-01` : value;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return value;
  const hasDay = /^\d{4}-\d{2}-\d{2}/.test(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: hasDay ? "numeric" : undefined,
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
