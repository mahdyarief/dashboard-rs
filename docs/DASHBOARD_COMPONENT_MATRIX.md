# Matriks Komponen Dashboard Rumah Sakit

> Dokumen kerja untuk review cakupan komponen. Diturunkan dari
> `RESEARCH_DASHBOARD_RS.md` §3–§5 dan §10–§12 (sintesis indikator dan desain).
>
> Matriks disusun per **imperatif bisnis**, bukan per jenis metrik, agar penilaian
> berbunyi "keputusan apa yang dibantu" dan bukan "angka apa yang ada".
>
> Batas atas yang dipakai: **18–22 indikator** di level direksi, dengan subset per
> unit (Rabiei & Almasi 2022). Karena itu §A adalah **katalog pemilihan**, bukan
> daftar yang ditampilkan sekaligus.
>
> Status target: `Wajib` = diatur regulasi · `Praktik` = acuan Depkes 2005/SIRS ·
> `Internal` = ditetapkan RS · `Belum verifikasi` = angka acuan belum diperiksa.

---

## A. Imperatif bisnis → indikator → komponen

| # | Imperatif bisnis | Pertanyaan manajerial | Indikator inti | Komponen utama | Tier / cadence | Dasar target |
|---|---|---|---|---|---|---|
| 1 | Keselamatan pasien | Adakah harm yang bisa dicegah minggu ini? | kebersihan tangan; kepatuhan APD; identifikasi pasien; pasien jatuh per 1.000 hari rawat; IDO/HAIs | KPI tile RAG, heatmap unit × indikator, tren, feed alert | Direksi (outcome) + Unit (proses) / bulanan–harian | Wajib (Permenkes 30/2022, SIMAR) |
| 2 | Mutu klinis & outcome | Apakah hasil klinis membaik dan variasi antarbangsal menyempit? | GDR; NDR; readmisi 30 hari; mortalitas 30 hari; survival kanker 5 tahun (P2) | KPI tile, tren, boxplot variasi per unit, funnel review, drill ke daftar kasus | Dewan / Departemen / bulanan | GDR ≤45‰, NDR ≤25‰ (Praktik); sisanya Internal |
| 3 | Pengalaman pasien | Apakah pasien puas dan keluhan ditutup tepat waktu? | indeks kepuasan pasien; komplain per 1.000 kunjungan; kecepatan tanggap komplain; DAMA | Gauge, tren, tabel komplain + SLA, pareto keluhan | Direksi / bulanan; komplain harian | Wajib (INM) + Internal |
| 4 | Akses & waktu tunggu | Berapa lama pasien menunggu, dan di jam berapa macet? | waktu tunggu rawat jalan; LOS IGD; tanggap SC emergensi; operasi elektif tertunda; kepatuhan visite | Bar pita waktu, heatmap jam × hari, alert breach, tren | Unit / harian–mingguan | Wajib (INM); sebagian Belum verifikasi |
| 5 | Alur & kapasitas rawat inap | Apakah tempat tidur dipakai efisien tanpa bottleneck? | BOR, ALOS, TOI, BTO per bangsal; okupansi ICU; ketersediaan bed | Scatter Barber Johnson (BOR–ALOS), bar per bangsal, bed board timeline, alert overcrowding | Unit + Direksi / harian | BOR 60–85%, ALOS 6–9, TOI 1–3, BTO 40–50× (Praktik) |
| 6 | Keberlanjutan keuangan | Apakah pendapatan tertagih dan arus kas sehat? | pendapatan; piutang klaim; klaim ditolak/pending; AR days; TAT pencairan | KPI tile, waterfall pendapatan, aging AR, pareto denial, tren vs target | Direksi / bulanan | Internal |
| 7 | Produktivitas & kesejahteraan SDM | Apakah staf cukup, terlatih, dan terpelihara? | kepuasan staf; rasio tenaga per TT; jumlah tenaga per jenis; turnover; absensi; pelatihan | KPI tile, tabel headcount, bar rasio per unit, heatmap unit × shift, tren turnover | Direksi / bulanan | Internal (BSC learning & growth) |
| 8 | Kepatuhan regulasi & pelaporan | Apakah semua kewajiban terpenuhi tanpa temuan? | status 13 INM; 6 indikator SIRS; akreditasi KARS/JCI; kelengkapan dan ketepatan waktu lapor | Scorecard checklist, kalender deadline, status submit, tautan bukti | Direksi / Mutu / bulanan + alert deadline | Wajib (Permenkes 30/2022; SIRS) |
| 9 | Kinerja strategis (BSC) | Apakah strategi terukur dan selaras antarperspektif? | financial; customer; internal process; learning & growth | Strategy map, scorecard per perspektif, target vs aktual, pelacakan inisiatif | Dewan / kuartalan–bulanan | Internal |
| 10 | Keputusan berbasis data (konversasional) | Siapa pun bisa bertanya dan jawabannya bisa dipercaya? | seluruh indikator di atas lewat NLQ + drill-down | Chat sidebar, chart auto-render, panel bukti/definisi, saved view, audit log | Semua / on-demand | Metric layer sebagai sumber angka |

