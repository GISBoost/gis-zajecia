// Port of transit-index/design/ui_kits/landing/journey.js.
// A 5-line bundle enters the hero from the right, then runs down the page through a
// station node at every [data-station]; between stations the two sub-bundles swing across
// the corridor and cross with paper casings. Draw-on is scrubbed by ScrollTrigger and a
// "vehicle" head rides the lead line. Reduced motion -> static, fully drawn lines.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TransitGeometry as TG, type Pt } from '../lib/geometry';

gsap.registerPlugin(ScrollTrigger);

const SVGNS = 'http://www.w3.org/2000/svg';
const KEYS_A = ['vermilion', 'orange', 'yellow'];
const KEYS_B = ['sky', 'blue'];
const DEL = [0, 0.035, 0.07, 0.02, 0.055];

type Part = { cas: SVGPathElement; lines: (SVGPathElement & { _L?: number })[] };

let triggers: ScrollTrigger[] = [];
let tweens: gsap.core.Animation[] = [];
let entryDone = false;
let timer: number | undefined;
let lastW = window.innerWidth;

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function mk<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, parent?: Element) {
  const e = document.createElementNS(SVGNS, tag);
  for (const k in attrs) e.setAttribute(k, String(attrs[k]));
  if (parent) parent.appendChild(e);
  return e;
}

