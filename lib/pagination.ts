/** Archive list page size — one scroll of dense Listen/Read rows on desktop. */
export const ARCHIVE_PAGE_SIZE = 6;

export type ArchiveQuery = {
  q?: string;
};

export function parsePage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function parseSearchQuery(raw: string | string[] | null | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (value ?? "").trim();
}

/** Case-insensitive: every whitespace token must appear as a substring. */
export function matchesArchiveSearch(haystack: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = haystack.toLowerCase();
  return q.split(/\s+/).every((token) => hay.includes(token));
}

export function paginate<T>(items: T[], page: number, pageSize = ARCHIVE_PAGE_SIZE) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: current,
    pageSize,
    total,
    totalPages,
    hasPrev: current > 1,
    hasNext: current < totalPages,
  };
}

export function archiveHref(basePath: string, page = 1, query: ArchiveQuery = {}): string {
  const path = basePath.endsWith("/") ? basePath : `${basePath}/`;
  const params = new URLSearchParams();
  const q = query.q?.trim();
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

/** @deprecated Prefer archiveHref — kept for call sites that only need page. */
export function pageHref(basePath: string, page: number, query: ArchiveQuery = {}): string {
  return archiveHref(basePath, page, query);
}