---

## B. Inventaris komponen UI

| Komponen | Fungsi | Dipakai di imperatif | Prinsip desain |
|---|---|---|---|
| KPI tile + RAG | Satu angka, status warna, delta terhadap target/periode | 1, 2, 3, 6, 7 | Actionable-first; traffic light |
| Tren garis | Arah jangka waktu vs target | 1, 2, 3, 4, 6, 7 | Grafik + tabel |
| Bar/kolom per unit | Perbandingan antarbangsal | 1, 2, 5, 7 | Drill-down |
| Heatmap | Pola unit × indikator atau jam × hari | 1, 4, 7 | Actionable-first |
| Scatter Barber Johnson | Posisi efisiensi pada bidang BOR–ALOS | 5 | Grafik + tabel |
| Gauge | Skor terhadap target tunggal | 3 | Traffic light |
| Funnel | Tahap alur (mis. review mortalitas) | 2 | Drill-down |
| Pareto | Konsentrasi penyebab (komplain, denial klaim) | 3, 6 | Actionable-first |
| Waterfall | Komposisi pendapatan | 6 | Grafik + tabel |
| Aging AR | Umur piutang per bucket | 6 | Actionable-first |
| Tabel drill-down | Detail di balik angka agregat | 1–10 | Grafik + tabel; klik minimal |
| Bed board timeline | Okupansi real-time per tempat tidur | 5 | Workflow-integrated |
| Kalender deadline | Tenggat pelaporan | 8 | Workflow-integrated |
| Scorecard checklist | Status kepatuhan item per item | 8 | Traffic light |
| Strategy map | Keterkaitan perspektif BSC | 9 | Drill-down |
| Feed alert | Sinyal yang butuh aksi sekarang | 1, 4, 5 | Penjaga kelelahan notifikasi |
| Chat sidebar | NLQ, jawaban streaming | 10 | Workflow-integrated |
| Panel bukti + definisi | Rumus, sumber data, dasar target | 1–10 | Consistent terminology |
| Breadcrumb drill | Jejak ringkasan → unit → kasus | 1–10 | Klik minimal |
| Filter global | Periode, unit, kelas, penjamin | 1–10 | Kustomisasi |
| Badge kesegaran data | Waktu sinkron terakhir | 1–10 | Akurasi data |
| Ekspor Excel/PDF | Pelaporan visual | 2, 6, 8 | Kebutuhan fungsional |
| Role switcher | Tampilan sesuai peran | 1–10 | Visualisasi per peran |

---

## C. Shell lintas halaman

Header memuat pemilih periode/unit/kelas, legenda RAG, indikator kesegaran data,
tombol ekspor, dan pintu masuk chat. Navigasi tingkat atas memakai lima domain —
pelayanan pasien, mutu & keselamatan, operasional, keuangan, SDM — bukan urutan
abjad. Setiap angka yang tampil wajib dapat di-drill ke definisi dan sumbernya.

---

## D. Sengaja tidak ditampilkan

- Seluruh 51 / 110 / 1.161 indikator literatur sekaligus — melanggar batas konten
  yang direkomendasikan (Rabiei & Almasi 2022).
- BTO dan TOI sebagai tile terpisah; keduanya lebih berguna di dalam Barber Johnson.
- Angka target yang belum terverifikasi tampil abu-abu "target belum ditetapkan",
  bukan RAG.
- Data per pasien di tampilan direksi; akses turun hanya lewat drill-down ber-RBAC.
- Prediksi tanpa interval keyakinan atau tanpa tautan bukti.
- Angka KPI yang dihitung ulang oleh LLM; semua angka berasal dari metric layer.

---

## E. Keputusan yang diperlukan saat review

1. **Titik mulai** — direksi (12–15 KPI) atau satu unit pilot (4–6 KPI).
   Rekomendasi literatur: mulai sempit, lalu perluas.
2. **Dasar target per KPI** — mana memakai regulasi, mana target internal. Untuk INM,
   lengkapi dari Lampiran Permenkes 30/2022.
3. **Ketersediaan sumber** — SIRS, SIMAR, klaim BPJS, atau billing. Menentukan apa
   yang layak masuk P0.
4. **Kedalaman drill** — sampai daftar kasus atau cukup agregat unit.
5. **Bahasa dan istilah** yang dipakai di antarmuka (ID/EN, singkatan klinis).

---

## F. Rujukan internal

- `RESEARCH_DASHBOARD_RS.md` §3 — set inti indikator dan tier peran
- `RESEARCH_DASHBOARD_RS.md` §4 — rumus dan nilai ideal
- `RESEARCH_DASHBOARD_RS.md` §5 — prinsip desain dan kebutuhan pengguna
- `RESEARCH_DASHBOARD_RS.md` §10–§12 — lapisan konversasional, arsitektur, peta fitur
