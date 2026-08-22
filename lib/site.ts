export const site = {
  name: "Nick Perkins",
  handle: "RevDevNick",
  title: "Nick Perkins — Pastor, Writer, Builder",
  description:
    "Associate Pastor of Administration & Engagement at Bethlehem Baptist Church. A doorway to the Word, to Jesus, and to technical work in His service.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://nickperkins.dev",
  location: "Clayton, North Carolina",
  church: {
    name: "Bethlehem Baptist Church",
    url: "https://bethlehemknightdale.com/",
    staffUrl: "https://bethlehemknightdale.com/staff/",
  },
  storyRocket: {
    name: "Story Rocket",
    url: "https://www.storyrocket.io/",
  },
  linkedin: "https://www.linkedin.com/in/nick-perkins/",
  github: "https://github.com/revdevnick",
  githubAlt: "https://github.com/nickprkins",
  twitter: "https://twitter.com/revdevnick",
  instagram: "https://instagram.com/revdevnick",
  line: "I love solving problems. Some of them take code. The deepest ones take Jesus.",
} as const;

export const socials = [
  { href: site.linkedin, label: "LinkedIn", icon: "linkedin" },
  { href: site.github, label: "GitHub @revdevnick", icon: "github" },
  { href: site.githubAlt, label: "GitHub @nickprkins", icon: "github" },
  { href: site.twitter, label: "Twitter @revdevnick", icon: "twitter" },
  { href: site.instagram, label: "Instagram @revdevnick", icon: "instagram" },
] as const;

export const sameAs = [
  site.github,
  site.githubAlt,
  site.twitter,
  site.instagram,
  site.linkedin,
  site.storyRocket.url,
  site.church.staffUrl,
];

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    alternateName: site.handle,
    url: site.url,
    jobTitle: [
      "Associate Pastor of Administration & Engagement",
      "Software Engineer",
    ],
    worksFor: [
      { "@type": "Church", name: site.church.name, url: site.church.url },
      { "@type": "Organization", name: site.storyRocket.name, url: site.storyRocket.url },
    ],
    sameAs,
    description: site.description,
  };
}
