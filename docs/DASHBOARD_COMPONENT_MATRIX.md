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
>
> **Revisi 25 Nov 2026:** imperatif #6 diperluas dengan pra-verifikasi berkas klaim
> (sumber: ValidAI), dan imperatif #11 ditambahkan untuk kesiapan alat medis &
> utilitas kritis (sumber: PRD ESOPT v2.3, modul Healthcare). Asal-usul, pemetaan
> data, dan batasannya ada di §G. Keduanya sudah ada di mock dengan data simulasi:
> kartu pra-verifikasi di halaman Keuangan, bagian kesiapan alat di halaman Operasional.

---

## A. Imperatif bisnis → indikator → komponen

| # | Imperatif bisnis | Pertanyaan manajerial | Indikator inti | Komponen utama | Tier / cadence | Dasar target |
|---|---|---|---|---|---|---|
| 1 | Keselamatan pasien | Adakah harm yang bisa dicegah minggu ini? | kebersihan tangan; kepatuhan APD; identifikasi pasien; pasien jatuh per 1.000 hari rawat; IDO/HAIs | KPI tile RAG, heatmap unit × indikator, tren, feed alert | Direksi (outcome) + Unit (proses) / bulanan–harian | Wajib (Permenkes 30/2022, SIMAR) |
| 2 | Mutu klinis & outcome | Apakah hasil klinis membaik dan variasi antarbangsal menyempit? | GDR; NDR; readmisi 30 hari; mortalitas 30 hari; survival kanker 5 tahun (P2) | KPI tile, tren, boxplot variasi per unit, funnel review, drill ke daftar kasus | Dewan / Departemen / bulanan | GDR ≤45‰, NDR ≤25‰ (Praktik); sisanya Internal |
| 3 | Pengalaman pasien | Apakah pasien puas dan keluhan ditutup tepat waktu? | indeks kepuasan pasien; komplain per 1.000 kunjungan; kecepatan tanggap komplain; DAMA | Gauge, tren, tabel komplain + SLA, pareto keluhan | Direksi / bulanan; komplain harian | Wajib (INM) + Internal |
| 4 | Akses & waktu tunggu | Berapa lama pasien menunggu, dan di jam berapa macet? | waktu tunggu rawat jalan; LOS IGD; tanggap SC emergensi; operasi elektif tertunda; kepatuhan visite | Bar pita waktu, heatmap jam × hari, alert breach, tren | Unit / harian–mingguan | Wajib (INM); sebagian Belum verifikasi |
| 5 | Alur & kapasitas rawat inap | Apakah tempat tidur dipakai efisien tanpa bottleneck? | BOR, ALOS, TOI, BTO per bangsal; okupansi ICU; ketersediaan bed | Scatter Barber Johnson (BOR–ALOS), bar per bangsal, bed board timeline, alert overcrowding | Unit + Direksi / harian | BOR 60–85%, ALOS 6–9, TOI 1–3, BTO 40–50× (Praktik) |
| 6 | Keberlanjutan keuangan | Apakah pendapatan tertagih dan arus kas sehat? Berkas mana yang berisiko ditolak sebelum dikirim? | pendapatan; piutang klaim; klaim ditolak/pending; AR days; TAT pencairan; **% berkas lolos pra-verifikasi; temuan per kategori aturan** | KPI tile, waterfall pendapatan, aging AR, pareto denial, tren vs target, **kartu pra-verifikasi klaim** | Direksi / bulanan; pra-verifikasi harian (Casemix) | Internal; pra-verifikasi Belum verifikasi |
| 7 | Produktivitas & kesejahteraan SDM | Apakah staf cukup, terlatih, dan terpelihara? | kepuasan staf; rasio tenaga per TT; jumlah tenaga per jenis; turnover; absensi; pelatihan | KPI tile, tabel headcount, bar rasio per unit, heatmap unit × shift, tren turnover | Direksi / bulanan | Internal (BSC learning & growth) |
| 8 | Kepatuhan regulasi & pelaporan | Apakah semua kewajiban terpenuhi tanpa temuan? | status 13 INM; 6 indikator SIRS; akreditasi KARS/JCI; kelengkapan dan ketepatan waktu lapor | Scorecard checklist, kalender deadline, status submit, tautan bukti | Direksi / Mutu / bulanan + alert deadline | Wajib (Permenkes 30/2022; SIRS) |
| 9 | Kinerja strategis (BSC) | Apakah strategi terukur dan selaras antarperspektif? | financial; customer; internal process; learning & growth | Strategy map, scorecard per perspektif, target vs aktual, pelacakan inisiatif | Dewan / kuartalan–bulanan | Internal |
| 10 | Keputusan berbasis data (konversasional) | Siapa pun bisa bertanya dan jawabannya bisa dipercaya? | seluruh indikator di atas lewat NLQ + drill-down | Chat sidebar, chart auto-render, panel bukti/definisi, saved view, audit log | Semua / on-demand | Metric layer sebagai sumber angka |
| 11 | Kesiapan alat medis & utilitas kritis | Apakah alat kritis siap pakai dan utilitas penunjang hidup aman hari ini? | % alat kritis READY per unit; kepatuhan kalibrasi (tidak lewat jatuh tempo); excursion cold chain farmasi; status gas medis & listrik kritis (genset/UPS) | Grid kesiapan alat unit × status, progress kepatuhan kalibrasi + daftar jatuh tempo, daftar status utilitas, feed alert | Unit + Direksi / harian; kalibrasi bulanan | Internal; kalibrasi Belum verifikasi (rujukan akreditasi belum diperiksa) |

