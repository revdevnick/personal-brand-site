type HeadSvgProps = {
  className?: string;
};

export function HeadSvg({ className = "h-48 w-auto" }: HeadSvgProps) {
  return (
    <svg
      viewBox="0 0 200 220"
      className={className}
      role="img"
      aria-label="Nick Perkins"
    >
      <g data-head-part="neck">
        <path d="M78 188c6 16 14 24 22 24s16-8 22-24" fill="#c48a5a" />
      </g>
      <g data-head-part="ear-left">
        <ellipse cx="42" cy="118" rx="10" ry="16" fill="#d4a06a" />
        <ellipse cx="43" cy="118" rx="5" ry="9" fill="#c48a5a" />
      </g>
      <g data-head-part="ear-right">
        <ellipse cx="158" cy="118" rx="10" ry="16" fill="#d4a06a" />
        <ellipse cx="157" cy="118" rx="5" ry="9" fill="#c48a5a" />
      </g>
      <g data-head-part="face">
        <path
          d="M58 96c2-38 18-62 42-62s40 24 42 62c2 28-2 58-18 74-10 10-22 14-24 14s-14-4-24-14c-16-16-20-46-18-74Z"
          fill="#d4a06a"
        />
      </g>
      <g data-head-part="hair">
        <path
          d="M54 92 62 28l12 48 10-56 12 52 14-62 12 58 16-50 8 52 16-40-6 54c-8-28-22-48-42-54-24-6-42 4-52 28Z"
          fill="#1a1a1a"
        />
        <path d="M70 40 78 8l6 36" fill="#1a1a1a" />
        <path d="M108 32 116 2l8 34" fill="#1a1a1a" />
        <path d="M138 48 152 18l2 40" fill="#1a1a1a" />
      </g>
      <g data-head-part="brows">
        <path d="M58 96c10-8 22-10 32-6" fill="none" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" />
        <path d="M110 90c10-4 22-2 32 6" fill="none" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" />
      </g>
      <g data-head-part="glasses">
        <rect x="52" y="100" width="44" height="30" rx="4" fill="none" stroke="#1a1a1a" strokeWidth="6" data-draw />
        <rect x="104" y="100" width="44" height="30" rx="4" fill="none" stroke="#1a1a1a" strokeWidth="6" data-draw />
        <path d="M96 114h8" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" data-draw />
        <path d="M52 114h-10" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" data-draw />
        <path d="M148 114h10" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round" data-draw />
      </g>
      <g data-head-part="lenses">
        <rect x="56" y="104" width="36" height="22" rx="2" fill="#f3f1ec" />
        <rect x="108" y="104" width="36" height="22" rx="2" fill="#f3f1ec" />
      </g>
      <g data-head-part="beard">
        <path
          d="M78 150c6 4 10 6 22 6s16-2 22-6c-2 18-10 32-22 38-12-6-20-20-22-38Z"
          fill="#1a1a1a"
        />
        <path d="M86 146c8 8 20 8 28 0-8 4-20 4-28 0Z" fill="#1a1a1a" />
      </g>
    </svg>
  );
}
