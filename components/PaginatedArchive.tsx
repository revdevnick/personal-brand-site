"use client";

import {
  Children,
  Suspense,
  startTransition,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArchivePagination } from "@/components/ArchivePagination";
import { ArchiveSearch } from "@/components/ArchiveSearch";
import {
  ARCHIVE_PAGE_SIZE,
  archiveHref,
  matchesArchiveSearch,
  paginate,
  parsePage,
  parseSearchQuery,
} from "@/lib/pagination";

type Props = {
  basePath: string;
  children: ReactNode;
  pageSize?: number;
  /**
   * Parallel to `children` (same order). When set, shows search and filters
   * the full set before pagination. Prefer title / passage / topics text.
   */
  searchTexts?: string[];
  searchLabel?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
};

function PaginatedArchiveInner({
  basePath,
  children,
  pageSize = ARCHIVE_PAGE_SIZE,
  searchTexts,
  searchLabel,
  searchPlaceholder,
  emptyMessage = "No matches for that search.",
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = parseSearchQuery(searchParams.get("q"));
  const pageParam = parsePage(searchParams.get("page") ?? undefined);

  const [activeQuery, setActiveQuery] = useState(urlQuery);

  useEffect(() => {
    setActiveQuery(urlQuery);
  }, [urlQuery]);

  const onQueryCommit = useCallback(
    (query: string) => {
      setActiveQuery(query);
      startTransition(() => {
        router.replace(archiveHref(basePath, 1, { q: query || undefined }), { scroll: false });
      });
    },
    [basePath, router],
  );

  const all = Children.toArray(children);
  const searchable = Boolean(searchTexts?.length);

  const filtered =
    searchable && activeQuery
      ? all.filter((_, index) => matchesArchiveSearch(searchTexts![index] ?? "", activeQuery))
      : all;

  const { items, page, totalPages } = paginate(filtered, pageParam, pageSize);
  const queryForLinks = activeQuery || undefined;

  return (
    <>
      {searchable ? (
        <ArchiveSearch
          urlQuery={urlQuery}
          onQueryCommit={onQueryCommit}
          label={searchLabel}
          placeholder={searchPlaceholder}
        />
      ) : null}

      {filtered.length === 0 && activeQuery ? (
        <p className="border-t border-ink/15 py-10 text-ink/60">{emptyMessage}</p>
      ) : (
        items
      )}

      <ArchivePagination
        basePath={basePath}
        page={page}
        totalPages={filtered.length === 0 && activeQuery ? 1 : totalPages}
        query={queryForLinks}
      />
    </>
  );
}

/** Client pagination with `?page=` — works with `output: "export"`. Optional `?q=` search. */
export function PaginatedArchive(props: Props) {
  const pageSize = props.pageSize ?? ARCHIVE_PAGE_SIZE;
  const firstPage = Children.toArray(props.children).slice(0, pageSize);
  const showSearch = Boolean(props.searchTexts?.length);

  return (
    <Suspense
      fallback={
        <>
          {showSearch ? (
            <div className="mb-8">
              <p className="mb-2.5 font-ui text-[0.7rem] font-medium tracking-[0.18em] text-ink/68 uppercase sm:text-xs">
                {props.searchLabel ?? "Search sermons"}
              </p>
              <div className="flex min-h-14 items-center border border-ink/40 bg-white px-4 font-ui text-lg text-ink/45 sm:min-h-[3.75rem]">
                {props.searchPlaceholder ?? "Search title, passage, or topics"}
              </div>
            </div>
          ) : null}
          {firstPage}
          <ArchivePagination basePath={props.basePath} page={1} totalPages={1} />
        </>
      }
    >
      <PaginatedArchiveInner {...props} />
    </Suspense>
  );
}