---

## B. Inventaris komponen UI

| Komponen | Fungsi | Dipakai di imperatif | Prinsip desain |
|---|---|---|---|
| KPI tile + RAG | Satu angka, status warna, delta terhadap target/periode | 1, 2, 3, 6, 7 | Actionable-first; traffic light |
| Tren garis | Arah jangka waktu vs target | 1, 2, 3, 4, 6, 7, 11 | Grafik + tabel |
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
| Feed alert | Sinyal yang butuh aksi sekarang | 1, 4, 5, 11 | Penjaga kelelahan notifikasi |
| Kartu pra-verifikasi klaim | % lolos, temuan per 4 kategori aturan, butir checklist paling sering gagal; diletakkan di samping pareto denial | 6 | Actionable-first; leading indicator |
| Grid kesiapan alat | Jumlah alat kritis per unit × status kesiapan | 11 | Traffic light; drill-down |
| Progress kepatuhan kalibrasi | % alat dalam masa kalibrasi + daftar yang jatuh tempo ≤30 hari | 11 | Actionable-first |
| Daftar status utilitas | Gas medis, genset, UPS, cold chain: status + waktu data terakhir | 11 | Traffic light; akurasi data |
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
Imperatif #11 tidak mendapat tab sendiri; ia menjadi satu bagian di halaman
Operasional agar jumlah halaman tetap terkendali.

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
- Isi laporan ValidAI per berkas (temuan per pasien, usulan kode ICD) dan Medical
  Scribe (SOAP); keduanya data klinis per pasien, tetap di aplikasi ValidAI.
- Biaya per pemakaian alat, downtime impact, dan penghematan sewa (FR-HC-030/038);
  terlalu rinci untuk tampilan direksi tahap ini.

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
6. **Integrasi ValidAI** — perlu endpoint/ekspor agregat (status, jumlah temuan per
   kategori) dan kepastian aturan Complete/Incomplete sebelum #6 tambahan masuk P0.
7. **Sumber data alat & utilitas** — apakah RS memakai ESOPT, CMMS lain, atau
   pencatatan manual. Tanpa sumber, #11 tetap P1.
8. **Daftar alat kritis** — alat mana yang dihitung di "% alat kritis READY"
   (mis. ventilator, monitor, syringe pump, defibrilator, inkubator).

---

## F. Rujukan internal

- `RESEARCH_DASHBOARD_RS.md` §3 — set inti indikator dan tier peran
- `RESEARCH_DASHBOARD_RS.md` §4 — rumus dan nilai ideal
- `RESEARCH_DASHBOARD_RS.md` §5 — prinsip desain dan kebutuhan pengguna
- `RESEARCH_DASHBOARD_RS.md` §10–§12 — lapisan konversasional, arsitektur, peta fitur
- `estrada-validai/APP_FEATURE_CAPABILITY.md` — FR-VER-003…006, FR-DASH-002 (ValidAI)
- `estrada-validai/ANALYSIS_REPORT.md` — model data submission dan batas inferensi
- `estrada/esopt-docs/00-prd/esopt-prd-v2.3.docx` §9 — FR-HC-001…039 (Healthcare)

---

## G. Sumber dari ekosistem Estrada

Hasil penelaahan `estrada-validai` dan `estrada` (25 Nov 2026). Prinsipnya: ambil
yang mengisi celah keputusan manajerial; jangan menambah indikator hanya karena
datanya ada.

### G.1 ValidAI → pra-verifikasi berkas klaim (memperluas #6)

