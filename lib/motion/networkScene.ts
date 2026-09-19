// The hero backdrop: stacked glass layers, each holding a network of
// community members, linked across the layers, in gold on obsidian. It is drawn
// live, not played from a video, so it never restarts or hitches.
//
// Every motion is a whole-number harmonic of SCENE_PERIOD seconds, so the scene at
// time T is exactly the scene at time 0. Running the clock round and round is
// therefore continuous by construction (there is no loop point to notice).

export const SCENE_PERIOD = 12;

const TAU = Math.PI * 2;
const CAM = 1500;
const PW = 520;
const PH = 300;
const LAYER_Z = [-230, 0, 230];

const fract = (v: number) => v - Math.floor(v);

interface Node {
  bx: number;
  by: number;
  ax: number;
  ay: number;
  k1: number;
  k2: number;
  p1: number;
  p2: number;
  member: boolean;
}
interface Edge {
  a: number;
  b: number;
  pulse: boolean;
  n: number;
  p0: number;
  gold: boolean;
}
interface Layer {
  z: number;
  k: number;
  nodes: Node[];
  edges: Edge[];
}
interface Link {
  k: number;
  a: number;
  b: number;
  p0: number;
}
interface Dust {
  x: number;
  y: number;
  n: number;
  sway: number;
  ph: number;
  r: number;
}
interface P {
  x: number;
  y: number;
  f: number;
}

export type SpriteFactory = (rgb: string, size: number) => CanvasImageSource;

