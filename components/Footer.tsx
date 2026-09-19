import Link from "next/link";
import { SocialLinks } from "@/components/SocialLinks";
import { site } from "@/lib/site";

const year = new Date().getFullYear();

const destinations = [
  { href: site.church.url, label: site.church.name, external: true },
  { href: site.storyRocket.url, label: site.storyRocket.name, external: true },
  { href: "/contact/", label: "Contact", external: false },
] as const;

export function Footer() {
  return (
    <footer id="site-footer" className="site-footer mt-auto">
      <div className="site-footer-glow" aria-hidden />
      <div className="site-footer-grain" aria-hidden />

      <div className="site-footer-inner">
        <p className="site-footer-kicker">
          <span>{site.handle}</span>
          <span aria-hidden className="site-footer-dot">
            ·
          </span>
          <span>{site.location}</span>
        </p>

        <p className="site-footer-support font-display">
          Preaching His Word. Pointing others to my Savior. Building a bridge
          over myself—daily. Solving technology problems without the mask or
          cape.
        </p>

        <div className="site-footer-bar">
          <SocialLinks className="site-footer-socials" />
          <nav aria-label="Footer">
            <ul className="site-footer-links">
              {destinations.map((item) => (
                <li key={item.href}>
                  {item.external ? (
                    <a
                      className="site-footer-link"
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link className="site-footer-link" href={item.href}>
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="site-footer-meta">
          <span>© {year} {site.name}</span>
          <span aria-hidden className="site-footer-dot">
            ·
          </span>
          <span>ALL TO JESUS, I SURRENDER</span>
        </p>
      </div>
    </footer>
  );
}
