import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(path.join(process.cwd(), "public/logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#0B0B0C",
          color: "#F4EFE4",
          padding: 64,
        }}
      >
        <img src={logoSrc} width={320} height={253} alt="" />
        <div style={{ fontSize: 52, marginTop: 28, lineHeight: 1.1 }}>Nick Perkins</div>
        <div style={{ fontSize: 24, marginTop: 20, color: "#C4A574", maxWidth: 880, textAlign: "center" }}>
          {site.line}
        </div>
      </div>
    ),
    { ...size },
  );
}
