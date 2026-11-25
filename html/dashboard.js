"use strict";
/* =================================================================
   Dashboard Manajemen RS Nusantara
   Render per domain + lapisan konversasional.
   Angka hanya berasal dari mock-data.js (peran metric layer).
   ================================================================= */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));

function fmt(n, d = 0) {
  return new Intl.NumberFormat("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
}
function targetNum(s) {
  const m = String(s).match(/[\d.,]+/);
  return m ? parseFloat(m[0].replace(/\./g, "").replace(",", ".")) : 0;
}
function deltaText(v, unit) {
  const sign = v > 0 ? "+" : v < 0 ? "−" : "±";
  return `${sign}${fmt(Math.abs(v), Number.isInteger(v) ? 0 : 1)}${unit ? " " + unit : ""}`;
}
function deltaClass(d) {
  const good = d.good === "down" ? d.delta <= 0 : d.delta >= 0;
  return d.delta === 0 ? "flat" : good ? "good" : "bad";
}
function statusLabel(s) { return s === "ok" ? "ON-TARGET" : s === "warn" ? "WATCH" : s === "crit" ? "BREACH" : s === "na" ? "TARGET BELUM DITETAPKAN" : "INFO"; }
function cellStatus(ind, value) {
  const t = targetNum(ind.target);
  if (ind.dir === "high") {
    if (value >= t) return "ok";
    if (value >= t * 0.94) return "warn";
    return "crit";
  }
  if (value <= t) return "ok";
  if (value <= t * 1.35) return "warn";
  return "crit";
}

const state = { tab: "ringkasan", role: "direksi", unit: "all", caseId: null };

const TABS = [
  { id:"ringkasan",  label:"Ringkasan",          roles:["direksi","unit","mutu"] },
  { id:"mutu",       label:"Mutu & keselamatan", roles:["direksi","unit","mutu"] },
  { id:"pengalaman", label:"Pengalaman pasien",  roles:["direksi","mutu"] },
  { id:"akses",      label:"Akses & waktu",      roles:["direksi","unit"] },
  { id:"operasional",label:"Operasional",        roles:["direksi","unit"] },
  { id:"keuangan",   label:"Keuangan",           roles:["direksi"] },
  { id:"sdm",        label:"SDM",                roles:["direksi","unit"] },
  { id:"kepatuhan",  label:"Kepatuhan",          roles:["direksi","mutu"] },
  { id:"strategi",   label:"Strategi (BSC)",     roles:["direksi"] },
  { id:"docs",       label:"Panduan",        roles:["direksi","unit","mutu"] }
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
  $("#unitFilter").innerHTML = `<option value="all">Seluruh RS</option>` +
    units.map(u => `<option value="${esc(u.name)}">${esc(u.name)}</option>`).join("");
  $("#syncTime").textContent = "24 Nov · 07:42";
  $("#scopeChip").textContent = "Cakupan: seluruh RS";
  $("#footerSources").textContent = "Sumber: " + RS_INFO.sources;
}

function renderTabs() {
  const tabs = allowedTabs();
  if (!tabs.some(t => t.id === state.tab)) state.tab = tabs[0].id;
  $("#tabs").innerHTML = tabs.map(t => `
    <button type="button" role="tab" data-tab="${t.id}" id="tab-${t.id}" data-state="${t.id === state.tab ? "active" : "inactive"}"
      aria-selected="${t.id === state.tab}" aria-controls="view" tabindex="${t.id === state.tab ? "0" : "-1"}">${t.label}</button>`).join("");
}

/* ================= SVG chart helpers ================= */
function lineChart({ series, labels, band, target, unit = "", height = 148, colors = ["var(--accent-color)"], names = [] }) {
  const W = 380, H = height, p = { l: 27, r: 10, t: 12, b: 18 };
  const vals = [...series.flat()];
  if (band) vals.push(...band);
  if (target != null) vals.push(target);
  let lo = Math.min(...vals), hi = Math.max(...vals);
  const padV = ((hi - lo) || 1) * 0.14;
  lo = Math.min(...vals) >= 0 ? Math.max(0, lo - padV) : lo - padV;
  hi += padV;
  const n = series[0].length;
  const X = i => p.l + (i / (n - 1)) * (W - p.l - p.r);
  const Y = v => p.t + (1 - (v - lo) / (hi - lo)) * (H - p.t - p.b);
  let grid = "";
  for (let t = 0; t < 3; t++) {
    const v = lo + (hi - lo) * (t / 2), y = Y(v);
    grid += `<line class="gridline" x1="${p.l}" y1="${y.toFixed(1)}" x2="${W - p.r}" y2="${y.toFixed(1)}"/>`;
    grid += `<text x="${p.l - 5}" y="${(y + 3).toFixed(1)}" text-anchor="end">${fmt(v, hi - lo < 6 ? 1 : 0)}</text>`;
  }
  let bandEl = "";
  if (band) {
    const y1 = Y(band[1]), y2 = Y(band[0]);
    bandEl = `<rect class="band" x="${p.l}" y="${y1.toFixed(1)}" width="${W - p.l - p.r}" height="${Math.max(2, y2 - y1).toFixed(1)}" rx="3"/>`;
  }
  let targetEl = "";
  if (target != null) {
    const y = Y(target);
    targetEl = `<line class="target" x1="${p.l}" y1="${y.toFixed(1)}" x2="${W - p.r}" y2="${y.toFixed(1)}"/>`;
  }
  let paths = "";
  series.forEach((s, si) => {
    const col = colors[si % colors.length];
    const d = s.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(" ");
    if (si === 0) paths += `<path class="area" d="${d} L${X(n - 1).toFixed(1)} ${Y(lo).toFixed(1)} L${X(0).toFixed(1)} ${Y(lo).toFixed(1)} Z" fill="${col}"/>`;
    paths += `<path class="series" d="${d}" stroke="${col}"/>`;
    const lx = X(n - 1), ly = Y(s[n - 1]);
    paths += `<circle class="dot" cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="3" fill="${col}"/>`;
    paths += `<text x="${(lx - 4).toFixed(1)}" y="${(ly - 7).toFixed(1)}" text-anchor="end" style="fill:${col};font-size:8.5px">${fmt(s[n - 1], 1)}${esc(unit)}</text>`;
  });
  const idx = [0, Math.floor((n - 1) / 2), n - 1];
  const xlabels = idx.map(i => `<text x="${X(i).toFixed(1)}" y="${H - 4}" text-anchor="${i === 0 ? "start" : i === n - 1 ? "end" : "middle"}">${esc(labels[i])}</text>`).join("");
  const note = `Tren ${names.join(", ") || "indikator"}; nilai terakhir ${series.map(s => fmt(s[n - 1], 1)).join(", ")} ${unit}.`;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(note)}">${bandEl}${targetEl}${grid}${paths}${xlabels}</svg>`;
}

function columnChart({ labels, values, target, unit = "", height = 150, colour }) {
  const W = 380, H = height, p = { l: 27, r: 8, t: 12, b: 20 };
  const hi = Math.max(...values, target ?? 0) * 1.14;
  const step = (W - p.l - p.r) / values.length;
  const bw = Math.max(7, step * 0.56);
  const Y = v => p.t + (1 - v / hi) * (H - p.t - p.b);
  let grid = "";
  for (let t = 0; t < 3; t++) {
    const v = hi * (t / 2), y = Y(v);
    grid += `<line class="gridline" x1="${p.l}" y1="${y.toFixed(1)}" x2="${W - p.r}" y2="${y.toFixed(1)}"/>`;
    grid += `<text x="${p.l - 5}" y="${(y + 3).toFixed(1)}" text-anchor="end">${fmt(v, 0)}</text>`;
  }
  const bars = values.map((v, i) => {
    const x = p.l + i * step + (step - bw) / 2;
    const col = colour || (target != null && v > target ? "var(--crit)" : "var(--accent-color)");
    return `<rect x="${x.toFixed(1)}" y="${Y(v).toFixed(1)}" width="${bw.toFixed(1)}" height="${(H - p.t - p.b - (Y(v) - p.t)).toFixed(1)}" rx="2.5" fill="${col}"><title>${esc(labels[i])}: ${fmt(v)}${esc(unit)}</title></rect>`;
  }).join("");
  const targetEl = target != null ? `<line class="target" x1="${p.l}" y1="${Y(target).toFixed(1)}" x2="${W - p.r}" y2="${Y(target).toFixed(1)}"/>` : "";
  const xlabels = labels.map((l, i) => i % 2 === 0 ? `<text x="${(p.l + i * step + step / 2).toFixed(1)}" y="${H - 4}" text-anchor="middle">${esc(l)}</text>` : "").join("");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc("Grafik kolom " + unit)}">${grid}${targetEl}${bars}${xlabels}</svg>`;
}

function gauge({ value, target, min = 0, max = 100, unit = "", label = "", note = "" }) {
  const cx = 66, cy = 76, r = 52;
  const pt = t => { const a = Math.PI * (1 - t); return [cx + r * Math.cos(a), cy - r * Math.sin(a)]; };
  const arc = (t0, t1, stroke, width) => {
    let d = "";
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const [x, y] = pt(t0 + ((t1 - t0) * i) / steps);
      d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"/>`;
  };
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const tt = (target - min) / (max - min);
  const [tx, ty] = pt(tt);
  return `<div class="gauge-wrap">
    <div class="gauge">
      <svg viewBox="0 0 132 100" role="img" aria-label="${esc(label)} ${fmt(value, 1)}${esc(unit)}, target ${target}">
        ${arc(0, 1, "var(--line)", 9)}${arc(0, t, "var(--accent-color)", 9)}
        <line x1="${tx.toFixed(1)}" y1="${ty.toFixed(1)}" x2="${(tx + (tx - cx) * 0.14).toFixed(1)}" y2="${(ty + (ty - cy) * 0.14).toFixed(1)}" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <div class="gauge-val">${fmt(value, 1)}<small>${esc(unit)} · target ${esc(String(target))}</small></div>
    </div>
    <div class="gauge-copy">${note}</div>
  </div>`;
}

