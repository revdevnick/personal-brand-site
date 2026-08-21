type BraceMarkProps = {
  className?: string;
  side?: "left" | "right";
};

export function BraceMark({ className = "h-full w-auto", side = "right" }: BraceMarkProps) {
  return (
    <svg
      viewBox="0 0 43 150"
      className={className}
      aria-hidden
      style={side === "left" ? { transform: "scaleX(-1)" } : undefined}
    >
      <path
        d="M10 16c18 0 26 18 26 40 0 16 2 22 7 19-5 3-7 10-7 26 0 22-8 40-26 40"
        fill="none"
        stroke="#e07a3d"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
