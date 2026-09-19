#!/usr/bin/env node
/**
 * grab-sermon-stills.mjs
 *
 * Extract mid-sermon YouTube stills for Listen sermon pages.
 *
 * Rule: the `t=` in Nick's livestream URL marks the moment right before he
 * preaches. Capture frames ~15 minutes after that (t + 900s). Prefer a
 * close-up of him preaching among nearby candidates; otherwise use the best
 * available frame near that point.
 *
 * Prerequisites: yt-dlp and ffmpeg on PATH (`brew install yt-dlp ffmpeg`).
 *
 * Usage:
 *   node scripts/grab-sermon-stills.mjs --slug <sermon-slug> <youtube-url> [url…]
 *
 * Examples:
 *   node scripts/grab-sermon-stills.mjs \
 *     --slug 2026-03-01-learning-the-rhythm \
 *     "https://www.youtube.com/live/XUbEKYS2UVw?t=1177" \
 *     "https://www.youtube.com/live/PksLTXJZHXU?t=1164"
 *
 *   # Custom preach offset (seconds after t=); default 900 (15 min)
 *   node scripts/grab-sermon-stills.mjs --slug my-sermon --offset 900 "https://youtu.be/ID?t=1000"
 *
 *   # Keep scored candidates under /tmp/sermon-stills-candidates/<slug>/
 *   node scripts/grab-sermon-stills.mjs --slug my-sermon --keep-candidates "https://…"
 *
 * Output:
 *   public/sermons/<slug>/<youtubeId>.jpg
 *
 * Wire the path into the sermon MDX recording `image` field:
 *   image: /sermons/<slug>/<youtubeId>.jpg
 *
 * Archive rows typically reuse the 9:00 AM still; detail pages use one still
 * per service recording.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const DEFAULT_OFFSET = 900;
/** Sample offsets (seconds) relative to preach start (t + offset). */
const CANDIDATE_DELTAS = [0, 20, 40, 60, 90, 120, 150];

function usage(exitCode = 1) {
  console.error(
    "Usage: node scripts/grab-sermon-stills.mjs --slug <slug> [--offset 900] [--keep-candidates] <youtube-url> [url…]",
  );
  process.exit(exitCode);
}

function requireBin(name) {
  const r = spawnSync("which", [name], { encoding: "utf8" });
  if (r.status !== 0) {
    console.error(`Missing dependency: ${name}. Install with: brew install yt-dlp ffmpeg`);
    process.exit(1);
  }
}

function parseArgs(argv) {
  const urls = [];
  let slug = null;
  let offset = DEFAULT_OFFSET;
  let keepCandidates = false;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") usage(0);
    if (a === "--slug") {
      slug = argv[++i];
      continue;
    }
    if (a === "--offset") {
      offset = Number(argv[++i]);
      if (!Number.isFinite(offset) || offset < 0) {
        console.error("--offset must be a non-negative number of seconds");
        process.exit(1);
      }
      continue;
    }
    if (a === "--keep-candidates") {
      keepCandidates = true;
      continue;
    }
    if (a.startsWith("-")) {
      console.error(`Unknown flag: ${a}`);
      usage();
    }
    urls.push(a);
  }

  if (!slug || urls.length === 0) usage();
  return { slug, offset, keepCandidates, urls };
}

/** Parse YouTube id + t= seconds from common URL shapes. */
function parseYouTube(url) {
  let id = null;
  let t = 0;

  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      id = u.pathname.replace(/^\//, "").split("/")[0] || null;
    } else if (u.pathname.startsWith("/live/")) {
      id = u.pathname.split("/")[2] || null;
    } else if (u.pathname.startsWith("/shorts/")) {
      id = u.pathname.split("/")[2] || null;
    } else if (u.searchParams.get("v")) {
      id = u.searchParams.get("v");
    } else {
      const parts = u.pathname.split("/").filter(Boolean);
      id = parts[parts.length - 1] || null;
    }

    const tParam = u.searchParams.get("t") ?? u.searchParams.get("start");
    if (tParam) t = parseTimestamp(tParam);
    if (!t && u.hash) {
      const m = u.hash.match(/t=([\dhm]+)/i);
      if (m) t = parseTimestamp(m[1]);
    }
  } catch {
    console.error(`Invalid URL: ${url}`);
    process.exit(1);
  }

  if (!id || !/^[A-Za-z0-9_-]{6,}$/.test(id)) {
    console.error(`Could not parse YouTube id from: ${url}`);
    process.exit(1);
  }

  return { id, t };
}

