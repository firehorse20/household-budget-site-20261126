// Hand-written SVG charts for Home Ledger. No library: each function takes
// plain data and returns an SVG string. Bars and donuts are used for money;
// lines for the six-month trend. Every chart has a table twin on its page.

const INK = '#123524';
const TEAL = '#0b6e4f';
const AMBER = '#b45309';
const CORAL = '#b91c1c';
const GRID = '#e4e0d4';
const MUTED = '#5d6b60';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function niceMax(v) {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / p;
  const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nf * p;
}

function niceMin(v) {
  if (v >= 0) return 0;
  const p = Math.pow(10, Math.floor(Math.log10(-v)));
  const f = -v / p;
  const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return -nf * p;
}

function frame(w, h) {
  return { w, h, padL: 64, padR: 14, padT: 14, padB: 30 };
}

// A line chart. points: [{x: label, y: number}]. opts: {unit, color}
export function lineChart(points, opts = {}) {
  const { w = 720, h = 300 } = opts;
  const f = frame(w, h);
  const iw = f.w - f.padL - f.padR;
  const ih = f.h - f.padT - f.padB;
  const ys = points.map((p) => p.y);
  const lo = niceMin(Math.min(...ys));
  const hi = niceMax(Math.max(...ys));
  const span = hi - lo || 1;
  const xAt = (i) => f.padL + (points.length === 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const yAt = (v) => f.padT + ih - ((v - lo) / span) * ih;
  let g = '';
  for (let t = 0; t <= 4; t++) {
    const v = lo + (span * t) / 4;
    const y = yAt(v);
    g += `<line x1="${f.padL}" y1="${y}" x2="${f.w - f.padR}" y2="${y}" stroke="${GRID}" stroke-width="1"/>`;
    g += `<text x="${f.padL - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="${MUTED}">${fmtTick(v, opts.unit)}</text>`;
  }
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)},${yAt(p.y).toFixed(1)}`).join(' ');
  const area = `${path} L${xAt(points.length - 1).toFixed(1)},${yAt(lo).toFixed(1)} L${xAt(0).toFixed(1)},${yAt(lo).toFixed(1)} Z`;
  g += `<path d="${area}" fill="${opts.color || TEAL}" fill-opacity="0.08"/>`;
  g += `<path d="${path}" fill="none" stroke="${opts.color || TEAL}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
  points.forEach((p, i) => {
    g += `<circle cx="${xAt(i)}" cy="${yAt(p.y)}" r="3.5" fill="#fff" stroke="${opts.color || TEAL}" stroke-width="2"/>`;
    if (i === points.length - 1) {
      g += `<text x="${xAt(i)}" y="${yAt(p.y) - 10}" text-anchor="middle" font-size="12" font-weight="700" fill="${INK}">${fmtTick(p.y, opts.unit)}</text>`;
    }
  });
  points.forEach((p, i) => {
    g += `<text x="${xAt(i)}" y="${f.h - 8}" text-anchor="middle" font-size="11" fill="${MUTED}">${esc(p.x)}</text>`;
  });
  return `<svg viewBox="0 0 ${f.w} ${f.h}" role="img" aria-label="Line chart">${g}</svg>`;
}

