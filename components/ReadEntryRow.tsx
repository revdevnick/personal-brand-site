import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { formatDate } from "@/lib/format";

type Topic = {
  label: string;
  href?: string;
};

type Props = {
  date: string;
  title: string;
  titleHref?: string;
  byline: string;
  excerpt?: string;
  topics?: Topic[];
  actionLabel: string;
  actionHref?: string;
  actionExternal?: boolean;
  asideLabel?: string;
  asideMeta?: string;
  /** Optional still — public path. Linked when actionHref is set. */
  image?: string;
  imageAlt?: string;
};

function MediaLink({
  href,
  external,
  ariaLabel,
  className,
  children,
}: {
  href: string;
  external?: boolean;
  ariaLabel?: string;
  className?: string;
  children: ReactNode;
}) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

export function ReadEntryRow({
  date,
  title,
  titleHref,
  byline,
  excerpt,
  topics,
  actionLabel,
  actionHref,
  actionExternal,
  asideLabel = "Open",
  asideMeta,
  image,
  imageAlt,
}: Props) {
  const titleNode = titleHref ? (
    actionExternal ? (
      <a
        href={titleHref}
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors group-hover:text-accent"
      >
        {title}
      </a>
    ) : (
      <Link href={titleHref} className="transition-colors group-hover:text-accent">
        {title}
      </Link>
    )
  ) : (
    <span>{title}</span>
  );

  const actionNode = actionHref ? (
    actionExternal ? (
      <a
        href={actionHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 font-ui text-xs font-medium tracking-[0.12em] text-accent uppercase"
      >
        {actionLabel} <span aria-hidden>→</span>
      </a>
    ) : (
      <Link
        href={actionHref}
        className="inline-flex items-center gap-2 font-ui text-xs font-medium tracking-[0.12em] text-accent uppercase"
      >
        {actionLabel} <span aria-hidden>→</span>
      </Link>
    )
  ) : (
    <p className="font-ui text-xs tracking-[0.12em] text-ink/40 uppercase">{actionLabel}</p>
  );

  const alt = imageAlt ?? "";
  const linkAria = alt ? undefined : actionLabel;

  const stillFrame = (sizes: string, className?: string) =>
    image ? (
      <Image
        src={image}
        alt={alt}
        width={640}
        height={360}
        className={`aspect-video w-full object-cover ${className ?? ""}`}
        sizes={sizes}
      />
    ) : null;

  const linkedStill = (sizes: string, wrapperClass: string) => {
    const frame = stillFrame(sizes);
    if (!frame) return null;
    if (!actionHref) {
      return <div className={wrapperClass}>{frame}</div>;
    }
    return (
      <MediaLink
        href={actionHref}
        external={actionExternal}
        ariaLabel={linkAria}
        className={wrapperClass}
      >
        {frame}
      </MediaLink>
    );
  };

  return (
    <article
      className={`group grid gap-5 border-t border-ink/15 py-8 md:gap-8 ${
        image
          ? "md:grid-cols-[8.5rem_minmax(0,1fr)_14rem]"
          : "md:grid-cols-[8.5rem_minmax(0,1fr)_12rem]"
      }`}
    >
      {image
        ? linkedStill(
            "(max-width: 767px) 100vw, 14rem",
            "order-1 mx-auto w-full max-w-md overflow-hidden ring-1 ring-ink/10 transition-[box-shadow] group-hover:ring-accent/35 md:hidden",
          )
        : null}

      <div className="order-2 font-ui text-xs leading-relaxed tracking-[0.08em] text-ink/48 uppercase md:order-none">
        <p>{formatDate(date)}</p>
      </div>

      <div className="order-3 md:order-none">
        <h3 className="font-display text-3xl leading-tight sm:text-4xl">{titleNode}</h3>
        <p className="mt-2 font-ui text-sm text-ink/55">{byline}</p>
        {excerpt ? <p className="mt-3 max-w-xl leading-relaxed text-ink/62">{excerpt}</p> : null}
        {topics?.length ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 font-ui text-xs text-ink/52">
            <span className="tracking-[0.14em] text-ink/38 uppercase">Topics</span>
            {topics.map((topic) =>
              topic.href ? (
                <Link
                  key={topic.label}
                  href={topic.href}
                  className="border-l border-scripture/60 pl-2 hover:text-accent"
                >
                  {topic.label}
                </Link>
              ) : (
                <span key={topic.label} className="border-l border-scripture/60 pl-2">
                  {topic.label}
                </span>
              ),
            )}
          </div>
        ) : null}
      </div>

      <div className="order-4 self-start md:order-none md:self-center md:border-l md:border-ink/12 md:pl-4">
        {image ? (
          <div className="mb-4 hidden md:block">
            {linkedStill(
              "14rem",
              "block overflow-hidden ring-1 ring-ink/10 transition-[box-shadow] group-hover:ring-accent/35",
            )}
          </div>
        ) : null}
        <p className="mb-2 font-ui text-[0.65rem] tracking-[0.18em] text-ink/40 uppercase">
          {asideLabel}
        </p>
        {asideMeta ? <p className="font-ui text-sm text-ink/65">{asideMeta}</p> : null}
        <div className="mt-4">{actionNode}</div>
      </div>
    </article>
  );
}