function parseTimestamp(raw) {
  const s = String(raw).trim().replace(/s$/i, "");
  if (/^\d+$/.test(s)) return Number(s);
  const m = s.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/i);
  if (!m) return 0;
  return (Number(m[1] || 0) * 3600) + (Number(m[2] || 0) * 60) + Number(m[3] || 0);
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    ...opts,
  });
  if (r.status !== 0) {
    const err = (r.stderr || r.stdout || "").trim();
    throw new Error(`${cmd} ${args.join(" ")} failed (${r.status}): ${err.slice(0, 800)}`);
  }
  return r;
}

function getStreamUrl(videoId) {
  const page = `https://www.youtube.com/watch?v=${videoId}`;
  // Prefer a progressive/single file when available; fall back to best video.
  const formats = ["bv*[height<=1080][protocol^=https]/merge-none", "bv*[height<=1080]", "b[height<=1080]", "bv*", "b"];
  let lastErr = null;
  for (const f of formats) {
    try {
      const r = run("yt-dlp", ["-g", "-f", f, "--no-playlist", page]);
      const line = r.stdout.trim().split("\n").find(Boolean);
      if (line) return line;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error(`No stream URL for ${videoId}`);
}

function extractFrame(streamUrl, seconds, outPath) {
  run("ffmpeg", [
    "-y",
    "-ss", String(seconds),
    "-i", streamUrl,
    "-frames:v", "1",
    "-q:v", "2",
    outPath,
  ], { stdio: ["ignore", "pipe", "pipe"] });
}

/**
 * Prefer close-ups / subject-forward frames: higher center detail, with
 * penalties for blank frames and large bright corner PiP slide overlays.
 */
function scoreCloseUp(jpegPath) {
  const ppm = jpegPath.replace(/\.jpg$/i, ".score.ppm");
  try {
    run("ffmpeg", [
      "-y",
      "-i", jpegPath,
      "-vf", "scale=160:90,format=gray",
      "-frames:v", "1",
      ppm,
    ], { stdio: ["ignore", "pipe", "pipe"] });
  } catch {
    return 0;
  }

  const buf = fs.readFileSync(ppm);
  // Skip PPM header (P5\nW H\n255\n)
  let i = 0;
  let newlines = 0;
  while (i < buf.length && newlines < 3) {
    if (buf[i] === 0x0a) newlines++;
    i++;
  }
  const pixels = buf.subarray(i);
  const w = 160;
  const h = 90;
  if (pixels.length < w * h) {
    fs.rmSync(ppm, { force: true });
    return 0;
  }

  const at = (x, y) => pixels[y * w + x];
  const lap = (x, y) => {
    const c = at(x, y);
    return Math.abs(4 * c - at(x - 1, y) - at(x + 1, y) - at(x, y - 1) - at(x, y + 1));
  };

  let center = 0;
  let centerN = 0;
  let full = 0;
  let fullN = 0;
  let sum = 0;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const e = lap(x, y);
      full += e;
      fullN++;
      sum += at(x, y);
      const inCenter = x >= w * 0.25 && x < w * 0.75 && y >= h * 0.15 && y < h * 0.85;
      if (inCenter) {
        center += e;
        centerN++;
      }
    }
  }

  // Detect bright, relatively flat corner blocks typical of livestream PiP slides.
  const cornerPenalty = (x0, y0, x1, y1) => {
    let s = 0;
    let n = 0;
    let edges = 0;
    for (let y = y0 + 1; y < y1 - 1; y++) {
      for (let x = x0 + 1; x < x1 - 1; x++) {
        s += at(x, y);
        n++;
        edges += lap(x, y);
      }
    }
    if (!n) return 0;
    const mean = s / n;
    const edgeAvg = edges / n;
    // Bright-ish panel with moderate/low internal edge density → likely a slide.
    if (mean > 140 && edgeAvg < 18) return 35;
    if (mean > 170 && edgeAvg < 28) return 22;
    return 0;
  };

  const pipPenalty =
    cornerPenalty(0, Math.floor(h * 0.45), Math.floor(w * 0.42), h) +
    cornerPenalty(Math.floor(w * 0.58), Math.floor(h * 0.45), w, h);

  fs.rmSync(ppm, { force: true });

  const mean = sum / (w * h);
  // Near-black or near-white / flat frames score poorly.
  if (mean < 18 || mean > 240) return 0;

  const centerAvg = center / Math.max(1, centerN);
  const fullAvg = full / Math.max(1, fullN);
  if (fullAvg < 2) return 0; // almost no detail

  // Close-ups concentrate edge energy in the center subject.
  const ratio = centerAvg / (fullAvg + 0.01);
  return Math.max(0, centerAvg * (0.65 + 0.35 * Math.min(ratio, 2)) - pipPenalty);
}

