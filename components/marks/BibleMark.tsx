export function BibleMark({ className = "h-full w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 120" className={className} aria-hidden>
      <rect className="bible-cover" x="8" y="10" width="74" height="100" rx="4" fill="#e07a3d" />
      <rect className="bible-spine" x="8" y="10" width="10" height="100" rx="2" fill="#c45e24" />
      <g className="bible-pages">
        <rect className="bible-page" x="22" y="16" width="54" height="88" rx="2" fill="#f4efe4" />
        <rect className="bible-page" x="24" y="18" width="52" height="84" rx="2" fill="#efe6d3" />
        <rect className="bible-page" x="26" y="20" width="50" height="80" rx="2" fill="#f7f1e6" />
        <path d="M34 36h32M34 46h28M34 56h32M34 66h24" stroke="#c4a574" strokeWidth="1.4" />
        <circle cx="51" cy="84" r="6" fill="none" stroke="#c4a574" strokeWidth="1.3" />
      </g>
    </svg>
  );
}
