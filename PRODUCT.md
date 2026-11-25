# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Direksi RS** (direktur utama, direktur pelayanan medis & keperawatan, direktur keuangan): membaca kondisi rumah sakit dalam beberapa menit, sering dari ponsel, untuk memutuskan apa yang harus ditindaklanjuti hari ini atau bulan ini.
- **Kepala unit** (ICU, IGD, rawat inap, kamar operasi, dsb.): memantau indikator unitnya sendiri, kesiapan alat, dan antrean bed.
- **Komite mutu / PMKP**: menelusuri indikator nasional mutu (INM) dan definisinya untuk pelaporan dan akreditasi.

Prototipe ini melayani dua audiens sekaligus: dipakai sekarang sebagai bahan pitch Nusantech kepada direksi dan manajemen RS calon klien, dan dikembangkan menjadi produk nyata yang dipakai harian oleh peran-peran di atas.

## Product Purpose

Dashboard manajemen rumah sakit yang mengubah data operasional, mutu, keuangan, SDM, dan pengalaman pasien menjadi keputusan per peran. Berhasil bila direksi dapat menjawab "apa yang sedang tidak beres dan siapa yang harus bertindak" tanpa membuka laporan terpisah, dan bila setiap angka dapat dipertanggungjawabkan definisinya.

## Positioning

1. **Indikator berbasis regulasi.** Setiap angka memiliki definisi, rumus, target, dan dasar regulasi yang dapat ditelusuri (INM Kemenkes, SIRS Online, ketentuan klaim BPJS/INA-CBG, standar akreditasi), dan asisten yang menjelaskan angka tersebut. Target yang belum memiliki dasar ditulis "belum ditetapkan", tidak dikarang.
2. **Satu tampilan lintas sistem.** Menggabungkan SIMRS/SIRS, klaim BPJS, billing internal, pra-verifikasi berkas klaim (ValidAI), dan kesiapan alat & utilitas kritis (ESOPT Healthcare) dalam satu layar keputusan.

## Operating Context

- Domain: Ringkasan, Mutu, Keuangan, Operasional, SDM, Pengalaman pasien, Akses, Kepatuhan, Strategi, ditambah tab Panduan.
- Peran yang dapat dipilih: Direksi, Kepala unit, Komite mutu. Filter periode (hari ini, minggu ini, bulanan, tahunan) dan filter unit.
- Dialog definisi indikator, ekspor CSV, asisten tanya-jawab dengan pertanyaan cepat per peran, breadcrumb drill-down.
- Rujukan riset dan matriks komponen: `docs/RESEARCH_DASHBOARD_RS.md`, `docs/DASHBOARD_COMPONENT_MATRIX.md`.

## Capabilities and Constraints

- **100% Basecoat UI (1.3, CDN) dan lean**: tanpa CSS komponen buatan sendiri, tanpa library berat; hanya token, Tailwind v4 utilities, ApexCharts. Aturan lengkap ada di aturan lean plugin basecoat-ui.
- **Statis**: HTML + vanilla JS tanpa build step, di-deploy ke GitHub Pages dari `html/` (repo publik).
- **Mobile 390px**: harus nyaman di ponsel, tanpa geser horizontal halaman.
- **Bahasa Indonesia**: semua copy dalam Bahasa Indonesia, dengan **istilah medis dan rumah sakit diutamakan** (BOR, LOS, TOI, INM, IGD, HCU, berkas klaim, kalibrasi, dsb.) dibanding istilah bisnis atau teknologi generik.
- Integrasi ESOPT dan ValidAI belum ada; ValidAI tidak memiliki API publik dan aturan verdict Complete/Incomplete-nya belum diketahui.
- Belum diputuskan: dasar target kepatuhan kalibrasi; nomor FR PRD untuk kesegaran data.

## Brand Commitments

- Nama RS contoh: "RS Nusantara" (RSU Tipe B, 180 tempat tidur, Bandung), fiktif.
- Pembuat: Nusantech. Sumber data selalu ditampilkan di footer kartu.

## Evidence on Hand

- Seluruh angka adalah **data mock** (`html/mock-data.js`) dan harus selalu dilabeli demikian. Prototipe konsep, bukan alat medis.
- Tidak ada testimoni, pelanggan, atau hasil pilot nyata; jangan dibuat.

## Product Principles

1. Setiap angka dapat ditelusuri: definisi, target, dasar, dan sumber selalu satu klik dari angkanya.
2. Status tidak pernah dikarang: tanpa dasar target, status ditulis "belum ditetapkan".
3. Tunjukkan yang perlu ditindaklanjuti lebih dulu, lalu konteksnya.
4. Jujur tentang data: mock, simulasi, dan potret sesaat diberi label yang jelas.
5. Bicara dengan bahasa klinis dan manajemen RS yang dikenal penggunanya.

## Accessibility & Inclusion

Status tidak boleh hanya mengandalkan warna (selalu ikon + label); gerak dimatikan di bawah `prefers-reduced-motion`; dibaca nyaman dalam mode terang dan gelap.
