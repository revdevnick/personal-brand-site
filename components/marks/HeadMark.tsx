"use client";

import { useId } from "react";

type HeadMarkProps = {
  className?: string;
};

export function HeadMark({ className = "h-full w-auto" }: HeadMarkProps) {
  const clipId = useId().replace(/:/g, "");

  return (
    <svg viewBox="0 0 144 150" className={className} aria-hidden>
      <defs>
        <clipPath id={`head-clip-${clipId}`}>
          <circle className="head-clip" cx="72" cy="78" r="90" />
        </clipPath>
      </defs>
      <image
        className="head-art"
        href="/logo-head.png"
        width="144"
        height="150"
        clipPath={`url(#head-clip-${clipId})`}
      />
      <g
        className="head-outlines"
        fill="none"
        stroke="#e07a3d"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          className="head-draw"
          d="M32 78 28 36l16 18 8-32 12 28 14-34 12 32 16-30 10 28 22-18"
        />
        <rect className="head-draw" x="32" y="80" width="80" height="22" rx="3" />
        <path
          className="head-draw"
          d="M48 118c8 8 16 12 24 14 8-2 16-6 24-14"
        />
      </g>
    </svg>
  );
}