function scatterBj() {
  const W = 360, H = 236, p = { l: 30, r: 10, t: 10, b: 26 };
  const xMin = 40, xMax = 100, yMin = 0, yMax = 12;
  const X = v => p.l + ((v - xMin) / (xMax - xMin)) * (W - p.l - p.r);
  const Y = v => H - p.b - ((v - yMin) / (yMax - yMin)) * (H - p.t - p.b);
  const grid = [40, 60, 80, 100].map(v => `<line class="sgrid" x1="${X(v)}" y1="${p.t}" x2="${X(v)}" y2="${H - p.b}"/><text x="${X(v)}" y="${H - 12}" text-anchor="middle">${v}%</text>`).join("") +
    [0, 3, 6, 9, 12].map(v => `<line class="sgrid" x1="${p.l}" y1="${Y(v)}" x2="${W - p.r}" y2="${Y(v)}"/><text x="${p.l - 5}" y="${Y(v) + 3}" text-anchor="end">${v}</text>`).join("");
  const zone = `<rect class="zone" x="${X(60).toFixed(1)}" y="${Y(9).toFixed(1)}" width="${(X(85) - X(60)).toFixed(1)}" height="${(Y(6) - Y(9)).toFixed(1)}" rx="3"/>`;
  const pts = units.map(u => {
    const cx = X(u.bor), cy = Y(u.alos);
    const show = u.status === "crit" || u.bor < 60 || u.name.includes("IGD");
    return `<circle class="pt" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="4.6" fill="var(--${u.status === "ok" ? "ok" : u.status === "warn" ? "warn" : "crit"})">
      <title>${esc(u.name)} · BOR ${u.bor}% · ALOS ${fmt(u.alos, 1)} hari</title></circle>` +
      (show ? `<text class="pt-label" x="${(cx + 6).toFixed(1)}" y="${(cy - 6).toFixed(1)}">${esc(u.name.replace("Rawat Inap ", "RI "))}</text>` : "");
  }).join("");
  return `<svg class="scatter" viewBox="0 0 ${W} ${H}" role="img" aria-label="Sebaran BOR dan ALOS per unit; zona efisiensi BOR 60 sampai 85 persen dan ALOS 6 sampai 9 hari.">
    ${zone}${grid}${pts}
    <text x="${p.l}" y="8" style="font-size:7px">ALOS (hari)</text>
    <text x="${W - p.r}" y="${H - 2}" text-anchor="end" style="font-size:7px">BOR (%)</text>
  </svg>`;
}

function waterfall(components, total, target) {
  const max = Math.max(total, target, ...components.map(c => c.v)) * 1.05;
  let acc = 0;
  const rows = components.map(c => {
    const left = (acc / max) * 100, w = (c.v / max) * 100;
    acc += c.v;
    return `<div class="wf-row"><span class="wf-label">${esc(c.label)}</span>
      <span class="wf-track"><span class="wf-seg" style="left:${left.toFixed(1)}%;width:${w.toFixed(1)}%"></span></span>
      <span class="wf-val">${fmt(c.v, 1)} M</span></div>`;
  }).join("");
  return `<div class="wf">${rows}
    <div class="wf-row"><span class="wf-label"><b>Total</b></span>
      <span class="wf-track"><span class="wf-seg total" style="left:0;width:${(total / max * 100).toFixed(1)}%"></span>
        <span title="Target ${fmt(target, 1)} M" style="position:absolute;left:${(target / max * 100).toFixed(1)}%;top:-2px;bottom:-2px;border-left:2px dashed var(--crit)"></span></span>
      <span class="wf-val"><b>${fmt(total, 1)} M</b></span></div>
  </div>`;
}

function boxplot() {
  const d = unitBoxes;
  const W = 380, H = 220, p = { l: 30, r: 10, t: 14, b: 30 };
  const hi = Math.max(...d.groups.flatMap(g => [g.max, ...(g.out || [])])) * 1.12;
  const Y = v => p.t + (1 - v / hi) * (H - p.t - p.b);
  const step = (W - p.l - p.r) / d.groups.length;
  const bw = Math.min(30, step * 0.42);
  let grid = "";
  for (let t = 0; t < 5; t++) {
    const v = hi * (t / 4), y = Y(v);
    grid += `<line class="gridline" x1="${p.l}" y1="${y.toFixed(1)}" x2="${W - p.r}" y2="${y.toFixed(1)}"/>`;
    grid += `<text x="${p.l - 5}" y="${(y + 3).toFixed(1)}" text-anchor="end">${fmt(v, 0)}</text>`;
  }
  const targetEl = `<line class="target" x1="${p.l}" y1="${Y(d.target).toFixed(1)}" x2="${W - p.r}" y2="${Y(d.target).toFixed(1)}"/>`;
  const boxes = d.groups.map((g, i) => {
    const cx = p.l + i * step + step / 2, x = cx - bw / 2;
    const outs = (g.out || []).map(o =>
      `<circle class="out" cx="${cx.toFixed(1)}" cy="${Y(o).toFixed(1)}" r="2.6"><title>${esc(g.name)}: outlier ${o}‰</title></circle>`).join("");
    return `<g><title>${esc(g.name)}: median ${g.median}‰, Q1 ${g.q1}, Q3 ${g.q3}</title>
      <line class="whisker" x1="${cx.toFixed(1)}" y1="${Y(g.min).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${Y(g.max).toFixed(1)}"/>
      <line class="whisker" x1="${(cx - bw * 0.3).toFixed(1)}" y1="${Y(g.min).toFixed(1)}" x2="${(cx + bw * 0.3).toFixed(1)}" y2="${Y(g.min).toFixed(1)}"/>
      <line class="whisker" x1="${(cx - bw * 0.3).toFixed(1)}" y1="${Y(g.max).toFixed(1)}" x2="${(cx + bw * 0.3).toFixed(1)}" y2="${Y(g.max).toFixed(1)}"/>
      <rect class="bp-box" x="${x.toFixed(1)}" y="${Y(g.q3).toFixed(1)}" width="${bw.toFixed(1)}" height="${(Y(g.q1) - Y(g.q3)).toFixed(1)}" rx="2"/>
      <line class="med" x1="${x.toFixed(1)}" y1="${Y(g.median).toFixed(1)}" x2="${(x + bw).toFixed(1)}" y2="${Y(g.median).toFixed(1)}"/>
      ${outs}
      <text class="bp-x" x="${cx.toFixed(1)}" y="${H - 8}" text-anchor="middle">${esc(g.name.replace("Rawat Inap ", "RI "))}</text>
    </g>`;
  }).join("");
  return `<svg class="chart bp-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Kotak variansi GDR per unit; garis putus-putus target ${d.target} per mil.">
    ${grid}${targetEl}${boxes}</svg>`;
}

function funnelChart() {
  const d = mortalityFunnel;
  const max = d.stages[0].n;
  const rows = d.stages.map((s, i) => {
    const w = Math.max(5, (s.n / max) * 100);
    const conv = i ? (s.n / d.stages[i - 1].n * 100) : 100;
    return `<div class="fn-row${i === d.stages.length - 1 ? " last" : ""}">
      <span class="fn-label">${esc(s.label)}</span>
      <span class="fn-track"><span class="fn-fill" style="width:${w.toFixed(1)}%"></span></span>
      <span class="fn-val">${s.n}${i ? `<small>${fmt(conv, 0)}% dari tahap sebelumnya</small>` : `<small>100%</small>`}</span>
    </div>`;
  }).join("");
  return `<div class="funnel" role="img" aria-label="Funnel audit kematian: dari ${d.stages[0].n} pasien keluar sampai ${d.stages[d.stages.length - 1].n} tindak lanjut tervalidasi.">
    ${rows}</div>`;
}

