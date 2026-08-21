import Image from "next/image";

type LogoProps = {
  className?: string;
  title?: string;
};

export function Logo({ className = "h-10 w-auto", title = "RevDevNick" }: LogoProps) {
  return (
    <Image
      src="/Nick-Cartoon-Head-Logo-2026.svg"
      alt={title}
      width={822}
      height={651}
      className={className}
      unoptimized
      priority
    />
  );
}
