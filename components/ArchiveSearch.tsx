"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Committed query from the URL (`?q=`). */
  urlQuery: string;
  /** Called with the debounced draft (also used to write `?q=`). */
  onQueryCommit: (query: string) => void;
  /** Visible field label — e.g. "Search sermons". */
  label?: string;
  placeholder?: string;
  debounceMs?: number;
};

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="10.5" cy="10.5" r="6.25" />
      <path d="M15.5 15.5 20 20" />
    </svg>
  );
}

/**
 * Editorial archive search — one clear field with enough presence to find.
 * Draft updates immediately; `onQueryCommit` fires after debounce (and on clear).
 */
export function ArchiveSearch({
  urlQuery,
  onQueryCommit,
  label = "Search sermons",
  placeholder = "Search title, passage, or topics",
  debounceMs = 180,
}: Props) {
  const [draft, setDraft] = useState(urlQuery);
  const ignoreNextUrl = useRef(false);
  const onCommitRef = useRef(onQueryCommit);
  onCommitRef.current = onQueryCommit;

  useEffect(() => {
    if (ignoreNextUrl.current) {
      ignoreNextUrl.current = false;
      return;
    }
    setDraft(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    const trimmed = draft.trim();
    if (trimmed === urlQuery) return;

    const id = window.setTimeout(() => {
      ignoreNextUrl.current = true;
      onCommitRef.current(trimmed);
    }, debounceMs);

    return () => window.clearTimeout(id);
  }, [draft, urlQuery, debounceMs]);

  const showClear = draft.length > 0;

  return (
    <div className="mb-8">
      <label
        htmlFor="archive-search"
        className="mb-2.5 block font-ui text-[0.7rem] font-medium tracking-[0.18em] text-ink/68 uppercase sm:text-xs"
      >
        {label}
      </label>
      <div className="archive-search-field flex min-h-14 items-center gap-3 border border-ink/40 bg-white px-3.5 transition-[border-color] sm:min-h-[3.75rem] sm:gap-3.5 sm:px-4">
        <SearchIcon className="size-5 shrink-0 text-ink/50 sm:size-[1.35rem]" />
        <input
          id="archive-search"
          type="search"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent py-3.5 font-ui text-[1.05rem] leading-snug text-ink placeholder:text-ink/45 outline-none sm:text-lg [&::-webkit-search-cancel-button]:hidden"
        />
        {showClear ? (
          <button
            type="button"
            onClick={() => {
              setDraft("");
              ignoreNextUrl.current = true;
              onCommitRef.current("");
            }}
            className="shrink-0 py-2 font-ui text-xs tracking-[0.12em] text-ink/50 uppercase transition-colors hover:text-accent"
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
