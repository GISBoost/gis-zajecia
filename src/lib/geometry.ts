// Port of TransitGeometry from transit-index/design/components/transit/LineBundle.jsx.
// Waypoints -> tangent arcs -> per-line offsets; arcs of every offset line share the
// centreline's arc centre, so bundles stay concentric through bends (0/45/90° only).
export type Pt = [number, number];

const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
const mul = (a: Pt, k: number): Pt => [a[0] * k, a[1] * k];
const unit = (v: Pt): Pt => {
  const l = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / l, v[1] / l];
};
const dot = (a: Pt, b: Pt) => a[0] * b[0] + a[1] * b[1];
const f = (n: number) => Math.round(n * 100) / 100;
const angle = (d1: Pt, d2: Pt) => Math.acos(Math.max(-1, Math.min(1, dot(d1, d2))));

function clean(pts: Pt[]): Pt[] {
  const out: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i];
    const q = out[out.length - 1];
    if (Math.hypot(p[0] - q[0], p[1] - q[1]) < 1e-6) continue;
    if (out.length >= 2) {
      const d1 = unit(sub(q, out[out.length - 2]));
      const d2 = unit(sub(p, q));
      if (Math.abs(d1[0] * d2[1] - d1[1] * d2[0]) < 1e-6 && dot(d1, d2) > 0) {
        out[out.length - 1] = p;
        continue;
      }
    }
    out.push(p);
  }
  return out;
}

function radii(c: Pt[], radius: number): number[] {
  const rs: number[] = [];
  for (let i = 1; i < c.length - 1; i++) {
    const d1 = unit(sub(c[i], c[i - 1]));
    const d2 = unit(sub(c[i + 1], c[i]));
    const tn = Math.tan(angle(d1, d2) / 2);
    const lp = Math.hypot(...sub(c[i], c[i - 1])) * (i === 1 ? 1 : 0.5);
    const ln = Math.hypot(...sub(c[i + 1], c[i])) * (i === c.length - 2 ? 1 : 0.5);
    rs.push(tn > 1e-6 ? Math.min(radius, Math.min(lp, ln) / tn) : radius);
  }
  return rs;
}

function offsetPts(c: Pt[], o: number): Pt[] {
  const n = c.length;
  const dirs: Pt[] = [];
  for (let i = 0; i < n - 1; i++) dirs.push(unit(sub(c[i + 1], c[i])));
  const nr = dirs.map((d) => [-d[1], d[0]] as Pt);
  return c.map((p, i) => {
    if (i === 0) return add(p, mul(nr[0], o));
    if (i === n - 1) return add(p, mul(nr[n - 2], o));
    const m = add(nr[i - 1], nr[i]);
    const k = 1 + dot(nr[i - 1], nr[i]);
    return add(p, mul(m, o / k));
  });
}

function toPath(p: Pt[], rs: number[]): string {
  let d = 'M' + f(p[0][0]) + ' ' + f(p[0][1]);
  for (let i = 1; i < p.length - 1; i++) {
    const d1 = unit(sub(p[i], p[i - 1]));
    const d2 = unit(sub(p[i + 1], p[i]));
    const th = angle(d1, d2);
    const r = rs[i - 1];
    if (th < 1e-4 || r <= 0) {
      d += ' L' + f(p[i][0]) + ' ' + f(p[i][1]);
      continue;
    }
    const t = r * Math.tan(th / 2);
    const A = sub(p[i], mul(d1, t));
    const B = add(p[i], mul(d2, t));
    const cr = d1[0] * d2[1] - d1[1] * d2[0];
    d += ' L' + f(A[0]) + ' ' + f(A[1]) + ' A' + f(r) + ' ' + f(r) + ' 0 0 ' + (cr > 0 ? 1 : 0) + ' ' + f(B[0]) + ' ' + f(B[1]);
  }
  const e = p[p.length - 1];
  return d + ' L' + f(e[0]) + ' ' + f(e[1]);
}

function bundle(points: Pt[], offsets: number[] = [0], radius = 40): string[] {
  const c = clean(points);
  if (c.length < 2) return offsets.map(() => '');
  const rs = radii(c, radius);
  const dirs: Pt[] = [];
  for (let i = 0; i < c.length - 1; i++) dirs.push(unit(sub(c[i + 1], c[i])));
  const nr = dirs.map((d) => [-d[1], d[0]] as Pt);
  return offsets.map((o) => {
    const p = offsetPts(c, o);
    const r2 = rs.map((r, i) => {
      const s = dot(nr[i], dirs[i + 1]) > 0 ? 1 : -1;
      return Math.max(0.01, r - o * s);
    });
    return toPath(p, r2);
  });
}

export const TransitGeometry = {
  bundle,
  path: (pts: Pt[], radius = 40) => bundle(pts, [0], radius)[0],
};
