# Dashboard Manajemen Rumah Sakit — prototipe

Mockup dashboard manajemen RS (HTML + Basecoat UI + Tailwind v4 + ApexCharts + vanilla JS) yang diturunkan dari
[`docs/DASHBOARD_COMPONENT_MATRIX.md`](docs/DASHBOARD_COMPONENT_MATRIX.md).

**Demo:** https://mahdyarief.github.io/dashboard-rs/

> Semua angka adalah data mock. Prototipe konsep, bukan alat medis.

## Isi

| Path | Keterangan |
|---|---|
| `html/index.html` | Shell halaman: header, filter, tab domain, chat rail, dialog definisi |
| `html/dashboard.js` | Render per domain dengan komponen Basecoat, grafik ApexCharts (warna dari token `--chart-*`), breadcrumb drill, chat, ekspor CSV |
| `html/mock-data.js` | Data mock (peran metric layer) |
| `docs/` | Riset indikator, matriks komponen, spec |

## Menjalankan lokal

Buka `html/index.html` langsung di Chrome/Edge, atau sajikan foldernya:

```sh
python -m http.server 8765 --directory html
```

Tab dapat dibuka langsung lewat hash, mis. `index.html#keuangan`.

## Deploy

Setiap push ke `main` yang mengubah `html/` di-deploy ke GitHub Pages oleh
`.github/workflows/pages.yml`.