function grabOne({ id, t, slug, offset, keepCandidates, outDir }) {
  const preachAt = t + offset;
  console.log(`\n${id}: t=${t}s → preach seek ${preachAt}s (t+${offset})`);

  const streamUrl = getStreamUrl(id);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `sermon-still-${id}-`));
  const candidatesDir = path.join(os.tmpdir(), "sermon-stills-candidates", slug, id);

  if (keepCandidates) {
    fs.mkdirSync(candidatesDir, { recursive: true });
  }

  const scored = [];
  for (const delta of CANDIDATE_DELTAS) {
    const at = preachAt + delta;
    const name = `${id}+${offset + delta}s.jpg`;
    const tmpPath = path.join(tmp, name);
    process.stdout.write(`  frame @ ${at}s (+${delta} from preach)… `);
    try {
      extractFrame(streamUrl, at, tmpPath);
      const score = scoreCloseUp(tmpPath);
      scored.push({ at, delta, path: tmpPath, score });
      console.log(`ok (score ${score.toFixed(1)})`);
      if (keepCandidates) {
        fs.copyFileSync(tmpPath, path.join(candidatesDir, name));
      }
    } catch (e) {
      console.log(`fail (${e.message.slice(0, 120)})`);
    }
  }

  if (scored.length === 0) {
    fs.rmSync(tmp, { recursive: true, force: true });
    throw new Error(`No frames extracted for ${id}`);
  }

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  const dest = path.join(outDir, `${id}.jpg`);
  fs.copyFileSync(best.path, dest);
  fs.rmSync(tmp, { recursive: true, force: true });

  console.log(`  → ${path.relative(root, dest)} (picked ${best.at}s, delta +${best.delta}s, score ${best.score.toFixed(1)})`);
  if (keepCandidates) {
    console.log(`  candidates: ${candidatesDir}`);
  }
  return { id, preachAt, pickedAt: best.at, delta: best.delta, dest };
}

function main() {
  requireBin("yt-dlp");
  requireBin("ffmpeg");

  const { slug, offset, keepCandidates, urls } = parseArgs(process.argv.slice(2));
  const outDir = path.join(root, "public", "sermons", slug);
  fs.mkdirSync(outDir, { recursive: true });

  const results = [];
  for (const url of urls) {
    const { id, t } = parseYouTube(url);
    results.push(grabOne({ id, t, slug, offset, keepCandidates, outDir }));
  }

  console.log("\nDone. Point MDX `image` fields at:");
  for (const r of results) {
    console.log(`  /sermons/${slug}/${r.id}.jpg  (frame @ ${r.pickedAt}s)`);
  }
}

main();