function build() {
  const svg = document.getElementById('journey') as SVGSVGElement | null;
  if (!svg) return;
  triggers.forEach((t) => t.kill());
  tweens.forEach((t) => t.kill());
  triggers = [];
  tweens = [];
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  svg.style.height = '0px';

  const W = document.documentElement.clientWidth;
  const H = document.documentElement.scrollHeight;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.style.width = W + 'px';
  svg.style.height = H + 'px';

  const edge = document.querySelector('[data-content-edge]');
  const cr = edge ? edge.getBoundingClientRect().right : W * 0.6;
  let w = 10;
  let g = 4;
  let bw = 5 * w + 4 * g;
  const cs = cr + 56 + bw / 2;
  const ce = Math.max(cs, W - 40 - bw / 2);
  // Same breakpoint as the CSS layout; a narrow desktop corridor still keeps two lanes.
  const mobile = W <= 860;
  if (mobile) {
    w = 4;
    g = 2;
    bw = 5 * w + 4 * g;
  }
  const s = w + g;
  const r = bw * 1.6;
  const lanes: Record<string, number> = mobile ? { L: 14 + bw / 2, R: 14 + bw / 2 } : { L: cs, R: ce };
  const st = Array.from(document.querySelectorAll<HTMLElement>('[data-station]')).map((e) => {
    const b = e.getBoundingClientRect();
    return {
      y: Math.round(b.top + window.scrollY + b.height / 2),
      x: lanes[e.dataset.lane || 'R'],
      term: e.hasAttribute('data-terminus'),
      label: (e.textContent || '').trim(),
    };
  });
  // A lane switch needs a 45° run of |dx| plus room for the bends. When two stations are too
  // close vertically, keep the previous lane instead of overshooting and looping back up.
  for (let k = 1; k < st.length; k++) {
    if (Math.abs(st[k].x - st[k - 1].x) + 2 * r > st[k].y - st[k - 1].y) st[k].x = st[k - 1].x;
  }
  if (st.length < 2) return;

  const root = mk('g', {}, svg);
  const nodes = mk('g', {}, svg);

  function bundle(parent: Element, main: Pt[], lineOffs: number[], casingOff: number, keys: string[]): Part {
    const gEl = mk('g', { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, parent);
    const cas = mk('path', { d: TG.bundle(main, [casingOff], r)[0], 'stroke-width': keys.length * w + (keys.length - 1) * g + 2 * g }, gEl);
    cas.style.stroke = 'var(--paper)';
    const lines = TG.bundle(main, lineOffs, r).map((d, j) => {
      const p = mk('path', { d, 'stroke-width': w }, gEl);
      p.style.stroke = `var(--line-${keys[j]})`;
      return p;
    });
    return { cas, lines };
  }

  const s0 = st[0];
  const ey = Math.max(96, s0.y - r * 2.4);
  const entryMain: Pt[] = mobile ? [[s0.x, -20], [s0.x, s0.y]] : [[W + bw, ey], [s0.x, ey], [s0.x, s0.y]];
  const eA = bundle(root, entryMain, [2 * s, s, 0], s, KEYS_A);
  const eB = bundle(root, entryMain, [-s, -2 * s], -1.5 * s, KEYS_B);

  const segs: { a: (typeof st)[0]; b: (typeof st)[0]; A: Part; B: Part }[] = [];
  const cA = -s;
  const cB = 1.5 * s;
  for (let k = 0; k < st.length - 1; k++) {
    const a = st[k];
    const b = st[k + 1];
    const h = b.y - a.y;
    const dx = b.x - a.x;
    const adx = Math.abs(dx);
    let mA: Pt[];
    let mB: Pt[];
    if (adx < 1) {
      mA = [[a.x + cA, a.y], [a.x + cA, b.y]];
      mB = [[a.x + cB, a.y], [a.x + cB, b.y]];
    } else {
      let yL = a.y + Math.max(r, h * 0.2);
      let yF = yL + Math.max(bw * 2.2, h * 0.18);
      if (yF + adx + r > b.y) {
        yF = b.y - adx - r;
        yL = Math.min(yL, yF - bw * 2.2);
        if (yL < a.y + r * 0.6) yL = yF = a.y + Math.max(r * 0.6, (h - adx) / 2);
      }
      const leadA = dx > 0;
      const ya = leadA ? yL : yF;
      const yb = leadA ? yF : yL;
      mA = [[a.x + cA, a.y], [a.x + cA, ya], [b.x + cA, ya + adx], [b.x + cA, b.y]];
      mB = [[a.x + cB, a.y], [a.x + cB, yb], [b.x + cB, yb + adx], [b.x + cB, b.y]];
    }
    const grp = mk('g', {}, root);
    let pA: Part;
    let pB: Part;
    if (k % 2 === 0) {
      pB = bundle(grp, mB, [s / 2, -s / 2], 0, KEYS_B);
      pA = bundle(grp, mA, [s, 0, -s], 0, KEYS_A);
    } else {
      pA = bundle(grp, mA, [s, 0, -s], 0, KEYS_A);
      pB = bundle(grp, mB, [s / 2, -s / 2], 0, KEYS_B);
    }
    segs.push({ a, b, A: pA, B: pB });
  }

  st.forEach((p) => {
    const hh = w + 14;
    const rc = mk('rect', { x: p.x - bw / 2 - 9, y: p.y - hh / 2, width: bw + 18, height: hh, rx: hh / 2, 'stroke-width': mobile ? 2 : 3 }, nodes);
    rc.style.fill = p.term ? 'var(--ink)' : 'var(--paper)';
    rc.style.stroke = 'var(--ink)';
    // The terminus is named on the line itself, beside its node (left on desktop, right on mobile).
    if (p.term && p.label) {
      const t = mk('text', { y: p.y, 'dominant-baseline': 'central', 'font-size': 15, 'font-weight': 700, 'letter-spacing': 1.2 }, nodes);
      t.textContent = p.label.toUpperCase();
      t.style.fontFamily = 'var(--font-condensed)';
      t.style.fill = 'var(--ink)';
      const gap = bw / 2 + 9 + 14;
      t.setAttribute('x', String(mobile ? p.x + gap : p.x - gap - t.getComputedTextLength()));
    }
  });
  const head = mk('g', { opacity: 0 }, nodes);
  const hc = mk('circle', { r: w * 1.15 }, head);
  const hi = mk('circle', { r: w * 0.45 }, head);
  hc.style.fill = 'var(--ink)';
  hi.style.fill = 'var(--paper)';

  if (reduced()) return;
  const vh = window.innerHeight;
  const prep = (p: SVGPathElement & { _L?: number }) => {
    const L = p.getTotalLength();
    p.style.strokeDasharray = `${L} ${L}`;
    p.style.strokeDashoffset = String(L);
    p._L = L;
    return p;
  };

  // Play the entry once; a rebuild (fonts, images loading) after it started draws it fully.
  if (!entryDone && window.scrollY < 10) {
    entryDone = true;
    const tl0 = gsap.timeline({ delay: 0.25 });
    [eA, eB].forEach((part, bi) => {
      prep(part.cas);
      tl0.to(part.cas, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, bi * 0.12);
      part.lines.forEach((p, j) => {
        prep(p);
        tl0.to(p, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, (bi * 3 + j) * 0.06);
      });
    });
    tweens.push(tl0);
  } else entryDone = true;

  segs.forEach((sg) => {
    const tl = gsap.timeline({ paused: true });
    [sg.A, sg.B].forEach((part, bi) => {
      const dl = part.lines.map((_, j) => DEL[bi * 3 + j]);
      const mn = Math.min(...dl);
      prep(part.cas);
      tl.to(part.cas, { strokeDashoffset: 0, duration: 1 - mn, ease: 'none' }, mn);
      part.lines.forEach((p, j) => {
        prep(p);
        tl.to(p, { strokeDashoffset: 0, duration: 1 - dl[j], ease: 'none' }, dl[j]);
      });
    });
    const lead = sg.A.lines[1];
    tl.eventCallback('onUpdate', () => {
      const p = (tl.progress() - DEL[1]) / (1 - DEL[1]);
      if (p > 0.002 && p < 0.998) {
        const pt = lead.getPointAtLength((lead._L || 0) * p);
        head.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
        head.setAttribute('opacity', '1');
      } else head.setAttribute('opacity', '0');
    });
    // The page cannot scroll past H - vh, so clamp the trigger: otherwise the last segment
    // never finishes drawing and stops short of the terminus.
    const maxScroll = Math.max(1, H - vh);
    const start = Math.min(Math.max(0, sg.a.y - vh * 0.6), maxScroll - 1);
    const end = Math.min(Math.max(start + 1, sg.b.y - vh * 0.6), maxScroll);
    triggers.push(ScrollTrigger.create({ start, end, animation: tl, scrub: 0.6 }));
    tweens.push(tl);
  });
}

let built = '';
export function schedule() {
  clearTimeout(timer);
  timer = window.setTimeout(() => {
    // Rebuild only when the layout really changed; a rebuild mid-scroll redraws every segment.
    const key = `${document.documentElement.clientWidth}x${document.documentElement.scrollHeight}:${reduced()}`;
    if (key === built) return;
    built = key;
    build();
    ScrollTrigger.refresh();
    // Jump straight to the current scroll position instead of scrubbing up from zero.
    triggers.forEach((t) => t.animation?.progress(t.progress));
  }, 160);
}

window.addEventListener('resize', () => {
  if (window.innerWidth !== lastW) {
    lastW = window.innerWidth;
    schedule();
  }
});
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', schedule);
window.addEventListener('load', schedule);
document.fonts?.ready.then(schedule);
// Images and <details> change page height: rebuild so stations line up again.
document.querySelectorAll('img').forEach((img) => img.addEventListener('load', schedule, { once: true }));
document.querySelectorAll('details').forEach((d) => d.addEventListener('toggle', schedule));
schedule();

// Reveal-on-scroll for blocks marked [data-reveal] (transform/opacity only).
if (!reduced()) {
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, { y: 28, opacity: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });
  gsap.utils.toArray<HTMLElement>('[data-bar]').forEach((el) => {
    gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });
}
