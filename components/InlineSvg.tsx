"use client";

import { useEffect, useRef } from "react";

type Props = {
  src: string;
  className?: string;
  title?: string;
  onReady?: (svg: SVGSVGElement) => void;
};

export function InlineSvg({ src, className, title, onReady }: Props) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    let cancelled = false;

    fetch(src)
      .then((response) => response.text())
      .then((markup) => {
        if (cancelled || !host.current) return;
        host.current.innerHTML = markup;
        const svg = host.current.querySelector("svg");
        if (!svg) return;
        svg.setAttribute("role", "img");
        if (title) svg.setAttribute("aria-label", title);
        svg.removeAttribute("width");
        svg.removeAttribute("height");
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.display = "block";
        svg.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
        const style = svg.querySelector("style");
        if (style?.textContent && className) {
          const scope = className.split(" ")[0];
          style.textContent = style.textContent.replace(/\.([A-Za-z_-])/g, `.${scope} .$1`);
          svg.classList.add(scope);
        }
        onReady?.(svg);
      });

    return () => {
      cancelled = true;
    };
  }, [src, className, title, onReady]);

  return <div ref={host} className={className} />;
}
