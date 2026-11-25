"use strict";
/* =================================================================
   Dashboard Manajemen RS Nusantara
   UI: 100% komponen Basecoat (card, table, badge, item, progress,
   accordion, breadcrumb, sidebar, sheet, dialog) + utilitas Tailwind.
   Grafik: ApexCharts dengan warna dari token Basecoat (--chart-1..5,
   --destructive, --border, --muted-foreground).
   Angka hanya berasal dari mock-data.js (peran metric layer).
   ================================================================= */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));

function fmt(n, d = 0) {
  return new Intl.NumberFormat("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
}
const fmtAuto = v => fmt(v, Number.isInteger(v) ? 0 : 1);
function targetNum(s) {
  const m = String(s).match(/[\d.,]+/);
  return m ? parseFloat(m[0].replace(/\./g, "").replace(",", ".")) : 0;
}
function deltaText(v, unit) {
  const sign = v > 0 ? "+" : v < 0 ? "−" : "±";
  return `${sign}${fmt(Math.abs(v), Number.isInteger(v) ? 0 : 1)}${unit ? " " + unit : ""}`;
}
function deltaGood(d) { return d.good === "down" ? d.delta <= 0 : d.delta >= 0; }
function cellStatus(ind, value) {
  const t = targetNum(ind.target);
  if (ind.dir === "high") return value >= t ? "ok" : value >= t * 0.94 ? "warn" : "crit";
  return value <= t ? "ok" : value <= t * 1.35 ? "warn" : "crit";
}

/* ================= ikon (Lucide, inline) ================= */
const svg = (d, extra = "") => `<svg ${extra} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICON = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  alert: '<path d="m21.7 18-8-14a2 2 0 0 0-3.5 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3"/><path d="M12 9v4M12 17h.01"/>',
  x: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
  minus: '<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  home: '<path d="M3 10.5 12 3l9 7.5V21H3z"/><path d="M9 21v-6h6v6"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  bed: '<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'
};
const icon = (name, extra = 'data-icon="inline-start"') => svg(ICON[name], extra);

/* ================= status → varian badge Basecoat ================= */
const STATUS = {
  ok:      { label:"Sesuai target", variant:"outline", icon:"check", cls:"border-chart-2/50 bg-chart-2/10 *:text-chart-2" },
  warn:    { label:"Waspada", variant:"outline", icon:"alert", cls:"border-chart-3/70 bg-chart-3/20 *:text-foreground dark:*:text-chart-3" },
  crit:    { label:"Di luar target", variant:"destructive", icon:"x" },
  na:      { label:"Target belum ditetapkan", variant:"outline", icon:"minus" },
  neutral: { label:"Info", variant:"outline", icon:"info" }
};
function statusLabel(s) { return (STATUS[s] || STATUS.neutral).label; }
function badge(status, label) {
  const s = STATUS[status] || STATUS.neutral;
  return `<span class="badge shrink-0 ${s.cls || ""}" data-variant="${s.variant}">${icon(s.icon)}${esc(label || s.label)}</span>`;
}
const riskLabel = r => r === "crit" ? "Kritis" : r === "warn" ? "Pantau" : "Stabil";

/* ================= state & navigasi ================= */
const state = { tab: "ringkasan", role: "direksi", unit: "all", caseId: null, period: "month" };

/* ================= filter periode =================
   Data mock aslinya bulanan (November 2026). Periode lain disimulasikan secara
   deterministik: rasio bergeser sedikit, hitungan diskalakan menurut panjang
   periode, dan tren memakai sumbu waktu yang sesuai. Di sistem nyata, metric
   layer yang mengembalikan angka per periode. */
const PERIODS = {
  today: { label: "Hari ini",   range: "Selasa, 24 Nov 2026", vs: "vs kemarin",     factor: 1 / 30, perPoint: 1 / 360, seed: 11, gran: "per 2 jam, hari ini",
           labels: ["00","02","04","06","08","10","12","14","16","18","20","22"] },
  week:  { label: "Minggu ini", range: "18–24 Nov 2026",      vs: "vs minggu lalu", factor: 7 / 30, perPoint: 1 / 30, seed: 23, gran: "harian, 7 hari terakhir",
           labels: ["Rab 18","Kam 19","Jum 20","Sab 21","Min 22","Sen 23","Sel 24"] },
  month: { label: "Bulan ini",  range: "November 2026",       vs: "vs Okt",         factor: 1,      perPoint: 1, seed: 0,  gran: "" },
  year:  { label: "Tahun ini",  range: "Jan–Nov 2026",        vs: "vs 2025",        factor: 11,     perPoint: 1, seed: 37, gran: "bulanan, Jan–Nov 2026",
           labels: ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov"] }
};
const P = () => PERIODS[state.period];
const isMonth = () => state.period === "month";
function rnd(key) { // −1..1, stabil per (periode, kunci)
  let h = 2166136261 ^ P().seed;
  for (const c of String(key)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return ((h >>> 0) % 2001) / 1000 - 1;
}
const roundLike = (v, ref) => { const d = Number.isInteger(ref) ? 0 : Math.abs(ref) < 1 ? 2 : 1; return Math.round(v * 10 ** d) / 10 ** d; };
/* rasio/indeks: geser ±spread */
function pv(key, v, spread = 0.04) { return isMonth() ? v : roundLike(v * (1 + rnd(key) * spread), v); }
/* hitungan/arus (rupiah, kejadian): skala menurut panjang periode */
function pc(v, dec = 0) { if (isMonth()) return v; const r = v * P().factor * (1 + rnd("c" + v) * 0.08); return dec ? Math.round(r * 10 ** dec) / 10 ** dec : Math.max(0, Math.round(r)); }
/* subjudul granularitas tren */
const gran = def => (isMonth() ? def : P().gran);
/* sampel ulang deret ke sumbu waktu periode; titik terakhir = nilai periode */
function pseries(key, base, baseLabels) {
  if (isMonth()) return { labels: baseLabels, data: base };
  const L = P().labels, n = L.length, m = base.length;
  const span = (Math.max(...base) - Math.min(...base)) || Math.abs(base[m - 1]) * 0.05 || 1;
  const last = pv(key, base[m - 1]);
  const data = L.map((_, i) => {
    const pos = (i / (n - 1)) * (m - 1), lo = Math.floor(pos), f = pos - lo;
    const interp = base[lo] + (base[Math.min(m - 1, lo + 1)] - base[lo]) * f;
    const v = state.period === "year" ? interp : base[m - 1] + (interp - base[m - 1]) * 0.35;
    return roundLike(v + rnd(key + i) * span * 0.18, base[m - 1]);
  });
  data[n - 1] = last;
  return { labels: L, data };
}
function statusFromTarget(target, v) {
  const t = targetNum(target), s = String(target).trim();
  if (/^[<≤]/.test(s)) return v <= t ? "ok" : v <= t * 1.15 ? "warn" : "crit";
  return v >= t ? "ok" : v >= t * 0.94 ? "warn" : "crit";
}
function statusFromBand(v, band) {
  if (v >= band[0] && v <= band[1]) return "ok";
  const w = (band[1] - band[0]) * 0.12 || Math.abs(band[1]) * 0.06;
  return v >= band[0] - w && v <= band[1] + w ? "warn" : "crit";
}
/* KPI inti menurut periode */
function kpiFor(k) {
  const d = execKpis.find(x => x.k === k);
  if (isMonth()) return d;
  const value = pv(k, d.value);
  const delta = roundLike(rnd("d" + k) * Math.max(Math.abs(d.delta), Number.isInteger(d.value) ? 1 : 0.2), d.delta);
  return { ...d, value, delta, status: statusFromBand(value, d.band) };
}
const inmFor = () => inm.map(i => { const value = pv("inm" + i.k, i.value, 0.03); return isMonth() ? i : { ...i, value, status: statusFromTarget(i.target, value) }; });
const unitsFor = () => units.map(u => isMonth() ? u : { ...u, bor: pv("bor" + u.name, u.bor, 0.05), alos: pv("alos" + u.name, u.alos, 0.06), toi: pv("toi" + u.name, u.toi, 0.08), bto: pv("bto" + u.name, u.bto, 0.04) });

const TABS = [
  { id:"ringkasan",  label:"Ringkasan",          icon:"home",      roles:["direksi","unit","mutu"] },
  { id:"mutu",       label:"Mutu & keselamatan", icon:"shield",    roles:["direksi","unit","mutu"] },
  { id:"pengalaman", label:"Pengalaman pasien",  icon:"smile",     roles:["direksi","mutu"] },
  { id:"akses",      label:"Akses & waktu",      icon:"clock",     roles:["direksi","unit"] },
  { id:"operasional",label:"Operasional",        icon:"bed",       roles:["direksi","unit"] },
  { id:"keuangan",   label:"Keuangan",           icon:"wallet",    roles:["direksi"] },
  { id:"sdm",        label:"SDM",                icon:"users",     roles:["direksi","unit"] },
  { id:"kepatuhan",  label:"Kepatuhan",          icon:"clipboard", roles:["direksi","mutu"] },
  { id:"strategi",   label:"Strategi (BSC)",     icon:"target",    roles:["direksi"] },
  { id:"docs",       label:"Panduan",            icon:"book",      roles:["direksi","unit","mutu"] }
];

function allowedTabs() { return TABS.filter(t => t.roles.includes(state.role)); }
function scopeText() { return state.unit === "all" ? "seluruh RS" : state.unit; }
function go(tab) {
  if (!allowedTabs().some(t => t.id === tab)) tab = "ringkasan";
  state.tab = tab;
  state.caseId = null;
  if (location.hash !== "#" + tab) history.replaceState(null, "", "#" + tab);
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function initSelects() {
  $("#unitFilter").innerHTML = `<option value="all">Unit: Seluruh RS</option>` +
    units.map(u => `<option value="${esc(u.name)}">Unit: ${esc(u.name)}</option>`).join("");
  $("#footerSources").textContent = "Sumber: " + RS_INFO.sources;

}

function renderNav() {
  const tabs = allowedTabs();
  if (!tabs.some(t => t.id === state.tab)) state.tab = tabs[0].id;
  $("#navList").innerHTML = tabs.map(t => `<li><a href="#${t.id}" data-tab="${t.id}"${t.id === state.tab ? ' aria-current="page"' : ""}>${svg(ICON[t.icon])}<span>${esc(t.label)}</span></a></li>`).join("");
}

/* ================= grafik: ApexCharts + token Basecoat ================= */
const colorCtx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
function col(token, alpha = 1) {
  // Ubah token CSS (oklch/hex) menjadi rgba yang dipahami ApexCharts.
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim() || "#888";
  colorCtx.clearRect(0, 0, 1, 1);
  colorCtx.fillStyle = "#000";
  colorCtx.fillStyle = raw;
  colorCtx.fillRect(0, 0, 1, 1);
  const [r, g, b] = colorCtx.getImageData(0, 0, 1, 1).data;
  return alpha === 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${alpha})`;
}
const isDark = () => document.documentElement.classList.contains("dark");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const C = {
  main: () => col("--chart-1"), soft: () => col("--chart-1"), ok: () => col("--chart-2"), warn: () => col("--chart-3"), mid: () => col("--chart-4"), deep: () => col("--chart-5"),
  crit: () => col("--destructive"), muted: () => col("--muted-foreground"), border: () => col("--border"), fg: () => col("--foreground"),
  /* teks di atas label merah: putih di mode terang, latar gelap di mode gelap (merahnya lebih terang) */
  onCrit: () => isDark() ? col("--background") : "#fff"
};

function merge(a, b) {
  for (const k of Object.keys(b)) {
    if (b[k] && typeof b[k] === "object" && !Array.isArray(b[k]) && typeof a[k] === "object" && a[k] && !Array.isArray(a[k])) merge(a[k], b[k]);
    else a[k] = b[k];
  }
  return a;
}
function baseOpts(type, height) {
  return {
    chart: { type, height, fontFamily: "inherit", toolbar: { show: false }, zoom: { enabled: false },
      animations: { enabled: !reduceMotion.matches, speed: 450, animateGradually: { enabled: false }, dynamicAnimation: { enabled: false } }, background: "transparent", foreColor: C.muted(), parentHeightOffset: 0 },
    theme: { mode: isDark() ? "dark" : "light" },
    grid: { borderColor: C.border(), strokeDashArray: 4, padding: { left: 4, right: 8 } },
    dataLabels: { enabled: false },
    legend: { position: "bottom", horizontalAlign: "left", fontSize: "12px", labels: { colors: C.muted() }, markers: { size: 5 } },
    tooltip: { theme: isDark() ? "dark" : "light" },
    states: { hover: { filter: { type: "none" } } }
  };
}

let chartSeq = 0;
let pendingCharts = [];
let liveCharts = [];
function chart(label, build, height = 240) {
  const id = "chart-" + (++chartSeq);
  pendingCharts.push({ id, build, height });
  return `<div id="${id}" class="w-full min-w-0" role="img" aria-label="${esc(label)}"></div>`;
}
function mountCharts() {
  liveCharts.forEach(c => { try { c.destroy(); } catch {} });
  liveCharts = [];
  const list = pendingCharts;
  pendingCharts = [];
  list.forEach(({ id, build, height }) => {
    const el = document.getElementById(id);
    if (!el || !window.ApexCharts) return;
    const c = new ApexCharts(el, build(height));
    c.render();
    liveCharts.push(c);
  });
}

