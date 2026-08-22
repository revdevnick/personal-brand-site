"use client";

import { useEffect, useRef } from "react";
import { MARKS, TRAVEL_ORIGIN, TRAVEL_PACIFIC, TRAVEL_TURN } from "@/lib/marks";
import { TRAIL_CAP, buildRoute, fillTrail } from "@/lib/travel";

const MARK_CAP = 128;

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform sampler2D u_map;
uniform vec2 u_res;
uniform float u_rot;
uniform float u_markAlpha;
uniform vec2 u_pts[${MARK_CAP}];
uniform vec4 u_trail[${TRAIL_CAP}];
uniform vec3 u_light;

const float PI = 3.14159265359;

mat3 rotX(float a) {
  float c = cos(a), s = sin(a);
  return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
}

mat3 rotY(float a) {
  float c = cos(a), s = sin(a);
  return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / (min(u_res.x, u_res.y) * 0.5);
  float r = length(p);
  float alpha = 1.0 - smoothstep(0.991, 1.0, r);
  if (alpha < 0.004) discard;

  float z = sqrt(max(0.0, 1.0 - min(r * r, 1.0)));
  vec3 n = normalize(vec3(p.x, p.y, z));

  // North up, slight look from ~12°N. Negative X is west, so the Americas sit left of Africa.
  vec3 e = rotY(-u_rot) * rotX(0.21) * n;

  float lon = atan(e.x, e.z);
  float lat = asin(clamp(e.y, -1.0, 1.0));
  vec2 uv = vec2(lon / (2.0 * PI) + 0.5, 0.5 - lat / PI);
  vec3 ink = texture2D(u_map, uv).rgb;
  float line = max(ink.r, max(ink.g, ink.b));

  vec3 light = normalize(u_light);
  float ndotl = dot(n, light);
  float day = smoothstep(-0.18, 0.38, ndotl);
  float terminator = exp(-pow(ndotl * 3.4, 2.0));
  float fresnel = pow(clamp(1.0 - n.z, 0.0, 1.0), 6.4);

  vec3 night = vec3(0.012, 0.012, 0.016);
  vec3 dusk = vec3(0.038, 0.032, 0.028);
  vec3 base = mix(night, dusk, day);
  base *= mix(1.0, 0.62, pow(1.0 - n.z, 1.15));

  vec3 lineCol = vec3(0.62, 0.59, 0.52);
  vec3 color = base + lineCol * line * mix(0.08, 0.38, day);

  float pxScale = min(u_res.x, u_res.y) * 0.5;
  float ribbon = 0.0;
  float comet = 0.0;
  vec3 prevMv = vec3(0.0);
  float prevW = 0.0;
  for (int i = 0; i < ${TRAIL_CAP}; i++) {
    vec4 s = u_trail[i];
    if (s.w < 0.02) {
      prevW = 0.0;
      continue;
    }
    vec3 mv = rotX(-0.21) * rotY(u_rot) * s.xyz;
    if (mv.z < 0.12) {
      prevW = 0.0;
      continue;
    }
    float facing = smoothstep(0.12, 0.9, mv.z);
    float rad = mix(0.45, 1.9, s.w) * mix(0.55, 1.0, facing);
    float px = length(p - mv.xy) * pxScale;
    ribbon = max(ribbon, (1.0 - smoothstep(rad * 0.5, rad, px)) * s.w * facing);
    if (i == 0) {
      comet = max(comet, (1.0 - smoothstep(1.1, 2.8, px)) * facing);
    }
    if (prevW > 0.02 && prevMv.z > 0.12) {
      vec2 ab = mv.xy - prevMv.xy;
      float ab2 = dot(ab, ab);
      if (ab2 > 0.0000002 && ab2 < 0.12) {
        float h = clamp(dot(p - prevMv.xy, ab) / ab2, 0.0, 1.0);
        float seg = length(p - prevMv.xy - ab * h) * pxScale;
        float lw = mix(0.4, 1.55, 0.5 * (s.w + prevW)) * mix(0.5, 1.0, min(facing, smoothstep(0.12, 0.9, prevMv.z)));
        ribbon = max(ribbon, (1.0 - smoothstep(lw * 0.35, lw, seg)) * 0.5 * (s.w + prevW));
      }
    }
    prevMv = mv;
    prevW = s.w;
  }

  float period = 0.0;
  for (int i = 0; i < ${MARK_CAP}; i++) {
    vec2 ml = u_pts[i];
    if (ml.x < 9.0) {
      vec3 m = vec3(cos(ml.y) * sin(ml.x), sin(ml.y), cos(ml.y) * cos(ml.x));
      vec3 mv = rotX(-0.21) * rotY(u_rot) * m;
      if (mv.z > 0.1) {
        float facing = smoothstep(0.1, 0.92, mv.z);
        float rad = mix(0.55, 2.3, facing);
        float px = length(p - mv.xy) * pxScale;
        float disc = 1.0 - smoothstep(rad * 0.68, rad, px);
        float dim = mix(0.16, 1.0, facing * facing);
        period = max(period, disc * dim);
      }
    }
  }
  vec3 periodCol = vec3(0.957, 0.937, 0.894);
  color = mix(color, periodCol, period * u_markAlpha * mix(0.55, 1.0, day));

  vec3 trailCol = vec3(0.93, 0.78, 0.5);
  vec3 headCol = vec3(1.0, 0.94, 0.8);
  float lit = mix(0.42, 1.0, day);
  color = mix(color, trailCol, ribbon * u_markAlpha * lit * 0.85);
  color = mix(color, headCol, comet * u_markAlpha * lit);

  color += vec3(0.55, 0.68, 0.98) * fresnel * 0.2;
  color += vec3(0.92, 0.58, 0.32) * terminator * 0.1;
  color += vec3(0.9, 0.86, 0.78) * pow(max(ndotl, 0.0), 8.0) * 0.08;

  gl_FragColor = vec4(color, alpha);
}
`;

const MAP_W = 2048;
const MAP_H = 1024;
const SPIN_SECONDS = 88;
const START_ROT = 0.25;

type Ring = number[][];

function lonToX(lon: number, w: number) {
  return ((lon + 180) / 360) * w;
}

function latToY(lat: number, h: number) {
  return ((90 - lat) / 180) * h;
}

function ringWraps(ring: Ring, w: number) {
  let prev = lonToX(ring[0][0], w);
  for (let i = 1; i < ring.length; i++) {
    const x = lonToX(ring[i][0], w);
    if (Math.abs(x - prev) > w * 0.5) return true;
    prev = x;
  }
  return false;
}

function strokeRing(ctx: CanvasRenderingContext2D, ring: Ring, w: number, h: number) {
  if (ring.length < 2) return;
  ctx.beginPath();
  let moved = false;
  let prevX: number | null = null;
  for (const [lon, lat] of ring) {
    const x = lonToX(lon, w);
    const y = latToY(lat, h);
    if (prevX !== null && Math.abs(x - prevX) > w * 0.5) {
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
      moved = true;
    } else if (!moved) {
      ctx.moveTo(x, y);
      moved = true;
    } else {
      ctx.lineTo(x, y);
    }
    prevX = x;
  }
  ctx.stroke();
}

function fillRing(ctx: CanvasRenderingContext2D, ring: Ring, w: number, h: number) {
  if (ring.length < 3 || ringWraps(ring, w)) return;
  ctx.beginPath();
  ring.forEach(([lon, lat], i) => {
    const x = lonToX(lon, w);
    const y = latToY(lat, h);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fill();
}

function drawGeometry(ctx: CanvasRenderingContext2D, geometry: { type: string; coordinates: unknown }, w: number, h: number) {
  if (geometry.type === "Polygon") {
    const rings = geometry.coordinates as Ring[];
    rings.forEach((ring) => fillRing(ctx, ring, w, h));
    rings.forEach((ring) => strokeRing(ctx, ring, w, h));
    return;
  }
  if (geometry.type === "MultiPolygon") {
    const polys = geometry.coordinates as Ring[][];
    polys.forEach((rings) => rings.forEach((ring) => fillRing(ctx, ring, w, h)));
    polys.forEach((rings) => rings.forEach((ring) => strokeRing(ctx, ring, w, h)));
  }
}

async function loadOutlineTexture(gl: WebGLRenderingContext) {
  const res = await fetch("/countries-110m.json");
  const collection = (await res.json()) as {
    features: { geometry: { type: string; coordinates: unknown } }[];
  };

  const scratch = document.createElement("canvas");
  scratch.width = MAP_W;
  scratch.height = MAP_H;
  const ctx = scratch.getContext("2d");
  if (!ctx) throw new Error("globe map canvas failed");
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, MAP_W, MAP_H);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgb(168,162,150)";
  ctx.fillStyle = "rgba(244,239,228,0.04)";
  ctx.lineWidth = 1.15;

  collection.features.forEach((feature) => {
    if (feature.geometry) drawGeometry(ctx, feature.geometry, MAP_W, MAP_H);
  });

  const texture = gl.createTexture();
  if (!texture) throw new Error("globe texture failed");
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, scratch);
  return texture;
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function HeroGlobe({ marksOn = false }: { marksOn?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const marksOnRef = useRef(marksOn);
  marksOnRef.current = marksOn;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      depth: false,
      stencil: false,
    });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uMap = gl.getUniformLocation(program, "u_map");
    const uRes = gl.getUniformLocation(program, "u_res");
    const uRot = gl.getUniformLocation(program, "u_rot");
    const uMarkAlpha = gl.getUniformLocation(program, "u_markAlpha");
    const uLight = gl.getUniformLocation(program, "u_light");
    const trailLoc = gl.getUniformLocation(program, "u_trail[0]") ?? gl.getUniformLocation(program, "u_trail");
    gl.uniform1i(uMap, 0);
    gl.uniform3f(uLight, -0.42, 0.48, 0.76);

    const pts = new Float32Array(MARK_CAP * 2);
    pts.fill(10);
    MARKS.forEach(([lon, lat], i) => {
      pts[i * 2] = (lon * Math.PI) / 180;
      pts[i * 2 + 1] = (lat * Math.PI) / 180;
    });
    const ptsLoc = gl.getUniformLocation(program, "u_pts[0]") ?? gl.getUniformLocation(program, "u_pts");
    if (ptsLoc) gl.uniform2fv(ptsLoc, pts);

    const route = buildRoute(MARKS, TRAVEL_ORIGIN, TRAVEL_TURN, TRAVEL_PACIFIC);
    const trail = new Float32Array(TRAIL_CAP * 4);

    const placeholder = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, placeholder);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    let mapTex = placeholder;
    let markAlpha = 0;
    let travelTime = 0;
    let lastNow = 0;
    let alive = true;
    let playing = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      const css = canvas.clientWidth || 512;
      const size = Math.max(280, Math.min(900, Math.round(css * dpr)));
      if (canvas.width !== size || canvas.height !== size) {
        canvas.width = size;
        canvas.height = size;
        gl.viewport(0, 0, size, size);
      }
    };

    const draw = (rot: number, now: number) => {
      fit();
      const target = marksOnRef.current ? 1 : 0;
      markAlpha += (target - markAlpha) * 0.055;
      const dt = lastNow ? Math.min(0.05, (now - lastNow) / 1000) : 0;
      lastNow = now;
      if (!marksOnRef.current || markAlpha < 0.62) {
        travelTime = 0;
        trail.fill(0);
      } else if (playing) {
        travelTime += dt;
        fillTrail(route, travelTime, trail);
      }
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uRot, rot);
      gl.uniform1f(uMarkAlpha, markAlpha);
      if (trailLoc) gl.uniform4fv(trailLoc, trail);
      gl.bindTexture(gl.TEXTURE_2D, mapTex);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const tick = (now: number) => {
      if (!alive) return;
      const rot = START_ROT + ((now / 1000) * Math.PI * 2) / SPIN_SECONDS;
      draw(rot, now);
      if (playing && !document.hidden) raf = requestAnimationFrame(tick);
    };

    const onVis = () => {
      if (!playing) return;
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(tick);
    };

    void loadOutlineTexture(gl)
      .then((texture) => {
        if (!alive) {
          gl.deleteTexture(texture);
          return;
        }
        mapTex = texture;
        if (!playing) draw(START_ROT, 0);
      })
      .catch(() => undefined);

    window.addEventListener("resize", fit);
    document.addEventListener("visibilitychange", onVis);
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    fit();
    if (playing) raf = requestAnimationFrame(tick);
    else draw(START_ROT, 0);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
      document.removeEventListener("visibilitychange", onVis);
      ro.disconnect();
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
      gl.deleteTexture(placeholder);
      if (mapTex !== placeholder) gl.deleteTexture(mapTex);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-globe-canvas" aria-hidden />;
}
