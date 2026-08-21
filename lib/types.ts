export type RecordingSource = "youtube" | "vimeo" | "audio" | "other";

export type Recording = {
  label: string;
  url: string;
  source: RecordingSource;
};

export type Sermon = {
  slug: string;
  title: string;
  date: string;
  venue: string;
  location?: string;
  series?: string;
  scripture?: string;
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

export type WorkCase = {
  slug: string;
  title: string;
  problem: string;
  craft: string;
  url?: string;
  parent?: string;
  order: number;
  body: string;
};

export type Experience = {
  role: string;
  org: string;
  start: string;
  end: string;
  summary: string;
};
