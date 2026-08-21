import Link from "next/link";

type Props = {
  href: string;
  kicker?: string;
  title: string;
  meta?: string;
};

export function LedgerRow({ href, kicker, title, meta }: Props) {
  return (
    <Link
      href={href}
      className="group relative block border-t border-ink/15 py-8 pl-4 pr-2 transition-colors hover:bg-ink/[0.03]"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-3 left-0 w-px scale-y-0 bg-accent transition-transform group-hover:scale-y-100"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-3 h-3 w-3 border-l border-t border-transparent group-hover:border-accent"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-3 left-0 h-3 w-3 border-b border-l border-transparent group-hover:border-accent"
      />
      {kicker ? (
        <p className="font-ui text-xs tracking-[0.2em] text-ink/50 uppercase">{kicker}</p>
      ) : null}
      <p className="mt-2 font-display text-3xl leading-tight group-hover:text-accent">{title}</p>
      {meta ? <p className="mt-2 font-ui text-sm text-ink/60">{meta}</p> : null}
    </Link>
  );
}