function yRange(vals, pad = 0.14) {
  let lo = Math.min(...vals), hi = Math.max(...vals);
  const p = ((hi - lo) || 1) * pad;
  lo = lo >= 0 ? Math.max(0, lo - p) : lo - p;
  return { min: lo, max: hi + p };
}

function trendChart({ series, labels, band, target, unit = "", label, height = 240 }) {
  if (!isMonth()) {
    const key = label || series.map(s => s.name).join("|");
    const res = series.map(s => pseries(key + s.name, s.data, labels));
    labels = res[0].labels;
    series = series.map((s, i) => ({ ...s, data: res[i].data }));
  }
  const vals = series.flatMap(s => s.data).concat(band || [], target != null ? [target] : []);
  const r = yRange(vals);
  const dec = r.max - r.min < 6 ? 1 : 0;
  return chart(label || `Tren ${series.map(s => s.name).join(", ")}`, h => merge(baseOpts("area", h), {
    series,
    colors: [C.main(), C.muted()],
    stroke: { curve: "smooth", width: [2.5, 2], dashArray: [0, 5] },
    fill: { type: "gradient", gradient: { opacityFrom: series.length > 1 ? 0.25 : 0.3, opacityTo: 0.02, stops: [0, 100] } },
    markers: { size: 0, hover: { size: 4 } },
    xaxis: { categories: labels, tickAmount: Math.min(labels.length, 6), labels: { rotate: 0, hideOverlappingLabels: true }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { min: r.min, max: r.max, tickAmount: 4, labels: { formatter: v => fmt(v, dec) } },
    tooltip: { y: { formatter: v => fmt(v, 1) + unit } },
    legend: { show: series.length > 1 },
    annotations: {
      yaxis: [
        ...(band ? [{ y: band[0], y2: band[1], fillColor: C.soft(), opacity: 0.18, borderColor: "transparent",
          label: { text: `Target ${fmt(band[0])}–${fmt(band[1])}${unit}`, position: "left", textAnchor: "start", offsetX: 6,
            style: { background: "transparent", color: C.muted(), fontSize: "12px" }, borderColor: "transparent" } }] : []),
        ...(target != null ? [{ y: target, borderColor: C.crit(), strokeDashArray: 5,
          label: { text: `Target ${fmt(target, Number.isInteger(target) ? 0 : 1)}${unit}`, position: "left", textAnchor: "start", offsetX: 6,
            style: { background: C.crit(), color: C.onCrit(), fontSize: "12px" }, borderColor: C.crit() } }] : [])
      ]
    }
  }), height);
}

function sparkline(data, band) {
  return chart("Tren", h => merge(baseOpts("area", h), {
    chart: { sparkline: { enabled: true } },
    series: [{ name: "Nilai", data }],
    colors: [C.main()],
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.3, opacityTo: 0, stops: [0, 100] } },
    tooltip: { enabled: false },
    yaxis: { min: Math.min(...data, band ? band[0] : Infinity) * 0.98, max: Math.max(...data, band ? band[1] : -Infinity) * 1.02 },
    annotations: band ? { yaxis: [{ y: band[0], y2: band[1], fillColor: C.soft(), opacity: 0.15, borderColor: "transparent" }] } : {}
  }), 48);
}