/** Soft glowing dot, drawn once and reused instead of paying for a blur every frame. */
export const domSprite: SpriteFactory = (rgb, size) => {
  const s = document.createElement("canvas");
  s.width = s.height = size;
  const g = s.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, `rgba(${rgb},1)`);
  grad.addColorStop(0.25, `rgba(${rgb},0.55)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return s;
};

export interface Scene {
  draw(t: number): void;
  resize(w: number, h: number): void;
}

export function createNetworkScene(ctx: CanvasRenderingContext2D, width: number, height: number, makeSprite: SpriteFactory = domSprite): Scene {
  let W = width;
  let H = height;
  let portrait = H > W;
  let S = 1;
  let yOff = 0;
  const layout = () => {
    portrait = H > W;
    S = portrait ? (W / 1280) * 1.7 : Math.min(W / 1280, H / 720) * 1.05;
    yOff = portrait ? -H * 0.02 : 0;
  };
  layout();

  // Fixed seed: the same community layout every time, on every device.
  let seed = 20260919;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;

  const GOLD = makeSprite("224,196,138", 96);
  const CHAMP = makeSprite("242,230,201", 96);

  const layers: Layer[] = LAYER_Z.map((z, k) => {
    const nodes: Node[] = [];
    let guard = 0;
    while (nodes.length < 26 && guard++ < 2000) {
      const bx = (rnd() * 2 - 1) * PW * 0.92;
      const by = (rnd() * 2 - 1) * PH * 0.9;
      if (nodes.every((n) => Math.hypot(n.bx - bx, n.by - by) > 105)) {
        nodes.push({
          bx,
          by,
          ax: 10 + rnd() * 18,
          ay: 8 + rnd() * 16,
          k1: 1 + Math.floor(rnd() * 2),
          k2: 1 + Math.floor(rnd() * 2),
          p1: rnd() * TAU,
          p2: rnd() * TAU,
          member: nodes.length % 5 === 0,
        });
      }
    }
    const edges: Edge[] = [];
    const seen = new Set<string>();
    nodes.forEach((n, i) => {
      nodes
        .map((m, j) => ({ j, d: Math.hypot(n.bx - m.bx, n.by - m.by) }))
        .filter((o) => o.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2)
        .forEach((o) => {
          const key = i < o.j ? `${i}-${o.j}` : `${o.j}-${i}`;
          if (!seen.has(key)) {
            seen.add(key);
            edges.push({ a: i, b: o.j, pulse: rnd() < 0.6, n: 1 + Math.floor(rnd() * 2), p0: rnd(), gold: rnd() < 0.7 });
          }
        });
    });
    return { z, k, nodes, edges };
  });

  const links: Link[] = [];
  for (let k = 0; k < layers.length - 1; k++) {
    const lo = layers[k];
    const hi = layers[k + 1];
    lo.nodes
      .filter((n) => n.member || rnd() < 0.15)
      .forEach((n) => {
        let best = 0;
        let bd = 1e9;
        hi.nodes.forEach((m, j) => {
          const d = Math.hypot(n.bx - m.bx, n.by - m.by);
          if (d < bd) {
            bd = d;
            best = j;
          }
        });
        links.push({ k, a: lo.nodes.indexOf(n), b: best, p0: rnd() });
      });
  }

  const dust: Dust[] = Array.from({ length: 46 }, () => ({ x: rnd(), y: rnd(), n: 1 + Math.floor(rnd() * 2), sway: 6 + rnd() * 14, ph: rnd() * TAU, r: 0.8 + rnd() * 1.6 }));

  function project(x: number, y: number, z: number, th: number): P {
    const yaw = -0.3 + 0.05 * Math.sin(th);
    const e = 0.55 + 0.035 * Math.sin(th + 1.3);
    const x1 = x * Math.cos(yaw) - y * Math.sin(yaw);
    const y1 = x * Math.sin(yaw) + y * Math.cos(yaw);
    const up = y1 * Math.sin(e) + z * Math.cos(e);
    const depth = CAM + y1 * Math.cos(e) - z * Math.sin(e);
    const f = CAM / depth;
    return { x: W / 2 + x1 * f * S, y: H / 2 + yOff - up * f * S, f };
  }

  const pt = (L: Layer, i: number, th: number) => {
    const n = L.nodes[i];
    return project(n.bx + n.ax * Math.sin(n.k1 * th + n.p1), n.by + n.ay * Math.cos(n.k2 * th + n.p2), L.z, th);
  };

  function glow(spr: CanvasImageSource, p: { x: number; y: number }, size: number, alpha: number) {
    ctx.globalAlpha = alpha;
    ctx.drawImage(spr, p.x - size / 2, p.y - size / 2, size, size);
    ctx.globalAlpha = 1;
  }

  function draw(t: number) {
    const th = (t / SCENE_PERIOD) * TAU;
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0c0908");
    bg.addColorStop(1, "#1b140d");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // slow warm atmosphere
    ctx.globalCompositeOperation = "lighter";
    (
      [
        [0.22, 0.3, "224,196,138", 0.13, 0],
        [0.78, 0.55, "160,120,60", 0.16, 2.1],
        [0.5, 0.95, "242,230,201", 0.07, 4.2],
      ] as const
    ).forEach(([fx, fy, rgb, a, ph]) => {
      const cx = W * fx + Math.sin(th + ph) * W * 0.07;
      const cy = H * fy + Math.cos(th + ph) * H * 0.06;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.6);
      g.addColorStop(0, `rgba(${rgb},${a})`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    });
    ctx.globalCompositeOperation = "source-over";

    layers.forEach((L) => {
      const corners = (
        [
          [-PW, -PH],
          [PW, -PH],
          [PW, PH],
          [-PW, PH],
        ] as const
      ).map(([x, y]) => project(x, y, L.z, th));
      const poly = () => {
        ctx.beginPath();
        corners.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.closePath();
      };

      // the glass
      poly();
      ctx.fillStyle = "rgba(224,196,138,0.045)";
      ctx.fill();
      ctx.save();
      poly();
      ctx.clip();
      ctx.strokeStyle = "rgba(224,196,138,0.075)";
      ctx.lineWidth = 1;
      for (let gx = -PW; gx <= PW; gx += 130) {
        const a = project(gx, -PH, L.z, th);
        const b = project(gx, PH, L.z, th);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      for (let gy = -PH; gy <= PH; gy += 100) {
        const a = project(-PW, gy, L.z, th);
        const b = project(PW, gy, L.z, th);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      // a sheen that crosses the glass once per period, fully off it at both ends
      const xs = corners.map((p) => p.x);
      const bx0 = Math.min(...xs);
      const bw = Math.max(...xs) - bx0;
      const s = fract(t / SCENE_PERIOD + L.k * 0.33);
      const start = bx0 - bw * 0.4 + s * bw * 1.8;
      const sg = ctx.createLinearGradient(start, 0, start + bw * 0.4, 0);
      sg.addColorStop(0, "rgba(242,230,201,0)");
      sg.addColorStop(0.5, "rgba(242,230,201,0.10)");
      sg.addColorStop(1, "rgba(242,230,201,0)");
      ctx.fillStyle = sg;
      ctx.fillRect(bx0 - bw, 0, bw * 3, H);
      ctx.restore();
      poly();
      ctx.strokeStyle = "rgba(242,230,201,0.30)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // connections inside the layer
      L.edges.forEach((e) => {
        const a = pt(L, e.a, th);
        const b = pt(L, e.b, th);
        ctx.strokeStyle = `rgba(${e.gold ? "224,196,138" : "242,230,201"},0.22)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      });
      ctx.globalCompositeOperation = "lighter";
      L.edges.forEach((e) => {
        if (!e.pulse) return;
        const a = pt(L, e.a, th);
        const b = pt(L, e.b, th);
        const p = fract((th / TAU) * e.n + e.p0);
        glow(e.gold ? GOLD : CHAMP, { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p }, 15 * a.f * S * 1.3, 0.9);
      });
      // the members
      L.nodes.forEach((n, i) => {
        const p = pt(L, i, th);
        const pulse = 0.75 + 0.25 * Math.sin(th * n.k1 + n.p1);
        glow(n.member ? CHAMP : GOLD, p, (n.member ? 30 : 17) * p.f * S * pulse * 1.3, n.member ? 0.95 : 0.8);
      });
      ctx.globalCompositeOperation = "source-over";
      L.nodes.forEach((n, i) => {
        if (!n.member) return;
        const p = pt(L, i, th);
        ctx.strokeStyle = "rgba(242,230,201,0.55)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 9 * p.f * S * (1 + 0.15 * Math.sin(th + n.p2)), 0, TAU);
        ctx.stroke();
      });
    });

    // links that tie the community together across the glass
    ctx.lineWidth = 1;
    links.forEach((l) => {
      const a = pt(layers[l.k], l.a, th);
      const b = pt(layers[l.k + 1], l.b, th);
      ctx.strokeStyle = "rgba(242,230,201,0.17)";
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      const p = fract(th / TAU + l.p0);
      ctx.globalCompositeOperation = "lighter";
      glow(CHAMP, { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p }, 22 * S, 0.85);
      ctx.globalCompositeOperation = "source-over";
    });

    // drifting dust
    ctx.globalCompositeOperation = "lighter";
    dust.forEach((d) => {
      const y = fract(d.y - (th / TAU) * d.n) * H; // whole screens per period, so it wraps seamlessly
      const x = d.x * W + Math.sin(th + d.ph) * d.sway;
      glow(GOLD, { x, y }, d.r * 7, 0.35 + 0.25 * Math.sin(th * 2 + d.ph));
    });
    ctx.globalCompositeOperation = "source-over";

    // a soft vignette keeps the edges dark
    const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
    v.addColorStop(0, "rgba(8,6,5,0)");
    v.addColorStop(1, "rgba(8,6,5,0.6)");
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
  }

  return {
    draw,
    resize(w: number, h: number) {
      W = w;
      H = h;
      layout();
    },
  };
}
