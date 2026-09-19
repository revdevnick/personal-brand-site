import Link from "next/link";
import { archiveHref, type ArchiveQuery } from "@/lib/pagination";

type Props = {
  basePath: string;
  page: number;
  totalPages: number;
  /** Preserve `?q=` across page links. */
  query?: string;
};

export function ArchivePagination({ basePath, page, totalPages, query }: Props) {
  if (totalPages <= 1) return null;

  const q: ArchiveQuery = { q: query };

  return (
    <nav
      className="mt-10 flex items-center justify-between gap-4 border-t border-ink/15 pt-6"
      aria-label="Archive pages"
    >
      {page > 1 ? (
        <Link
          href={archiveHref(basePath, page - 1, q)}
          className="font-ui text-xs font-medium tracking-[0.12em] text-accent uppercase transition-colors hover:text-ink"
        >
          ← Previous
        </Link>
      ) : (
        <span className="font-ui text-xs tracking-[0.12em] text-ink/28 uppercase" aria-hidden>
          ← Previous
        </span>
      )}

      <p className="font-ui text-xs tracking-[0.15em] text-ink/45 uppercase">
        Page {page} of {totalPages}
      </p>

      {page < totalPages ? (
        <Link
          href={archiveHref(basePath, page + 1, q)}
          className="font-ui text-xs font-medium tracking-[0.12em] text-accent uppercase transition-colors hover:text-ink"
        >
          Next →
        </Link>
      ) : (
        <span className="font-ui text-xs tracking-[0.12em] text-ink/28 uppercase" aria-hidden>
          Next →
        </span>
      )}
    </nav>
  );
}