// A vertical bar chart. bars: [{x: label, y: number, color?}].
export function barChart(bars, opts = {}) {
  const { w = 720, h = 300 } = opts;
  const f = frame(w, h);
  const iw = f.w - f.padL - f.padR;
  const ih = f.h - f.padT - f.padB;
  const ys = bars.map((b) => b.y);
  const lo = niceMin(Math.min(0, ...ys));
  const hi = niceMax(Math.max(...ys));
  const span = hi - lo || 1;
  const yAt = (v) => f.padT + ih - ((v - lo) / span) * ih;
  const slot = iw / bars.length;
  const bw = Math.min(48, slot * 0.6);
  let g = '';
  for (let t = 0; t <= 4; t++) {
    const v = lo + (span * t) / 4;
    const y = yAt(v);
    g += `<line x1="${f.padL}" y1="${y}" x2="${f.w - f.padR}" y2="${y}" stroke="${GRID}" stroke-width="1"/>`;
    g += `<text x="${f.padL - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="${MUTED}">${fmtTick(v, opts.unit)}</text>`;
  }
  bars.forEach((b, i) => {
    const x = f.padL + i * slot + (slot - bw) / 2;
    const y0 = yAt(Math.max(0, b.y));
    const y1 = yAt(Math.min(0, b.y));
    const color = b.color || (b.y < 0 ? CORAL : opts.color || TEAL);
    g += `<rect x="${x.toFixed(1)}" y="${Math.min(y0, y1).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.abs(y1 - y0).toFixed(1)}" rx="3" fill="${color}"/>`;
    g += `<text x="${(x + bw / 2).toFixed(1)}" y="${(Math.min(y0, y1) - 6).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="700" fill="${INK}">${fmtTick(b.y, opts.unit)}</text>`;
    g += `<text x="${(x + bw / 2).toFixed(1)}" y="${f.h - 8}" text-anchor="middle" font-size="11" fill="${MUTED}">${esc(b.x)}</text>`;
  });
  return `<svg viewBox="0 0 ${f.w} ${f.h}" role="img" aria-label="Bar chart">${g}</svg>`;
}

// A donut chart for a composition split. slices: [{label, value, color, note}].
export function donutChart(slices, opts = {}) {
  const size = opts.size || 260;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 14;
  const inner = r * 0.62;
  const total = slices.reduce((s, x) => s + x.value, 0);
  let g = '';
  let start = -Math.PI / 2;
  slices.forEach((s) => {
    const frac = s.value / total;
    const end = start + frac * Math.PI * 2;
    const large = frac > 0.5 ? 1 : 0;
    const x0 = cx + r * Math.cos(start);
    const y0 = cy + r * Math.sin(start);
    const x1 = cx + r * Math.cos(end);
    const y1 = cy + r * Math.sin(end);
    const xi1 = cx + inner * Math.cos(end);
    const yi1 = cy + inner * Math.sin(end);
    const xi0 = cx + inner * Math.cos(start);
    const yi0 = cy + inner * Math.sin(start);
    g += `<path d="M${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${large} 1 ${x1.toFixed(1)},${y1.toFixed(1)} L${xi1.toFixed(1)},${yi1.toFixed(1)} A${inner},${inner} 0 ${large} 0 ${xi0.toFixed(1)},${yi0.toFixed(1)} Z" fill="${s.color}"><title>${esc(s.label)}: ${esc(s.note || String(s.value))}</title></path>`;
    start = end;
  });
  g += `<text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="26" font-weight="800" fill="${INK}">${esc(opts.centre || '')}</text>`;
  g += `<text x="${cx}" y="${cy + 18}" text-anchor="middle" font-size="12" fill="${MUTED}">${esc(opts.centreSub || '')}</text>`;
  return `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Donut chart">${g}</svg>`;
}

// A plain data table for the same series a chart shows.
export function dataTable(rows, columns) {
  const head = columns.map((c) => `<th>${esc(c.label)}</th>`).join('');
  const body = rows
    .map((r) => `<tr>${columns.map((c) => `<td>${esc(c.get(r))}</td>`).join('')}</tr>`)
    .join('');
  return `<table class="data-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function fmtTick(v, unit) {
  if (unit === 'pct') return `${trimNum(v)}%`;
  if (unit === 'sgd') return `S$${Math.round(v).toLocaleString('en-SG')}`;
  if (unit === 'sgd-k') return `S$${trimNum(v / 1000)}k`;
  return trimNum(v);
}

function trimNum(v) {
  const r = Math.round(v * 10) / 10;
  return Number.isInteger(r) ? String(r) : String(r);
}

export const CHART_COLORS = { teal: TEAL, amber: AMBER, coral: CORAL, ink: INK };
