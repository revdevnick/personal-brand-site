import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Instrument_Serif, Noto_Serif_Devanagari, Noto_Serif_SC, Noto_Serif_Thai, Source_Serif_4 } from "next/font/google";
import { JsonLd } from "@/components/JsonLd";
import { SiteShell } from "@/components/SiteShell";
import { personJsonLd, site } from "@/lib/site";
import "./globals.css";

const geist = Geist({
  variable: "--font-ui",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const body = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
});

const zh = Noto_Serif_SC({
  variable: "--font-zh",
  subsets: ["latin"],
  weight: "400",
});

const hi = Noto_Serif_Devanagari({
  variable: "--font-hi",
  subsets: ["devanagari", "latin"],
  weight: "400",
});

const th = Noto_Serif_Thai({
  variable: "--font-th",
  subsets: ["thai", "latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  authors: [{ name: site.name, url: site.url }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: site.url,
    siteName: site.name,
    title: site.title,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  alternates: {
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0b0b0c" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${display.variable} ${body.variable} ${zh.variable} ${hi.variable} ${th.variable} min-h-svh antialiased`}
    >
      <body className="flex min-h-svh flex-col">
        <Script id="home-scroll-pin" strategy="beforeInteractive">
          {`(function(){try{var p=location.pathname;if(p==="/"||p===""){if("scrollRestoration"in history)history.scrollRestoration="manual";window.scrollTo(0,0);}}catch(e){}})();`}
        </Script>
        <JsonLd data={personJsonLd()} />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
