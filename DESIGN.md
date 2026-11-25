---
name: RS Nusantara — Dashboard Manajemen
description: Papan komando direksi rumah sakit di atas Basecoat UI (Nova), biru medis, angka yang dapat ditelusuri.
colors:
  medical-blue: "oklch(0.5 0.14 248)"
  medical-blue-foreground: "oklch(0.985 0.005 240)"
  focus-blue: "oklch(0.62 0.13 245)"
  clinical-white: "oklch(0.985 0.004 240)"
  card-white: "oklch(1 0 0)"
  ink: "oklch(0.145 0 0)"
  quiet-ink: "oklch(0.556 0 0)"
  ward-mist: "oklch(0.96 0.008 240)"
  hairline: "oklch(0.91 0.012 240)"
  selected-tint: "oklch(0.95 0.022 240)"
  selected-ink: "oklch(0.36 0.11 248)"
  sidebar-mist: "oklch(0.97 0.012 240)"
  trend-blue: "oklch(0.58 0.14 245)"
  status-ok: "oklch(0.62 0.15 152)"
  status-warn: "oklch(0.8 0.15 82)"
  comparison-teal: "oklch(0.64 0.1 195)"
  deep-navy: "oklch(0.4 0.11 252)"
  breach-red: "oklch(0.577 0.245 27.325)"
  night-ground: "oklch(0.18 0.015 245)"
  night-card: "oklch(0.215 0.018 245)"
  night-blue: "oklch(0.72 0.12 240)"
  night-breach-red: "oklch(0.75 0.17 22)"
typography:
  headline:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, Segoe UI, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  section:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, Segoe UI, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.025em"
  title:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.375
  metric:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, Segoe UI, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.025em"
    fontFeature: "tnum"
  metric-secondary:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, Segoe UI, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
    fontFeature: "tnum"
  body:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
rounded:
  md: "8px"
  lg: "10px"
  xl: "14px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.medical-blue}"
    textColor: "{colors.medical-blue-foreground}"
    rounded: "{rounded.lg}"
    height: "32px"
    padding: "0 12px"
  button-outline:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    height: "32px"
    padding: "0 12px"
  card:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "16px"
  card-footer:
    backgroundColor: "{colors.ward-mist}"
    textColor: "{colors.quiet-ink}"
    padding: "16px"
  badge-ok:
    backgroundColor: "{colors.status-ok}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  badge-breach:
    backgroundColor: "{colors.breach-red}"
    textColor: "{colors.breach-red}"
    rounded: "{rounded.md}"
  nav-item-active:
    backgroundColor: "{colors.selected-tint}"
    textColor: "{colors.selected-ink}"
    rounded: "{rounded.md}"
  select:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    height: "32px"
---

# Design System: RS Nusantara — Dashboard Manajemen

## Overview

**Creative North Star: "Papan Komando Direksi"**

Layar ini adalah meja komando direksi rumah sakit: yang perlu ditindaklanjuti berada paling atas, konteks dan bukti di bawahnya. Setiap elemen harus menjawab satu dari dua pertanyaan, yaitu "apa yang sedang tidak beres" dan "siapa yang harus bertindak", lalu mundur dan memberi ruang bagi angka.

Sistemnya sengaja terkendali. Biru medis dipakai untuk aksi dan pilihan aktif, merah untuk pelanggaran ambang, hijau dan kuning untuk status. Di luar itu, permukaan putih kebiruan yang bersih. Kepadatannya padat-tapi-bernapas: kartu berjarak 24px, isi kartu berjarak 12–16px, dan angka KPI besar dengan angka tabular, sehingga mata langsung menemukan nilainya.

Semua dibangun 100% dari Basecoat UI 1.3 (style pack Nova) dan utilitas Tailwind v4, tanpa CSS komponen buatan sendiri. Identitas hidup di token, bukan di stylesheet.

**Key Characteristics:**
- Prioritas lebih dulu, konteks kemudian; status selalu ikon + label + warna.
- Satu keluarga huruf (IBM Plex Sans) dengan langkah ukuran yang tegas.
- Datar saat diam; bayangan hanya sebagai respons hover.
- Biru medis tenang, netral sejuk, merah hanya untuk pelanggaran.
- Mode terang dan gelap setara; setiap token terang didefinisikan ulang untuk gelap.

## Colors

Palet klinis yang tenang: netral sejuk bernuansa biru, satu biru medis sebagai suara utama, dan warna status dengan makna tetap.

### Primary
- **Biru Medis** (`medical-blue`): tombol utama, periode aktif, link pasien, avatar asisten. Dalam mode gelap menjadi **Biru Malam** (`night-blue`) yang lebih terang.
- **Biru Fokus** (`focus-blue`): ring fokus keyboard dan sorotan rujukan yang dilompati.

