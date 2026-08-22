import { IconBrandGithub, IconBrandInstagram, IconBrandLinkedin, IconBrandX } from "@tabler/icons-react";
import { socials } from "@/lib/site";

const icons = {
  linkedin: IconBrandLinkedin,
  github: IconBrandGithub,
  twitter: IconBrandX,
  instagram: IconBrandInstagram,
} as const;

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`social-links ${className}`.trim()}>
      {socials.map((item) => {
        const Icon = icons[item.icon];
        return (
          <li key={item.href}>
            <a
              className="social-link"
              href={item.href}
              aria-label={item.label}
              title={item.label}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon aria-hidden />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