function heatGrid({ rows, days, unit = "", cellFmt = v => fmt(v, 0), dense = false }) {
  const flat = rows.flatMap(r => r.v);
  const lo = Math.min(...flat), hi = Math.max(...flat);
  const cell = v => {
    const t = (v - lo) / ((hi - lo) || 1);
    const cls = t >= 0.66 ? "hot" : t >= 0.33 ? "warm" : "cool";
    return `<td class="hg-cell ${cls}" title="${esc(cellFmt(v))}${esc(unit)}">${dense ? "" : cellFmt(v)}</td>`;
  };
  return `<div class="table-container"><table class="heatgrid${dense ? " dense" : ""}">
    <thead><tr><th class="rowhead">Unit</th>${days.map(dh => `<th>${esc(dh)}</th>`).join("")}</tr></thead>
    <tbody>${rows.map(r => `<tr><td class="rowhead">${esc(r.label)}</td>${r.v.map(v => cell(v)).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function bedBoard() {
  const d = capacity.bedBoard;
  const labels = ["Pagi 06–12", "Siang 12–18", "Sore 18–24", "Malam 24–06"];
  const row = r => `<tr>
      <td class="row-name">${esc(r.unit)}</td><td class="num">${r.beds}</td>
      ${r.occupied.map(o => {
        const pct = Math.min(100, (o / r.beds) * 100);
        const cls = pct >= 90 ? "bb-crit" : pct >= 75 ? "bb-warn" : "bb-ok";
        return `<td class="bb-cell"><span class="bb-bar"><i class="${cls}" style="width:${pct.toFixed(0)}%"></i></span><small>${o}/${r.beds}</small></td>`;
      }).join("")}
      <td class="num">${r.clean}</td><td class="num">${r.hold}</td>
    </tr>`;
  return `<div class="table-container"><table class="table bedboard">
    <thead><tr><th>Unit</th><th class="num">Bed</th>${labels.map(l => `<th class="num">${esc(l)}</th>`).join("")}<th class="num">Bersih</th><th class="num">Hold IGD</th></tr></thead>
    <tbody>${d.map(row).join("")}</tbody></table></div>`;
}

function strategyMap() {
  const W = 380, H = 256, rh = 44, gap = 16, x = 14, w = W - 14 - 96;
  const chain = [0, 1, 2, 3].map(i => bsc[i]); // keuangan → pelanggan → proses → pembelajaran (atas → bawah)
  const rects = chain.map((b, i) => {
    const y = 8 + i * (rh + gap);
    const col = `var(--${b.status === "ok" ? "ok" : b.status === "warn" ? "warn" : "crit"})`;
    return `<g>
      <rect class="sm-box sm-${b.status}" x="${x}" y="${y}" width="${w}" height="${rh}" rx="8"/>
      <text x="${x + 12}" y="${y + 18}" class="sm-title">${esc(b.p)}</text>
      <text x="${x + 12}" y="${y + 34}" class="sm-sub">${esc(b.note)}</text>
      <circle cx="${x + w - 44}" cy="${y + rh / 2}" r="4" fill="${col}"/>
      <text x="${x + w - 26}" y="${y + rh / 2 + 5}" class="sm-score" style="fill:${col}">${b.score}</text>
    </g>`;
  }).join("");
  const arrows = [0, 1, 2].map(i => {
    const yb = 8 + i * (rh + gap) + rh, yt = yb + gap;
    return `<line class="sm-arrow" x1="${x + w / 2}" y1="${yt + 3}" x2="${x + w / 2}" y2="${yb - 3}"/>
      <path class="sm-arrowhead" d="M${x + w / 2 - 4} ${yb - 4} L${x + w / 2} ${yb - 9} L${x + w / 2 + 4} ${yb - 4} Z"/>`;
  }).join("");
  return `<svg class="strategy-map" viewBox="0 0 ${W} ${H}" role="img" aria-label="Peta strategi: rantai sebab-akibat dari pembelajaran dan pertumbuhan naik ke perspektif keuangan.">
    ${arrows}${rects}
    <text x="${x}" y="${H - 4}" class="sm-cap">panah = sebab → akibat, ke atas</text>
  </svg>`;
}

/* ================= shared blocks ================= */
function metricTile(k) {
  const base = execKpis.find(x => x.k === k);
  const unit = state.unit === "all" ? null : units.find(x => x.name === state.unit);
  const scoped = unit && ["BOR", "ALOS", "TOI", "BTO"].includes(k);
  const d = scoped
    ? { ...base, value:unit[k.toLowerCase()], status:unit.status,
        note:`${unit.name} — BOR ${unit.bor}% · ALOS ${fmt(unit.alos, 1)} · TOI ${fmt(unit.toi, 1)} · BTO ${unit.bto}` }
    : base;
  const vals = [...d.series, d.value, d.band[0], d.band[1]];
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const pct = v => ((v - lo) / ((hi - lo) || 1)) * 100;
  const left = Math.max(0, Math.min(100, pct(d.band[0])));
  const right = Math.max(0, Math.min(100, pct(d.band[1])));
  const mark = Math.max(2, Math.min(98, pct(d.value)));
  const scopeNote = scoped ? unit.name : "RS-level";
  const foot = scoped
    ? `<span class="delta flat">unit</span><span>periode berjalan</span>`
    : `<span class="delta ${deltaClass(d)}">${deltaText(d.delta)}</span><span>vs Okt</span>`;
  return `<button class="metric" type="button" data-k="${d.k}" title="Klik untuk definisi ${esc(d.name)}">
    <span class="m-top"><span class="m-name">${d.k} · ${esc(d.name)}</span><span class="badge" data-variant="secondary" data-state="default" data-status="${d.status}">${statusLabel(d.status)}</span></span>
    <span class="m-value">${fmt(d.value, Number.isInteger(d.value) ? 0 : 1)}<small>${esc(d.unit)}</small></span>
    <span class="m-target">Target ${esc(d.target)} · ${esc(scopeNote)}</span>
    <span class="track"><span class="band" style="left:${left.toFixed(1)}%;width:${Math.max(2, right - left).toFixed(1)}%"></span>
      <span class="mark ${d.status}" style="left:${mark.toFixed(1)}%"></span></span>
    <span class="m-foot">${foot}</span>
    <span class="m-note">${esc(d.note)}</span>
  </button>`;
}

function alertRows(limit = 6) {
  return alerts.slice(0, limit).map(a => `<div class="alert app-alert" data-state="default" data-variant="default">
    <span class="state-dot ${a.sev}" aria-hidden="true"></span>
    <section>
      <h3 class="a-title">${esc(a.title)}</h3>
      <p class="a-detail">${esc(a.detail)}</p>
      <div class="a-meta"><b>${esc(a.domain)}</b><span>${esc(a.owner)}</span><span>${esc(a.age)} lalu</span></div>
    </section>
    <footer class="a-act"><button class="btn" data-variant="link" data-size="sm" type="button" data-go="${a.tab}">${esc(a.action)}</button></footer>
  </div>`).join("");
}

function capacityPanel() {
  const used = Math.round((capacity.occupied / capacity.totalBeds) * 100);
  return `<div class="panel">
    <div class="panel-head"><span class="panel-title">Kapasitas hari ini</span><span class="panel-sub">per 07:42</span></div>
    <div class="cap-figures">
      <div><b>${capacity.occupied}</b><span>/ ${capacity.totalBeds} bed terisi</span></div>
      <div><b>${capacity.available}</b><span>bed tersedia</span></div>
      <div><b>${capacity.icu.occupied}/${capacity.icu.total}</b><span>ICU terpakai</span></div>
      <div><b>${capacity.igdWaiting}</b><span>IGD menunggu</span></div>
    </div>
    <div class="bedbar" role="img" aria-label="${used} persen bed terisi"><i class="used" style="width:${used}%"></i><i class="free" style="width:${100 - used}%"></i></div>
    <div class="panel-foot"><span>${capacity.dischargesDone} dari ${capacity.dischargesPlanned} rencana pulang selesai</span></div>
  </div>`;
}

const domainRisk = [
  { name:"Keselamatan & mutu", status:"crit", note:"Alur klinis 76% · SC emergensi 74% · kebersihan tangan 82%" },
  { name:"Operasional & kapasitas", status:"crit", note:"BOR 87% · ICU 92% · 3 pasien IGD menunggu bed" },
  { name:"Keuangan", status:"warn", note:"AR days 38 · denial klaim 8,2% · piutang 3,9 M" },
  { name:"SDM", status:"crit", note:"Kepuasan 78 · rasio perawat IGD 1:3" },
  { name:"Pelayanan pasien", status:"ok", note:"Kepuasan 86,4 · komplain 12 · DAMA 2,1%" }
];

function domainRiskPanel() {
  return `<div class="panel">
    <div class="panel-head"><span class="panel-title">Status per domain</span><span class="panel-sub">5 domain</span></div>
    <div class="check-list">${domainRisk.map(d => `
      <div class="check-row" style="grid-template-columns:10px minmax(0,1fr) auto">
        <span class="state-dot ${d.status}"></span>
        <span class="c-name">${esc(d.name)}<span class="sub">${esc(d.note)}</span></span>
        <span class="badge" data-variant="secondary" data-state="default" data-status="${d.status}">${statusLabel(d.status)}</span>
      </div>`).join("")}
    </div>
  </div>`;
}

function priorityTable(rows) {
  return `<div class="table-container"><table class="table">
    <thead><tr><th>Pasien</th><th>Unit</th><th>Diagnosis</th><th>Catatan</th><th>Risiko</th></tr></thead>
    <tbody>${rows.map(p => `<tr class="${state.caseId === p.id ? "is-target" : ""}">
      <td><button class="btn row-link" data-variant="link" data-size="sm" type="button" data-case="${esc(p.id)}" title="Drill ke kasus ${esc(p.id)}">${esc(p.name)}, ${p.age}</button><span class="sub">${esc(p.id)}</span></td>
      <td>${esc(p.unit)}</td>
      <td>${esc(p.dx)}</td>
      <td>${esc(p.note)}</td>
      <td><span class="badge" data-variant="secondary" data-state="default" data-status="${p.risk}">${p.risk === "crit" ? "KRITIS" : p.risk === "warn" ? "PANTAU" : "STABIL"}</span></td>
    </tr>`).join("") || `<tr><td colspan="5"><span class="sub">Tidak ada pasien prioritas untuk unit ini.</span></td></tr>`}</tbody>
  </table></div>`;
}

/* ================= views ================= */
function renderRingkasan() {
  return `
  <section class="section">
    <div class="section-head">
      <h2>Enam indikator inti</h2>
      <span class="meta">${RS_INFO.period} · dibandingkan target</span>
      <span class="spacer"></span><span class="meta">${esc(scopeText())}</span>
    </div>
    <div class="grid g3">${execKpis.map(d => metricTile(d.k)).join("")}</div>
  </section>

  <div class="grid g23 section">
    <div class="panel">
      <div class="panel-head"><span class="panel-title">Papan prioritas</span>
        <span class="panel-sub">${alerts.filter(a => a.sev === "crit").length} kritis · ${alerts.length} item</span></div>
      <div class="app-alerts">${alertRows()}</div>
      <div class="panel-foot"><span>Setiap item menautkan data sumber dan pemilik tindakan.</span></div>
    </div>
    <div class="stack">${capacityPanel()}${domainRiskPanel()}</div>
  </div>

  <div class="grid g2 section">
    <div class="panel">
      <div class="panel-head"><span class="panel-title">Tren okupansi 14 hari</span><span class="panel-sub">BOR %</span></div>
      ${lineChart({ series:[capacity.occupancySeries], labels:capacity.occupancyLabels, band:[60,85], unit:"%", names:["BOR"], height:160 })}
      <div class="legend"><span><i style="background:var(--accent-color)"></i>BOR harian</span>
        <span><i style="background:var(--ok-bg);border:1px solid var(--ok)"></i>Rentang target 60–85%</span></div>
    </div>
    <div class="panel">
      <div class="panel-head"><span class="panel-title">Pasien prioritas</span><span class="panel-sub">${priorityPatients.length} tertinggi risiko</span></div>
      ${priorityTable(priorityPatients)}
      <div class="panel-foot"><span>Data anonim. Detail per pasien hanya lewat RBAC.</span></div>
    </div>
  </div>`;
}

function heatTable() {
  const rows = state.unit === "all" ? safetyMatrix : safetyMatrix.filter(r => r.unit === state.unit);
  return `<div class="table-container"><table class="heat">
    <thead><tr><th class="rowhead">Unit</th>
      ${safetyIndicators.map(i => `<th>${esc(i.name)}<br><span style="color:var(--faint)">${esc(i.target)}</span></th>`).join("")}
    </tr></thead>
    <tbody>${rows.map(r => `<tr>
      <td class="rowhead">${esc(r.unit)}</td>
      ${safetyIndicators.map(i => {
        const v = r[i.key], st = cellStatus(i, v);
        return `<td class="cell-${st}" title="${esc(i.name)} ${fmt(v, 1)}${i.unit} · target ${esc(i.target)}">${fmt(v, Number.isInteger(v) ? 0 : 1)}</td>`;
      }).join("")}
    </tr>`).join("")}</tbody></table></div>
  <div class="heat-legend">
    <span><i class="state-dot ok"></i>Memenuhi target</span>
    <span><i class="state-dot warn"></i>Dalam 6% dari target</span>
    <span><i class="state-dot crit"></i>Perlu tindakan</span>
    <span>IDO dalam % · indikator lain dalam %</span>
  </div>`;
}

function inmTable() {
  return `<div class="table-container"><table class="table">
    <thead><tr><th style="width:38%">Indikator</th><th class="num">Target</th><th class="num">Capai</th><th>Status</th></tr></thead>
    <tbody>${inm.map(i => `<tr>
      <td class="row-name">${esc(i.k)}</td>
      <td class="num">${esc(i.target)}</td>
      <td class="num">${fmt(i.value, Number.isInteger(i.value) ? 0 : 1)}${String(i.target).includes("%") ? "%" : ""}</td>
      <td><span class="badge" data-variant="secondary" data-state="default" data-status="${i.status}">${statusLabel(i.status)}</span></td>
    </tr>`).join("")}</tbody></table></div>`;
}

function renderMutu() {
  return `
  <section class="section">
    <div class="section-head"><h2>Mutu & keselamatan</h2>
      <span class="meta">13 INM · matriks unit × indikator</span>
      <span class="spacer"></span><span class="meta">${esc(scopeText())}</span></div>
    <div class="panel">
      <div class="panel-head"><span class="panel-title">Matriks kepatuhan per unit</span>
        <span class="panel-sub">${state.unit === "all" ? "7 unit" : esc(state.unit)}</span></div>
      ${heatTable()}
    </div>
  </section>

  <div class="grid g3 section">
    <div class="panel"><div class="panel-head"><span class="panel-title">GDR</span><span class="panel-sub">‰ · ≤45</span></div>
      ${lineChart({ series:[qualityTrend.gdr], labels:qualityTrend.labels, band:[0,45], unit:"‰", names:["GDR"], height:140 })}
      <div class="legend"><span><i style="background:var(--accent-color)"></i>GDR bulanan</span><span><i style="background:var(--ok-bg)"></i>Ambang ≤45‰</span></div></div>
    <div class="panel"><div class="panel-head"><span class="panel-title">NDR</span><span class="panel-sub">‰ · ≤25</span></div>
      ${lineChart({ series:[qualityTrend.ndr], labels:qualityTrend.labels, band:[0,25], unit:"‰", names:["NDR"], height:140 })}
      <div class="legend"><span><i style="background:var(--accent-color)"></i>NDR bulanan</span><span><i style="background:var(--ok-bg)"></i>Ambang ≤25‰</span></div></div>
    <div class="panel"><div class="panel-head"><span class="panel-title">Readmisi 30 hari</span><span class="panel-sub">% · target &lt;5</span></div>
      ${lineChart({ series:[qualityTrend.readmisi], labels:qualityTrend.labels, target:qualityTrend.readmisiTarget, unit:"%", names:["Readmisi"], height:140 })}
      <div class="legend"><span><i style="background:var(--accent-color)"></i>Readmisi</span><span><i style="background:var(--crit)"></i>Target 5%</span></div></div>
  </div>

  <section class="section">
    <div class="panel">
      <div class="panel-head"><span class="panel-title">Status 13 Indikator Nasional Mutu</span><span class="panel-sub">Permenkes 30/2022 · wajib</span></div>
      ${inmTable()}
      <div class="panel-foot"><span>Target efektif per indikator mengikuti Lampiran Permenkes; angka target yang belum terverifikasi ditandai di dokumen riset.</span></div>
    </div>
  </section>

  <div class="grid g2 section">
    <div class="panel">
      <div class="panel-head"><span class="panel-title">Variansi GDR antar unit</span><span class="panel-sub">kotak Q1–Q3 · garis putus target</span></div>
      ${boxplot()}
      <div class="panel-foot"><span>ICU dan outlier di atasnya menyempitkan variasi antar bangsal; pantau kepatuhan alur klinis.</span></div>
    </div>
    <div class="panel">
      <div class="panel-head"><span class="panel-title">Funnel review mortalitas</span><span class="panel-sub">bulan berjalan · 5 tahap</span></div>
      ${funnelChart()}
      <div class="panel-foot"><span>Dari 11 kematian ≥48 jam, 5 tindak lanjut tervalidasi — celah di tahap audit komite.</span></div>
    </div>
  </div>

  <section class="section">${unsetTargetPanel(["MORT30", "SURV5", "PJATUH"], "Indikator outcome tanpa target terverifikasi", "target internal · belum ditetapkan")}</section>`;
}

function barsHTML(rows, { max, unit = "", color = "var(--accent-color)", valFmt = v => fmt(v) } = {}) {
  const hi = max ?? Math.max(...rows.map(r => r.v));
  return `<div class="bars">${rows.map(r => `<div class="bar-row">
    <span class="bar-label" title="${esc(r.label)}">${esc(r.label)}</span>
    <span class="bar-track"><span class="bar-fill" style="width:${((r.v / hi) * 100).toFixed(1)}%;background:${r.color || color}"></span></span>
    <span class="bar-val">${valFmt(r.v)}${esc(unit)}</span></div>`).join("")}</div>`;
}

function renderPengalaman() {
  return `
  <section class="section">
    <div class="section-head"><h2>Pengalaman pasien</h2><span class="meta">kepuasan · komplain · DAMA</span>
      <span class="spacer"></span><span class="meta">${esc(scopeText())}</span></div>
    <div class="grid g2">
      <div class="panel">
        <div class="panel-head"><span class="panel-title">Indeks kepuasan pasien</span><span class="panel-sub">survei pasca rawat</span></div>
        ${gauge({
          value:experience.satisfaction, target:experience.satisfactionTarget, unit:"/100",
          label:"Kepuasan pasien",
          note:`Di atas target ${experience.satisfactionTarget}. Komplain ${experience.complaints} bulan ini (target ≤${experience.complaintsTarget}); ${experience.response48h}% ditutup dalam 48 jam.`
        })}
        <div class="panel-foot"><span>Sumber: survei pasca rawat · 412 respons</span></div>
      </div>
      <div class="panel">
        <div class="panel-head"><span class="panel-title">Tren kepuasan</span><span class="panel-sub">7 periode</span></div>
        ${lineChart({ series:[experience.satisfactionSeries], labels:["Mei","Jun","Jul","Agu","Sep","Okt","Nov"], target:experience.satisfactionTarget, unit:"", names:["Kepuasan"], height:178 })}
        <div class="legend"><span><i style="background:var(--accent-color)"></i>Indeks</span><span><i style="background:var(--crit)"></i>Target 85</span></div>
      </div>
    </div>

    <div class="grid g2 section">
      <div class="panel">
        <div class="panel-head"><span class="panel-title">Pareto keluhan</span><span class="panel-sub">${experience.complaints} komplain</span></div>
        ${barsHTML(experience.pareto.map((p, i) => ({ label:p.label, v:p.n, color:i === 0 ? "var(--warn)" : "var(--accent-color)" })), { unit:"", valFmt:v => v + "×" })}
        <div class="panel-foot"><span>5 dari 12 komplain soal waktu tunggu; selaras dengan waktu tunggu IGD.</span></div>
      </div>
      <div class="panel">
        <div class="panel-head"><span class="panel-title">Penutupan keluhan &amp; DAMA</span><span class="panel-sub">bulan berjalan</span></div>
        <div class="check-list">
          <div class="check-row" style="grid-template-columns:10px minmax(0,1fr) 74px 74px 64px">
            <span class="state-dot ${experience.complaints <= experience.complaintsTarget ? "ok" : "warn"}"></span>
            <span class="c-name">Komplain diterima</span><span class="c-target">≤${experience.complaintsTarget}</span>
            <span class="c-value">${experience.complaints}</span><span class="badge" data-variant="secondary" data-state="default" data-status="warn">WATCH</span>
          </div>
          <div class="check-row" style="grid-template-columns:10px minmax(0,1fr) 74px 74px 64px">
            <span class="state-dot ok"></span>
            <span class="c-name">Ditutup ≤48 jam</span><span class="c-target">≥${experience.responseTarget}%</span>
            <span class="c-value">${experience.response48h}%</span><span class="badge" data-variant="secondary" data-state="default" data-status="ok">ON-TARGET</span>
          </div>
          <div class="check-row" style="grid-template-columns:10px minmax(0,1fr) 74px 74px 64px">
            <span class="state-dot ${experience.dama <= experience.damaTarget ? "ok" : "warn"}"></span>
            <span class="c-name">Pulang atas permintaan sendiri</span><span class="c-target">&lt;${experience.damaTarget}%</span>
            <span class="c-value">${fmt(experience.dama, 1)}%</span><span class="badge" data-variant="secondary" data-state="default" data-status="warn">WATCH</span>
          </div>
        </div>
        <div class="panel-foot"><span>DAMA dipantau karena berkorelasi dengan kepuasan dan readmisi.</span></div>
      </div>
    </div>
  </section>`;
}

function renderAkses() {
  const statRows = [
    { n:"Kepatuhan waktu tunggu ≤60 mnt", v:access.waitCompliance, t:">"+access.waitTarget+"%", st:"ok" },
    { n:"SC emergensi ≤30 mnt", v:access.scResponse, t:"≥"+access.scTarget+"%", st:"crit" },
    { n:"Penundaan operasi elektif", v:access.electiveDelay, t:"<"+access.electiveTarget+"%", st:"warn" },
    { n:"Kepatuhan visite dokter", v:access.visitCompliance, t:">"+access.visitTarget+"%", st:"ok" }
  ];
  return `
  <section class="section">
    <div class="section-head"><h2>Akses & waktu tunggu</h2><span class="meta">p90 per jam · INM</span>
      <span class="spacer"></span><span class="meta">${esc(scopeText())}</span></div>
    <div class="grid g23">
      <div class="panel">
        <div class="panel-head"><span class="panel-title">Waktu tunggu rawat jalan</span><span class="panel-sub">p90 menit per jam</span></div>
        ${columnChart({ labels:access.byHour.map(x => x.h), values:access.byHour.map(x => x.p90), target:60, unit:" mnt", height:170 })}
        <div class="legend"><span><i style="background:var(--accent-color)"></i>Di bawah 60 menit</span><span><i style="background:var(--crit)"></i>Melewati target</span><span><i style="background:var(--crit);height:2px"></i>Ambang 60 menit</span></div>
        <div class="chart-note">Puncak 10.00–11.00 (64 dan 55 menit). Geser jadwal poli dan tambah loket pada jam itu.</div>
      </div>
      <div class="panel">
        <div class="panel-head"><span class="panel-title">Kepatuhan akses</span><span class="panel-sub">bulan berjalan</span></div>
        <div class="check-list">${statRows.map(r => `
          <div class="check-row" style="grid-template-columns:10px minmax(0,1fr) 70px 60px 64px">
            <span class="state-dot ${r.st}"></span>
            <span class="c-name">${esc(r.n)}</span>
            <span class="c-target">${esc(r.t)}</span>
            <span class="c-value">${fmt(r.v, 1)}%</span>
            <span class="badge" data-variant="secondary" data-state="default" data-status="${r.st}">${statusLabel(r.st)}</span>
          </div>`).join("")}</div>
        <div class="panel-foot"><span>SC emergensi perlu alur konsul anestesi paralel.</span></div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="panel">
      <div class="panel-head"><span class="panel-title">Kepadatan waktu tunggu jam × hari</span><span class="panel-sub">p90 menit · Sen–Min</span></div>
      ${heatGrid({ rows:accessDay.map((d, i) => ({ label:d, v:access.byDayHour[i] })), days:accessHours.map(h => h + ":00"), unit:" mnt" })}
      <div class="heat-legend">
        <span><i class="state-dot ok"></i>≤30 menit</span>
        <span><i class="state-dot warn"></i>30–55 menit</span>
        <span><i class="state-dot crit"></i>&gt;55 menit</span>
        <span>Puncak Selasa–Jumat pukul 09–11; Senin pagi ramai karena rujukan akhir pekan.</span>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="panel">
      <div class="panel-head"><span class="panel-title">Titik breach yang perlu tindakan</span><span class="panel-sub">4 item</span></div>
      <div class="table-container"><table class="table">
        <thead><tr><th>Unit</th><th>Indikator</th><th class="num">Capaian</th><th class="num">Target</th><th>Pemilik</th></tr></thead>
        <tbody>${access.breaches.map(b => `<tr>
          <td class="row-name">${esc(b.unit)}</td><td>${esc(b.indikator)}</td>
          <td class="num">${esc(b.value)}</td><td class="num">${esc(b.target)}</td><td>${esc(b.owner)}</td>
        </tr>`).join("")}</tbody></table></div>
    </div>
  </section>

  <section class="section">${unsetTargetPanel(["LOSIGD", "TATRAD", "ANTRIFAR"], "Indikator akses tanpa acuan terverifikasi", "angka acuan belum diperiksa")}</section>`;
}

function unitTable() {
  const rows = state.unit === "all" ? units : units.filter(u => u.name === state.unit);
  return `<div class="table-container"><table class="table">
    <thead><tr><th>Unit</th><th class="num">TT</th><th class="num">BOR</th><th class="num">ALOS</th><th class="num">TOI</th><th class="num">BTO</th><th>Status</th></tr></thead>
    <tbody>${rows.map(u => `<tr class="${state.unit === u.name ? "is-target" : ""}">
      <td><button class="btn" data-variant="link" data-size="sm" type="button" data-unit="${esc(u.name)}" title="Filter ke ${esc(u.name)}">${esc(u.name)}</button></td>
      <td class="num">${u.beds}</td><td class="num">${u.bor}%</td><td class="num">${fmt(u.alos, 1)}</td>
      <td class="num">${fmt(u.toi, 1)}</td><td class="num">${u.bto}</td>
      <td><span class="badge" data-variant="secondary" data-state="default" data-status="${u.status}">${statusLabel(u.status)}</span></td>
    </tr>`).join("")}</tbody></table></div>`;
}

function renderOperasional() {
  return `
  <section class="section">
    <div class="section-head"><h2>Operasional & kapasitas</h2><span class="meta">Barber Johnson · per bangsal</span>
      <span class="spacer"></span><span class="meta">${esc(scopeText())}</span></div>
    <div class="grid g23">
      <div class="panel">
        <div class="panel-head"><span class="panel-title">Barber Johnson</span><span class="panel-sub">BOR vs ALOS per unit</span></div>
        <div class="scatter-panel">
          ${scatterBj()}
          <div class="scatter-key"><b>Zona efisiensi</b>
            <p style="margin-bottom:5px">BOR 60–85% dan ALOS 6–9 hari.</p>
            <ul>
              <li><i class="state-dot ok"></i>Dalam zona</li>
              <li><i class="state-dot warn"></i>Perlu pantau</li>
              <li><i class="state-dot crit"></i>Keluar zona</li>
            </ul>
          </div>
        </div>
        <div class="chart-note">ICU dan HCU berada di kuadran BOR tinggi–ALOS panjang: bed terpakai intensif dan lama. VIP berada di BOR rendah–ALOS pendek: kapasitas menganggur.</div>
      </div>
      <div class="stack">
        ${capacityPanel()}
        <div class="panel">
          <div class="panel-head"><span class="panel-title">Unit perlu perhatian</span><span class="panel-sub">hari ini</span></div>
          <div class="check-list">
            <div class="check-row" style="grid-template-columns:10px minmax(0,1fr) auto">
              <span class="state-dot crit"></span><span class="c-name">ICU<span class="sub">92% · 11/12 bed</span></span>
              <span class="badge" data-variant="secondary" data-state="default" data-status="crit">KRITIS</span></div>
            <div class="check-row" style="grid-template-columns:10px minmax(0,1fr) auto">
              <span class="state-dot warn"></span><span class="c-name">HCU<span class="sub">89% · 16/18 bed</span></span>
              <span class="badge" data-variant="secondary" data-state="default" data-status="warn">PANTAU</span></div>
            <div class="check-row" style="grid-template-columns:10px minmax(0,1fr) auto">
              <span class="state-dot warn"></span><span class="c-name">Rawat Inap A<span class="sub">88% · 35/40 bed</span></span>
              <span class="badge" data-variant="secondary" data-state="default" data-status="warn">PANTAU</span></div>
            <div class="check-row" style="grid-template-columns:10px minmax(0,1fr) auto">
              <span class="state-dot ok"></span><span class="c-name">VIP / Paviliun<span class="sub">58% · 13/22 bed</span></span>
              <span class="badge" data-variant="secondary" data-state="default" data-status="ok">LONGGAR</span></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="panel">
      <div class="panel-head"><span class="panel-title">Indikator rawat inap per unit</span><span class="panel-sub">klik unit untuk memfilter</span></div>
      ${unitTable()}
      <div class="panel-foot"><span>BTO dan TOI lebih berguna dibaca bersama pada Barber Johnson daripada sebagai angka terpisah.</span></div>
    </div>
  </section>

  <section class="section">
    <div class="panel">
      <div class="panel-head"><span class="panel-title">Bed board okupansi harian</span><span class="panel-sub">4 jendela jam · hari ini</span></div>
      ${bedBoard()}
      <div class="panel-foot"><span>Hold IGD menunda pindahan; bed bersih menunggu pembersihan akhir sebelum diisi.</span></div>
    </div>
  </section>

  <div class="grid g2 section">
    <div class="panel">
      <div class="panel-head"><span class="panel-title">Tren okupansi 14 hari</span><span class="panel-sub">BOR %</span></div>
      ${lineChart({ series:[capacity.occupancySeries], labels:capacity.occupancyLabels, band:[60,85], unit:"%", names:["BOR"], height:150 })}
      <div class="legend"><span><i style="background:var(--accent-color)"></i>BOR harian</span><span><i style="background:var(--ok-bg);border:1px solid var(--ok)"></i>Target 60–85%</span></div>
    </div>
    <div class="panel">
      <div class="panel-head"><span class="panel-title">Pasien prioritas</span><span class="panel-sub">drill-down unit</span></div>
      ${priorityTable(priorityPatients.filter(p => state.unit === "all" || p.unit === state.unit).slice(0, 5))}
      <div class="panel-foot"><span>Daftar penuh tersedia untuk kepala unit sesuai RBAC.</span></div>
    </div>
  </div>`;
}

function simpleMetric({ label, value, unit = "", target, status, note, k }) {
  const tag = k ? "button" : "div";
  const attrs = k ? ` type="button" data-k="${esc(k)}" title="Klik untuk definisi ${esc(label)}"` : "";
  const tgt = status === "na" ? "Target belum ditetapkan" : "Target " + esc(target);
  return `<${tag} class="metric" data-status="${status}"${attrs}>
    <span class="m-top"><span class="m-name">${esc(label)}</span><span class="badge" data-variant="secondary" data-state="default" data-status="${status}">${statusLabel(status)}</span></span>
    <span class="m-value">${value}<small>${esc(unit)}</small></span>
    <span class="m-target">${tgt}</span>
    <span class="m-note">${esc(note)}</span>
  </${tag}>`;
}

/* Indikator tanpa target terverifikasi: tampil abu-abu, bukan RAG (§D). */
function unsetTargetPanel(keys, title, sub) {
  const items = keys.map(k => unsetTargets.find(x => x.k === k)).filter(Boolean);
  return `<div class="panel">
    <div class="panel-head"><span class="panel-title">${esc(title)}</span><span class="panel-sub">${esc(sub)}</span></div>
    <div class="grid g3">${items.map(x => simpleMetric({ ...x, status:"na" })).join("")}</div>
    <div class="panel-foot"><span>Ditampilkan tanpa warna RAG sampai dasar target disepakati (lihat dokumen matriks §E.2).</span></div>
  </div>`;
}

/* ================= breadcrumb drill: ringkasan → domain → unit → kasus ================= */
function breadcrumb() {
  const tab = TABS.find(t => t.id === state.tab);
  const parts = [{ label:"RS Nusantara", crumb:"root" }];
  if (state.tab !== "ringkasan") parts.push({ label:tab.label, crumb:"tab" });
  if (state.unit !== "all") parts.push({ label:state.unit, crumb:"unit" });
  if (state.caseId) parts.push({ label:"Kasus " + state.caseId });
  return `<nav class="crumbs" aria-label="Jejak drill-down"><ol>${parts.map((p, i) => {
    const last = i === parts.length - 1;
    return `<li>${last
      ? `<span aria-current="page">${esc(p.label)}</span>`
      : `<button class="btn" data-variant="link" data-size="sm" type="button" data-crumb="${p.crumb}">${esc(p.label)}</button>`}</li>`;
  }).join("")}</ol>
  <span class="crumb-level">Level: ${state.caseId ? "kasus" : state.unit !== "all" ? "unit" : state.tab === "ringkasan" ? "ringkasan" : "domain"}</span></nav>`;
}

function casePanel() {
  const p = priorityPatients.find(x => x.id === state.caseId);
  if (!p) return "";
  const u = units.find(x => x.name === p.unit);
  return `<section class="section"><div class="panel case-panel" data-status="${p.risk}">
    <div class="panel-head"><span class="panel-title">Detail kasus ${esc(p.id)}</span>
      <span class="panel-sub">akses RBAC · ${esc(p.unit)}</span></div>
    <dl class="def-list">
      <div><dt>Pasien</dt><dd>${esc(p.name)}, ${p.age} th (anonim)</dd></div>
      <div><dt>Diagnosis kerja</dt><dd>${esc(p.dx)}</dd></div>
      <div><dt>Catatan klinis</dt><dd>${esc(p.note)}</dd></div>
      <div><dt>Risiko</dt><dd><span class="badge" data-variant="secondary" data-state="default" data-status="${p.risk}">${p.risk === "crit" ? "KRITIS" : p.risk === "warn" ? "PANTAU" : "STABIL"}</span></dd></div>
      ${u ? `<div><dt>Konteks unit</dt><dd>BOR ${u.bor}% · ALOS ${fmt(u.alos, 1)} hari · ${u.beds} TT</dd></div>` : ""}
      <div><dt>Sumber</dt><dd>SIMRS rekam medis elektronik · ${esc(RS_INFO.updated)}</dd></div>
    </dl>
    <div class="panel-foot"><span>Data per pasien tidak tampil di tampilan direksi; level ini hanya terbuka lewat drill-down ber-RBAC.</span>
      <span class="spacer"></span><button class="btn" data-variant="outline" data-size="sm" type="button" data-crumb="unit">Kembali ke ${esc(p.unit)}</button></div>
  </div></section>`;
}

function renderKeuangan() {
  return `
  <section class="section">
    <div class="section-head"><h2>Keuangan & siklus klaim</h2><span class="meta">November 2026 · miliar rupiah</span>
      <span class="spacer"></span><span class="meta">${esc(scopeText())}</span></div>
    <div class="grid g4">
      ${simpleMetric({ label:"Pendapatan", value:fmt(finance.revenue, 1), unit:"M", target:fmt(finance.revenueTarget, 1) + " M",
        status:"warn", note:`Tercapai ${fmt(finance.revenue / finance.revenueTarget * 100, 1)}% target.` })}
      ${simpleMetric({ label:"AR days", value:fmt(finance.arDays), unit:"hari", target:"≤" + finance.arTarget,
        status:"warn", note:"Piutang 3,9 M; 12% berumur >90 hari." })}
      ${simpleMetric({ label:"Denial klaim", value:fmt(finance.denialRate, 1), unit:"%", target:"≤" + fmt(finance.denialTarget, 1) + "%",
        status:"warn", note:"Kode INA-CBG tidak sesuai mendominasi." })}
      ${simpleMetric({ label:"Collection rate", value:fmt(finance.collectionRate, 1), unit:"%", target:"≥95%",
        status:"warn", note:"Klaim tertahan " + fmt(finance.pendingClaims, 2) + " M." })}
    </div>
  </section>

  <div class="grid g23 section">
    <div class="panel">
      <div class="panel-head"><span class="panel-title">Komposisi pendapatan</span><span class="panel-sub">vs target ${fmt(finance.revenueTarget, 1)} M</span></div>
      ${waterfall(finance.revenueComponents, finance.revenue, finance.revenueTarget)}
      <div class="panel-foot"><span>Garis putus-putus = target. Rawat inap menyumbang ${fmt(finance.revenueComponents[0].v / finance.revenue * 100, 1)}% pendapatan.</span></div>
    </div>
    <div class="panel">
      <div class="panel-head"><span class="panel-title">Umur piutang</span><span class="panel-sub">total 3,93 M</span></div>
      ${barsHTML(finance.aging.map((a, i) => ({ label:a.bucket, v:a.v, color:i >= 2 ? "var(--warn)" : "var(--accent-color)" })), { unit:" M", valFmt:v => fmt(v, 2) })}
      <div class="panel-foot"><span>Prioritas: rekonsiliasi klaim BPJS periode Sep–Okt.</span></div>
    </div>
  </div>

  <div class="grid g2 section">
    <div class="panel">
      <div class="panel-head"><span class="panel-title">Tren pendapatan vs target</span><span class="panel-sub">miliar rupiah · ${finance.trendLabels.length} bulan</span></div>
      ${lineChart({ series:[finance.revenueSeries, finance.revenueTargetSeries], labels:finance.trendLabels, unit:" M",
        names:["Realisasi", "Target"], colors:["var(--accent-color)", "var(--muted-foreground)"], height:160 })}
      <div class="legend"><span><i style="background:var(--accent-color)"></i>Realisasi</span><span><i style="background:var(--muted-foreground)"></i>Target bulanan</span></div>
      <div class="chart-note">Selisih melebar sejak Agustus (−1,6 M di November); klaim tertahan ${fmt(finance.pendingClaims, 2)} M menutup sebagian besar gap.</div>
    </div>
    <div class="panel">
      <div class="panel-head"><span class="panel-title">Tren AR days</span><span class="panel-sub">hari · target ≤${finance.arTarget}</span></div>
      ${lineChart({ series:[finance.arSeries], labels:finance.trendLabels, target:finance.arTarget, unit:" hari", names:["AR days"], height:160 })}
      <div class="legend"><span><i style="background:var(--accent-color)"></i>AR days</span><span><i style="background:var(--crit)"></i>Target ${finance.arTarget} hari</span></div>
      <div class="chart-note">Naik dari 30 hari (Jun) ke 38 hari (Nov) seiring denial INA-CBG; turunkan lewat rekonsiliasi klaim sebelum 5 Des.</div>
    </div>
  </div>

  <div class="grid g2 section">
    <div class="panel">
      <div class="panel-head"><span class="panel-title">Penyebab denial klaim</span><span class="panel-sub">84 klaim</span></div>
      ${barsHTML(finance.denialPareto.map((d, i) => ({ label:d.label, v:d.n, color:i === 0 ? "var(--crit)" : "var(--accent-color)" })), { unit:"", valFmt:v => v + "×" })}
    </div>
    <div class="panel">
      <div class="panel-head"><span class="panel-title">Tindak lanjut arus kas</span><span class="panel-sub">3 langkah</span></div>
      <div class="check-list">
        <div class="check-row" style="grid-template-columns:10px minmax(0,1fr) auto">
          <span class="state-dot crit"></span><span class="c-name">Rekonsiliasi 34 klaim kode INA-CBG<span class="sub">target selesai 5 Des</span></span><span class="badge" data-variant="secondary" data-state="default" data-status="crit">PRIORITAS</span></div>
        <div class="check-row" style="grid-template-columns:10px minmax(0,1fr) auto">
          <span class="state-dot warn"></span><span class="c-name">Lengkapi 22 dokumen klaim tertahan<span class="sub">verifikasi berkas</span></span><span class="badge" data-variant="secondary" data-state="default" data-status="warn">PANTAU</span></div>
        <div class="check-row" style="grid-template-columns:10px minmax(0,1fr) auto">
          <span class="state-dot ok"></span><span class="c-name">Collection rate 94,2%<span class="sub">di atas 90%, di bawah target 95%</span></span><span class="badge" data-variant="secondary" data-state="default" data-status="ok">STABIL</span></div>
      </div>
      <div class="panel-foot"><span>Denial rate 8,2% setara 84 dari 1.024 klaim bulan ini.</span></div>
    </div>
  </div>`;
}

function renderSDM() {
  return `
  <section class="section">
    <div class="section-head"><h2>Sumber daya manusia</h2><span class="meta">kepuasan · turnover · rasio</span>
      <span class="spacer"></span><span class="meta">${esc(scopeText())}</span></div>
    <div class="grid g2">
      <div class="panel">
        <div class="panel-head"><span class="panel-title">Kepuasan staf</span><span class="panel-sub">survei internal</span></div>
        ${gauge({
          value:hr.satisfaction, target:hr.satisfactionTarget, unit:"/100", label:"Kepuasan staf",
          note:`Di bawah target ${hr.satisfactionTarget}. Turnover ${fmt(hr.turnover, 1)}% per tahun (target <${hr.turnoverTarget}%), absensi ${fmt(hr.absence, 1)}%.`
        })}
        <div class="panel-foot"><span>Kepuasan staf adalah KPI SDM tertinggi menurut manajer RS (Nabovati 2023).</span></div>
      </div>
      <div class="panel">
        <div class="panel-head"><span class="panel-title">Tren turnover</span><span class="panel-sub">% per tahun</span></div>
        ${lineChart({ series:[hr.turnoverSeries], labels:hr.turnoverLabels, target:hr.turnoverTarget, unit:"%", names:["Turnover"], height:178 })}
        <div class="legend"><span><i style="background:var(--accent-color)"></i>Turnover</span><span><i style="background:var(--crit)"></i>Batas 10%</span></div>
      </div>
    </div>

    <div class="grid g23 section">
      <div class="panel">
        <div class="panel-head"><span class="panel-title">Kehadiran perawat unit × shift</span><span class="panel-sub">% shift terisi</span></div>
        ${heatGrid({
          rows: hr.shiftHeat.units.map(u => ({ label:u.unit, v:u.v })),
          days: hr.shiftHeat.shifts, unit:"%", cellFmt: v => v + "%"
        })}
        <div class="heat-legend">
          <span><i class="state-dot ok"></i>≥90%</span>
          <span><i class="state-dot warn"></i>80–90%</span>
          <span><i class="state-dot crit"></i>&lt;80%</span>
          <span>Shift malam IGD dan Rawat Inap C paling rendah — tekanan absensi tertinggi.</span>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><span class="panel-title">Komposisi tenaga</span><span class="panel-sub">${hr.headcount.reduce((a, b) => a + b.n, 0)} orang</span></div>
        ${barsHTML(hr.headcount.map(h => ({ label:h.role, v:h.n })), { unit:"", valFmt:v => fmt(v) + " org" })}
        <div class="panel-foot"><span>Komposisi menentukan kapasitas shift; bukan indikator kinerja tunggal.</span></div>
      </div>
      <div class="panel">
        <div class="panel-head"><span class="panel-title">Rasio perawat : pasien</span><span class="panel-sub">per unit</span></div>
        <div class="table-container"><table class="table">
          <thead><tr><th>Unit</th><th class="num">Rasio</th><th class="num">Target</th><th>Status</th></tr></thead>
          <tbody>${hr.ratio.map(r => `<tr>
            <td class="row-name">${esc(r.unit)}</td><td class="num">${esc(r.ratio)}</td><td class="num">${esc(r.target)}</td>
            <td><span class="badge" data-variant="secondary" data-state="default" data-status="${r.status}">${statusLabel(r.status)}</span></td></tr>`).join("")}</tbody>
        </table></div>
        <div class="panel-foot"><span>IGD 1:3 dari target 1:2 — sumber tekanan kepuasan staf.</span></div>
      </div>
    </div>
  </section>`;
}

function renderKepatuhan() {
  return `
  <section class="section">
    <div class="section-head"><h2>Kepatuhan regulasi</h2><span class="meta">13 INM · 6 indikator SIRS · tenggat</span>
      <span class="spacer"></span><span class="meta">${esc(compliance.akreditasi)}</span></div>
    <div class="grid g23">
      <div class="panel">
        <div class="panel-head"><span class="panel-title">Scorecard 13 INM</span><span class="panel-sub">${inm.filter(i => i.status === "ok").length}/${inm.length} terpenuhi</span></div>
        <div class="check-list">${inm.map(i => `
          <div class="check-row" style="grid-template-columns:10px minmax(0,1fr) 82px 62px 64px">
            <span class="state-dot ${i.status}"></span>
            <span class="c-name">${esc(i.k)}</span>
            <span class="c-target">${esc(i.target)}</span>
            <span class="c-value">${fmt(i.value, Number.isInteger(i.value) ? 0 : 1)}</span>
            <span class="badge" data-variant="secondary" data-state="default" data-status="${i.status}">${statusLabel(i.status)}</span>
          </div>`).join("")}</div>
        <div class="panel-foot"><span>Dasar: Permenkes 30/2022. Pelaporan melalui SIMAR.</span></div>
      </div>
      <div class="stack">
        <div class="panel">
          <div class="panel-head"><span class="panel-title">Indikator SIRS</span><span class="panel-sub">RL 1.2 &amp; 3.1</span></div>
          <div class="table-container"><table class="table">
            <thead><tr><th>Indikator</th><th class="num">Nilai</th><th class="num">Target</th><th>Status</th></tr></thead>
            <tbody>${sirs.map(s => `<tr><td class="row-name">${esc(s.k)}</td>
              <td class="num">${esc(String(s.value))}</td><td class="num">${esc(s.target)}</td>
              <td><span class="badge" data-variant="secondary" data-state="default" data-status="${s.status}">${statusLabel(s.status)}</span></td></tr>`).join("")}</tbody>
          </table></div>
        </div>
        <div class="panel">
          <div class="panel-head"><span class="panel-title">Tenggat pelaporan</span><span class="panel-sub">terdekat</span></div>
          <div class="deadline-list">${compliance.deadlines.map(d => `
            <div class="deadline">
              <span class="dl-date"><b>${esc(d.date.split(" ")[0])}</b>${esc(d.date.split(" ").slice(1).join(" "))}</span>
              <span class="dl-label">${esc(d.label)}<span class="dl-meta">${d.days} hari lagi</span></span>
              <span class="badge" data-variant="secondary" data-state="default" data-status="${d.status === "due" ? "crit" : "neutral"}">${d.status === "due" ? "JATUH TEMPO" : "TERJADWAL"}</span>
            </div>`).join("")}</div>
        </div>
      </div>
    </div>
  </section>`;
}

function renderStrategi() {
  const rows = [
    { k:"Pendapatan 28,4 M / 30,0 M", owner:"Direktur Keuangan", due:"31 Des", st:"warn" },
    { k:"AR days ≤30", owner:"Manajer Keuangan", due:"31 Des", st:"warn" },
    { k:"Kepatuhan alur klinis >80%", owner:"Komite Mutu", due:"7 Des", st:"crit" },
    { k:"SC emergensi ≥80% dalam 30 mnt", owner:"Kepala OK", due:"7 Des", st:"crit" },
    { k:"Rasio perawat IGD 1:2", owner:"SDM", due:"31 Jan", st:"crit" },
    { k:"Kepuasan pasien >85", owner:"Direktur Pelayanan", due:"31 Des", st:"ok" }
  ];
  return `
  <section class="section">
    <div class="section-head"><h2>Kinerja strategis</h2><span class="meta">Balanced Scorecard · 4 perspektif</span>
      <span class="spacer"></span><span class="meta">Q4 2026</span></div>
    <div class="bsc-grid">${bsc.map(b => `
      <div class="bsc-card">
        <div class="bsc-head"><span class="state-dot ${b.status}"></span>${esc(b.p)}</div>
        <div class="bsc-score">${b.score}<small>/100</small></div>
        <div class="bsc-note">${esc(b.note)}</div>
        <div class="bsc-items">${b.items.map(i => `<div><span>${esc(i.k)}</span><span>${esc(i.value)} · ${esc(i.target)}</span></div>`).join("")}</div>
      </div>`).join("")}
    </div>
  </section>

  <section class="section">
    <div class="panel">
      <div class="panel-head"><span class="panel-title">Peta strategi sebab-akibat</span><span class="panel-sub">4 perspektif BSC</span></div>
      ${strategyMap()}
      <div class="panel-foot"><span>Pembelajaran &amp; pertumbuhan (74) menekan proses internal; perbaikan kepuasan staf menjadi hulu sebelum target keuangan.</span></div>
    </div>
  </section>

  <section class="section">
    <div class="grid g2">
      <div class="panel">
        <div class="panel-head"><span class="panel-title">Inisiatif strategis</span><span class="panel-sub">6 inisiatif</span></div>
        <div class="check-list">${rows.map(r => `
          <div class="check-row" style="grid-template-columns:10px minmax(0,1fr) 120px 60px 64px">
            <span class="state-dot ${r.st}"></span>
            <span class="c-name">${esc(r.k)}</span>
            <span class="c-target">${esc(r.owner)}</span>
            <span class="c-value">${esc(r.due)}</span>
            <span class="badge" data-variant="secondary" data-state="default" data-status="${r.st}">${statusLabel(r.st)}</span>
          </div>`).join("")}</div>
      </div>
      <div class="panel">
        <div class="panel-head"><span class="panel-title">Cara membaca BSC</span><span class="panel-sub">catatan metode</span></div>
        <div class="stack" style="gap:9px">
          <p style="font-size:.74rem;line-height:1.55;color:var(--ink-2)">Skor tiap perspektif adalah rata-rata tertimbang indikator di dalamnya, bukan hasil uji statistik. Bobot: keuangan 30%, pelanggan 25%, proses internal 25%, pembelajaran 20%.</p>
          <p style="font-size:.74rem;line-height:1.55;color:var(--ink-2)">Gunakan skor untuk membandingkan arah antarperspektif, bukan untuk memberi peringkat unit. Indikator dengan status BREACH tetap ditindaklanjuti terlepas dari skornya.</p>
          <p style="font-size:.74rem;line-height:1.55;color:var(--ink-2)">BSC tidak menambah indikator baru; ia menyusun ulang 18–22 indikator inti ke dalam rantai sebab-akibat.</p>
        </div>
        <div class="panel-foot"><span>Dasar: Kaplan &amp; Norton; tinjauan BSC kesehatan (Bohm 2021, belum diverifikasi ulang).</span></div>
      </div>
    </div>
  </section>`;
}

/* ================= panduan (dokumentasi untuk pembaca awam) ================= */
function refNo(id) { return docsContent.references.findIndex(r => r.id === id) + 1; }
function refChips(ids = []) {
  const chips = ids.map(id => ({ id, n:refNo(id) })).filter(x => x.n > 0).sort((a, b) => a.n - b.n)
    .map(x => `<button class="ref-chip" type="button" data-docjump="ref-${x.id}" title="${esc(docsContent.references[x.n - 1].cite)}">${x.n}</button>`).join("");
  return chips ? `<span class="ref-chips" aria-label="Rujukan">${chips}</span>` : "";
}

function renderDocs() {
  const d = docsContent;
  const canOpen = id => allowedTabs().some(t => t.id === id);

  return `
  <section class="section">
    <div class="section-head"><h2>Panduan dashboard</h2>
      <span class="meta">apa yang ditampilkan, kenapa, dan datanya dari mana</span></div>

    <div class="grid g23">
      <div class="panel doc-prose">
        <div class="panel-head"><span class="panel-title">${esc(d.intro.title)}</span></div>
        ${d.intro.paragraphs.map(p => `<p>${esc(p)}</p>`).join("")}
        <p class="doc-basis">Dasar pemilihan ${refChips(d.intro.refs)}</p>
      </div>
      <div class="panel">
        <div class="panel-head"><span class="panel-title">${esc(d.intro.colorsTitle)}</span>${refChips(d.intro.colorsRefs)}</div>
        <div class="doc-colors">${d.intro.colors.map(c => `
          <div class="doc-color"><span class="badge" data-variant="secondary" data-state="default" data-status="${c.status}">${esc(c.label)}</span>
            <p>${esc(c.text)}</p></div>`).join("")}</div>
      </div>
    </div>

    <div class="panel doc-prose section">
      <div class="panel-head"><span class="panel-title">${esc(d.intro.tipsTitle)}</span></div>
      <ul>${d.intro.tips.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
    </div>
  </section>

  <section class="section">
    <div class="section-head"><h2>Penjelasan per halaman</h2><span class="meta">klik judul untuk membuka</span></div>
    <section class="accordion doc-accordion" data-state="closed">${d.sections.map((s, i) => `
      <details${i === 0 ? " open" : ""}>
        <summary>
          <span class="doc-sum-title">${esc(s.title)}</span>
          <span class="doc-sum-q">${esc(s.question)}</span>
        </summary>
        <section class="doc-body">
          <p class="doc-why"><b>Kenapa halaman ini ada.</b> ${esc(s.why)} ${refChips(s.refs)}</p>
          <ul class="doc-items">${s.items.map(it => `
            <li><span class="doc-what">${esc(it.what)}</span><span class="doc-reason">${esc(it.why)}</span></li>`).join("")}</ul>
          <div class="doc-source"><span class="doc-source-label">Datanya dari mana</span><span>${esc(s.source)}</span></div>
          ${canOpen(s.tab) ? `<button class="btn" data-variant="outline" data-size="sm" type="button" data-go="${s.tab}">Buka halaman ${esc(s.title)} →</button>`
            : `<span class="doc-muted">Halaman ini tersedia untuk peran lain.</span>`}
        </section>
      </details>`).join("")}
    </section>
  </section>

  <section class="section">
    <div class="grid g2">
      <div class="panel doc-prose">
        <div class="panel-head"><span class="panel-title">${esc(d.assistant.title)}</span></div>
        <p>${esc(d.assistant.text)}</p>
      </div>
      <div class="panel doc-prose">
        <div class="panel-head"><span class="panel-title">${esc(d.notShown.title)}</span>${refChips(d.notShown.refs)}</div>
        <ul>${d.notShown.items.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="panel doc-prose">
      <div class="panel-head"><span class="panel-title">${esc(d.mock.title)}</span></div>
      <p>${esc(d.mock.text)}</p>
      <div class="doc-colors doc-readiness">${d.mock.readiness.map(r => `
        <div class="doc-color"><span class="badge" data-variant="secondary" data-state="default" data-status="${r.status}">${esc(r.label)}</span><p>${esc(r.text)}</p></div>`).join("")}</div>
    </div>
  </section>

  <section class="section">
    <div class="panel doc-refs">
      <div class="panel-head"><span class="panel-title">Daftar pustaka</span>
        <span class="panel-sub">nomor di setiap penjelasan merujuk ke daftar ini</span></div>
      <ol>${d.references.map(r => `
        <li id="ref-${r.id}">
          <p class="ref-cite">${esc(r.cite)} ${r.u ? `<a href="${esc(r.u)}" target="_blank" rel="noopener">${esc(r.u.replace(/^https?:\/\//, ""))}</a>` : ""}</p>
          <p class="ref-use"><b>Dipakai untuk:</b> ${esc(r.usedFor)}</p>
          <span class="badge" data-variant="secondary" data-state="default" data-status="${r.verified ? "ok" : "na"}">${r.verified ? "TERVERIFIKASI" : "BELUM DIVERIFIKASI ULANG"}</span>
        </li>`).join("")}</ol>
      <div class="panel-foot"><span>Rujukan bertanda "belum diverifikasi ulang" berasal dari riset awal dan masih perlu dicek ke naskah aslinya. Uraian lengkap: <code>docs/RESEARCH_DASHBOARD_RS.md</code> dan <code>docs/DASHBOARD_COMPONENT_MATRIX.md</code>.</span></div>
    </div>
  </section>`;
}
/* ================= views registry & render ================= */
const VIEWS = {
  ringkasan: renderRingkasan, mutu: renderMutu, pengalaman: renderPengalaman,
  akses: renderAkses, operasional: renderOperasional, keuangan: renderKeuangan,
  sdm: renderSDM, kepatuhan: renderKepatuhan, strategi: renderStrategi, docs: renderDocs
};

function render() {
  document.querySelectorAll("#tabs [role='tab']").forEach(b => {
    const active = b.dataset.tab === state.tab;
    b.setAttribute("aria-selected", String(active));
    b.setAttribute("tabindex", active ? "0" : "-1");
    b.dataset.state = active ? "active" : "inactive";
  });
  $("#scopeChip").textContent = "Cakupan: " + scopeText();
  const v = $("#view");
  v.innerHTML = breadcrumb() + (state.caseId ? casePanel() : "") + VIEWS[state.tab]();
  v.setAttribute("aria-labelledby", "tab-" + state.tab);
}

/* ================= chat rail ================= */
const auditLog = [];
const roleIntro = {
  direksi: "Selamat pagi. Saya merangkum enam indikator inti, papan prioritas, dan status lima domain. Setiap jawaban menautkan sumber, definisi, dan dasar target.",
  unit: "Mode kepala unit. Gunakan pemilih Unit di atas untuk mempersempit cakupan. Saya bisa menjelaskan kapasitas, waktu tunggu, mutu unit, dan rencana pulang.",
  mutu: "Mode komite mutu. Fokus saya: 13 INM, matriks kepatuhan per unit, dan tenggat pelaporan SIMAR."
};

function pushUser(text) {
  $("#stream").insertAdjacentHTML("beforeend", `<div class="msg user"><div class="bubble">${esc(text)}</div></div>`);
  scrollStream();
}
function pushBot(a) {
  const ev = (a.evidence || []).map(k => {
    const d = definitions[k];
    if (!d) return "";
    const title = `${d.name} — ${d.formula}. Target ${d.target}. Dasar ${d.basis}. Sumber ${d.source}.`;
    return `<button class="badge ev-chip" data-variant="outline" type="button" data-ev="${k}" title="${esc(title)}">${esc(k)} · ${esc(d.name)}</button>`;
  }).join("");
  const acts = (a.acts || []).map((x, i) => `<button class="btn act" data-variant="secondary" data-size="sm" type="button" data-act="${i}">${esc(x.t)}</button>`).join("");
  $("#stream").insertAdjacentHTML("beforeend", `<div class="msg bot"><div class="bubble">
    ${a.lede ? `<span class="lede">${a.lede}</span>` : ""}${a.body || ""}
    ${ev ? `<div class="src">${ev}</div>` : ""}
    ${acts ? `<div class="action-row">${acts}</div>` : ""}
  </div></div>`);
  const last = $("#stream").lastElementChild;
  last.querySelectorAll(".act").forEach(btn => {
    const act = (a.acts || [])[Number(btn.dataset.act)];
    if (act && typeof act.f === "function") btn.addEventListener("click", act.f);
  });
  scrollStream();
}
function scrollStream() { const s = $("#stream"); s.scrollTop = s.scrollHeight; }

function resetChat() {
  $("#stream").innerHTML = "";
  pushBot({
    lede: "Asisten data RS Nusantara",
    body: `${roleIntro[state.role]} <br><span style="color:var(--muted)">Prototipe memakai data mock; bukan alat medis.</span>`
  });
  const prompts = quickPrompts[state.role] || quickPrompts.direksi;
  $("#quick").innerHTML = prompts.map(p => `<button class="btn" data-variant="outline" data-size="sm" type="button" data-q="${esc(p.q)}">${esc(p.t)}</button>`).join("");
}

function logAudit(q) {
  auditLog.push({ at: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }), q });
  $("#auditCount").textContent = auditLog.length;
  $("#auditList").innerHTML = auditLog.map(a => `<li><time>${a.at}</time>${esc(a.q)}</li>`).join("");
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
  $("#stream").insertAdjacentHTML("beforeend", `<div class="msg bot" id="${id}"><div class="thinking"><i></i><i></i><i></i></div></div>`);
  scrollStream();
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.remove();
    pushBot(answerFor(q));
  }, 340);
}