### Secondary
- **Biru Tren** (`trend-blue`, `--chart-1`): garis dan area tren, batang data utama.
- **Teal Klinis** (`comparison-teal`, `--chart-4`): seri pembanding.
- **Navy Dalam** (`deep-navy`, `--chart-5`): aksen gelap pada grafik bertumpuk.

### Tertiary (status)
- **Hijau Aman** (`status-ok`, `--chart-2`): sesuai target.
- **Kuning Waspada** (`status-warn`, `--chart-3`): mendekati ambang. Label teks di atas sel kuning selalu gelap.
- **Merah Pelanggaran** (`breach-red`, `--destructive`): di luar target, garis ambang, delta yang memburuk. Di mode gelap menjadi `night-breach-red` agar label badge lolos 4.5:1.

### Neutral
- **Putih Klinis** (`clinical-white`): latar halaman.
- **Putih Kartu** (`card-white`): permukaan kartu, popover, dialog.
- **Tinta** (`ink`) dan **Tinta Redup** (`quiet-ink`): teks utama dan teks sekunder (target, catatan, sumber).
- **Kabut Bangsal** (`ward-mist`): permukaan muted, footer kartu, track progres.
- **Garis Rambut** (`hairline`): border, pemisah daftar, input.
- **Kabut Sidebar** (`sidebar-mist`): lapis netral kedua untuk navigasi, sedikit lebih sejuk dari konten.
- **Tint Terpilih** (`selected-tint` / `selected-ink`): item navigasi aktif.

### Named Rules
**The Fixed Meaning Rule.** `--chart-2` selalu aman, `--chart-3` selalu waspada, `--destructive` selalu pelanggaran. Warna status tidak pernah dipakai sebagai hiasan atau pembeda kategori.

**The Quiet Accent Rule.** Biru medis hanya untuk aksi utama, pilihan aktif, dan data tren. Status yang tidak aktif dan elemen dekoratif tidak memakai warna jenuh.

## Typography

**Body Font:** IBM Plex Sans (dengan ui-sans-serif, system-ui, Segoe UI)

**Character:** Humanis-institusional, terasa seperti dokumen resmi rumah sakit yang ditata dengan baik; angka tabular membuat kolom dan KPI tidak goyang saat periode berganti.

### Hierarchy
- **Headline** (600, 24px desktop / 20px ponsel, tracking -0.025em): judul halaman di header.
- **Section** (600, 20px, tracking -0.025em, `text-wrap: balance`): judul section seperti "Enam indikator inti".
- **Title** (600, 16px): judul kartu dan judul asisten.
- **Metric** (600, 36px, tabular): angka KPI utama di tile indikator inti.
- **Metric Secondary** (600, 30px, tabular): angka di kartu metrik sederhana dan kartu kapasitas.
- **Body** (400, 14px, `text-wrap: pretty`): isi kartu, catatan, tabel. Padat karena ini permukaan kerja, bukan bacaan panjang.
- **Label** (500, 12px): badge, meta, sumber data, waktu sinkron.

### Named Rules
**The One Family Rule.** Satu keluarga huruf untuk semua peran. Hierarki datang dari ukuran dan bobot, bukan dari font kedua.

**The Tabular Rule.** Setiap angka yang dibandingkan (KPI, tabel, skor) memakai angka tabular.

## Layout

Shell dua kolom: sidebar kiri (Basecoat sidebar, breakpoint 768px) dan area konten. Header lengket berisi judul + meta, lalu toolbar filter (grup tombol periode, select unit dan peran, ekspor di kanan). Konten memakai grid satu kolom di ponsel yang menjadi 3 kolom pada `xl` (konten 2 kolom + rail asisten 1 kolom yang lengket). Di bawah `xl`, asisten pindah ke sheet kanan; node DOM yang sama dipindah, tidak dirender dua kali.

Ritme: 24px antar-kartu dan antar-section, 16px padding kartu, 12px antar-elemen di dalam tile, 8px di dalam grup kontrol. Kartu dengan isi yang berubah lebar memakai container query (misalnya kapasitas: 2 kolom, 4 kolom bila kartunya ≥36rem). Tabel lebar dan heatmap bergulir di dalam kartunya; halaman tidak pernah bergulir ke samping di 390px.

**The Action-First Rule.** Urutan setiap halaman: indikator inti atau prioritas → daftar tindak lanjut → tren → detail. Detail tidak pernah mendahului keputusan.

## Elevation & Depth

