export function ScrollCue({ className = "" }: { className?: string }) {
  return (
    <div className={`scroll-cue ${className}`} aria-hidden>
      <div className="scroll-cue-mouse">
        <svg viewBox="0 0 28 44" className="h-11 w-7">
          <rect x="1.5" y="1.5" width="25" height="41" rx="12.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <rect className="scroll-cue-wheel" x="12" y="8" width="4" height="8" rx="2" fill="currentColor" />
        </svg>
        <p className="mt-2 font-ui text-[0.65rem] tracking-[0.28em] uppercase">Scroll</p>
      </div>
      <div className="scroll-cue-arrow">
        <span className="hero-chevron text-2xl">↓</span>
        <p className="mt-1 font-ui text-[0.65rem] tracking-[0.28em] uppercase">Scroll</p>
      </div>
    </div>
  );
}