/* ================= panel bukti + definisi (dialog) ================= */
function currentValue(k) {
  const kpi = execKpis.find(x => x.k === k);
  if (kpi) return { value:`${fmt(kpi.value, Number.isInteger(kpi.value) ? 0 : 1)} ${kpi.unit}`, status:kpi.status };
  const u = unsetTargets.find(x => x.k === k);
  if (u) return { value:`${u.value} ${u.unit}`, status:"na" };
  return null;
}

function showDefinition(k) {
  const d = definitions[k];
  if (!d) return;
  logAudit("Definisi " + k);
  const cur = currentValue(k);
  const verified = !!d.target;
  const dlg = $("#defDialog");
  $("#defTitle").textContent = `${k} — ${d.name}`;
  $("#defSub").textContent = `Periode ${RS_INFO.period} · cakupan ${scopeText()}`;
  $("#defBody").innerHTML = `<dl class="def-list">
    ${cur ? `<div><dt>Nilai saat ini</dt><dd><b>${esc(cur.value)}</b> <span class="badge" data-variant="secondary" data-state="default" data-status="${cur.status}">${statusLabel(cur.status)}</span></dd></div>` : ""}
    <div><dt>Rumus</dt><dd>${esc(d.formula)}</dd></div>
    <div><dt>Target</dt><dd>${verified ? esc(d.target) : `<span class="badge" data-variant="secondary" data-state="default" data-status="na">TARGET BELUM DITETAPKAN</span>`}</dd></div>
    <div><dt>Dasar target</dt><dd>${esc(d.basis)}</dd></div>
    <div><dt>Sumber data</dt><dd>${esc(d.source)}</dd></div>
    <div><dt>Sinkron terakhir</dt><dd>${esc(RS_INFO.updated)}</dd></div>
    <div><dt>Asal angka</dt><dd>Metric layer (tidak dihitung ulang oleh asisten)</dd></div>
  </dl>`;
  $("#defAsk").dataset.defk = k;
  dlg.showModal();
  dlg.dataset.state = "open";
  dlg.dataset.fsmState = "open";
}