Datar saat diam. Kartu Basecoat Nova memakai ring 1px dari `foreground` 10% sebagai batas, bukan bayangan. Kedalaman tonal dari tiga lapis: latar halaman, permukaan kartu, dan footer/muted di dalam kartu. Bayangan hanya muncul sebagai respons state.

### Shadow Vocabulary
- **Hover angkat** (Tailwind `shadow-md` + `translate-y -2px`): hanya pada kartu yang dapat diklik (tile KPI yang membuka definisi). Dimatikan di `prefers-reduced-motion`.

### Named Rules
**The Flat-By-Default Rule.** Permukaan tidak berbayang saat diam. Bayangan berarti "ini bisa diklik dan sedang ditunjuk", tidak lebih.

## Shapes

Sudut membulat lembut dan konsisten: kartu 14px, tombol, select, dan input 10px, badge dan item navigasi 8px, avatar dan nomor rujukan bulat penuh. Kartu memotong isinya (`overflow: hidden`) sehingga footer muted mengikuti lengkung bawah. Daftar di dalam kartu dipisah garis rambut, tidak dibungkus kotak.

## Components

### Buttons
- **Shape:** sudut lembut (10px), tinggi 32px untuk ukuran kecil di toolbar dan kartu.
- **Primary:** biru medis dengan teks putih; dipakai untuk aksi utama dan periode aktif.
- **Outline:** permukaan kartu dengan garis rambut; aksi sekunder seperti "Lihat kapasitas" dan ekspor.
- **Ghost / Link:** pembuka definisi dan nama pasien di tabel.
- **Hover / Focus:** transisi warna Basecoat 100ms; ring fokus biru fokus.

### Chips (badge)
- **Style:** badge outline dengan tint 10% dari warna status dan ikon berwarna status; label tetap warna tinta penuh. Pelanggaran memakai varian destructive.
- **State:** label kalimat biasa: "Sesuai target", "Waspada", "Di luar target", "Target belum ditetapkan", "Kritis", "Pantau", "Stabil".

### Cards / Containers
- **Corner Style:** 14px.
- **Background:** putih kartu; footer muted dengan garis atas.
- **Shadow Strategy:** lihat Elevation; ring 1px saat diam.
- **Border:** tidak pernah ditambah `border`; ring sudah bawaan.
- **Internal Padding:** 16px; footer kartu memuat sumber data sebagai badge outline "… · mock".

### Inputs / Fields
- **Style:** select dan input Basecoat, tinggi 32px, garis rambut, sudut 10px; label disembunyikan secara visual tetapi ada untuk pembaca layar.
- **Focus:** ring biru fokus.

### Navigation
- **Style:** sidebar dengan grup "Domain", ikon garis 16px + label 14px. Item aktif memakai tint terpilih dan `aria-current="page"`. Footer sidebar memuat tombol tema, badge "Data mock · bukan alat medis", dan sumber data. Di ponsel sidebar menjadi laci yang dibuka tombol di header.

### Tile Indikator (signature)
Kartu yang dapat diklik: nama indikator + badge status di header, angka metric 36px dengan satuan kecil, target dan cakupan, sparkline tren dengan pita target, lalu footer muted berisi delta (merah bila memburuk) dan catatan klinis singkat. Klik membuka dialog definisi (rumus, target, dasar regulasi, sumber).

## Do's and Don'ts

### Do:
- **Do** memasangkan setiap status dengan ikon dan label teks; warna tidak pernah sendirian.
- **Do** mendefinisikan ulang setiap token yang di-override di `:root` di dalam `.dark`.
- **Do** membaca warna grafik dari token (`--chart-1..5`, `--destructive`) lewat konversi `rgb()`, dan merender ulang grafik saat tema berganti.
- **Do** memakai angka tabular untuk semua angka yang dibandingkan.
- **Do** menulis status tanpa dasar target sebagai "Target belum ditetapkan".
- **Do** memakai istilah klinis dan manajemen RS (BOR, ALOS, INM, berkas klaim) dalam Bahasa Indonesia.

### Don't:
- **Don't** menulis CSS komponen sendiri atau memuat library berat; hanya Basecoat, token, dan utilitas Tailwind.
- **Don't** menaruh kartu di dalam kartu; daftar di dalam kartu dipisah garis rambut.
- **Don't** menambah `border` pada `.card` atau mengganti padding kartu dengan `py-*` (merusak footer Nova).
- **Don't** memakai label status bahasa Inggris atau huruf kapital semua (ON-TARGET, BREACH).
- **Don't** memberi bayangan pada permukaan yang tidak dapat diklik.
- **Don't** memakai warna status untuk dekorasi atau pembeda kategori.
