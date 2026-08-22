export const TRAIL_CAP = 48;

type Vec3 = readonly [number, number, number];

const SPEED = 0.233;
const MIN_HOP = 0.58;
const TAIL_SECONDS = 4.6;
const STEP_RAD = 0.028;
const EAST_PENALTY = 10;

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export function xyzFromLonLat(lon: number, lat: number): [number, number, number] {
  const λ = (lon * Math.PI) / 180;
  const φ = (lat * Math.PI) / 180;
  return [Math.cos(φ) * Math.sin(λ), Math.sin(φ), Math.cos(φ) * Math.cos(λ)];
}

function dot(a: Vec3, b: Vec3) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function ang(a: Vec3, b: Vec3) {
  return Math.acos(clamp(dot(a, b), -1, 1));
}

function slerp(a: Vec3, b: Vec3, t: number): [number, number, number] {
  const d = ang(a, b);
  if (d < 1e-5) return [a[0], a[1], a[2]];
  const s = Math.sin(d);
  const w0 = Math.sin((1 - t) * d) / s;
  const w1 = Math.sin(t * d) / s;
  return [a[0] * w0 + b[0] * w1, a[1] * w0 + b[1] * w1, a[2] * w0 + b[2] * w1];
}

function nearestIndex(pts: [number, number, number][], lonlat: readonly [number, number]) {
  const q = xyzFromLonLat(lonlat[0], lonlat[1]);
  let best = 0;
  let bestD = Infinity;
  pts.forEach((p, i) => {
    const d = ang(p, q);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}

function eastwardDeg(lon: number, fromLon: number) {
  return ((lon - fromLon) % 360 + 360) % 360;
}

function sweepWalk(pts: [number, number, number][], lons: number[], from: number, pool: number[]) {
  const left = new Set(pool);
  const order: number[] = [];
  let cur = from;
  while (left.size) {
    let minLon = Infinity;
    for (const i of left) minLon = Math.min(minLon, lons[i]);
    let best = -1;
    let bestCost = Infinity;
    for (const i of left) {
      const d = ang(pts[cur], pts[i]);
      const east = Math.max(0, lons[i] - minLon) * (Math.PI / 180);
      const cost = d + east * EAST_PENALTY;
      if (cost < bestCost) {
        bestCost = cost;
        best = i;
      }
    }
    left.delete(best);
    order.push(best);
    cur = best;
  }
  return order;
}

export type Route = {
  pts: [number, number, number][];
  segs: { a: number; b: number; len: number; dur: number }[];
  total: number;
};

export function buildRoute(
  marks: readonly [number, number][],
  origin: readonly [number, number],
  turn: readonly [number, number],
  pacific: readonly [number, number],
): Route {
  const pts = marks.map(([lon, lat]) => xyzFromLonLat(lon, lat));
  const lons = marks.map(([lon]) => lon);
  const start = nearestIndex(pts, origin);
  const gate = nearestIndex(pts, turn);
  const coast = nearestIndex(pts, pacific);
  const rest = marks.map((_, i) => i).filter((i) => i !== start && i !== gate && i !== coast);
  const landfall = rest.filter((i) => {
    const [lon, lat] = marks[i];
    return lon > 28 && lon < 48 && lat > -15 && lat < 8;
  });
  const landfallSet = new Set(landfall);
  const east = rest.filter((i) => eastwardDeg(marks[i][0], turn[0]) < 180 && !landfallSet.has(i));
  const west = rest.filter((i) => eastwardDeg(marks[i][0], turn[0]) >= 180);
  const order = [
    start,
    gate,
    ...sweepWalk(pts, lons, gate, landfall),
  ];
  const afterLand = order[order.length - 1];
  order.push(...sweepWalk(pts, lons, afterLand, east));
  order.push(coast, ...sweepWalk(pts, lons, coast, west));
  const segs = order.map((a, i) => {
    const b = order[(i + 1) % order.length];
    const len = Math.max(ang(pts[a], pts[b]), 1e-4);
    return { a, b, len, dur: Math.max(MIN_HOP, len / SPEED) };
  });
  const total = segs.reduce((sum, seg) => sum + seg.dur, 0);
  return { pts, segs, total };
}

function locate(route: Route, time: number) {
  let t = ((time % route.total) + route.total) % route.total;
  for (let i = 0; i < route.segs.length; i++) {
    const seg = route.segs[i];
    if (t <= seg.dur) {
      return { i, u: t / seg.dur, tIn: t, seg };
    }
    t -= seg.dur;
  }
  const last = route.segs.length - 1;
  return { i: last, u: 1, tIn: route.segs[last].dur, seg: route.segs[last] };
}

function pushSample(
  out: Float32Array,
  slot: number,
  pos: [number, number, number],
  strength: number,
) {
  const o = slot * 4;
  out[o] = pos[0];
  out[o + 1] = pos[1];
  out[o + 2] = pos[2];
  out[o + 3] = strength;
}

export function fillTrail(route: Route, time: number, out: Float32Array) {
  out.fill(0);
  if (time <= 0) return;
  const at = locate(route, time);
  const a = route.pts[at.seg.a];
  const b = route.pts[at.seg.b];
  let slot = 0;
  const fade = (age: number) => clamp(1 - age / TAIL_SECONDS, 0, 1) ** 1.2;

  pushSample(out, slot, slerp(a, b, at.u), 1);
  slot += 1;

  let age = 0;
  const emitHop = (from: Vec3, to: Vec3, fromU: number, toU: number, len: number, hopDur: number) => {
    const span = Math.abs(fromU - toU) * len;
    const steps = Math.max(2, Math.ceil(span / STEP_RAD));
    for (let s = 1; s <= steps && slot < TRAIL_CAP && age < TAIL_SECONDS; s++) {
      const frac = s / steps;
      const uu = fromU + (toU - fromU) * frac;
      age += (hopDur * Math.abs(fromU - toU)) / steps;
      pushSample(out, slot, slerp(from, to, uu), fade(age));
      slot += 1;
    }
  };

  emitHop(a, b, at.u, 0, at.seg.len, at.seg.dur);

  let si = (at.i - 1 + route.segs.length) % route.segs.length;
  while (slot < TRAIL_CAP && age < TAIL_SECONDS && si !== at.i) {
    const hop = route.segs[si];
    emitHop(route.pts[hop.a], route.pts[hop.b], 1, 0, hop.len, hop.dur);
    si = (si - 1 + route.segs.length) % route.segs.length;
  }
}
