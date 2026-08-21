import type { Metadata } from "next";
import Link from "next/link";
import { getExperience } from "@/lib/content";
import { formatRange } from "@/lib/format";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "Nick Perkins is a pastor and a builder. This site introduces him so you can find the work. It is all about Jesus.",
};

export default function AboutPage() {
  const roles = getExperience();

  return (
    <div className="mx-auto grid max-w-6xl gap-16 px-6 py-20 lg:grid-cols-2">
      <section>
        <p className="font-ui text-xs tracking-[0.2em] text-ink/50 uppercase">About</p>
        <h1 className="mt-4 font-display text-5xl leading-tight">A name on the door.</h1>
        <div className="study-measure mt-8 space-y-6 text-lg">
          <p>
            People need to know who I am and what I do, or they cannot find the sermons, the writing, or the work. That is why this site carries my name. It is not a pedestal.
          </p>
          <p>
            I am Nick Perkins — RevDevNick in the places that still use handles. Associate Pastor of Administration &amp; Engagement at{" "}
            <Link className="underline decoration-accent/40 underline-offset-4" href={site.church.url}>
              Bethlehem Baptist Church
            </Link>{" "}
            in Knightdale. I also build software and own{" "}
            <Link className="underline decoration-accent/40 underline-offset-4" href={site.storyRocket.url}>
              Story Rocket
            </Link>
            .
          </p>
          <p>{site.line}</p>
          <p>
            I like solving problems. Many times that is programming and technology. I also like walking with people as they seek the Lord with deeper spiritual and personal ones. I am not Mr. Fix-It of all things. God is.
          </p>
          <p>
            This house exists to serve the Lord: teaching His Word, telling others about Him, and solving technology problems of various kinds. It is all about Jesus.
          </p>
          <p className="text-base text-ink/70">
            Books, someday. I have not written one yet. When I do, it will live here. Not a shop until then.
          </p>
        </div>
      </section>
      <section>
        <p className="font-ui text-xs tracking-[0.2em] text-ink/50 uppercase">A thread</p>
        <ol className="mt-8 space-y-10">
          {roles.map((role) => (
            <li key={`${role.role}-${role.org}`} className="border-l border-ink/15 pl-6">
              <p className="font-ui text-xs text-ink/45">{formatRange(role.start, role.end)}</p>
              <h2 className="mt-1 font-display text-2xl">
                {role.role}
                <span className="text-ink/50"> · {role.org}</span>
              </h2>
              <p className="mt-3 text-ink/75">{role.summary}</p>
            </li>
          ))}
        </ol>
        <p className="mt-12 font-ui text-sm text-ink/60">
          The exhaustive professional record lives on{" "}
          <Link className="underline decoration-accent/40 underline-offset-4" href={site.linkedin}>
            LinkedIn
          </Link>
          . When that changes, this page is updated by hand in{" "}
          <code className="font-mono text-sm">content/experience.yml</code>.
        </p>
      </section>
    </div>
  );
}