ValidAI memeriksa berkas klaim BPJS **sebelum dikirim**. Dua penyebab terbesar di
pareto denial dashboard ("Kode INA-CBG tidak sesuai", "Dokumen tidak lengkap")
adalah hal yang diperiksa ValidAI, sehingga ia menjadi *leading indicator* bagi
denial rate yang sekarang bersifat *lagging*.

| Indikator | Rumus | Field ValidAI |
|---|---|---|
| % berkas lolos pra-verifikasi | berkas Complete ÷ total berkas diverifikasi × 100 | `status` (Complete/Incomplete) |
| Butir perbaikan per berkas | rata-rata (`total_items` − `verified_items`) | `total_items`, `verified_items` |
| Temuan per kategori aturan | jumlah temuan per kategori | 4 kategori: Berita Acara Kesepakatan, Aturan Klinis, Peraturan Menteri Kesehatan, Aturan Coding Medis (FR-VER-003) |
| Butir checklist paling sering gagal | frekuensi gagal per butir | 10 butir: SEP & identitas, resume medis, billing, INA-CBG/e-klaim, dokumen gawat darurat, konsistensi RJ/IGD, kewajaran LOS, kelas rawat, diagnosis didukung terapi, justifikasi akut (FR-VER-004) |

Batasan yang harus ikut tampil di panel definisi:

- ValidAI belum punya API publik; data dibaca dari HTML laporan (`GET /submission-document/show/{id}`).
- Aturan keputusan Complete/Incomplete belum diketahui; kelima sampel berstatus Incomplete.
- Angka di mock bersifat simulasi dengan label sumber "ValidAI (belum terintegrasi)".

### G.2 PRD ESOPT Healthcare → kesiapan alat & utilitas (imperatif #11)

Dashboard belum menyentuh alat dan fasilitas. Modul Healthcare ESOPT
(FR-HC-001…039) dirancang tanpa data klinis pasien, sejalan dengan §D. Yang
diambil hanya subset wallboard (FR-HC-037):

| Indikator | Rumus | Dasar PRD |
|---|---|---|
| % alat kritis READY | alat kritis berstatus READY ÷ total alat kritis × 100, per unit | FR-HC-006, FR-HC-017 |
| Kepatuhan kalibrasi | alat dalam masa kalibrasi ÷ alat wajib kalibrasi × 100 | FR-HC-013 |
| Excursion cold chain | jumlah kejadian suhu/pintu/daya di luar profil per periode | FR-HC-021, FR-HC-022 |
| Status gas medis & listrik kritis | status terburuk per sistem (oksigen, vakum, genset, UPS, ATS) + waktu data | FR-HC-023, FR-HC-024 |

Pemetaan status kesiapan ESOPT ke badge dashboard:

| Status ESOPT (FR-HC-006) | Badge |
|---|---|
| READY | `ok` |
| READY_WITH_WARNING, WAITING_CLEANING | `warn` |
| WAITING_CALIBRATION, WAITING_MAINTENANCE, MISSING_ACCESSORY, MISSING_CONSUMABLE | `warn` (kritis bila alat kritis dan tidak ada cadangan) |
| NOT_READY, QUARANTINED, OUT_OF_SERVICE | `crit` |
| Nilai tidak didukung gateway | `na` ("Not Available", FR-HC-008) |

### G.3 Pola yang dipakai ulang tanpa menambah indikator

- Nilai yang tidak tersedia ditampilkan "Not Available", bukan nol (FR-HC-008); sama dengan status `na`.
- Setiap insight mengutip metrik dan rumus sumber (FR-HC-036); sama dengan panel bukti + definisi.
- Data freshness ikut dikembalikan bersama data komponen (FR-SPF dashboard); sama dengan badge kesegaran data.
- AI hanya membaca dan mewarisi RBAC, tidak mengambil keputusan otomatis (PRD §out of scope); sama dengan prinsip metric layer di #10.

### G.4 Ditelaah tetapi tidak diambil

| Sumber | Alasan |
|---|---|
| ValidAI Medical Scribe (SOAP, rekomendasi ICD) | Dokumentasi klinis per pasien, bukan KPI manajemen |
| ValidAI admin user & paket langganan | Urusan internal aplikasi ValidAI |
| ESOPT biaya alat, rental saving, capital plan (FR-HC-030/031/038) | Terlalu rinci untuk tahap ini; kandidat P2 |
| esopt-tracker-simulator (GPS armada Teltonika) | Bisa untuk waktu respons ambulans, tetapi belum ada kebutuhan keputusan |
| esthink-hikcentral, esthink-dahua (CCTV) | Integrasi kamera, tidak relevan untuk KPI RS |