function columnChart({ labels, values, target, unit = "", label, height = 260 }) {
  return chart(label, h => merge(baseOpts("bar", h), {
    series: [{ name: "p90", data: values }],
    colors: [({ value }) => (target != null && value > target ? C.crit() : C.main())],
    plotOptions: { bar: { columnWidth: "58%", borderRadius: 3 } },
    xaxis: { categories: labels, labels: { rotate: 0, hideOverlappingLabels: true }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { tickAmount: 4, labels: { formatter: v => fmt(v) } },
    tooltip: { y: { formatter: v => fmt(v) + unit } },
    annotations: target != null ? { yaxis: [{ y: target, borderColor: C.crit(), strokeDashArray: 5,
      label: { text: `Ambang ${target}${unit}`, position: "left", textAnchor: "start", offsetX: 6, style: { background: C.crit(), color: C.onCrit(), fontSize: "12px" }, borderColor: C.crit() } }] } : {}
  }), height);
}

function hBars({ rows, unit = "", label, highlight = [], highlightColor = "crit", dec = 0, height }) {
  const hgt = height || Math.max(160, rows.length * 38 + 40);
  return chart(label, h => merge(baseOpts("bar", h), {
    series: [{ name: label, data: rows.map(r => r.v) }],
    colors: rows.map((_, i) => highlightColor === "emph"
      ? (highlight.includes(i) ? C.main() : col("--chart-1", 0.4))
      : (highlight.includes(i) ? (highlightColor === "crit" ? C.crit() : C.warn()) : C.main())),
    plotOptions: { bar: { horizontal: true, distributed: true, barHeight: "62%", borderRadius: 3, dataLabels: { position: "top" } } },
    dataLabels: { enabled: true, formatter: v => fmt(v, dec) + unit, offsetX: 26, style: { colors: [C.fg()], fontSize: "12px", fontWeight: 500 } },
    xaxis: { categories: rows.map(r => r.label), min: 0, max: Math.max(...rows.map(r => r.v)) * 1.25, labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { maxWidth: 190, style: { fontSize: "12px" } } },
    grid: { xaxis: { lines: { show: false } }, yaxis: { lines: { show: false } } },
    legend: { show: false },
    tooltip: { y: { formatter: v => fmt(v, dec) + unit } }
  }), hgt);
}

function gauge({ value, target, max = 100, unit = "", label }) {
  return chart(`${label} ${fmt(value, 1)}${unit}, target ${target}`, h => merge(baseOpts("radialBar", h), {
    series: [Math.round((value / max) * 1000) / 10],
    colors: [value >= target ? C.ok() : C.crit()],
    plotOptions: { radialBar: { startAngle: -100, endAngle: 100, hollow: { size: "62%" },
      track: { background: col("--muted"), strokeWidth: "100%" },
      dataLabels: { name: { show: true, offsetY: 22, fontSize: "12px", color: C.muted() },
        value: { offsetY: -14, fontSize: "30px", fontWeight: 600, color: C.fg(), formatter: () => fmt(value, 1) } } } },
    labels: [`${unit.replace("/", "dari ")} · target ${target}`],
    stroke: { lineCap: "round" }
  }), 220);
}

function heatmap({ rows, cols, ranges, unit = "", label, height }) {
  const hgt = height || rows.length * 34 + 60;
  return chart(label, h => merge(baseOpts("heatmap", h), {
    series: rows.slice().reverse().map(r => ({ name: r.label, data: r.v.map((y, i) => ({ x: cols[i], y })) })),
    plotOptions: { heatmap: { radius: 3, enableShades: false, colorScale: { ranges: ranges() } } },
    dataLabels: { enabled: true, style: { fontSize: "12px", fontWeight: 600, colors: [isDark() ? col("--background") : col("--foreground")] } },
    stroke: { width: 2, colors: [col("--card")] },
    xaxis: { labels: { rotate: 0 }, axisBorder: { show: false }, axisTicks: { show: false } },
    tooltip: { y: { formatter: v => fmt(v) + unit } },
    legend: { show: true }
  }), hgt);
}

/* ================= blok Basecoat bersama ================= */
function card({ title, sub = "", body, foot = "", action = "", cls = "", id = "" }) {
  return `<article class="card min-w-0 scroll-mt-40 transition-shadow ${cls}"${id ? ` id="${id}"` : ""}>
    <header class="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
      <div class="min-w-0 flex-1 basis-56"><h3 class="text-base font-semibold leading-snug">${title}</h3>${sub ? `<p class="text-sm text-muted-foreground">${sub}</p>` : ""}</div>${action}
    </header>
    <section class="min-w-0">${body}</section>
    ${foot ? `<footer class="text-sm text-muted-foreground">${foot}</footer>` : ""}
  </article>`;
}
function sectionHead(title, meta, right = "") {
  return `<div class="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
    <div class="min-w-0"><h2 class="text-xl font-semibold tracking-tight text-balance">${title}</h2><p class="text-sm text-muted-foreground">${meta}${isMonth() ? "" : " · angka periode ini disimulasikan dari data bulanan (mock)"}</p></div>
    <span class="flex flex-wrap gap-1.5"><span class="badge" data-variant="secondary">${esc(P().label)} · ${esc(P().range)}</span>${right ? `<span class="badge" data-variant="outline">${esc(right)}</span>` : ""}</span>
  </div>`;
}
function table(head, rows, empty = "Tidak ada data.") {
  return `<div class="table-container scrollbar scrollbar-thin"><table class="table">
    <thead><tr>${head.map(h => `<th class="${h.num ? "text-right" : ""}">${h.t}</th>`).join("")}</tr></thead>
    <tbody>${rows.length ? rows.map(r => `<tr${r.attrs || ""}>${r.cells.map((c, i) => `<td class="${head[i].num ? "text-right tabular-nums" : ""} ${head[i].wrap ? "min-w-48 whitespace-normal" : ""}">${c}</td>`).join("")}</tr>`).join("")
      : `<tr><td colspan="${head.length}" class="text-muted-foreground">${empty}</td></tr>`}</tbody>
  </table></div>`;
}
const legend = items => `<div class="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">${items.map(([s, t]) => `<span class="inline-flex items-center gap-2">${badge(s, t)}</span>`).join("")}</div>`;
const grid = (cls, inner) => `<div class="grid grid-cols-1 gap-6 ${cls}">${inner}</div>`;

function metricTile(k) {
  const base = kpiFor(k);
  const unit = state.unit === "all" ? null : unitsFor().find(x => x.name === state.unit);
  const scoped = unit && ["BOR", "ALOS", "TOI", "BTO"].includes(k);
  const d = scoped
    ? { ...base, value: unit[k.toLowerCase()], status: unit.status,
        note: `${unit.name} — BOR ${unit.bor}% · ALOS ${fmt(unit.alos, 1)} · TOI ${fmt(unit.toi, 1)} · BTO ${unit.bto}` }
    : base;
  const delta = scoped
    ? `<span>Unit · periode berjalan</span>`
    : `<span class="${deltaGood(d) ? "text-foreground" : "text-destructive"} font-medium">${deltaText(d.delta)}</span><span>${P().vs}</span>`;
  return `<button type="button" class="card min-w-0 gap-3 text-left transition hover:-translate-y-0.5 hover:bg-muted/50 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-ring" data-k="${d.k}" aria-label="${esc(d.name)}: ${fmtAuto(d.value)} ${esc(d.unit)}. Klik untuk definisi.">
    <header class="flex items-start justify-between gap-2 px-4">
      <span class="text-sm font-medium leading-snug">${d.k} · ${esc(d.name)}</span>${badge(d.status)}
    </header>
    <section class="flex flex-col gap-1 px-4">
      <strong class="text-4xl font-semibold tracking-tight tabular-nums">${fmtAuto(d.value)}<span class="ml-1 text-sm font-normal text-muted-foreground">${esc(d.unit)}</span></strong>
      <span class="text-sm text-muted-foreground">Target ${esc(d.target)} · ${scoped ? esc(unit.name) : "RS-level"}</span>
      ${scoped ? "" : sparkline(pseries(d.k, d.series, d.labels).data, d.band)}
    </section>
    <footer class="flex-col items-start gap-1 px-4 text-sm text-muted-foreground">
      <span class="flex w-full justify-between gap-2">${delta}</span>
      <span>${esc(d.note)}</span>
    </footer>
  </button>`;
}

function simpleMetric({ label, value, unit = "", target, status, note, k }) {
  const tag = k ? "button" : "article";
  const attrs = k ? ` type="button" data-k="${esc(k)}" aria-label="${esc(label)}: ${esc(String(value))} ${esc(unit)}, ${esc(status === "na" ? "target belum ditetapkan" : statusLabel(status).toLowerCase())}. Buka definisi."` : "";
  return `<${tag} class="card min-w-0 gap-2 text-left ${k ? "transition hover:-translate-y-0.5 hover:bg-muted/50 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0" : ""}"${attrs}>
    <header class="flex items-start justify-between gap-2 px-4"><span class="text-sm font-medium leading-snug">${esc(label)}${k ? `<span class="ml-1 inline-flex align-[-2px] text-muted-foreground [&>svg]:size-3.5" title="Buka definisi">${icon("info", "aria-hidden=\"true\"")}</span>` : ""}</span>${badge(status)}</header>
    <section class="flex flex-col gap-1 px-4">
      <strong class="text-3xl font-semibold tracking-tight tabular-nums">${value}<span class="ml-1 text-sm font-normal text-muted-foreground">${esc(unit)}</span></strong>
      <span class="text-sm text-muted-foreground">${status === "na" ? "Target belum ditetapkan" : "Target " + esc(target)}</span>
      <span class="text-sm text-muted-foreground">${esc(note)}</span>
    </section>
  </${tag}>`;
}

function alertItems(limit = 6) {
  return `<div class="flex flex-col divide-y divide-border">${alerts.slice(0, limit).map(a => `
    <div class="item rounded-none px-0">
      <section class="min-w-0">
        <h3 class="flex flex-wrap items-center gap-2">${esc(a.title)}</h3>
        <p class="line-clamp-none">${esc(a.detail)}</p>
        <p class="line-clamp-none flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">${badge(a.sev, a.sev === "crit" ? "Kritis" : "Pantau")}<span class="font-medium text-foreground">${esc(a.domain)}</span><span>${esc(a.owner)}</span><span>${esc(a.age)} lalu</span></p>
        <div class="pt-2"><button type="button" class="btn" data-variant="outline" data-size="sm" data-go="${a.tab}">${esc(a.action)}</button></div>
      </section>
    </div>`).join("")}</div>`;
}

function capacityCard() {
  const used = Math.round((capacity.occupied / capacity.totalBeds) * 100);
  const fig = (v, t) => `<div class="flex min-w-0 flex-col"><strong class="text-3xl font-semibold tracking-tight tabular-nums">${v}</strong><span class="text-sm text-muted-foreground">${t}</span></div>`;
  return card({ title: "Kapasitas hari ini", sub: "per 07:42",
    body: `<div class="@container flex flex-col gap-4">
      <div class="grid grid-cols-2 gap-4 @xl:grid-cols-4">${fig(capacity.occupied, `/ ${capacity.totalBeds} bed terisi`)}${fig(capacity.available, "bed tersedia")}${fig(`${capacity.icu.occupied}/${capacity.icu.total}`, "ICU terpakai")}${fig(capacity.igdWaiting, "IGD menunggu")}</div>
      <div class="progress h-2" role="progressbar" aria-valuenow="${used}" aria-valuemin="0" aria-valuemax="100" aria-label="${used}% bed terisi"><span style="width:${used}%"></span></div>
    </div>`,
    foot: `${capacity.dischargesDone} dari ${capacity.dischargesPlanned} rencana pulang selesai` });
}

const domainRisk = [
  { name:"Keselamatan & mutu", status:"crit", note:"Alur klinis 76% · SC emergensi 74% · kebersihan tangan 82%", tab:"mutu" },
  { name:"Operasional & kapasitas", status:"crit", note:"BOR 87% · ICU 92% · 3 pasien IGD menunggu bed", tab:"operasional" },
  { name:"Keuangan", status:"warn", note:"AR days 38 · denial klaim 8,2% · piutang 3,9 M", tab:"keuangan" },
  { name:"SDM", status:"crit", note:"Kepuasan 78 · rasio perawat IGD 1:3", tab:"sdm" },
  { name:"Pelayanan pasien", status:"ok", note:"Kepuasan 86,4 · komplain 12 · DAMA 2,1%", tab:"pengalaman" }
];
function itemList(rows) {
  return `<div class="flex flex-col divide-y divide-border">${rows.map(r => `
    <${r.go ? `button type="button" data-go="${r.go}"` : r.jump ? `button type="button" data-docjump="${r.jump}"` : "div"} class="item rounded-none px-1 text-left ${r.go || r.jump ? "transition-colors hover:bg-muted/50" : ""}" data-size="sm">
      <section class="min-w-0 basis-48"><h3 class="text-balance">${esc(r.title)}</h3>${r.desc ? `<p class="line-clamp-none">${esc(r.desc)}</p>` : ""}</section>
      <aside>${r.badge}</aside>
    </${r.go || r.jump ? "button" : "div"}>`).join("")}</div>`;
}
function domainRiskCard() {
  const allowed = new Set(allowedTabs().map(t => t.id));
  return card({ title: "Status per domain", sub: "5 domain",
    body: itemList(domainRisk.map(d => ({ title: d.name, desc: d.note, badge: badge(d.status), go: allowed.has(d.tab) ? d.tab : "" }))) });
}

function priorityTable(rows) {
  return table(
    [{ t:"Pasien" }, { t:"Unit" }, { t:"Diagnosis", wrap:true }, { t:"Catatan", wrap:true }, { t:"Risiko" }],
    rows.map(p => ({
      attrs: state.caseId === p.id ? ' data-state="selected"' : "",
      cells: [
        `<button type="button" class="btn h-auto px-0" data-variant="link" data-case="${esc(p.id)}">${esc(p.name)}, ${p.age}</button><div class="text-xs text-muted-foreground">${esc(p.id)}</div>`,
        esc(p.unit), esc(p.dx), esc(p.note), badge(p.risk, riskLabel(p.risk))
      ]
    })),
    "Tidak ada pasien prioritas untuk unit ini.");
}

function statusTable(rows, { nameHead = "Indikator", extra } = {}) {
  const head = [{ t:nameHead, wrap:true }, ...(extra ? extra.head : []), { t:"Target", num:true }, { t:"Capai", num:true }, { t:"Status" }];
  return table(head, rows.map(r => ({ cells: [esc(r.n), ...(extra ? extra.cells(r) : []), esc(r.t), esc(r.v), badge(r.st, r.label)] })));
}

/* ================= halaman ================= */
function renderRingkasan() {
  return `
  ${sectionHead("Enam indikator inti", `${P().range} · dibandingkan target`, scopeText())}
  ${grid("sm:grid-cols-2 2xl:grid-cols-3", execKpis.map(d => metricTile(d.k)).join(""))}
  ${grid("lg:grid-cols-5", `
    <div class="min-w-0 lg:col-span-3">${card({ title: "Papan prioritas", sub: `${alerts.filter(a => a.sev === "crit").length} kritis · ${alerts.length} item`,
      body: alertItems(), foot: "Setiap item menautkan data sumber dan pemilik tindakan." })}</div>
    <div class="flex min-w-0 flex-col gap-6 lg:col-span-2">${capacityCard()}${domainRiskCard()}</div>`)}
  ${grid("2xl:grid-cols-2", `
    ${card({ title: "Tren okupansi", sub: `BOR % · ${gran("14 hari terakhir")} · area biru = target 60–85%`,
      body: trendChart({ series: [{ name: "BOR harian", data: capacity.occupancySeries }], labels: capacity.occupancyLabels, band: [60, 85], unit: "%" }) })}
    ${card({ title: "Pasien prioritas", sub: `${priorityPatients.length} tertinggi risiko`, body: priorityTable(priorityPatients),
      foot: "Data anonim. Detail per pasien hanya lewat RBAC." })}`)}`;
}

function heatTable() {
  const rows = state.unit === "all" ? safetyMatrix : safetyMatrix.filter(r => r.unit === state.unit);
  return table(
    [{ t:"Unit" }, ...safetyIndicators.map(i => ({ t:`${esc(i.name)}<div class="text-xs font-normal text-muted-foreground">${esc(i.target)}</div>` }))],
    rows.map(r => ({ cells: [`<span class="font-medium">${esc(r.unit)}</span>`, ...safetyIndicators.map(i => {
      const v = pv("sm" + r.unit + i.key, r[i.key], 0.03), st = cellStatus(i, v);
      return `<span class="badge tabular-nums ${STATUS[st].cls || ""}" data-variant="${STATUS[st].variant}" title="${esc(i.name)} ${fmt(v, 1)}${i.unit} · target ${esc(i.target)} · ${statusLabel(st)}">${icon(STATUS[st].icon)}${fmtAuto(v)}</span>`;
    })] })));
}

function renderMutu() {
  const inmRows = inmFor().map(i => ({ n: i.k, t: i.target, v: fmtAuto(i.value) + (String(i.target).includes("%") ? "%" : ""), st: i.status }));
  return `
  ${sectionHead("Mutu & keselamatan", "13 INM · matriks unit × indikator", scopeText())}
  ${card({ title: "Matriks kepatuhan per unit", sub: state.unit === "all" ? "7 unit · geser tabel ke samping di layar kecil" : esc(state.unit),
    body: `<div class="flex flex-col gap-4">${heatTable()}${legend([["ok", "Memenuhi target"], ["warn", "Dalam 6% dari target"], ["crit", "Perlu tindakan"]])}</div>`,
    foot: "IDO dalam % · indikator lain dalam %" })}
  ${grid("md:grid-cols-2 2xl:grid-cols-3", `
    ${card({ title: "GDR", sub: "‰ · ambang ≤45", body: trendChart({ series: [{ name: "GDR", data: qualityTrend.gdr }], labels: qualityTrend.labels, band: [0, 45], unit: "‰", height: 220 }) })}
    ${card({ title: "NDR", sub: "‰ · ambang ≤25", body: trendChart({ series: [{ name: "NDR", data: qualityTrend.ndr }], labels: qualityTrend.labels, band: [0, 25], unit: "‰", height: 220 }) })}
    ${card({ title: "Readmisi 30 hari", sub: "% · target <5", body: trendChart({ series: [{ name: "Readmisi", data: qualityTrend.readmisi }], labels: qualityTrend.labels, target: qualityTrend.readmisiTarget, unit: "%", height: 220 }) })}`)}
  ${card({ title: "Status 13 Indikator Nasional Mutu", sub: "Permenkes 30/2022 · wajib", body: statusTable(inmRows),
    foot: "Target efektif per indikator mengikuti Lampiran Permenkes; angka target yang belum terverifikasi ditandai di dokumen riset." })}
  ${grid("2xl:grid-cols-2", `
    ${card({ title: "Variansi GDR antar unit", sub: "kotak Q1–Q3 · garis putus = target", body: boxplot(),
      foot: "ICU dan outlier di atasnya menyempitkan variasi antar bangsal; pantau kepatuhan alur klinis." })}
    ${card({ title: "Funnel review mortalitas", sub: "bulan berjalan · 5 tahap", body: funnelChart(),
      foot: "Dari 11 kematian ≥48 jam, 5 tindak lanjut tervalidasi — celah di tahap audit komite." })}`)}
  ${unsetTargetCard(["MORT30", "SURV5", "PJATUH"], "Indikator outcome tanpa target terverifikasi", "target internal · belum ditetapkan")}`;
}

function boxplot() {
  const d = unitBoxes;
  const short = n => n.replace("Rawat Inap ", "RI ").replace(" / Paviliun", "");
  return chart(`Kotak variansi GDR per unit; target ${d.target} per mil`, h => merge(baseOpts("boxPlot", h), {
    series: [
      { name: "GDR", type: "boxPlot", data: d.groups.map(g => ({ x: short(g.name), y: [g.min, g.q1, g.median, g.q3, g.max] })) },
      { name: "Outlier", type: "scatter", data: d.groups.flatMap(g => (g.out || []).map(o => ({ x: short(g.name), y: o }))) }
    ],
    colors: [C.main(), C.crit()],
    plotOptions: { boxPlot: { colors: { upper: col("--chart-1", 0.55), lower: C.main() } }, bar: { columnWidth: "45%" } },
    stroke: { colors: [C.fg()], width: 1 },
    markers: { size: 5 },
    xaxis: { type: "category", labels: { rotate: 0, hideOverlappingLabels: false, style: { fontSize: "12px" } } },
    yaxis: { tickAmount: 4, labels: { formatter: v => fmt(v) } },
    legend: { show: false },
    annotations: { yaxis: [{ y: d.target, borderColor: C.crit(), strokeDashArray: 5,
      label: { text: `Target ${d.target}‰`, position: "left", textAnchor: "start", offsetX: 6, style: { background: C.crit(), color: C.onCrit(), fontSize: "12px" }, borderColor: C.crit() } }] }
  }), 280);
}

function funnelChart() {
  const s = mortalityFunnel.stages.reduce((acc, x, i) => { const n = Math.min(pc(x.n), i ? acc[i - 1].n : Infinity); acc.push({ ...x, n }); return acc; }, []);
  return chart(`Funnel audit kematian: dari ${s[0].n} pasien keluar sampai ${s[s.length - 1].n} tindak lanjut`, h => merge(baseOpts("bar", h), {
    series: [{ name: "Jumlah", data: s.map(x => x.n) }],
    colors: [C.main()],
    plotOptions: { bar: { horizontal: true, isFunnel: true, barHeight: "78%", borderRadius: 3 } },
    dataLabels: { enabled: true, formatter: (v, o) => {
      const i = o.dataPointIndex;
      return i ? `${s[i].label}: ${v} (${fmt(v / s[i - 1].n * 100)}%)` : `${s[0].label}: ${v}`;
    }, style: { fontSize: "12px", fontWeight: 500 }, dropShadow: { enabled: false } },
    xaxis: { categories: s.map(x => x.label) },
    legend: { show: false }
  }), 280);
}

function renderPengalaman() {
  const e = { ...experience, satisfaction: pv("sat", experience.satisfaction, 0.02), complaints: pc(experience.complaints), complaintsTarget: pc(experience.complaintsTarget),
    pareto: experience.pareto.map(x => ({ ...x, n: pc(x.n) })), dama: pv("dama", experience.dama, 0.15), response48h: pv("resp", experience.response48h, 0.03) };
  return `
  ${sectionHead("Pengalaman pasien", "kepuasan · komplain · DAMA", scopeText())}
  ${grid("lg:grid-cols-2", `
    ${card({ title: "Indeks kepuasan pasien", sub: "survei pasca rawat",
      body: `${gauge({ value: e.satisfaction, target: e.satisfactionTarget, unit: "/100", label: "Kepuasan pasien" })}
        <p class="text-sm text-muted-foreground">Di atas target ${e.satisfactionTarget}. Komplain ${e.complaints} ${P().label.toLowerCase()} (target ≤${e.complaintsTarget}); ${e.response48h}% ditutup dalam 48 jam.</p>`,
      foot: "Sumber: survei pasca rawat · 412 respons" })}
    ${card({ title: "Tren kepuasan", sub: gran("7 bulan terakhir"), body: trendChart({ series: [{ name: "Indeks", data: e.satisfactionSeries }], labels: ["Mei","Jun","Jul","Agu","Sep","Okt","Nov"], target: e.satisfactionTarget, height: 260 }) })}`)}
  ${grid("lg:grid-cols-2", `
    ${card({ title: "Pareto keluhan", sub: `${e.complaints} komplain`,
      body: hBars({ rows: e.pareto.map(p => ({ label: p.label, v: p.n })), unit: "×", label: "Pareto keluhan", highlight: [0] }),
      foot: "5 dari 12 komplain soal waktu tunggu; selaras dengan waktu tunggu IGD." })}
    ${card({ title: "Penutupan keluhan & DAMA", sub: "bulan berjalan",
      body: statusTable([
        { n: "Komplain diterima", t: "≤" + e.complaintsTarget, v: String(e.complaints), st: "warn" },
        { n: "Ditutup ≤48 jam", t: "≥" + e.responseTarget + "%", v: e.response48h + "%", st: "ok" },
        { n: "Pulang atas permintaan sendiri", t: "<" + e.damaTarget + "%", v: fmt(e.dama, 1) + "%", st: "warn" }
      ]),
      foot: "DAMA dipantau karena berkorelasi dengan kepuasan dan readmisi." })}`)}`;
}

function renderAkses() {
  const a = access;
  const rows = [
    { n:"Kepatuhan waktu tunggu ≤60 mnt", v:fmt(a.waitCompliance, 1) + "%", t:">" + a.waitTarget + "%", st:"ok" },
    { n:"SC emergensi ≤30 mnt", v:fmt(a.scResponse, 1) + "%", t:"≥" + a.scTarget + "%", st:"crit" },
    { n:"Penundaan operasi elektif", v:fmt(a.electiveDelay, 1) + "%", t:"<" + a.electiveTarget + "%", st:"warn" },
    { n:"Kepatuhan visite dokter", v:fmt(a.visitCompliance, 1) + "%", t:">" + a.visitTarget + "%", st:"ok" }
  ];
  return `
  ${sectionHead("Akses & waktu tunggu", "p90 per jam · INM", scopeText())}
  ${grid("2xl:grid-cols-5", `
    <div class="min-w-0 2xl:col-span-3">${card({ title: "Waktu tunggu rawat jalan", sub: "p90 menit per jam · merah = melewati 60 menit",
      body: columnChart({ labels: a.byHour.map(x => x.h), values: a.byHour.map(x => x.p90), target: 60, unit: " mnt", label: "Waktu tunggu p90 per jam" }),
      foot: "Puncak 10.00–11.00 (64 dan 55 menit). Geser jadwal poli dan tambah loket pada jam itu." })}</div>
    <div class="min-w-0 2xl:col-span-2">${card({ title: "Kepatuhan akses", sub: "bulan berjalan", body: statusTable(rows),
      foot: "SC emergensi perlu alur konsul anestesi paralel." })}</div>`)}
  ${card({ title: "Kepadatan waktu tunggu jam × hari", sub: "p90 menit · Sen–Min",
    body: `<div class="scrollbar scrollbar-thin overflow-x-auto"><div class="min-w-xl">${heatmap({
      rows: accessDay.map((d, i) => ({ label: d, v: a.byDayHour[i] })), cols: accessHours.map(h => h + ":00"), unit: " mnt", label: "Peta panas waktu tunggu",
      ranges: () => [{ from: 0, to: 30, color: C.ok(), name: "≤30 menit" }, { from: 30.01, to: 55, color: C.warn(), name: "30–55 menit" }, { from: 55.01, to: 999, color: C.crit(), name: ">55 menit" }] })}</div></div>`,
    foot: "Puncak Selasa–Jumat pukul 09–11; Senin pagi ramai karena rujukan akhir pekan." })}
  ${card({ title: "Titik breach yang perlu tindakan", sub: `${a.breaches.length} item`,
    body: table([{ t:"Unit" }, { t:"Indikator", wrap:true }, { t:"Capaian", num:true }, { t:"Target", num:true }, { t:"Pemilik" }],
      a.breaches.map(b => ({ cells: [`<span class="font-medium">${esc(b.unit)}</span>`, esc(b.indikator), esc(b.value), esc(b.target), esc(b.owner)] }))) })}
  ${unsetTargetCard(["LOSIGD", "TATRAD", "ANTRIFAR"], "Indikator akses tanpa acuan terverifikasi", "angka acuan belum diperiksa")}`;
}

function scatterBj() {
  const groups = { ok: "Dalam zona", warn: "Perlu pantau", crit: "Keluar zona" };
  const short = n => n.replace("Rawat Inap ", "RI ").replace(" / Paviliun", "");
  return chart("Sebaran BOR dan ALOS per unit; zona efisiensi BOR 60–85% dan ALOS 6–9 hari", h => merge(baseOpts("scatter", h), {
    series: Object.entries(groups).map(([st, name]) => ({ name, data: unitsFor().filter(u => u.status === st).map(u => ({ x: u.bor, y: u.alos, name: short(u.name) })) })),
    colors: [C.ok(), C.warn(), C.crit()],
    markers: { size: 8, strokeWidth: 2, strokeColors: col("--card") },
    dataLabels: { enabled: true, offsetY: -10, formatter: (v, o) => o.w.config.series[o.seriesIndex].data[o.dataPointIndex].name,
      background: { enabled: false }, style: { fontSize: "12px", fontWeight: 500, colors: [C.fg()] } },
    xaxis: { type: "numeric", min: 40, max: 100, tickAmount: 6, title: { text: "BOR (%)", style: { fontWeight: 500 } }, labels: { formatter: v => fmt(v) } },
    yaxis: { min: 0, max: 12, tickAmount: 4, title: { text: "ALOS (hari)", style: { fontWeight: 500 } }, labels: { formatter: v => fmt(v) } },
    tooltip: { custom: ({ seriesIndex, dataPointIndex, w }) => {
      const p = w.config.series[seriesIndex].data[dataPointIndex];
      return `<div class="px-3 py-2 text-xs"><b>${esc(p.name)}</b><br>BOR ${p.x}% · ALOS ${fmt(p.y, 1)} hari</div>`;
    } },
    annotations: {
      xaxis: [{ x: 60, x2: 85, fillColor: C.soft(), opacity: 0.14, borderColor: "transparent" }],
      yaxis: [{ y: 6, y2: 9, fillColor: C.soft(), opacity: 0.14, borderColor: "transparent" }]
    }
  }), 320);
}

function unitTable() {
  const U = unitsFor();
  const rows = state.unit === "all" ? U : U.filter(u => u.name === state.unit);
  return table([{ t:"Unit" }, { t:"TT", num:true }, { t:"BOR", num:true }, { t:"ALOS", num:true }, { t:"TOI", num:true }, { t:"BTO", num:true }, { t:"Status" }],
    rows.map(u => ({ attrs: state.unit === u.name ? ' data-state="selected"' : "", cells: [
      `<button type="button" class="btn h-auto px-0" data-variant="link" data-unit="${esc(u.name)}">${esc(u.name)}</button>`,
      u.beds, u.bor + "%", fmt(u.alos, 1), fmt(u.toi, 1), u.bto, badge(u.status)] })));
}

function bedBoard() {
  const labels = ["Pagi 06–12", "Siang 12–18", "Sore 18–24", "Malam 24–06"];
  return table([{ t:"Unit" }, { t:"Bed", num:true }, ...labels.map(l => ({ t:l })), { t:"Bersih", num:true }, { t:"Hold IGD", num:true }],
    capacity.bedBoard.map(r => ({ cells: [`<span class="font-medium">${esc(r.unit)}</span>`, r.beds,
      ...r.occupied.map(o => {
        const pct = Math.min(100, Math.round((o / r.beds) * 100));
        return `<div class="flex min-w-28 flex-col gap-1"><div class="progress ${pct >= 90 ? "*:bg-destructive" : ""}" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div><span class="text-xs text-muted-foreground tabular-nums">${o}/${r.beds} · ${pct}%</span></div>`;
      }), r.clean, r.hold] })));
}

/* ================= pra-verifikasi klaim (ValidAI) & kesiapan alat (ESOPT) ================= */
const defBtn = k => `<button type="button" class="btn" data-variant="ghost" data-size="sm" data-k="${k}" aria-label="Definisi ${k}">${icon("info")}Definisi</button>`;
const sourceFoot = (s, text) => `<div class="flex flex-col items-start gap-2"><span class="badge" data-variant="outline">${esc(s)} · mock</span><span>${text}</span></div>`;
function precheckFor() {
  const c = claimPrecheck, verified = pc(c.verified), rate = pv("pv", c.complete / c.verified * 100, 0.05);
  return { ...c, verified, complete: Math.round(verified * rate / 100), rate,
    avgFixItems: pv("pvfix", c.avgFixItems, 0.08),
    categories: c.categories.map(x => ({ ...x, n: pc(x.n) })), checklistFails: c.checklistFails.map(x => ({ ...x, n: pc(x.n) })) };
}
function precheckCards() {
  const c = precheckFor();
  return grid("2xl:grid-cols-2", `
    ${card({ title: "Pra-verifikasi berkas klaim", sub: `${fmt(c.verified)} berkas diperiksa sebelum dikirim`, action: `<span class="flex shrink-0 flex-wrap items-center justify-end gap-2">${badge("na")}${defBtn("PRAVER")}</span>`,
      body: `<div class="flex flex-col gap-4">
        <div class="flex flex-wrap items-end gap-x-6 gap-y-2">
          <div class="flex flex-col"><strong class="text-2xl font-semibold tabular-nums">${fmt(c.rate, 1)}<span class="ml-1 text-sm font-normal text-muted-foreground">% lolos</span></strong><span class="text-sm text-muted-foreground">${fmt(c.complete)} lengkap · ${fmt(c.verified - c.complete)} perlu perbaikan</span></div>
          <div class="flex flex-col"><strong class="text-2xl font-semibold tabular-nums">${fmt(c.avgFixItems, 1)}</strong><span class="text-sm text-muted-foreground">butir perbaikan per berkas</span></div>
        </div>
        <div class="progress h-2" role="progressbar" aria-valuenow="${Math.round(c.rate)}" aria-valuemin="0" aria-valuemax="100" aria-label="${fmt(c.rate, 1)}% berkas lolos"><span style="width:${c.rate}%"></span></div>
        <p class="text-sm font-medium">Temuan per kategori aturan</p>
        ${hBars({ rows: c.categories.map(x => ({ label: x.label, v: x.n })), unit: "×", label: "Temuan pra-verifikasi per kategori", highlight: [0], highlightColor: "emph" })}
      </div>`,
      foot: sourceFoot(c.source, "Kategori: Aturan Coding Medis, Aturan Klinis, Berita Acara Kesepakatan, Peraturan Menteri Kesehatan. Coding medis searah dengan penyebab denial terbesar (kode INA-CBG tidak sesuai). Target belum ditetapkan karena aturan Complete/Incomplete belum diketahui.") })}
    ${checklistCard(c)}`);
}
/* antrean perbaikan berkas: dipakai di Keuangan (direksi) dan Operasional (kepala unit) */
function checklistCard(c = precheckFor()) {
  return card({ id: "kartu-checklist", title: "Butir checklist paling sering gagal", sub: "dari 10 butir kelengkapan berkas · 2 terbanyak disorot",
    body: hBars({ rows: c.checklistFails.map(x => ({ label: x.label, v: x.n })), unit: "×", label: "Butir checklist klaim gagal", highlight: [0, 1], highlightColor: "emph" }),
    foot: sourceFoot(c.source, "Perbaiki butir ini sebelum berkas dikirim ke BPJS untuk menekan denial.") });
}

function equipmentFor() {
  const e = equipment;
  const rows = e.units.filter(u => state.unit === "all" || u.unit === state.unit);
  const tot = rows.reduce((a, u) => a + u.total, 0), rdy = rows.reduce((a, u) => a + u.ready, 0);
  return { ...e, rows, tot, rdy, readyPct: tot ? rdy / tot * 100 : null,
    calibPct: e.calibration.inPeriod / e.calibration.required * 100,
    excursions: pc(e.coldChain.excursions),
    due: e.calibrationDue.filter(d => state.unit === "all" || d.unit === state.unit) };
}
function renderEquipment() {
  const e = equipmentFor();
  const readySt = e.readyPct == null ? "na" : statusFromTarget("≥" + e.readyTarget, e.readyPct);
  const utilBad = e.utilities.filter(u => u.st !== "ok").length;
  const pctCell = u => { const p = Math.round(u.ready / u.total * 100);
    return `<div class="flex min-w-28 flex-col gap-1"><div class="progress ${p < 85 ? "*:bg-destructive" : ""}" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100" aria-label="${p}% siap"><span style="width:${p}%"></span></div><span class="text-xs text-muted-foreground tabular-nums">${p}%</span></div>`; };
  return `
  ${sectionHead("Kesiapan alat & utilitas kritis", "snapshot hari ini · alat kritis per unit", scopeText())}
  ${grid("sm:grid-cols-2 2xl:grid-cols-4", `
    ${simpleMetric({ k:"ALATKRIT", label:"Alat kritis siap pakai", value: e.readyPct == null ? "–" : fmt(e.readyPct, 1), unit:"%", target:"≥" + e.readyTarget + "%", status: readySt, note: e.tot ? `${e.rdy} dari ${e.tot} alat berstatus READY.` : "Unit ini tidak punya alat kritis terdaftar." })}
    ${simpleMetric({ k:"KALIB", label:"Kepatuhan kalibrasi", value: fmt(e.calibPct, 1), unit:"%", status:"na", note:`${e.calibration.inPeriod} dari ${e.calibration.required} alat dalam masa kalibrasi.` })}
    ${simpleMetric({ k:"COLDCHAIN", label:"Excursion cold chain", value: fmt(e.excursions), unit:"kejadian", target:"0", status: e.excursions ? "warn" : "ok", note:`${e.coldChain.storages} unit penyimpanan farmasi dipantau.` })}
    ${simpleMetric({ label:"Utilitas kritis normal", value: `${e.utilities.length - utilBad}/${e.utilities.length}`, unit:"sistem", target:"semua normal", status: utilBad ? "warn" : "ok", note:"Oksigen, vakum, genset, UPS, cold chain." })}`)}
  ${grid("2xl:grid-cols-5", `
    <div class="min-w-0 2xl:col-span-3">${card({ title: "Kesiapan alat kritis per unit", sub: "merah = <85% siap",
      body: table([{ t:"Unit" }, { t:"Alat", num:true }, { t:"Siap", num:true }, { t:"Peringatan", num:true }, { t:"Tidak siap", num:true }, { t:"% siap" }],
        e.rows.map(u => ({ cells: [`<span class="font-medium">${esc(u.unit)}</span>`, u.total, u.ready, u.warn, u.down ? `<span class="font-medium text-destructive">${u.down}</span>` : 0, pctCell(u)] })),
        "Unit ini tidak punya alat kritis terdaftar."),
      foot: sourceFoot(e.source, "Peringatan = menunggu kalibrasi, maintenance, pembersihan, atau aksesori; tidak siap = rusak, dikarantina, atau out of service.") })}</div>
    <div class="min-w-0 2xl:col-span-2">${card({ title: "Utilitas kritis", sub: "status terkini",
      body: itemList(e.utilities.map(u => ({ title: u.name, desc: `${u.value} · data ${u.age} lalu`, badge: badge(u.st, u.st === "ok" ? "Normal" : u.st === "warn" ? "Perhatian" : "Gangguan") }))),
      foot: e.coldChain.note })}</div>`)}
  ${grid("2xl:grid-cols-2", `
    ${card({ title: "Kalibrasi jatuh tempo", sub: "≤30 hari dan terlambat",
      body: `<div class="flex flex-col gap-4">
        <div class="progress h-2" role="progressbar" aria-valuenow="${Math.round(e.calibPct)}" aria-valuemin="0" aria-valuemax="100" aria-label="${fmt(e.calibPct, 1)}% alat dalam masa kalibrasi"><span style="width:${e.calibPct}%"></span></div>
        ${e.due.length ? itemList(e.due.map(d => ({ title: d.name, desc: `${d.unit} · ${d.due}`, badge: badge(d.st, d.st === "crit" ? "Terlambat" : d.st === "warn" ? "Segera" : "Terjadwal") }))) : `<p class="text-sm text-muted-foreground">Tidak ada kalibrasi jatuh tempo untuk unit ini.</p>`}
      </div>`,
      foot: "Alat yang lewat jatuh tempo kalibrasi dikarantina sampai lulus uji ulang." })}
    ${card({ title: "Tren kesiapan alat kritis", sub: `% READY · ${gran("7 bulan terakhir")} · target ≥${e.readyTarget}%`,
      body: trendChart({ series: [{ name: "Alat kritis siap", data: e.readySeries }], labels: e.readyLabels, target: e.readyTarget, unit: "%", label: "Tren kesiapan alat kritis", height: 240 }) })}`)}`;
}

function renderOperasional() {  return `
  ${sectionHead("Operasional & kapasitas", "Barber Johnson · per bangsal", scopeText())}
  ${grid("2xl:grid-cols-5", `
    <div class="min-w-0 2xl:col-span-3">${card({ title: "Barber Johnson", sub: "BOR vs ALOS per unit · area biru = zona efisiensi",
      body: scatterBj(),
      foot: "ICU dan HCU berada di kuadran BOR tinggi–ALOS panjang: bed terpakai intensif dan lama. VIP berada di BOR rendah–ALOS pendek: kapasitas menganggur." })}</div>
    <div class="flex min-w-0 flex-col gap-6 2xl:col-span-2">
      ${capacityCard()}
      ${card({ title: "Unit perlu perhatian", sub: "hari ini", body: itemList([
        { title: "ICU", desc: "92% · 11/12 bed", badge: badge("crit", "Kritis") },
        { title: "HCU", desc: "89% · 16/18 bed", badge: badge("warn", "Pantau") },
        { title: "Rawat Inap A", desc: "88% · 35/40 bed", badge: badge("warn", "Pantau") },
        { title: "VIP / Paviliun", desc: "58% · 13/22 bed", badge: badge("ok", "Longgar") }]) })}
    </div>`)}
  ${card({ title: "Indikator rawat inap per unit", sub: "klik unit untuk memfilter", body: unitTable(),
    foot: "BTO dan TOI lebih berguna dibaca bersama pada Barber Johnson daripada sebagai angka terpisah." })}
  ${card({ title: "Bed board okupansi harian", sub: "4 jendela jam · hari ini · merah = ≥90%", body: bedBoard(),
    foot: "Hold IGD menunda pindahan; bed bersih menunggu pembersihan akhir sebelum diisi." })}
  ${grid("2xl:grid-cols-2", `
    ${card({ title: "Tren okupansi", sub: `BOR % · ${gran("14 hari terakhir")}`, body: trendChart({ series: [{ name: "BOR harian", data: capacity.occupancySeries }], labels: capacity.occupancyLabels, band: [60, 85], unit: "%" }) })}
    ${card({ title: "Pasien prioritas", sub: "drill-down unit", body: priorityTable(priorityPatients.filter(p => state.unit === "all" || p.unit === state.unit).slice(0, 5)),
      foot: "Daftar penuh tersedia untuk kepala unit sesuai RBAC." })}`)}
  ${state.role === "unit" ? grid("2xl:grid-cols-2", `${checklistCard()}${card({ title: "Kenapa ini di Operasional", body: `<p class="text-sm leading-relaxed">Resume medis, SEP, dan kewajaran LOS disiapkan di unit. Butir yang gagal pra-verifikasi adalah antrean perbaikan berkas sebelum klaim dikirim; angka keuangannya ada di tab Keuangan untuk direksi.</p>` })}`) : ""}
  ${renderEquipment()}`;
}

function waterfall(components, total, target) {
  let acc = 0;
  const data = components.map(c => { const y = [acc, acc + c.v]; acc += c.v; return { x: c.label, y }; });
  data.push({ x: "Total", y: [0, total] });
  return chart("Komposisi pendapatan terhadap target", h => merge(baseOpts("rangeBar", h), {
    series: [{ name: "Pendapatan", data }],
    colors: [({ dataPointIndex }) => (dataPointIndex === data.length - 1 ? C.main() : col("--chart-1", 0.55))],
    plotOptions: { bar: { horizontal: true, barHeight: "60%", borderRadius: 3 } },
    dataLabels: { enabled: true, formatter: (v, o) => { const y = data[o.dataPointIndex].y; return fmt(y[1] - y[0], 1) + " M"; }, style: { fontSize: "12px", fontWeight: 500, colors: [C.fg()] },
      background: { enabled: true, foreColor: col("--card"), borderWidth: 0, borderRadius: 3, padding: 4, opacity: 0.92, dropShadow: { enabled: false } }, dropShadow: { enabled: false } },
    xaxis: { min: 0, max: Math.max(total, target) * 1.05, labels: { formatter: v => fmt(v) } },
    tooltip: { custom: ({ dataPointIndex }) => { const p = data[dataPointIndex]; return `<div class="px-3 py-2 text-xs"><b>${esc(p.x)}</b>: ${fmt(p.y[1] - p.y[0], 1)} M</div>`; } },
    annotations: { xaxis: [{ x: target, borderColor: C.crit(), strokeDashArray: 5,
      label: { text: `Target ${fmt(target, 1)} M`, orientation: "horizontal", textAnchor: "end", offsetX: -4, style: { background: C.crit(), color: C.onCrit(), fontSize: "12px" }, borderColor: C.crit() } }] }
  }), Math.max(220, data.length * 44 + 40));
}

function financeFor() {
  const comps = finance.revenueComponents.map(c => ({ ...c, v: pc(c.v, 2) }));
  const exact = (v, dec = 1) => (isMonth() ? v : Math.round(v * P().factor * 10 ** dec) / 10 ** dec);
  const f = { ...finance, revenueComponents: comps, revenue: Math.round(comps.reduce((a, c) => a + c.v, 0) * 10) / 10, revenueTarget: exact(finance.revenueTarget),
    pendingClaims: pc(finance.pendingClaims, 2), arDays: pv("ar", finance.arDays, 0.05), denialRate: pv("den", finance.denialRate, 0.08), collectionRate: pv("col", finance.collectionRate, 0.01),
    denialPareto: finance.denialPareto.map(d => ({ ...d, n: pc(d.n) })) };
  /* status selalu dihitung dari target, tidak pernah ditulis tangan */
  f.st = {
    rev: statusFromTarget("≥" + f.revenueTarget, f.revenue),
    ar: statusFromTarget("≤" + f.arTarget, f.arDays),
    den: statusFromTarget("≤" + f.denialTarget, f.denialRate),
    col: statusFromTarget("≥95", f.collectionRate)
  };
  return f;
}
function renderKeuangan() {
  const f = financeFor(), st = f.st;
  const denialTotal = f.denialPareto.reduce((a, d) => a + d.n, 0);
  const claimsTotal = pc(1024), denied = Math.round(claimsTotal * f.denialRate / 100);
  const reconcile = pc(34), docs = pc(22);
  const gap = Math.max(0, f.revenueTarget - f.revenue);
  const cover = gap ? Math.min(100, f.pendingClaims / gap * 100) : 100;
  const agingTotal = f.aging.reduce((a, x) => a + x.v, 0), aged = f.aging.slice(2).reduce((a, x) => a + x.v, 0);
  const old90 = f.aging[f.aging.length - 1].v / agingTotal * 100;
  const unitNote = state.unit === "all" ? "" : ` · keuangan dihitung di tingkat RS, bukan per unit`;
  const verdict = gap
    ? `Pendapatan kurang <b class="tabular-nums">${fmt(gap, 1)} M</b> dari target. Klaim tertahan <b class="tabular-nums">${fmt(f.pendingClaims, 2)} M</b> dapat menutup ${fmt(cover, 0)}% selisih bila rekonsiliasi kode INA-CBG selesai. Klaim tertahan adalah bagian dari piutang ${fmt(agingTotal, 2)} M.`
    : `Pendapatan mencapai target. Klaim tertahan <b class="tabular-nums">${fmt(f.pendingClaims, 2)} M</b> tetap perlu direkonsiliasi.`;
  return `
  ${sectionHead("Keuangan & siklus klaim", `${P().range} · miliar rupiah${unitNote}`, "seluruh RS")}
  ${grid("sm:grid-cols-2 2xl:grid-cols-4", `
    ${simpleMetric({ k:"REV", label:"Pendapatan", value:fmt(f.revenue, 1), unit:"M", target:fmt(f.revenueTarget, 1) + " M", status: st.rev, note:`Tercapai ${fmt(f.revenue / f.revenueTarget * 100, 1)}% target.` })}
    ${simpleMetric({ k:"AR", label:"Hari piutang (AR days)", value:fmt(f.arDays), unit:"hari", target:"≤" + f.arTarget + " hari", status: st.ar, note:`Piutang ${fmt(agingTotal, 2)} M; ${fmt(old90, 0)}% berumur >90 hari.` })}
    ${simpleMetric({ k:"DENIAL", label:"Klaim ditolak (denial)", value:fmt(f.denialRate, 1), unit:"%", target:"≤" + fmt(f.denialTarget, 1) + "%", status: st.den, note:"Kode INA-CBG tidak sesuai mendominasi." })}
    ${simpleMetric({ k:"COLL", label:"Tingkat penagihan (collection rate)", value:fmt(f.collectionRate, 1), unit:"%", target:"≥95%", status: st.col, note:`Piutang >60 hari ${fmt(aged, 2)} M belum tertagih.` })}`)}
  <div class="alert">${icon(gap ? "alert" : "check")}<h3>Ringkasan keuangan ${esc(P().label.toLowerCase())}</h3><section><p>${verdict}</p></section></div>
  ${grid("2xl:grid-cols-2", `
    ${card({ title: "Tindak lanjut arus kas", sub: "3 langkah · pemilik dan tenggat · klik untuk melihat buktinya", body: itemList([
      { title: `Rekonsiliasi ${fmt(reconcile)} klaim kode INA-CBG`, desc: "Casemix & Manajer Keuangan · tenggat 5 Des", badge: badge("crit", "Kritis"), jump: "kartu-denial" },
      { title: `Lengkapi ${fmt(docs)} berkas klaim tertahan`, desc: "Kepala unit rawat inap & IGD · resume medis, SEP", badge: badge("warn", "Pantau"), jump: "kartu-checklist" },
      { title: `Tagih piutang >60 hari (${fmt(aged, 2)} M)`, desc: "Manajer Keuangan · dahulukan klaim BPJS periode Sep–Okt", badge: badge(st.col === "ok" ? "ok" : "warn", st.col === "ok" ? "Stabil" : "Pantau"), jump: "kartu-piutang" }]),
      foot: sourceFoot("Klaim BPJS · billing internal", "Diurutkan dari dampak arus kas terbesar.") })}
    ${card({ id: "kartu-denial", title: "Penyebab denial klaim", sub: `${fmt(denied)} dari ${fmt(claimsTotal)} klaim ditolak · terbanyak di atas`,
      body: hBars({ rows: f.denialPareto.map(d => ({ label: d.label, v: d.n })), unit: "×", label: "Penyebab denial klaim", highlight: [0], highlightColor: "emph" }),
      foot: sourceFoot("Klaim BPJS (e-klaim)", "Penyebab terbanyak searah dengan temuan pra-verifikasi Coding medis di bawah.") })}`)}
  ${precheckCards()}
  ${grid("2xl:grid-cols-2", `
    ${card({ title: "Tren pendapatan vs target", sub: `miliar rupiah · ${gran(f.trendLabels.length + " bulan")} · sumbu tidak mulai dari nol`,
      body: trendChart({ series: [{ name: "Realisasi", data: f.revenueSeries.map(v => v * P().perPoint) }, { name: state.period === "today" ? "Target per 2 jam" : state.period === "week" ? "Target harian" : "Target bulanan", data: f.revenueTargetSeries.map(v => v * P().perPoint) }], labels: f.trendLabels, unit: " M" }),
      foot: sourceFoot("Billing internal", gap ? `Selisih ${fmt(gap, 1)} M terhadap target periode ini; klaim tertahan ${fmt(f.pendingClaims, 2)} M menutup ${fmt(cover, 0)}% di antaranya.` : "Realisasi di atas target periode ini.") })}
    ${card({ title: "Tren hari piutang", sub: `hari · target ≤${f.arTarget}`,
      body: trendChart({ series: [{ name: "AR days", data: f.arSeries }], labels: f.trendLabels, target: f.arTarget, unit: " hari" }),
      foot: sourceFoot("Billing internal · klaim BPJS", "Naik sejak Juni seiring denial INA-CBG; turunkan lewat rekonsiliasi klaim sebelum 5 Des.") })}`)}
  ${grid("2xl:grid-cols-5", `
    <div class="min-w-0 2xl:col-span-3">${card({ title: "Komposisi pendapatan", sub: `vs target ${fmt(f.revenueTarget, 1)} M`, body: waterfall(f.revenueComponents, f.revenue, f.revenueTarget),
      foot: sourceFoot("Billing internal", `Garis putus-putus = target. Rawat inap menyumbang ${fmt(f.revenueComponents[0].v / f.revenue * 100, 1)}% pendapatan.`) })}</div>
    <div class="min-w-0 2xl:col-span-2">${card({ id: "kartu-piutang", title: "Umur piutang", sub: `posisi saat ini · total ${fmt(agingTotal, 2)} M · >60 hari disorot`,
      body: hBars({ rows: f.aging.map(a => ({ label: a.bucket, v: a.v })), unit: " M", dec: 2, label: "Umur piutang", highlight: f.aging.map((_, i) => i).filter(i => i >= 2), highlightColor: "emph" }),
      foot: sourceFoot("Billing internal", "Piutang >60 hari menjadi langkah ketiga di Tindak lanjut arus kas.") })}</div>`)}`;
}

function renderSDM() {
  return `
  ${sectionHead("Sumber daya manusia", "kepuasan · turnover · rasio", scopeText())}
  ${grid("lg:grid-cols-2", `
    ${card({ title: "Kepuasan staf", sub: "survei internal",
      body: `${gauge({ value: hr.satisfaction, target: hr.satisfactionTarget, unit: "/100", label: "Kepuasan staf" })}
        <p class="text-sm text-muted-foreground">Di bawah target ${hr.satisfactionTarget}. Turnover ${fmt(hr.turnover, 1)}% per tahun (target &lt;${hr.turnoverTarget}%), absensi ${fmt(hr.absence, 1)}%.</p>`,
      foot: "Kepuasan staf adalah KPI SDM tertinggi menurut manajer RS (Nabovati 2023)." })}
    ${card({ title: "Tren turnover", sub: "% per tahun", body: trendChart({ series: [{ name: "Turnover", data: hr.turnoverSeries }], labels: hr.turnoverLabels, target: hr.turnoverTarget, unit: "%", height: 260 }) })}`)}
  ${card({ title: "Kehadiran perawat unit × shift", sub: "% shift terisi",
    body: heatmap({ rows: hr.shiftHeat.units.map(u => ({ label: u.unit, v: u.v })), cols: hr.shiftHeat.shifts, unit: "%", label: "Peta panas kehadiran perawat",
      ranges: () => [{ from: 0, to: 79.99, color: C.crit(), name: "<80%" }, { from: 80, to: 89.99, color: C.warn(), name: "80–90%" }, { from: 90, to: 100, color: C.ok(), name: "≥90%" }] }),
    foot: "Shift malam IGD dan Rawat Inap C paling rendah — tekanan absensi tertinggi." })}
  ${grid("lg:grid-cols-2", `
    ${card({ title: "Komposisi tenaga", sub: `${hr.headcount.reduce((a, b) => a + b.n, 0)} orang`,
      body: hBars({ rows: hr.headcount.map(x => ({ label: x.role, v: x.n })), unit: " org", label: "Komposisi tenaga" }),
      foot: "Komposisi menentukan kapasitas shift; bukan indikator kinerja tunggal." })}
    ${card({ title: "Rasio perawat : pasien", sub: "per unit",
      body: table([{ t:"Unit" }, { t:"Rasio", num:true }, { t:"Target", num:true }, { t:"Status" }],
        hr.ratio.map(r => ({ cells: [`<span class="font-medium">${esc(r.unit)}</span>`, esc(r.ratio), esc(r.target), badge(r.status)] }))),
      foot: "IGD 1:3 dari target 1:2 — sumber tekanan kepuasan staf." })}`)}`;
}

function renderKepatuhan() {
  return `
  ${sectionHead("Kepatuhan regulasi", "13 INM · 6 indikator SIRS · tenggat", compliance.akreditasi)}
  ${grid("2xl:grid-cols-5", `
    <div class="min-w-0 2xl:col-span-3">${card({ title: "Scorecard 13 INM", sub: `${inmFor().filter(i => i.status === "ok").length}/${inm.length} terpenuhi`,
      body: statusTable(inmFor().map(i => ({ n: i.k, t: i.target, v: fmtAuto(i.value), st: i.status }))),
      foot: "Dasar: Permenkes 30/2022. Pelaporan melalui SIMAR." })}</div>
    <div class="flex min-w-0 flex-col gap-6 2xl:col-span-2">
      ${card({ title: "Indikator SIRS", sub: "RL 1.2 & 3.1", body: table([{ t:"Indikator" }, { t:"Nilai", num:true }, { t:"Target", num:true }, { t:"Status" }],
        sirs.map(s => ({ cells: [`<span class="font-medium">${esc(s.k)}</span>`, esc(String(s.value)), esc(s.target), badge(s.status)] }))) })}
      ${card({ title: "Tenggat pelaporan", sub: "terdekat", body: `<div class="flex flex-col divide-y divide-border">${compliance.deadlines.map(d => `
        <div class="item rounded-none px-0" data-size="sm">
          <figure class="flex size-10 flex-col items-center justify-center rounded-md bg-muted text-center leading-none"><b class="text-sm">${esc(d.date.split(" ")[0])}</b><span class="text-xs text-muted-foreground">${esc(d.date.split(" ").slice(1).join(" "))}</span></figure>
          <section class="min-w-0"><h3>${esc(d.label)}</h3><p>${d.days} hari lagi</p></section>
          <aside>${d.status === "due" ? badge("crit", "Jatuh tempo") : badge("neutral", "Terjadwal")}</aside>
        </div>`).join("")}</div>` })}
    </div>`)}`;
}

function strategyMap() {
  const chain = [0, 1, 2, 3].map(i => bsc[i]); // keuangan → pelanggan → proses → pembelajaran (atas → bawah)
  return `<ol class="flex flex-col items-stretch gap-1" aria-label="Peta strategi: sebab di bawah, akibat di atas">${chain.map((b, i) => `
    ${i ? `<li class="flex justify-center text-muted-foreground" aria-hidden="true">${svg(ICON.up, 'class="size-5"')}</li>` : ""}
    <li class="item" data-variant="muted">
      <section class="min-w-0"><h3>${esc(b.p)}</h3><p class="line-clamp-none">${esc(b.note)}</p></section>
      <aside class="flex items-center gap-2"><strong class="text-xl font-semibold tabular-nums">${b.score}</strong>${badge(b.status)}</aside>
    </li>`).join("")}</ol>`;
}

function renderStrategi() {
  const rows = [
    { n:"Pendapatan 28,4 M / 30,0 M", owner:"Direktur Keuangan", due:"31 Des", st:"warn" },
    { n:"AR days ≤30", owner:"Manajer Keuangan", due:"31 Des", st:"warn" },
    { n:"Kepatuhan alur klinis >80%", owner:"Komite Mutu", due:"7 Des", st:"crit" },
    { n:"SC emergensi ≥80% dalam 30 mnt", owner:"Kepala OK", due:"7 Des", st:"crit" },
    { n:"Rasio perawat IGD 1:2", owner:"SDM", due:"31 Jan", st:"crit" },
    { n:"Kepuasan pasien >85", owner:"Direktur Pelayanan", due:"31 Des", st:"ok" }
  ];
  return `
  ${sectionHead("Kinerja strategis", "Balanced Scorecard · 4 perspektif", "Q4 2026")}
  ${grid("sm:grid-cols-2 2xl:grid-cols-4", bsc.map(b => card({ title: esc(b.p), action: badge(b.status),
    body: `<div class="flex flex-col gap-3">
      <strong class="text-3xl font-semibold tabular-nums">${b.score}<span class="ml-1 text-sm font-normal text-muted-foreground">/100</span></strong>
      <div class="progress" role="progressbar" aria-valuenow="${b.score}" aria-valuemin="0" aria-valuemax="100"><span style="width:${b.score}%"></span></div>
      <p class="text-sm text-muted-foreground">${esc(b.note)}</p>
      <dl class="flex flex-col gap-2 text-sm">${b.items.map(i => `<div class="flex justify-between gap-3 border-t border-border pt-2"><dt class="text-muted-foreground">${esc(i.k)}</dt><dd class="text-right font-medium tabular-nums">${esc(i.value)} · ${esc(i.target)}</dd></div>`).join("")}</dl>
    </div>` })).join(""))}
  ${grid("2xl:grid-cols-2", `
    ${card({ title: "Peta strategi sebab-akibat", sub: "panah = sebab → akibat, ke atas", body: strategyMap(),
      foot: "Pembelajaran & pertumbuhan (74) menekan proses internal; perbaikan kepuasan staf menjadi hulu sebelum target keuangan." })}
    ${card({ title: "Inisiatif strategis", sub: "6 inisiatif",
      body: table([{ t:"Inisiatif", wrap:true }, { t:"Pemilik" }, { t:"Tenggat" }, { t:"Status" }], rows.map(r => ({ cells: [esc(r.n), esc(r.owner), esc(r.due), badge(r.st)] }))) })}`)}
  ${card({ title: "Cara membaca BSC", sub: "catatan metode",
    body: `<div class="flex flex-col gap-3 text-sm leading-relaxed">
      <p>Skor tiap perspektif adalah rata-rata tertimbang indikator di dalamnya, bukan hasil uji statistik. Bobot: keuangan 30%, pelanggan 25%, proses internal 25%, pembelajaran 20%.</p>
      <p>Gunakan skor untuk membandingkan arah antarperspektif, bukan untuk memberi peringkat unit. Indikator dengan status di luar target tetap ditindaklanjuti terlepas dari skornya.</p>
      <p>BSC tidak menambah indikator baru; ia menyusun ulang 18–22 indikator inti ke dalam rantai sebab-akibat.</p></div>`,
    foot: "Dasar: Kaplan &amp; Norton; tinjauan 87 BSC kesehatan (Bohm dkk. 2021, BMJ Open Quality) — 97% merujuk Kaplan–Norton, tetapi hanya 21% memakai empat perspektif aslinya tanpa diubah." })}`;
}

/* Indikator tanpa target terverifikasi: abu-abu, bukan RAG (§D). */
function unsetTargetCard(keys, title, sub) {
  const items = keys.map(k => unsetTargets.find(x => x.k === k)).filter(Boolean);
  return card({ title, sub, body: grid("sm:grid-cols-2 2xl:grid-cols-3", items.map(x => simpleMetric({ ...x, status: "na" })).join("")),
    foot: "Ditampilkan tanpa warna RAG sampai dasar target disepakati (lihat dokumen matriks §E.2)." });
}

/* ================= breadcrumb drill: ringkasan → domain → unit → kasus ================= */
function breadcrumb() {
  const tab = TABS.find(t => t.id === state.tab);
  const parts = [{ label: "RS Nusantara", crumb: "root" }];
  if (state.tab !== "ringkasan") parts.push({ label: tab.label, crumb: "tab" });
  if (state.unit !== "all") parts.push({ label: state.unit, crumb: "unit" });
  if (state.caseId) parts.push({ label: "Kasus " + state.caseId });
  const level = state.caseId ? "kasus" : state.unit !== "all" ? "unit" : state.tab === "ringkasan" ? "ringkasan" : "domain";
  return `<div class="flex flex-wrap items-center justify-between gap-2">
    <nav aria-label="Jejak drill-down" class="breadcrumb">
      <ol class="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">${parts.map((p, i) => {
        const last = i === parts.length - 1;
        return `${i ? `<li role="presentation" aria-hidden="true">${svg(ICON.chevron, 'class="size-3.5"')}</li>` : ""}<li>${last
          ? `<span aria-current="page" class="font-medium text-foreground">${esc(p.label)}</span>`
          : `<button type="button" class="hover:text-foreground hover:underline" data-crumb="${p.crumb}">${esc(p.label)}</button>`}</li>`;
      }).join("")}</ol>
    </nav>
    <span class="badge" data-variant="secondary">Level: ${level}</span>
  </div>`;
}

function casePanel() {
  const p = priorityPatients.find(x => x.id === state.caseId);
  if (!p) return "";
  const u = unitsFor().find(x => x.name === p.unit);
  const row = (t, d) => `<div class="flex flex-col gap-1"><dt class="text-sm text-muted-foreground">${t}</dt><dd class="text-sm font-medium">${d}</dd></div>`;
  return card({ title: `Detail kasus ${esc(p.id)}`, sub: `akses RBAC · ${esc(p.unit)}`, action: badge(p.risk, riskLabel(p.risk)),
    body: `<dl class="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
      ${row("Pasien", `${esc(p.name)}, ${p.age} th (anonim)`)}${row("Diagnosis kerja", esc(p.dx))}${row("Catatan klinis", esc(p.note))}
      ${u ? row("Konteks unit", `BOR ${u.bor}% · ALOS ${fmt(u.alos, 1)} hari · ${u.beds} TT`) : ""}
      ${row("Sumber", `SIMRS rekam medis elektronik · ${esc(RS_INFO.updated)}`)}</dl>`,
    foot: `<div class="flex w-full flex-wrap items-center justify-between gap-3"><span>Data per pasien tidak tampil di tampilan direksi; level ini hanya terbuka lewat drill-down ber-RBAC.</span>
      <button type="button" class="btn" data-variant="outline" data-size="sm" data-crumb="unit">Kembali ke ${esc(p.unit)}</button></div>` });
}

/* ================= panduan (dokumentasi untuk pembaca awam) ================= */
function refNo(id) { return docsContent.references.findIndex(r => r.id === id) + 1; }
function refChips(ids = []) {
  const chips = ids.map(id => ({ id, n: refNo(id) })).filter(x => x.n > 0).sort((a, b) => a.n - b.n)
    .map(x => `<button type="button" class="badge tabular-nums" data-variant="outline" data-docjump="ref-${x.id}" title="${esc(docsContent.references[x.n - 1].cite)}" aria-label="Rujukan ${x.n}">${x.n}</button>`).join("");
  return chips ? `<span class="inline-flex flex-wrap gap-1 align-middle">${chips}</span>` : "";
}

function renderDocs() {
  const d = docsContent;
  const canOpen = id => allowedTabs().some(t => t.id === id);
  const statusLine = items => `<div class="flex flex-col gap-3">${items.map(c => `<div class="flex flex-col gap-1.5">${badge(c.status, c.label)}<p class="text-sm text-muted-foreground">${esc(c.text)}</p></div>`).join("")}</div>`;
  const bullets = items => `<ul class="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed">${items.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`;
  return `
  ${sectionHead("Panduan dashboard", "apa yang ditampilkan, kenapa, dan datanya dari mana")}
  ${grid("2xl:grid-cols-5", `
    <div class="min-w-0 2xl:col-span-3">${card({ title: esc(d.intro.title),
      body: `<div class="flex flex-col gap-3 text-sm leading-relaxed">${d.intro.paragraphs.map(p => `<p>${esc(p)}</p>`).join("")}<p class="text-muted-foreground">Dasar pemilihan ${refChips(d.intro.refs)}</p></div>` })}</div>
    <div class="min-w-0 2xl:col-span-2">${card({ title: esc(d.intro.colorsTitle), action: refChips(d.intro.colorsRefs), body: statusLine(d.intro.colors) })}</div>`)}
  ${card({ title: esc(d.intro.tipsTitle), body: bullets(d.intro.tips) })}

  ${sectionHead("Penjelasan per halaman", "ketuk judul untuk membuka")}
  ${card({ title: "Sembilan halaman dashboard", sub: "pertanyaan yang dijawab tiap halaman", body: `
    <section class="accordion">${d.sections.map((s, i) => `
      <details class="group border-b border-border last:border-b-0"${i === 0 ? " open" : ""}>
        <summary class="w-full rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <h4 class="flex flex-1 items-start justify-between gap-4 py-4 text-left text-sm font-medium hover:underline">
            <span class="flex min-w-0 flex-col gap-1"><span>${esc(s.title)}</span><span class="font-normal text-muted-foreground">${esc(s.question)}</span></span>
            ${svg(ICON.down, 'class="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200 group-open:rotate-180"')}
          </h4>
        </summary>
        <section class="flex flex-col gap-4 pb-4 text-sm leading-relaxed">
          <p><b>Kenapa halaman ini ada.</b> ${esc(s.why)} ${refChips(s.refs)}</p>
          ${table([{ t:"Yang ditampilkan" }, { t:"Kenapa", wrap:true }], s.items.map(it => ({ cells: [`<span class="font-medium whitespace-normal">${esc(it.what)}</span>`, esc(it.why)] })))}
          <div role="alert" class="alert">${icon("info")}<h5>Datanya dari mana</h5><section>${esc(s.source)}</section></div>
          <div>${canOpen(s.tab) ? `<button type="button" class="btn" data-variant="outline" data-size="sm" data-go="${s.tab}">Buka halaman ${esc(s.title)}</button>`
            : `<span class="text-muted-foreground">Halaman ini tersedia untuk peran lain.</span>`}</div>
        </section>
      </details>`).join("")}
    </section>` })}

  ${grid("lg:grid-cols-2", `
    ${card({ title: esc(d.assistant.title), body: `<p class="text-sm leading-relaxed">${esc(d.assistant.text)}</p>` })}
    ${card({ title: esc(d.notShown.title), action: refChips(d.notShown.refs), body: bullets(d.notShown.items) })}`)}
  ${card({ title: esc(d.mock.title), body: `<div class="flex flex-col gap-4"><p class="text-sm leading-relaxed">${esc(d.mock.text)}</p>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">${d.mock.readiness.map(r => `<div class="flex flex-col gap-1.5">${badge(r.status, r.label)}<p class="text-sm text-muted-foreground">${esc(r.text)}</p></div>`).join("")}</div></div>` })}
  ${card({ title: "Daftar pustaka", sub: "nomor di setiap penjelasan merujuk ke daftar ini", body: `
    <ol class="flex flex-col divide-y divide-border">${d.references.map((r, i) => `
      <li id="ref-${r.id}" class="item scroll-mt-40 px-1 transition-shadow">
        <figure class="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-semibold tabular-nums">${i + 1}</figure>
        <section class="min-w-0">
          <h3 class="whitespace-normal font-normal leading-relaxed">${esc(r.cite)}</h3>
          ${r.u ? `<p><a class="break-all underline underline-offset-4" href="${esc(r.u)}" target="_blank" rel="noopener">${esc(r.u.replace(/^https?:\/\//, ""))}</a></p>` : ""}
          <p class="line-clamp-none"><b class="text-foreground">Dipakai untuk:</b> ${esc(r.usedFor)}</p>
          <p>${badge(r.verified ? "ok" : "na", r.verified ? "TERVERIFIKASI" : "BELUM DIVERIFIKASI ULANG")}</p>
        </section>
      </li>`).join("")}</ol>`,
    foot: "Semua rujukan sudah dicocokkan ke metadata Crossref/OpenAlex dan abstraknya. Status ini memeriksa keberadaan dan isi klaim, bukan kualitas metodologi studi. Uraian lengkap: docs/RESEARCH_DASHBOARD_RS.md dan docs/DASHBOARD_COMPONENT_MATRIX.md." })}`;
}

/* ================= views registry & render ================= */
const VIEWS = {
  ringkasan: renderRingkasan, mutu: renderMutu, pengalaman: renderPengalaman,
  akses: renderAkses, operasional: renderOperasional, keuangan: renderKeuangan,
  sdm: renderSDM, kepatuhan: renderKepatuhan, strategi: renderStrategi, docs: renderDocs
};

let firstRender = true;
function render({ animate = true } = {}) {
  // Perpindahan halaman: crossfade View Transitions API (bawaan browser, 0 KB);
  // dilewati bila browser belum mendukung atau pengguna memilih "kurangi gerakan".
  const swap = () => renderNow();
  if (animate && !firstRender && document.startViewTransition && !reduceMotion.matches) document.startViewTransition(swap);
  else swap();
  firstRender = false;
}
function renderNow() {
  $$("#navList a").forEach(a => a.dataset.tab === state.tab ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
  const tab = TABS.find(t => t.id === state.tab);
  $("#pageTitle").textContent = tab.label;
  $("#scopeChip").textContent = scopeText();
  $("#periodLabel").textContent = P().range;
  $$("#periodGroup [data-period]").forEach(b => { const on = b.dataset.period === state.period; b.dataset.variant = on ? "primary" : "outline"; b.setAttribute("aria-pressed", String(on)); });
  document.title = `${tab.label} — RS Nusantara`;
  pendingCharts = [];
  $("#view").innerHTML = breadcrumb() + (state.caseId ? casePanel() : "") + VIEWS[state.tab]();
  requestAnimationFrame(mountCharts);
}
function remountCharts() {
  // Tema berganti: render ulang supaya warna token yang baru terbaca.
  render({ animate: false });
}

/* ================= asisten data ================= */
const auditLog = [];
const roleIntro = {
  direksi: "Selamat pagi. Saya merangkum enam indikator inti, papan prioritas, dan status lima domain. Setiap jawaban menautkan sumber, definisi, dan dasar target.",
  unit: "Mode kepala unit. Gunakan pemilih Unit di atas untuk mempersempit cakupan. Saya bisa menjelaskan kapasitas, waktu tunggu, mutu unit, dan rencana pulang.",
  mutu: "Mode komite mutu. Fokus saya: 13 INM, matriks kepatuhan per unit, dan tenggat pelaporan SIMAR."
};

function pushUser(text) {
  $("#stream").insertAdjacentHTML("beforeend", `<div class="ml-8 self-end rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">${esc(text)}</div>`);
  scrollStream();
}
function pushBot(a) {
  const ev = (a.evidence || []).map(k => {
    const d = definitions[k];
    if (!d) return "";
    return `<button type="button" class="badge" data-variant="outline" data-ev="${k}" title="${esc(`${d.name} — ${d.formula}. Target ${d.target}. Dasar ${d.basis}. Sumber ${d.source}.`)}">${esc(k)} · ${esc(d.name)}</button>`;
  }).join("");
  const acts = (a.acts || []).map((x, i) => `<button type="button" class="btn" data-variant="secondary" data-size="sm" data-act="${i}">${esc(x.t)}</button>`).join("");
  $("#stream").insertAdjacentHTML("beforeend", `<div class="mr-4 flex flex-col gap-2 rounded-lg bg-muted px-3 py-3 text-sm leading-relaxed">
    ${a.lede ? `<p class="font-semibold">${a.lede}</p>` : ""}<div>${a.body || ""}</div>
    ${ev ? `<div class="flex flex-wrap gap-1.5">${ev}</div>` : ""}
    ${acts ? `<div class="flex flex-wrap gap-2">${acts}</div>` : ""}
  </div>`);
  const last = $("#stream").lastElementChild;
  last.querySelectorAll("[data-act]").forEach(btn => {
    const act = (a.acts || [])[Number(btn.dataset.act)];
    if (act && typeof act.f === "function") btn.addEventListener("click", () => {
      if ($("#chatSheet").open) $("#chatSheet").close();
      act.f();
    });
  });
  scrollStream();
}
function scrollStream() { const s = $("#stream"); s.scrollTop = s.scrollHeight; }

function resetChat() {
  $("#stream").innerHTML = "";
  pushBot({ lede: "Asisten data RS Nusantara", body: `${roleIntro[state.role]}<br><span class="text-muted-foreground">Prototipe memakai data mock; bukan alat medis.</span>` });
  const prompts = quickPrompts[state.role] || quickPrompts.direksi;
  $("#quick").innerHTML = prompts.map(p => `<button type="button" class="btn" data-variant="outline" data-size="sm" data-q="${esc(p.q)}">${esc(p.t)}</button>`).join("");
}

function logAudit(q) {
  auditLog.push({ at: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }), q });
  $("#auditCount").textContent = auditLog.length;
  $("#auditList").innerHTML = auditLog.map(a => `<li class="flex gap-2"><time class="tabular-nums">${a.at}</time><span>${esc(a.q)}</span></li>`).join("");
}

function answerFor(text) {
  const hit = chatKnowledge.find(k => k.match.test(text));
  return hit ? hit.act() : chatFallback();
}

function ask(text) {
  const q = String(text || "").trim();
  if (!q) return;
  pushUser(q);
  logAudit(q);
  const id = "think-" + Date.now();
  $("#stream").insertAdjacentHTML("beforeend", `<div id="${id}" class="mr-4 animate-pulse rounded-lg bg-muted px-3 py-3 text-sm text-muted-foreground">Menyusun jawaban…</div>`);
  scrollStream();
  setTimeout(() => {
    document.getElementById(id)?.remove();
    pushBot(answerFor(q));
  }, 340);
}

/* Asisten: kolom kanan di layar lebar (xl), sheet Basecoat di layar lebih kecil. */
const wide = matchMedia("(min-width: 1280px)");
function placeChat() {
  const chat = $("#chat");
  if (wide.matches) {
    if ($("#chatSheet").open) $("#chatSheet").close();
    $("#chatHome").appendChild(chat);
  } else {
    $("#chatSheetBody").appendChild(chat);
  }
}

/* ================= definisi (dialog Basecoat) ================= */
function currentValue(k) {
  const kpi = execKpis.find(x => x.k === k);
  if (kpi) return { value: `${fmtAuto(kpi.value)} ${kpi.unit}`, status: kpi.status };
  if (k === "PRAVER") { const c = precheckFor(); return { value: `${fmt(c.rate, 1)} % lolos`, status: "na" }; }
  if (["ALATKRIT", "KALIB", "COLDCHAIN"].includes(k)) { const e = equipmentFor();
    if (k === "ALATKRIT") return { value: e.readyPct == null ? "–" : `${fmt(e.readyPct, 1)} %`, status: e.readyPct == null ? "na" : statusFromTarget("≥" + e.readyTarget, e.readyPct) };
    if (k === "KALIB") return { value: `${fmt(e.calibPct, 1)} %`, status: "na" };
    return { value: `${e.excursions} kejadian`, status: e.excursions ? "warn" : "ok" }; }
  if (["REV", "AR", "DENIAL", "COLL"].includes(k)) { const f = financeFor();
    return k === "REV" ? { value: `${fmt(f.revenue, 1)} M`, status: f.st.rev } : k === "AR" ? { value: `${fmt(f.arDays)} hari`, status: f.st.ar }
      : k === "DENIAL" ? { value: `${fmt(f.denialRate, 1)} %`, status: f.st.den } : { value: `${fmt(f.collectionRate, 1)} %`, status: f.st.col }; }
  const u = unsetTargets.find(x => x.k === k);
  if (u) return { value: `${u.value} ${u.unit}`, status: "na" };
  return null;
}

function showDefinition(k) {
  const d = definitions[k];
  if (!d) return;
  logAudit("Definisi " + k);
  const cur = currentValue(k);
  const row = (t, v) => `<div class="flex flex-col gap-1 border-b border-border pb-3 last:border-b-0 last:pb-0"><dt class="text-sm text-muted-foreground">${t}</dt><dd class="text-sm">${v}</dd></div>`;
  $("#defTitle").textContent = `${k} — ${d.name}`;
  $("#defSub").textContent = `Periode ${P().range} · cakupan ${scopeText()}`;
  $("#defBody").innerHTML = `<dl class="flex flex-col gap-3">
    ${cur ? row("Nilai saat ini", `<span class="flex flex-wrap items-center gap-2"><b>${esc(cur.value)}</b>${badge(cur.status)}</span>`) : ""}
    ${row("Rumus", esc(d.formula))}
    ${row("Target", d.target ? esc(d.target) : badge("na"))}
    ${row("Dasar target", esc(d.basis))}
    ${row("Sumber data", esc(d.source))}
    ${row("Sinkron terakhir", esc(RS_INFO.updated))}
    ${row("Asal angka", "Metric layer (tidak dihitung ulang oleh asisten)")}
  </dl>`;
  $("#defAsk").dataset.defk = k;
  const dlg = $("#defDialog");
  dlg.showModal();
  dlg.dataset.state = "open";
  dlg.dataset.fsmState = "open";
}

function askAboutDefinition(k) {
  const d = definitions[k];
  if (!d) return;
  if (!wide.matches) $("#chatSheet").showModal();
  pushUser("Definisi " + k);
  pushBot({ lede: `${k} — ${d.name}`,
    body: `<b>Rumus:</b> ${esc(d.formula)}<br><b>Target:</b> ${esc(d.target || "belum ditetapkan")}<br><b>Dasar:</b> ${esc(d.basis)}<br><b>Sumber:</b> ${esc(d.source)}` });
}

/* ================= ekspor ================= */
function exportCsv() {
  const rows = [["Bagian", "Indikator", "Nilai", "Satuan", "Target", "Status"]];
  const n = v => String(v).replace(".", ",");
  execKpis.map(x => kpiFor(x.k)).forEach(d => rows.push(["KPI inti", d.name, n(d.value), d.unit, d.target, statusLabel(d.status)]));
  inmFor().forEach(i => rows.push(["INM", i.k, n(i.value), "%", i.target, statusLabel(i.status)]));
  sirs.forEach(s => rows.push(["SIRS", s.k, n(s.value), "", s.target, statusLabel(s.status)]));
  unitsFor().forEach(u => {
    rows.push(["Unit " + u.name, "BOR", n(u.bor), "%", "60–85", statusLabel(u.status)]);
    rows.push(["Unit " + u.name, "ALOS", n(u.alos), "hari", "6–9", statusLabel(u.status)]);
    rows.push(["Unit " + u.name, "TOI", n(u.toi), "hari", "1–3", statusLabel(u.status)]);
    rows.push(["Unit " + u.name, "BTO", n(u.bto), "kali/tahun", "40–50", statusLabel(u.status)]);
  });
  { const f = financeFor();
    rows.push(["Keuangan", "Pendapatan", n(f.revenue), "miliar", n(f.revenueTarget), statusLabel(f.st.rev)]);
    rows.push(["Keuangan", "Hari piutang (AR days)", n(f.arDays), "hari", "≤" + f.arTarget, statusLabel(f.st.ar)]);
    rows.push(["Keuangan", "Klaim ditolak (denial)", n(f.denialRate), "%", "≤" + n(f.denialTarget), statusLabel(f.st.den)]);
    rows.push(["Keuangan", "Tingkat penagihan (collection rate)", n(f.collectionRate), "%", "≥95", statusLabel(f.st.col)]); }
  { const c = precheckFor(); rows.push(["Keuangan", "Pra-verifikasi klaim lolos (ValidAI, mock)", n(fmt(c.rate, 1)), "%", "belum ditetapkan", statusLabel("na")]);
    c.categories.forEach(x => rows.push(["Pra-verifikasi klaim", "Temuan: " + x.label, x.n, "temuan", "", ""])); }
  { const e = equipmentFor();
    rows.push(["Alat & utilitas", "Alat kritis siap (ESOPT, mock)", e.readyPct == null ? "" : n(fmt(e.readyPct, 1)), "%", "≥" + e.readyTarget, e.readyPct == null ? statusLabel("na") : statusLabel(statusFromTarget("≥" + e.readyTarget, e.readyPct))]);
    rows.push(["Alat & utilitas", "Kepatuhan kalibrasi", n(fmt(e.calibPct, 1)), "%", "belum ditetapkan", statusLabel("na")]);
    rows.push(["Alat & utilitas", "Excursion cold chain", e.excursions, "kejadian", "0", statusLabel(e.excursions ? "warn" : "ok")]);
    e.utilities.forEach(u => rows.push(["Utilitas", u.name, u.value, "", "normal", statusLabel(u.st)])); }
  rows.push(["SDM", "Kepuasan staf", n(hr.satisfaction), "/100", "≥" + hr.satisfactionTarget, "Waspada"]);
  rows.push(["Identitas", "Periode", `${P().label} (${P().range})`, "", "", ""]);
  rows.push(["Identitas", "Diekspor", new Date().toLocaleString("id-ID"), "", "", ""]);

  const csv = "﻿" + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = `rs-nusantara-kpi-${state.period}-2026.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);

  const label = $("#exportBtn span");
  const prev = label.textContent;
  label.textContent = `${rows.length} baris diekspor`;
  setTimeout(() => { label.textContent = prev; }, 2400);
}