function askAboutDefinition(k) {
  const d = definitions[k];
  if (!d) return;
  pushUser("Definisi " + k);
  pushBot({
    lede: `${k} — ${d.name}`,
    body: `<b>Rumus:</b> ${esc(d.formula)}<br><b>Target:</b> ${esc(d.target || "belum ditetapkan")}<br><b>Dasar:</b> ${esc(d.basis)}<br><b>Sumber:</b> ${esc(d.source)}`
  });
}

/* ================= export ================= */
function exportCsv() {
  const rows = [["Bagian", "Indikator", "Nilai", "Satuan", "Target", "Status"]];
  execKpis.forEach(d => rows.push(["KPI inti", d.name, String(d.value).replace(".", ","), d.unit, d.target, statusLabel(d.status)]));
  inm.forEach(i => rows.push(["INM", i.k, String(i.value).replace(".", ","), "%", i.target, statusLabel(i.status)]));
  sirs.forEach(s => rows.push(["SIRS", s.k, String(s.value).replace(".", ","), "", s.target, statusLabel(s.status)]));
  units.forEach(u => {
    rows.push(["Unit " + u.name, "BOR", String(u.bor).replace(".", ","), "%", "60–85", statusLabel(u.status)]);
    rows.push(["Unit " + u.name, "ALOS", String(u.alos).replace(".", ","), "hari", "6–9", statusLabel(u.status)]);
    rows.push(["Unit " + u.name, "TOI", String(u.toi).replace(".", ","), "hari", "1–3", statusLabel(u.status)]);
    rows.push(["Unit " + u.name, "BTO", String(u.bto).replace(".", ","), "kali/tahun", "40–50", statusLabel(u.status)]);
  });
  rows.push(["Keuangan", "Pendapatan", String(finance.revenue).replace(".", ","), "miliar", String(finance.revenueTarget).replace(".", ","), "WATCH"]);
  rows.push(["Keuangan", "AR days", String(finance.arDays).replace(".", ","), "hari", "≤" + finance.arTarget, "WATCH"]);
  rows.push(["Keuangan", "Denial klaim", String(finance.denialRate).replace(".", ","), "%", "≤" + String(finance.denialTarget).replace(".", ","), "WATCH"]);
  rows.push(["SDM", "Kepuasan staf", String(hr.satisfaction).replace(".", ","), "/100", "≥" + hr.satisfactionTarget, "WATCH"]);
  rows.push(["Identitas", "Periode", RS_INFO.period, "", "", ""]);
  rows.push(["Identitas", "Diekspor", new Date().toLocaleString("id-ID"), "", "", ""]);

  const csv = "\uFEFF" + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "rs-nusantara-kpi-nov-2026.csv";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);

  const chip = $("#scopeChip");
  const prev = chip.textContent;
  chip.textContent = "CSV diekspor · " + rows.length + " baris";
  setTimeout(() => { chip.textContent = prev; }, 2400);
}

