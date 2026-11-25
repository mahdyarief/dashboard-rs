# Dashboard Manajemen Rumah Sakit — prototipe

Mockup dashboard manajemen RS (HTML + Basecoat CSS + vanilla JS) yang diturunkan dari
[`docs/DASHBOARD_COMPONENT_MATRIX.md`](docs/DASHBOARD_COMPONENT_MATRIX.md).

**Demo:** https://mahdyarief.github.io/dashboard-rs/

> Semua angka adalah data mock. Prototipe konsep, bukan alat medis.

## Isi

| Path | Keterangan |
|---|---|
| `html/index.html` | Shell halaman: header, filter, tab domain, chat rail, dialog definisi |
| `html/dashboard.js` | Render per domain, grafik SVG, breadcrumb drill, chat, ekspor CSV |
| `html/mock-data.js` | Data mock (peran metric layer) |
| `html/dashboard.css` | Tema dan komponen di atas Basecoat |
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
