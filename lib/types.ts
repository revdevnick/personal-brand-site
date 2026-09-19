export type RecordingSource = "youtube" | "vimeo" | "audio" | "other";

export type Recording = {
  label: string;
  url?: string;
  source: RecordingSource;
  /** Optional; kept for future use — not shown in the listen UI. */
  duration?: string;
  /**
   * Optional still for the detail/archive — public path (e.g. `/sermons/slug/id.jpg`).
   * Frontmatter may use `image` or `thumbnail`; both map here.
   */
  image?: string;
};

export type Sermon = {
  slug: string;
  title: string;
  date: string;
  venue: string;
  location?: string;
  series?: string;
  passage?: string;
  topics?: string[];
  bibleBook?: string;
  excerpt?: string;
  body: string;
  recordings: Recording[];
};

export type WritingTag = "faith" | "tech" | "ai" | "engineering" | "life";

export type Writing = {
  slug: string;
  title: string;
  date: string;
  tags: WritingTag[];
  excerpt: string;
  body: string;
};

/** Live Read formats Nick can evaluate; books stay future-only for now. */
export type ReadFormat = "articles" | "resources" | "publications" | "books";

/**
 * Link-first Read entries (resources, publications / writing elsewhere).
 * Prefer YAML in `content/reading/`; body is optional for short local notes.
 */
export type ReadLinkEntry = {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  /** Author when the piece is not Nick’s (common for resources). */
  author?: string;
  /** Publication, site, or collection name. */
  source?: string;
  /** External URL when the piece lives off this site. */
  url?: string;
  topics?: string[];
  body?: string;
};

/**
 * Link-first Listen appearances (guest videos, interviews, outings).
 * Prefer YAML in `content/listening/appearances.yml`.
 */
export type Appearance = {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  /** Channel, show, or host name. */
  host?: string;
  /** Place, event, or series label for the aside. */
  venue?: string;
  /** External watch URL (YouTube, etc.). */
  url?: string;
  source?: RecordingSource;
  duration?: string;
  /**
   * Optional still for the list row — public path (e.g. `/appearances/….jpg`).
   * YAML may use `image` or `thumbnail`; both map here.
   */
  image?: string;
};

/**
 * A Solve problem→solution entry (apps, websites, and similar builds).
 * Prefer YAML in `content/solving/entries.yml` — not agency case studies.
 */
export type SolveEntry = {
  slug: string;
  title: string;
  /** The problem as it landed — bold lead for the pair. */
  problem: string;
  /** What Nick built in response — the reveal. */
  solution: string;
  /** app | website | product | system | … — open string so Nick can extend. */
  type: string;
  /** Optional live link (site, App Store, product page). */
  url?: string;
  /** Optional still — public path (e.g. `/solve/scoreboardtv.jpg`). */
  image?: string;
  /**
   * Year (`2024`) or ISO date. Year-only is preferred.
   * Sorts newest-first; `formatDate` handles display.
   */
  date: string;
  /** Optional stack / topics shown under the solution. */
  stack?: string[];
  /** Optional tiebreaker within the same date (lower first). */
  order?: number;
  /** Optional one-line aside — not a case-study body. */
  note?: string;
};

/** @deprecated Prefer SolveEntry — kept as an alias during the Solve redesign. */
export type WorkCase = SolveEntry;

export type Experience = {
  role: string;
  org: string;
  start: string;
  end: string;
  summary: string;
};