/* ================= events & init ================= */
function setUnit(name) {
  state.unit = name === "all" ? "all" : name;
  state.caseId = null;
  const sel = $("#unitFilter");
  if (sel.value !== state.unit) sel.value = state.unit;
  $("#scopeChip").textContent = "Cakupan: " + scopeText();
  render();
}

/* ================= tema: otomatis → terang → gelap ================= */
const THEME_LABEL = { auto:"Otomatis", light:"Terang", dark:"Gelap" };
const darkQuery = matchMedia("(prefers-color-scheme: dark)");
function storedTheme() {
  try { const t = localStorage.getItem("theme"); return t === "light" || t === "dark" ? t : "auto"; } catch { return "auto"; }
}
function applyTheme(mode) {
  const dark = mode === "dark" || (mode === "auto" && darkQuery.matches);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.dataset.themeMode = mode;
  $("#themeLabel").textContent = THEME_LABEL[mode];
  $("#themeBtn").setAttribute("aria-label", `Tema: ${THEME_LABEL[mode]}. Klik untuk mengganti.`);
}
function cycleTheme() {
  const next = { auto:"light", light:"dark", dark:"auto" }[storedTheme()];
  try { next === "auto" ? localStorage.removeItem("theme") : localStorage.setItem("theme", next); } catch {}
  applyTheme(next);
}

