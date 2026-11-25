# Design: 5 komponen mockup baru dari DASHBOARD_COMPONENT_MATRIX

Date: 2026-11-24 · Status: approved

## Scope

Lengkapi 9 tab dengan keluarga komponen matriks yang belum ada. Komponen lama
(heatmap mutu, KPI, tren, gauge, waterfall, aging, pareto, barber johnson,
scorecard, deadline, BSC cards, chat rail, tabel drill) sudah ada dan tidak diubah.

## Komponen baru (5)

1. **Boxplot variasi antar unit** (tab Mutu) — boxplot GDR dan ALOS per unit;
   whisker + median + outlier, SVG murni. Data: `qualityTrend.unitBoxes`.
2. **Funnel review mortalitas** (tab Mutu) — 5 tahap: exit → screening
   komite → audit morbiditas → rekomendasi → implementasi. Data:
   `qualityTrend.mortalityFunnel`.
3. **Heatmap jam × hari** (tab Akses) — p90 waktu tunggu poli per
   (7 hari × 12 jam). Data: `access.byDayHour`.
4. **Heatmap unit × shift** (tab SDM) — kehadiran perawat per unit ×
   3 shift. Data: `hr.shiftHeat`.
5. **Bed board timeline** (tab Operasional) — bed per unit × 4 jendela
   jam (pagi/siang/sore/malam): okupansi, bed bersih, hold IGD. Data:
   `capacity.bedBoard`.
6. **Strategy map BSC** (tab Strategi) — 4 perspektif vertikal + panah
   sebab-akibat, SVG. Data dari `bsc` yang ada.

## Pendekatan teknis

- SVG murni + `var(--*)` token, konsisten dengan `lineChart`/`scatterBj`.
- Helper render baru di `html/dashboard.js`: `boxplot()`, `funnel()`,
  `heatGrid()`, `bedBoard()`, `strategyMap()`.
- Data mock baru di `html/mock-data.js`.
- CSS baru di `html/dashboard.css`, scoped di dalam `.panel` yang ada.
- Tanpa library; tetap single-file stack (index.html + 3 file html/).

## Aturan

- Semua angka mock, label "Data mock · bukan alat medis" tetap berlaku.
- Komponen harus membaca `state.unit` (filter) bila data per unit.