/* ================= events & init ================= */
function setUnit(name) {
  state.unit = name === "all" ? "all" : name;
  state.caseId = null;
  const sel = $("#unitFilter");
  if (sel.value !== state.unit) sel.value = state.unit;
  render();
}

function init() {
  initSelects();
  renderNav();
  const fromHash = location.hash.slice(1);
  if (TABS.some(t => t.id === fromHash)) state.tab = fromHash;
  render();
  resetChat();
  placeChat();
  wide.addEventListener("change", placeChat);

  window.addEventListener("hashchange", () => {
    const t = location.hash.slice(1);
    if (t && t !== state.tab && TABS.some(x => x.id === t)) go(t);
  });

  $("#sidebarToggle").addEventListener("click", () => {
    const sb = $("#sidebar");
    if (typeof sb.toggle === "function") sb.toggle();
    else sb.setAttribute("aria-hidden", String(sb.getAttribute("aria-hidden") !== "true"));
    // margin konten ikut bergeser; beri tahu grafik agar mengukur ulang lebarnya
    setTimeout(() => window.dispatchEvent(new Event("resize")), 320);
  });
  $("#themeBtn").addEventListener("click", () => {
    if (window.basecoat?.theme) window.basecoat.theme.toggle();
    else {
      const dark = !document.documentElement.classList.contains("dark");
      document.documentElement.classList.toggle("dark", dark);
      try { localStorage.setItem("themeMode", dark ? "dark" : "light"); } catch {}
      remountCharts();
    }
  });
  document.addEventListener("basecoat:themechange", remountCharts);

  const dlg = $("#defDialog");
  dlg.addEventListener("close", () => { dlg.dataset.state = "closed"; dlg.dataset.fsmState = "closed"; });
  $("#defAsk").addEventListener("click", () => { const k = $("#defAsk").dataset.defk; dlg.close(); askAboutDefinition(k); });
  $("#chatOpen").addEventListener("click", () => { placeChat(); $("#chatSheet").showModal(); });
  $$("dialog").forEach(d => d.addEventListener("click", e => {
    if (e.target === d || e.target.closest("[data-close]")) d.close();
  }));

  $("#roleSelect").addEventListener("change", e => {
    state.role = e.target.value;
    renderNav();
    render();
    resetChat();
  });
  $("#unitFilter").addEventListener("change", e => setUnit(e.target.value));
  $("#periodGroup").addEventListener("click", e => {
    const b = e.target.closest("[data-period]");
    if (!b || b.dataset.period === state.period) return;
    state.period = b.dataset.period;
    logAudit("Periode: " + P().label);
    render();
  });
  $("#exportBtn").addEventListener("click", exportCsv);

  document.addEventListener("click", e => {
    const jump = e.target.closest("[data-docjump]");
    if (jump) {
      const el = document.getElementById(jump.dataset.docjump);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-ring");
      return setTimeout(() => el.classList.remove("ring-2", "ring-ring"), 1600);
    }
    const crumb = e.target.closest("[data-crumb]");
    if (crumb) {
      const c = crumb.dataset.crumb;
      if (c === "root") { state.unit = "all"; $("#unitFilter").value = "all"; return go("ringkasan"); }
      if (c === "tab") return setUnit("all");
      if (c === "unit") { state.caseId = null; return render(); }
    }
    const caseBtn = e.target.closest("[data-case]");
    if (caseBtn) {
      const p = priorityPatients.find(x => x.id === caseBtn.dataset.case);
      if (!p) return;
      if (units.some(u => u.name === p.unit)) { state.unit = p.unit; $("#unitFilter").value = p.unit; }
      state.caseId = p.id;
      logAudit("Drill kasus " + p.id);
      render();
      return window.scrollTo({ top: 0, behavior: "smooth" });
    }
    const goBtn = e.target.closest("[data-go]");
    if (goBtn && goBtn.dataset.go) { if ($("#chatSheet").open) $("#chatSheet").close(); return go(goBtn.dataset.go); }
    const kpi = e.target.closest("[data-k]");
    if (kpi) return showDefinition(kpi.dataset.k);
    const unitBtn = e.target.closest("[data-unit]");
    if (unitBtn) return setUnit(unitBtn.dataset.unit);
    const ev = e.target.closest("[data-ev]");
    if (ev) return showDefinition(ev.dataset.ev);
    const q = e.target.closest("[data-q]");
    if (q) return ask(q.dataset.q);
  });

  $("#send").addEventListener("click", () => { const inp = $("#inp"); ask(inp.value); inp.value = ""; inp.focus(); });
  $("#inp").addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    ask(e.target.value);
    e.target.value = "";
  });
  $("#auditToggle").addEventListener("click", () => {
    const list = $("#auditList");
    list.hidden = !list.hidden;
    $("#auditToggle").setAttribute("aria-expanded", String(!list.hidden));
  });
}

init();