function init() {
  applyTheme(storedTheme());
  $("#themeBtn").addEventListener("click", cycleTheme);
  darkQuery.addEventListener("change", () => { if (storedTheme() === "auto") applyTheme("auto"); });
  initSelects();
  renderTabs();
  const fromHash = location.hash.slice(1);
  if (TABS.some(t => t.id === fromHash)) state.tab = fromHash;
  render();
  resetChat();
  window.addEventListener("hashchange", () => {
    const t = location.hash.slice(1);
    if (t && t !== state.tab && TABS.some(x => x.id === t)) go(t);
  });

  const dlg = $("#defDialog");
  dlg.addEventListener("close", () => { dlg.dataset.state = "closed"; dlg.dataset.fsmState = "closed"; });
  dlg.addEventListener("click", e => {
    if (e.target === dlg || e.target.closest("[data-close]")) dlg.close();
  });
  $("#defAsk").addEventListener("click", () => {
    const k = $("#defAsk").dataset.defk;
    dlg.close();
    askAboutDefinition(k);
  });

  $("#roleSelect").addEventListener("change", e => {
    state.role = e.target.value;
    renderTabs();
    render();
    resetChat();
  });
  $("#unitFilter").addEventListener("change", e => setUnit(e.target.value));
  $("#exportBtn").addEventListener("click", exportCsv);

  $("#tabs").addEventListener("keydown", e => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const tabs = document.querySelectorAll("#tabs [role='tab']");
    const i = tabs.findIndex(t => t.dataset.tab === state.tab);
    const next = e.key === "ArrowRight" ? (i + 1) % tabs.length : (i - 1 + tabs.length) % tabs.length;
    e.preventDefault();
    go(tabs[next].dataset.tab);
    tabs[next]?.focus();
  });

  document.addEventListener("click", e => {
    const jump = e.target.closest("[data-docjump]");
    if (jump) {
      const el = document.getElementById(jump.dataset.docjump);
      if (!el) return;
      el.scrollIntoView({ behavior:"smooth", block:"center" });
      el.classList.add("flash");
      return setTimeout(() => el.classList.remove("flash"), 1600);
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
      return $("#view").scrollIntoView({ behavior:"smooth", block:"start" });
    }
    const tab = e.target.closest("[data-tab]");
    if (tab) return go(tab.dataset.tab);
    const goBtn = e.target.closest("[data-go]");
    if (goBtn && goBtn.dataset.go) return go(goBtn.dataset.go);
    const kpi = e.target.closest("[data-k]");
    if (kpi) return showDefinition(kpi.dataset.k);
    const unitBtn = e.target.closest("[data-unit]");
    if (unitBtn) return setUnit(unitBtn.dataset.unit);
    const ev = e.target.closest("[data-ev]");
    if (ev) return showDefinition(ev.dataset.ev);
    const q = e.target.closest("[data-q]");
    if (q) return ask(q.dataset.q);
  });

  $("#send").addEventListener("click", () => {
    const inp = $("#inp");
    ask(inp.value);
    inp.value = "";
    inp.focus();
  });
  $("#inp").addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    ask(e.target.value);
    e.target.value = "";
  });

  $("#auditToggle").addEventListener("click", () => {
    const list = $("#auditList");
    const open = list.hidden;
    list.hidden = !open;
    $("#auditToggle").setAttribute("aria-expanded", String(open));
  });
}

init();
