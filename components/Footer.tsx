import Link from "next/link";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-current/10 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 font-ui text-sm sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-md space-y-2">
          <p>This site is here to serve the Lord.</p>
          <p className="opacity-70">
            Teaching His Word, telling others about Him, and solving technology
            problems of various kinds.
          </p>
        </div>
        <ul className="flex flex-col gap-2 sm:text-right">
          <li>
            <Link className="hover:text-accent" href={site.church.url}>
              {site.church.name}
            </Link>
          </li>
          <li>
            <Link className="hover:text-accent" href={site.storyRocket.url}>
              {site.storyRocket.name}
            </Link>
          </li>
          <li>
            <Link className="hover:text-accent" href={site.linkedin}>
              LinkedIn
            </Link>
          </li>
          <li>
            <Link className="hover:text-accent" href="/contact/">
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
