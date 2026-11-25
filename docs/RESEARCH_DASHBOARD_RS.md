# Dashboard Manajemen Rumah Sakit — Indikator, Desain, dan Lapisan Konversasional

> Dokumen gabungan dan satu-satunya acuan. Isinya dilebur dari dua berkas riset
> yang kemudian dihapus: `RESEARCH_CONVERSATIONAL_HOSPITAL_DASHBOARD.md`
> (riset awal, 2026-11-19 — arsitektur dashboard konversasional) dan
> `RESEARCH_KPI_DASHBOARD_RUMAH_SAKIT.md` (2026-11-23 — sintesis indikator/KPI
> dengan verifikasi sitasi dan regulasi).
>
> Lingkup: indikator apa yang wajib ada di dashboard manajemen RS, bagaimana
> mendesainnya, dan bagaimana lapisan konversasional (NLQ + LLM) ditumpangkan di atasnya.
> Penekanan konteks Indonesia.
>
> **Status verifikasi.** §6 dan §7 (artikel KPI + regulasi Indonesia) telah diperiksa
> judul, penulis, tahun, dan DOI/URL-nya. Rujukan pada §8 berasal dari riset awal dan
> **belum diverifikasi ulang** di sini; ditandai per entri. Tidak ada metadata yang
> dikarang — entri yang tidak dapat dipastikan tidak dimasukkan.

---

## Daftar Isi

1. Ringkasan eksekutif
2. Sintesis indikator per domain
3. Set inti indikator untuk RS Indonesia
4. Definisi indikator yang sering salah
5. Desain dashboard klinis dan kebutuhan pengguna
6. Rujukan artikel indikator (terverifikasi)
7. Regulasi dan sumber resmi Indonesia (terverifikasi)
8. Rujukan pendukung (belum diverifikasi)
9. Prioritas Nabovati 2023: apa yang bisa dikutip
10. Lapisan konversasional: NLQ, agen, dan trust
11. Arsitektur rekomendasi
12. Peta fitur berprioritas
13. Implikasi implementasi di `dashboard-rs`
14. Batasan bukti dan koreksi klaim lama
15. Pernyataan penggunaan AI

---

## 1. Ringkasan eksekutif

Dua temuan saling menguatkan. Pertama, literatur manajemen RS konsisten menyimpulkan
bahwa dashboard yang berhasil memakai **set indikator terbatas, terdefinisi, dan
berjenjang menurut peran** — bukan kumpulan besar metrik. Kedua, literatur desain
dashboard menambahkan bahwa konten yang benar saja tidak cukup: tampilan harus
*actionable-first*, memakai klasifikasi warna tiga tingkat, dan mengikuti alur kerja
klinis.

| Lapis | Sumber | Kontribusi |
|---|---|---|
| Prioritas pengguna | Nabovati dkk. 2023 (234 manajer RS publik) | 51 KPI disaring menjadi 25 prioritas dalam 5 domain |
| Peta indikator | Hadian dkk. 2024 (91 studi, 1.161 indikator) | 110 indikator utama, 21 dimensi, 14 subkategori |
| Frekuensi pemakaian | Talebpour dkk. 2025 (16 studi) | 10 KPI tersering di literatur |
| Kewajiban hukum | Permenkes 30/2022; Kepmenkes 129/2008; SIRS/BPS | 13 INM RS + 6 indikator rawat inap |
| Desain & interaksi | Rabiei & Almasi 2022; umbrella review dashboard | Kebutuhan fungsional/non-fungsional, klasifikasi clinical vs quality |

**Urutan kepentingan domain** menurut manajer RS (Nabovati dkk. 2023, skala 1–10):
pelayanan pasien 8,62 → mutu & keselamatan 8,35 → keuangan 8,30 → SDM 7,91 →
operasional 7,24.

Angka di atas adalah **rata-rata semua item dalam domain**, bukan skor KPI tunggal.
Satu KPI dapat jauh lebih tinggi dari rata-rata domainnya: BOR per bangsal 8,93
(tertinggi di domain operasional yang rata-ratanya hanya 7,24) dan pendapatan total
9,36 (tertinggi di seluruh studi). Konsekuensi praktis: memilih domain untuk dashboard
tidak sama dengan memilih indikator individual di dalam domain itu.

---

## 2. Sintesis indikator per domain

### 2.1 Pelayanan pasien

Domain dengan skor tertinggi secara keseluruhan (8,62) — dan hanya berisi tiga KPI:
kepuasan pasien rawat inap, kepuasan pasien IGD, dan komplain pasien
(Nabovati dkk. 2023). Ketiganya masuk prioritas pertama. Talebpour dkk. 2025 juga
menempatkan *patient satisfaction rate* di antara 10 KPI tersering.

Konsekuensi desain yang mudah terlewat: skor domain tinggi di sini sebagian
disebabkan domainnya kecil (3 item) dan seluruhnya selaras. Jangan membacanya
sebagai bukti bahwa kepuasan pasien lebih penting daripada 22 item operasional
yang dipecah dan diberi skor lebih rendah.

### 2.2 Mutu & keselamatan

Talebpour dkk. 2025 menempatkan **angka infeksi nosokomial** dan **angka kejadian
tidak diharapkan** sebagai KPI paling sering diteliti, bersama mortalitas,
insiden/error, dan readmisi. Nabovati dkk. 2023 menyertakan mortalitas
sebelum/sesudah 24 jam, pasien jatuh, tingkat CPR berhasil, dan re-hospitalisasi
15 hari. Hadian dkk. 2024 mencatat **mortalitas muncul di 29 dari 91 studi (32%)**
dan **readmisi di 23 studi (25%)**.

Teks artikel Nabovati 2023 menyebut **pasien jatuh** sebagai indikator terpenting
di domain ini, tetapi angka mean yang menyertainya tidak dapat dipasangkan dengan
aman dari ekstraksi tabel (lihat §9). Dashboard tetap menampilkannya; yang tidak
dilakukan adalah mengutip skornya.

### 2.3 Operasional

Dua kelompok indikator berbeda asal-usulnya:

- **Pemanfaatan tempat tidur.** Hadian dkk. 2024 mencatat subkategori
  *bed utilization rate* dilaporkan di **46 dari 91 studi (50%)**; di dalam dimensi
  *productivity*, LOS muncul di 43 dari 53 studi (80%) dan BOR di 21 (40%).
  Talebpour dkk. 2025 menempatkan ALOS di peringkat pertama KPI tersering.
- **Indikator operasional versi manajer.** Nabovati dkk. 2023 memberi skor tertinggi
  pada **BOR per bangsal (8,93)** — bukan BOR agregat RS, dan bukan jumlah pasien.
  Indikasi desain: dashboard harus bisa dipecah per bangsal.

Domain operasional justru **domain dengan skor terendah (7,24)** di antara lima
domain, meski jumlah item yang dinilai paling banyak (22 dari 51). Implikasi: banyak
indikator operasional tidak otomatis berarti penting bagi manajemen. BTO dan TOI
tidak masuk daftar Nabovati; keduanya berasal dari pelaporan SIRS/SPM Indonesia.

Ketegangan yang layak disorot: **BOR per bangsal (8,93) adalah KPI operasional
tertinggi menurut manajer** — ditegaskan langsung oleh teks artikel — sementara
ALOS, yang paling sering dipakai di literatur (Hadian 2024: 80% studi pada dimensi
*productivity*; Talebpour 2025: peringkat pertama), hanya masuk prioritas pertama
tanpa menjadi yang tertinggi. Artinya, frekuensi sitasi literatur bukan ukuran
kepentingan manajerial. Dashboard tetap memuat ALOS karena kewajiban pelaporan,
tetapi menaruh BOR per bangsal sebagai sorotan utama domain operasional.

Untuk dashboard, ini berarti satu angka BOR tingkat RS tidak cukup; agregasi per
bangsal adalah bentuk minimum yang berguna.

### 2.4 Keuangan

Domain keuangan berisi sepuluh KPI: pendapatan total RS, neraca keuangan, anggaran
per sumber daya, utang per kreditur, pendapatan rawat jalan, potongan klaim asuransi,
klaim belum terbayar, klaim terbayar, diskon pasien, dan saldo dana.
**Pendapatan total RS adalah yang tertinggi di seluruh studi (9,36)** — ditegaskan
teks artikel. Kelompok klaim asuransi (belum terbayar, terbayar, potongan) menjadi
klaster penting di domain ini. Urutan skor butir lain tidak dikutip di sini (lihat §9).

Hadian dkk. 2024 mencatat subkategori *financial management* dilaporkan di
**38 dari 91 studi (42%)**, subkategori tersering kedua setelah *bed utilization*
dan *patient safety* (keduanya 46 studi); Talebpour dkk. 2025 mencatat
*mean cost per patient* di antara KPI efisiensi yang dilaporkan.

Untuk Indonesia, klaim BPJS menjadi padanan alami dari kelompok klaim asuransi itu,
dengan klaim ditolak/pending sebagai padanan *deductions*.

### 2.5 SDM

Dari enam KPI SDM, **kepuasan personel memuncaki domain ini dengan 8,83** — angka
yang ditegaskan langsung oleh teks artikel ("personnel satisfaction rate (mean = 8.83)
was the most important indicator in human resources domain"). Nilainya lebih tinggi
daripada semua indikator mutu dan hampir menyamai BOR per bangsal (8,93).
Sisanya, yaitu jumlah personel dan perencanaan tenaga kerja, berada di pita
prioritas kedua (mean 6–8).

Implikasi yang tidak intuitif: dashboard yang hanya memuat rasio tenaga per tempat
tidur dan mengabaikan kepuasan staf melewatkan KPI SDM yang paling penting menurut
manajer sendiri. Domain ini berskor agregat terendah kedua (7,91), jadi bobotnya
di dashboard sebaiknya lebih kecil daripada mutu dan keuangan — tetapi kepuasan
personel tetap layak ditampilkan.

---

## 3. Set inti indikator untuk RS Indonesia

Ukuran sasaran: **18–22 indikator** pada level direksi, dengan subset harian untuk unit.
Angka ini hasil penyaringan sendiri, bukan angka baku dari satu studi. Dasarnya dua:
literatur dashboard menyebut salah satu solusi masalah konten adalah tidak memilih
terlalu banyak indikator (Rabiei & Almasi 2022), dan 25 KPI prioritas pertama
Nabovati 2023 sudah mencakup semua domain wajib.

| Domain | Indikator yang disarankan | Dasar |
|---|---|---|
| Mutu & keselamatan | kepatuhan kebersihan tangan; kepatuhan identifikasi pasien; pasien jatuh per 1.000 hari rawat; GDR; NDR; infeksi daerah operasi/HAIs; readmisi 30 hari | Permenkes 30/2022 (wajib); Talebpour 2025; Hadian 2024 |
| Pelayanan pasien | indeks kepuasan pasien; komplain per 1.000 kunjungan; waktu tunggu rawat jalan; LOS IGD | Permenkes 30/2022; Nabovati 2023 (domain skor tertinggi) |
| Operasional rawat inap | BOR, ALOS, TOI, BTO per bangsal; pulang atas permintaan sendiri (DAMA); okupansi ICU; operasi elektif tertunda | Nabovati 2023; SPM RS 2008; SIRS |
| Keuangan | pendapatan; piutang klaim; klaim ditolak/pending; AR days | Nabovati 2023; Hadian 2024 |
| SDM | kepuasan staf; rasio tenaga per tempat tidur; jumlah tenaga menurut jenis pekerjaan; turnover; absensi | Nabovati 2023 (kepuasan staf = KPI SDM tertinggi) |

**Berjenjang menurut peran** (rekomendasi operasional, bukan temuan uji terkontrol):

| Tier | Pengguna | Isi | Cadence |
|---|---|---|---|
| Dewan / direksi | CEO, direktur, dewan pengawas | 12–15 indikator outcome, mutu & keselamatan, keuangan, SDM | Bulanan |
| Departemen | Kepala unit / instalasi | 4–6 indikator proses + outcome | Mingguan |
| Front-line | Tim perawat, huddle pagi | 3–5 sinyal alur & keselamatan | Harian |

Prinsip cascade ini konsisten dengan kritik bahwa banyak RS memakai KPI lebih banyak
daripada yang disarankan literatur (Behrouzi dkk. 2014, §8 — belum diverifikasi ulang).

Indikator yang bersifat mengikat: **13 INM** (Permenkes 30/2022) dan **6 indikator
rawat inap** untuk pelaporan SIRS. Gabungan keduanya sudah terwakili di tabel di atas
dan menjadi tulang punggung dashboard. Sisanya pilihan yang perlu disesuaikan dengan
tipe, kelas, dan strategi RS.

Konteks Indonesia tambahan yang mempengaruhi pemilihan indikator: mutu diukur lewat
**INM + HAIs** (dilaporkan via **SIMAR** Kemenkes), kepatuhan akreditasi
**KARS/JCI**, klaim **BPJS/JKN** (denial rate, AR days, TAT pencairan), dan SDM
lewat **ABK & IKI** (standar RS BLU — ARSI 2017, §8).

---

## 4. Definisi indikator yang sering salah

| Indikator | Rumus | Catatan |
|---|---|---|
| BOR | (jumlah hari perawatan ÷ (jumlah TT × jumlah hari periode)) × 100% | Ideal 60–85% |
| ALOS | jumlah lama dirawat ÷ jumlah pasien keluar (hidup + mati) | Ideal 6–9 hari; pada kasus tertentu wajar berbeda |
| BTO | jumlah pasien keluar ÷ jumlah TT | Ideal 40–50 kali per tahun |
| TOI | ((jumlah TT × jumlah hari) − hari perawatan) ÷ jumlah pasien keluar | Ideal 1–3 hari |
| GDR | (jumlah kematian seluruhnya ÷ jumlah pasien keluar) × 1.000 | Angka kematian **umum**, satuan permil |
| NDR | (jumlah kematian ≥48 jam ÷ jumlah pasien keluar) × 1.000 | Kematian setelah 48 jam dirawat |
| DAMA | (pasien pulang atas permintaan sendiri ÷ pasien keluar) × 100% | Padanan *discharge with own agreement* pada Nabovati 2023 |

Catatan atribusi penting: nilai ideal BOR/ALOS/TOI/BTO/GDR/NDR lazim dirujuk ke
**Depkes RI 2005 (Pedoman Penyelenggaraan Rekam Medis Rumah Sakit)** — atribusi ini
muncul eksplisit di profil Dinas Kesehatan daerah — dan direproduksi pada metadata
indikator BPS Sirusa serta pelaporan **SIRS Online (RL 1.2 dan 3.1)**. Nilai tersebut
memang menjadi acuan praktik, tetapi **tidak berasal dari Permenkes 24/2022**
(dokumen itu tentang rekam medis elektronik). Untuk Kepmenkes 129/2008, indikator
yang dikutip publikasi adalah tingkat pemanfaatan sarana (BOR), rata-rata lama rawat,
dan rata-rata kunjungan — target angkanya belum saya verifikasi langsung dari
Lampiran, jadi jangan atribusikan angka 60–85% ke dokumen itu tanpa memeriksa salinannya.

Satu catatan tambahan: **Kepmenkes HK.01.07/MENKES/346/2025** (Pedoman Penghitungan
Biaya Satuan Pelayanan di RS, berlaku 18 April 2025) memuat tahapan menghitung BOR
dan LOS sebagai bagian dari perhitungan utilisasi untuk penetapan tarif. Ini artinya
BOR/LOS kini juga punya peran tarif, bukan hanya pelaporan mutu.

Grafik Barber Johnson bukan indikator tambahan, melainkan tampilan bersama
BOR–BTO–TOI–ALOS pada satu bidang. Di dashboard sebaiknya berupa scatter plot
dengan kuadran efisiensi, bukan empat angka terpisah.

---

## 5. Desain dashboard klinis dan kebutuhan pengguna

### 5.1 Prinsip desain yang terkonfirmasi literatur

1. **Actionable information first** — data yang butuh aksi sekarang di permukaan, bukan semua data
2. **Traffic light / 3-level color coding** (green/amber/red) — standar de facto untuk risiko
3. **Grafik + tabel side-by-side** — clinicians lebih memilih tampilan gabungan, bukan satu saja
4. **Hierarchical drill-down** — ringkasan → kategori → detail per-pasien
5. **Minimal click depth** — nilai langsung ditampilkan, bukan tersembunyi di tooltip
6. **Notification fatigue guard** — ambang + snooze + personalisasi, bukan alert konstan
7. **Workflow-integrated** — dashboard mengikuti alur klinis, bukan memaksa alur baru
8. **Co-design dengan pengguna** — physiotherapist, perawat, dan dokter punya kebutuhan berbeda
9. **Data accuracy > data volume** — 62 KPI yang benar lebih baik daripada 500 KPI yang salah
10. **Consistent terminology** — istilah medis konsisten, tidak ada singkatan berbeda untuk hal sama

Dasar nomor 1–10: umbrella review dashboard kesehatan (41 studi, klasifikasi
*clinical dashboard* vs *quality dashboard*), kerangka evaluasi dashboard IEEE TVCG
2022 (7 skenario evaluasi), studi desain antarmuka CDS untuk deteksi deteriorasi
(JAMIA 2025: grafik + tabel paling disukai, traffic light tiga warna paling umum),
Triptychon (2023), Ludlow & Westbrook (2022), dan tinjauan UX CDSS berbasis
*user-centered design*. Rincian sitasi ada di §8.

### 5.2 Kebutuhan fungsional dan non-fungsional

Rabiei & Almasi 2022 (54 dari 1.254 artikel, rentang 2000–Mei 2020) memetakan:

- **Tujuan dashboard:** penilaian mutu layanan, manajemen sumber daya, pemantauan
  aktivitas RS, serta analisis dan peramalan.
- **Kebutuhan fungsional:** kustomisasi, pembuatan alert, pelacakan, pengukuran
  indikator terhadap standar/rata-rata nasional/tren, pelaporan visual (ekspor
  Excel/Word/PDF), dan pengingat.
- **Kebutuhan non-fungsional:** kecepatan, keamanan, kemudahan pakai, lintas
  perangkat, integrasi sistem, berbasis web, *data warehouse*, kemutakhiran data,
  dan visualisasi sesuai kebutuhan pengguna.
- **Temuan penting:** salah satu solusi untuk masalah konten dashboard adalah
  **tidak memilih terlalu banyak indikator untuk dilaporkan**.

### 5.3 Kebutuhan manajemen puncak

- **Ferreira dkk. (BMC HSR 2026, Delphi ED Portugal)** — dukungan kuat untuk akses
  yang berfokus kepemimpinan, visualisasi per peran, serta alert untuk
  *overcrowding*, *triage breach*, dan *bed shortage*; hambatannya biaya tinggi dan
  infrastruktur data.
- **Zagorecki dkk. (2012)** — executive dashboard sebagai abstraksi tinggi yang
  mencegah *information overload* lewat set KPI terbatas.
- **Tjomsland dkk. (BMJ Leader 2023)** — untuk dewan RS dan pimpinan puncak,
  dashboard *unwarranted variation*: mortalitas 30 hari, survival kanker 5 tahun,
  dan utilisasi prosedur yang dipengaruhi preferensi/penyedia.
- **Tiering beban informasi** — lihat tabel berjenjang pada §3.

---

## 6. Rujukan artikel indikator (terverifikasi)

1. **Nabovati E, Farrahi R, Sadeqi Jabali M, Khajouei R, Abbasi R.** Identifying and
   prioritizing the key performance indicators for hospital management dashboard at a
   national level: Viewpoint of hospital managers. *Health Informatics Journal.*
   2023;29(4). doi:10.1177/14604582231221139 · PMID 38062641
   → 234 manajer RS publik Iran (survei 2020); 51 KPI diuji dalam 5 domain →
   25 KPI prioritas pertama (mean ≥8). Skor domain (rata-rata item domain ± SD):
   layanan pasien 8,62±2,12 / mutu & keselamatan 8,35±1,34 / keuangan 8,30±1,23 /
   SDM 7,91±1,44 / operasional 7,24±1,42. Komposisi kuesioner: keuangan 10,
   operasional 22, SDM 6, mutu 10, layanan pasien 3.
   KPI tertinggi yang ditegaskan di teks artikel: pendapatan total 9,36 (keuangan),
   BOR per bangsal 8,93 (operasional), kepuasan personel 8,83 (SDM).
   Teks artikel juga menyebut pasien jatuh (mutu & keselamatan) dan kepuasan pasien
   (layanan) sebagai KPI paling penting domainnya, tanpa angka yang dapat dipasangkan
   dengan aman dari ekstraksi tabel.
   Batasan yang penulis akui: hanya RS publik Iran; mungkin kurang berlaku untuk
   RS swasta, militer, dan nirlaba.

2. **Hadian SA, Rezayatmand R, Shaarbafchizadeh N, Ketabi S, Pourghaderi AR.**
   Hospital performance evaluation indicators: a scoping review.
   *BMC Health Services Research.* 2024;24:561. doi:10.1186/s12913-024-10940-1 ·
   PMID 38693562 · PMCID PMC11064245
   → 1.204 indikator dikumpulkan dari 91 studi; 43 dibuang (terlalu umum) → 1.161
   indikator → 145 dimensi fungsional → **21 dimensi kinerja**, **14 subkategori**,
   **110 indikator utama**. Kategori: organisasi (78/91 studi), klinis (62),
   administratif (51). Dimensi terkuat: efficiency 54 studi, productivity 53,
   safety 38, effectiveness 37. Angka kunci: subkategori *bed utilization* 46 studi;
   *financial management* 38; *patient safety* 46; *human resource management* dan
   *time management* 31 masing-masing; mortalitas 29, readmisi 23. Dalam dimensi
   productivity: LOS 43/53 studi (80%), BOR 21/53 (40%), BTO dan hospitalization
   rate 12 studi masing-masing.
   Catatan: paragraf *safety dimension* menyebut *patient safety* 38 studi (sama
   dengan jumlah studi berdimensi safety), sedangkan abstrak, Table 4, dan paragraf
   *subcategories* menyebut 46 — untuk prevalensi subkategori gunakan 46/91.

3. **Talebpour A, Sadeghi-Bazargani H, Janati A, Pashazadeh F, Gholizadeh M.**
   Crucial key performance indicators for hospital evaluation: A scoping review.
   *Journal of Education and Health Promotion.* 2025;14:195.
   doi:10.4103/jehp.jehp_2102_23 · PMID 40575502 · PMCID PMC12200011
   → JBI/PRISMA-ScR; 16 studi; urutan KPI tersering: ALOS, infeksi nosokomial,
   kepuasan pasien, mortalitas, BOR, insiden/error, kejadian tidak diharapkan,
   waktu tunggu, readmisi, biaya rata-rata per pasien.

4. **Rabiei R, Almasi S.** Requirements and challenges of hospital dashboards:
   a systematic literature review. *BMC Medical Informatics and Decision Making.*
   2022;22:287. doi:10.1186/s12911-022-02037-8 · PMID 36348339 · PMCID PMC9644506
   → 54 dari 1.254 artikel; rentang pencarian 2000–Mei 2020. Ringkasan kebutuhan
   fungsional/non-fungsional ada di §5.2. Temuan penting: salah satu solusi untuk
   masalah konten dashboard adalah **tidak memilih terlalu banyak indikator**.

---

## 7. Regulasi dan sumber resmi Indonesia (terverifikasi)

5. **Peraturan Menteri Kesehatan RI Nomor 30 Tahun 2022** tentang Indikator Nasional
   Mutu Pelayanan Kesehatan Tempat Praktik Mandiri Dokter dan Dokter Gigi, Klinik,
   Pusat Kesehatan Masyarakat, Rumah Sakit, Laboratorium Kesehatan, dan Unit Transfusi
   Darah. Ditetapkan 12 Oktober 2022; diundangkan 17 Oktober 2022; BN 2022 No. 1054;
   94 hlm. **Status: berlaku.**
   URL naskah: https://jdih.kemkes.go.id/storage/documents/pdfs/2022permenkes030.pdf
   Metadata: https://peraturan.bpk.go.id/Details/245550/permenkes-no-30-tahun-2022
   → Pasal 4 ayat (4): 13 indikator mutu RS. Pasal 5: pengukuran lewat profil indikator
   dengan tahapan pengumpulan, validasi, analisis, pelaporan; data dari tiap unit
   pelayanan; pelaporan melalui sistem informasi Kemenkes. Pasal 4 ayat (8): daerah/RS
   boleh menetapkan indikator tambahan.
   13 indikator: (a) kepatuhan kebersihan tangan; (b) kepatuhan penggunaan APD;
   (c) kepatuhan identifikasi pasien; (d) waktu tanggap operasi seksio sesarea emergensi;
   (e) waktu tunggu rawat jalan; (f) penundaan operasi elektif; (g) kepatuhan waktu
   visite dokter; (h) pelaporan hasil kritis laboratorium; (i) kepatuhan penggunaan
   Formularium Nasional; (j) kepatuhan alur klinis (clinical pathway); (k) kepatuhan
   upaya pencegahan risiko pasien jatuh; (l) kecepatan waktu tanggap komplain;
   (m) kepuasan pasien.

6. **Peraturan Menteri Kesehatan RI Nomor 24 Tahun 2022** tentang Rekam Medis.
   URL: https://jdih.kemkes.go.id/storage/documents/pdfs/2022permenkes024.pdf
   → **Bukan** dasar indikator kinerja. Mengatur kewajiban Rekam Medis Elektronik
   (Pasal 3) dan menyatakan RME adalah subsistem dari sistem informasi fasyankes
   yang terhubung dengan subsistem lain (Pasal 5). Relevan sebagai dasar integrasi
   sumber data dashboard, bukan sebagai daftar indikator.

7. **Keputusan Menteri Kesehatan RI Nomor 129/Menkes/SK/II/2008** tentang Standar
   Pelayanan Minimal Rumah Sakit. Ditetapkan 6 Februari 2008.
   Salinan: https://rsucnd.acehbaratkab.go.id/media/2021.05/PMK-No-129-tahun-2008-tengan-SPM-RS-lengkap1.pdf
   → Lampiran memuat jenis pelayanan, indikator, dan standar SPM per unit
   (gawat darurat, rawat jalan, rawat inap, dsb.). Catatan: pedoman ini menetapkan
   target periode 2007–2012.

8. **Badan Pusat Statistik — Sirusa, metadata indikator "Indikator Kinerja Pelayanan
   di Rumah Sakit"** (ID Indah 106970, Dinas Kesehatan Kab. Tangerang; ID 132857,
   Dinas Kesehatan Prov. Kalimantan Selatan).
   https://sirusa.bps.go.id/metadata/indikator/6f6f307b-6556-e2b5-557a-a4f274585336
   → Definisi dan rumus BOR, ALOS, TOI, BTO, GDR, NDR; nilai ideal BOR 60–85%,
   ALOS 6–9 hari, TOI 1–3 hari, BTO 40–50 kali/tahun; sumber data pelaporan
   **SIRS Online R.L. 1.2 dan 3.1**. Nilai ideal di sini merujuk praktik
   **Depkes RI 2005**, bukan Permenkes.

9. **Direktorat Jenderal Kesehatan Lanjutan, Kementerian Kesehatan RI — Informasi
   Indikator Nasional Mutu.** https://keslan.kemkes.go.id/inm/index
   → Ringkasan publik INM; contoh target terkonfirmasi: kepatuhan kebersihan tangan
   >85%, waktu tunggu rawat jalan >80% (≤60 menit).

10. **Keputusan Menteri Kesehatan RI Nomor HK.01.07/MENKES/346/2025** tentang Pedoman
    Penghitungan Biaya Satuan Pelayanan di Rumah Sakit. Ditetapkan 18 April 2025;
    status berlaku.
    Naskah: https://jdih.kemkes.go.id/storage/documents/pdfs/2025kepmenkes346.pdf
    → Menetapkan dua pendekatan *costing* (top-down Step Down; bottom-up TDABC), dan
    memuat tahapan menghitung BOR dan LOS sebagai bagian dari analisis utilisasi.
    BOR didefinisikan sebagai persentase penggunaan tempat tidur; LOS sebagai rata-rata
    lama tinggal. Gunanya: landasan bahwa BOR/LOS juga dipakai untuk penetapan tarif.

11. **Dinas Kesehatan Kabupaten Badung — Profil Kesehatan 2025** (contoh praktik
    atribusi di daerah).
    https://diskes.badungkab.go.id/storage/diskes/file/profil-dinkes-2025-final-20260629105027-XL268.pdf
    → Mengutip nilai ideal BOR 60–85% dan LOS 6–9 hari dengan rujukan eksplisit
    **(Depkes RI, 2005)**, dan memuat tabel BOR/LOS per rumah sakit. Berguna sebagai
    bukti bahwa angka ideal itu praktik pelaporan daerah, bukan pasal peraturan.

---

## 8. Rujukan pendukung (belum diverifikasi ulang)

Entri di bawah berasal dari dokumen riset awal. **Status: belum diperiksa ulang**
di sesi penyusunan gabungan ini — judul, DOI, dan angka sitasi mengikuti catatan
sumber. Gunakan sebagai petunjuk pencarian, bukan sebagai sitasi siap pakai.

### 8.1 Arsitektur NLQ / agen klinis

| # | Rujukan | Temuan yang dicatat |
|---|---|---|
| 12 | EHRAgent — Shi et al., EMNLP 2024, doi:10.18653/v1/2024.emnlp-main.1245 | LLM + code generation + execution loop; dekomposisi query → tabel → SQL → eksekusi → self-correct; +29,6% atas baseline |
| 13 | Multi-Agent FHIR EHR — De Maio et al., SoftCOM 2024, doi:10.23919/softcom62040.2024.10721684 | Dua LLM: publik susun URI FHIR, lokal interpret resource; data sensitif tidak keluar |
| 14 | Robust Clinical NL2SQL — Blašković & Tanković, MDPI 2025 | Eksekusi GPT-4o 66,1%, DeepSeek V3.1 59,8%; 86,3% error dari *lexical/ontology grounding* |
| 15 | M3 — arXiv:2507.01053, 2025 | NL → MIMIC-IV via MCP; Claude Sonnet 4 94%, gpt-oss-20B lokal 93%; OAuth2 + audit log |
| 16 | TQGen-EHRQuery — arXiv, 2025 | Multi-modal EHR → query code; UMLS + Faiss template similarity |
| 17 | MedicalVis — arXiv:2506.12837, 2025 | 35.374 pasangan NLQ-visualisasi; MedCodeT5 hasilkan chart |
| 18 | Conversational BI — Zenodo 2025 | Groq API + LangChain, multi-turn, chart dinamis, multi-bahasa |
| 19 | PhenomenAgent — doi:10.21203/rs.3.rs-10026525/v1, 2026 | Agentic LLM untuk EHR phenotyping, self-correction, open-weight |
| 20 | LLMonFHIR — PMC12144420, 2025 | 210 respons dinilai 5/5 oleh dokter |

### 8.2 Desain dan evaluasi dashboard

| # | Rujukan | Temuan yang dicatat |
|---|---|---|
| 21 | Umbrella Review of Healthcare Dashboards — Almasi et al., *Digital Health* 2026, doi:10.1177/20552076261429609 | 41 studi, 12 aplikasi; klasifikasi *clinical* vs *quality dashboard* |
| 22 | Framework for Evaluating Dashboards — Zhuang, Concannon, Manley, IEEE TVCG 2022, doi:10.1109/tvcg.2022.3147154 | 7 skenario evaluasi: task, behaviour, workflow, engagement, utility, algorithm, implementation |
| 23 | Patient Safety Dashboard — Mehdibagli et al., *Med J Iran* 2025, doi:10.47176/mjiri.39.132 | 62 KPI, 8 kategori; SUS 82,99 |
| 24 | CDS Deterioration Interface — Jayawardena et al. 2025, doi:10.1016/j.ijmedinf.2025.105946 | Grafik + tabel paling disukai; traffic light 3 warna paling umum |
| 25 | Triptychon — Kittel et al. 2023, PMC10627022 | 3 panel (lokasi/prosedur, lab, vital); 20 partisipan; warna membingungkan, klik berlebih |
| 26 | Ludlow & Westbrook 2022, doi:10.4324/9781003109945-42 | 6 fasilitator/hambatan: co-design, usability, aksesibilitas, akurasi data, infrastruktur, alur kerja |
| 27 | Heuristic Evaluation of XAI in Dashboards — SHTI 2025, doi:10.3233/shti250341 | Evaluasi heuristik penjelasan pada dashboard kesehatan |

### 8.3 Trust, explainability, dan agen percakapan

| # | Rujukan | Temuan yang dicatat |
|---|---|---|
| 28 | Visual-Conversational Diabetes Risk — Samimi et al., ACM CUI 2025, doi:10.1145/3719160.3736616 | Hybrid fine-tuned + general LLM; 30 HCP; evidence menaikkalibrasi trust |
| 29 | Explainability Assistant — Krjutškov et al., ICECET 2026, doi:10.1109/icecet65726.2026.11632877 | Function calling; 94% intent accuracy vs 76,8% TalkToModel |
| 30 | Human-Algorithmic Interaction — Rajashekar et al., CHI 2024, doi:10.1145/3613904.3642024 | Sitasi hasil LLM meningkatkan trust |
| 31 | TrAAIT — Stevens & Stetson, JBI 2023, doi:10.1016/j.jbi.2023.104550 | Trust = f(ability, integrity, benevolence) |
| 32 | Emotion-Adaptive CDSS — JMIR HF 2026, doi:10.2196/89005 | Deteksi emosi → adaptasi nada; trust & explainability naik |
| 33 | Cognitive Alignment — Frontiers Cardiovasc Med 2025, doi:10.3389/fcvm.2025.1651324 | "Think WITH clinicians, not FOR clinicians" |
| 34 | Transforming Clinical Reasoning — Front Digit Health 2026, doi:10.3389/fdgth.2025.1715440 | AI mendukung, bukan menggantikan kognisi manusia |
| 35 | Conversational Agents in Digital Health — Dingler et al. 2021, doi:10.1055/s-0041-1726510 | Tinjauan peran asisten percakapan kesehatan |
| 36 | Multi-User Conversational Interfaces — Applied Sciences 2025, doi:10.3390/app15137267 | Arsitektur, dialogue/user modelling, metrik evaluasi |
| 37 | Scoping review LLM untuk EHR — Li et al., arXiv:2405.03066 | 329 paper; 126 sitasi (per catatan sumber) |

### 8.4 Eksekutif, strategi, dan konteks Indonesia (belum diverifikasi)

| Rujukan | Temuan yang dicatat |
|---|---|
| Bohm et al., *BMJ Open Quality* 2021 | Scoping 87 BSC kesehatan; 4 perspektif Kaplan-Norton dominan; hanya 69% selaras strategi; seleksi indikator harus terbatas & iteratif |
| Abu Jaber & Nashwan, *Cureus* 2022 | Framework 5 dimensi (+ quality of care); financial ROI/income/budget, customer satisfaction/komplain, quality HAIs/readmisi/adverse events, internal LOS/BOR/door-to-therapy, learning turnover/training/EHR |
| Behrouzi et al., *Australian Health Review* 2014 | 41% studi RS memakai KPI lebih banyak dari rekomendasi → solusi BSC berjenjang |
| Si et al., *IJERPH* 2017 | modified DEMATEL: adverse events, infeksi nosokomial, LOS, BOR, financial |
| Amer et al. 2022 | Review: BSC meningkatkan kepuasan pasien & kinerja keuangan; efek ke puasan staf kecil |
| Ferreira et al., *BMC HSR* 2026 | Delphi ED Portugal; akses kepemimpinan, visualisasi per peran, alert overcrowding/triage breach/bed shortage; hambatan biaya & infrastruktur |
| Zagorecki et al. 2012 | Executive dashboard = abstraction tinggi, cegah information overload |
| Amri et al., RIGGS 2026 | Review dashboard BI kinerja eksekutif RS Indonesia: BOR/ALOS/BTO/TOI + HAIs + klaim BPJS + KARS |
| Priyandari et al., Techno.Com 2025 | Dashboard publik RS, 7 indikator, 3 kategori pengguna |
| ARSI 2017 | Standar ABK & IKI untuk RS BLU |

### 8.5 Implementasi industri (belum diverifikasi)

NurseFlow (Devpost), UpHill Clinical Cockpit, Medovora Workspace, Virtual Collaborator/GE
(Ezra chatbot), Vitaloop (Cornell 2026). Pola umum: chat sidebar, real-time via
WebSocket/SSE, LLM lokal untuk data sensitif, role-based view, konfirmasi sebelum
aksi destruktif, streaming response.

### 8.6 Referensi lokal Garuda (belum diverifikasi)

- "Natural Language Query Hybrid Architecture for Cross-Sectoral Analytics Dashboards" — *Equivalent* 2026
- "Deteksi Ill-Formed Natural Language Query Berbasis Rule pada LLM Text-to-SQL Berbahasa Indonesia" — *HORIZON* 2026
- "Konversi Bahasa Indonesia ke DML/SQL menggunakan NLP" — *BUSITI* 2022
- "Artificial Intelligence in Anesthesiology and Intensive Care" — *Jurnal Komplikasi Anestesi* 2026
- "SmartOTC CDSS for Pharmacists" — *J Advanced Health Informatics* 2026

---

## 9. Prioritas Nabovati 2023: apa yang bisa dikutip

Ekstraksi HTML Tabel 3 artikel ini **menggeser kolom**: pada beberapa baris, angka
dari baris sebelumnya terbawa ke baris berikutnya (misalnya baris ALOS memuat 8,93
dan baris BOR memuat 8,07, padahal teks menyatakan BOR per bangsal = 8,93).
Karena itu dokumen ini **sengaja tidak menyalin tabel 25 skor KPI**. Yang dikutip
hanya angka yang ditegaskan langsung oleh teks artikel:

| KPI mean | Domain | Status |
|---|---|---|
| 9,36 — pendapatan total RS | Keuangan | Ditegaskan teks; tertinggi di seluruh studi |
| 8,93 — BOR per bangsal | Operasional | Ditegaskan teks; tertinggi di domain |
| 8,83 — kepuasan personel | SDM | Ditegaskan teks; tertinggi di domain |

Untuk domain pelayanan pasien dan mutu & keselamatan, artikel menyebut indikator
paling pentingnya (kepuasan pasien; pasien jatuh) tetapi tidak memasang angka yang
dapat diverifikasi dengan aman, jadi tidak dikutip di sini. Pita skor yang masih
dapat dikutip adalah rata-rata per domain (§1), bukan skor per butir.

Cara verifikasi mandiri: unduh PDF di
https://journals.sagepub.com/doi/pdf/10.1177/14604582231221139 dan bandingkan
Tabel 3 dengan narasi hasil.

---

## 10. Lapisan konversasional: NLQ, agen, dan trust

Bagian ini menjawab pertanyaan berbeda dari §2–§4: bukan *indikator apa*, tetapi
*bagaimana pengguna bertanya ke dashboard*. Semua rujukan di sini berasal dari §8
dan berstatus belum diverifikasi ulang.

### 10.1 Temuan arsitektur NLQ

- **Function calling lebih akurat daripada NL2SQL murni.** EHRAgent (EMNLP 2024)
  memakai loop generate → execute → self-correct dan melampaui baseline 29,6%;
  Explainability Assistant (ICECET 2026) melaporkan 94% intent accuracy dengan
  function calling, dibanding 76,8% pada TalkToModel.
- **Hambatan utama bukan SQL, melainkan grounding istilah.** Studi NL2SQL klinis
  lokal (MDPI 2025) menemukan 86,3% error berasal dari ketidakcocokan
  string/ontologi, bukan dari sintaks query. Konsekuensi: lapisan pemetaan
  terminologi (UMLS, RSN, ICD-10) harus dibangun lebih dulu daripada prompt tuning.
- **Privasi menentukan pembagian model.** Arsitektur dua-LLM (SoftCOM 2024) dan
  MCP-based M3 (arXiv 2025) sama-sama memisahkan model publik untuk menyusun
  permintaan dari model lokal untuk membaca data sensitif. M3 melaporkan akurasi
  sebanding antara model besar (94%) dan model lokal 20B (93%), yang berarti
  opsi on-premise realistis.
- **Multi-turn wajib.** Pertanyaan lanjutan seperti "bandingkan dengan bulan lalu"
  membutuhkan memori konteks; tanpa itu pengguna harus mengulang semua parameter.

### 10.2 Empat syarat dashboard konversasional

1. **Grounding klinis** — setiap jawaban menautkan ke data sumber; confidence + sitasi
   bukti. Rujukan: EHRAgent, Multi-Agent FHIR, TQGen-EHRQuery, Robust NL2SQL.
2. **Usability klinis** — actionable-first, traffic light tiga tingkat, grafik + tabel
   berdampingan, kedalaman klik minimal, penjaga kelelahan notifikasi.
3. **Trust & explainability** — penjelasan sebab, bukan skor keyakinan saja; kalibrasi
   sesuai peran; penanganan error yang jujur ("tidak yakin" lebih baik daripada
   mengarang).
4. **Integrasi alur kerja** — mengikuti alur yang ada, agent proaktif (hasil lab
   abnormal masuk → notifikasi), real-time, RBAC, dan gerbang konfirmasi sebelum
   aksi destruktif (admit, transfer, discharge).

### 10.3 Prinsip trust

TrAAIT (JBI 2023) memecah trust menjadi ability, integrity, dan benevolence;
studi CHI 2024 menemukan sitasi hasil LLM meningkatkan kepercayaan; studi ACM CUI
2025 menemukan bahwa bukti pendukung mengkalibrasi trust lebih baik daripada
tingkat keyakinan yang dinyatakan. Arah praktisnya: tampilkan **dari mana angka itu
berasal** dan **definisi indikator yang dipakai**, bukan sekadar "AI yakin 92%".

Aturan yang layak dijadikan invarian sistem: **model tidak boleh menghitung ulang
KPI dengan rumus sendiri**. Angka diambil dari lapisan metrik yang tervalidasi
(§4); LLM hanya memilih, menjelaskan, dan memvisualkan.

### 10.4 Konteks Indonesia untuk lapisan ini

- Terminologi: ICD-10/RSN sebagai lapisan pemetaan utama; UMLS sebagai pelengkap.
- Bahasa: query bahasa Indonesia perlu penanganan khusus — referensi lokal di §8.6
  menyoroti deteksi *ill-formed query* pada text-to-SQL berbahasa Indonesia.
- Regulasi: UU Kesehatan 2023 dan persyaratan keamanan data (ISO 27001 sebagai acuan
  praktik) membatasi di mana model boleh berjalan.
- Antarmuka bilingual (ID/EN) dengan istilah klinis konsisten.

---

## 11. Arsitektur rekomendasi

```
┌──────────────────────────────────────────────────────────────────┐
│              DASHBOARD MANAJEMEN RS KONVERSASIONAL               │
├──────────────────────────────────────────────────────────────────┤
│ FRONTEND          BACKEND               LLM LAYER                │
│  chat sidebar      REST/WS/SSE           cloud LLM (umum)        │
│  dashboard panel   auth + RBAC           local LLM (sensitif)    │
│  chart renderer    audit log             function calling        │
│  alert system      metric service        intent parsing          │
│  real-time (WS)    FHIR/HL7 adapter      ontology mapping        │
│                                          multi-turn memory       │
├──────────────────────────────────────────────────────────────────┤
│ METRIC LAYER  (sumber kebenaran angka)                           │
│  definisi indikator + versi · rumus tervalidasi · threshold RAG  │
│  agregasi dua tingkat (RS → unit/bangsal) · lineage data         │
├──────────────────────────────────────────────────────────────────┤
│ DATA LAYER                                                       │
│  EHR/FHIR · laboratorium · vital/IoT · registri pasien            │
│  farmasi · penjadwalan · billing/klaim BPJS                      │
├──────────────────────────────────────────────────────────────────┤
│ PROACTIVE AGENT ENGINE                                           │
│  deteksi deteriorasi · alert lab abnormal · ringkasan handoff     │
│  pengingat tindak lanjut · alert overcrowding/bed shortage        │
└──────────────────────────────────────────────────────────────────┘
```

Perbedaan penting dari arsitektur awal di dokumen sumber: **metric layer dipisah
eksplisit**. Tanpa lapisan ini, LLM akan menjadi jalur perhitungan KPI dan angka
dashboard tidak akan konsisten antarhalaman. Dengan lapisan ini, LLM hanya
menerjemahkan pertanyaan menjadi panggilan ke metrik yang sudah didefinisikan.

Komponen kunci:

1. **Chat sidebar** sebagai interaksi utama, dapat diubah ukurannya, respons streaming.
2. **Panel dashboard** berbasis kartu, dengan drill-down hierarkis.
3. **Peta lantai / papan pasien** berwarna sesuai tingkat risiko.
4. **Alert engine** berbasis ambang, bisa ditunda, dipersonalisasi.
5. **Real-time engine** untuk tanda vital dan status tempat tidur.
6. **LLM hybrid** dengan pembagian cloud/lokal menurut sensitivitas data.
7. **Ontology mapping** untuk terminologi Indonesia.
8. **Proactive agent** dengan jalur notifikasi yang tidak mengganggu.
9. **Role-based views** — perawat, dokter, manajemen, pasien.
10. **Audit log** untuk setiap query, rekomendasi, dan aksi.

---

## 12. Peta fitur berprioritas

### P0 — inti (MVP)

- [ ] Chat sidebar: pertanyaan bahasa alami → jawaban + grafik
- [ ] Panel dashboard indikator inti (§3) dengan traffic light terhadap target
- [ ] BOR/ALOS/TOI/BTO per bangsal, dihitung dari metric layer
- [ ] Role-based view (perawat / dokter / manajemen)
- [ ] Daftar pasien + detail (klik dari papan → kartu pasien)
- [ ] Ambang alert dasar + notifikasi
- [ ] Audit log query

### P1 — lanjutan

- [ ] Konteks percakapan multi-turn
- [ ] Pemilihan tipe grafik otomatis
- [ ] Evidence grounding: rekomendasi menautkan ke data sumber dan definisi indikator
- [ ] Agent proaktif: hasil lab abnormal → notifikasi
- [ ] Deteksi deteriorasi (skor peringatan dini)
- [ ] Papan handoff shift dengan ringkasan terstruktur
- [ ] LLM lokal (Ollama/VLLM) untuk data sensitif
- [ ] Pemetaan ontologi istilah Indonesia

### P2 — lengkap

- [ ] Antarmuka suara
- [ ] Peta lantai interaktif
- [ ] Integrasi FHIR/HL7 penuh
- [ ] Panel eksekutif tingkat dewan (variasi tak beralasan, survival, mortalitas 30 hari)
- [ ] Portal pasien konversasional
- [ ] Dukungan bilingual penuh (ID/EN)

---

## 13. Implikasi implementasi di `dashboard-rs`

1. **Navigasi berbasis domain, bukan daftar panjang.** Lima domain Nabovati (pelayanan,
   mutu & keselamatan, operasional, keuangan, SDM) memberi struktur menu tingkat atas
   yang sesuai dengan cara manajer menilai kepentingan. Urutan tampil mengikuti skor
   domain, bukan urutan abjad.

2. **Metadata wajib per KPI.** Setiap indikator menyimpan: rumus, satuan, sumber data,
   target + dasar target (regulasi atau internal), pemilik (role), cadence, dan status
   verifikasi target. Tanpa dasar target, dashboard tidak bisa memberi warna RAG secara
   bertanggung jawab. Untuk INM, target sebagian masih perlu dilengkapi dari Lampiran
   Permenkes 30/2022.

3. **Ambang RAG bersumber regulasi, bukan angka pilihan sendiri.** BOR 60–85%,
   ALOS 6–9 hari, TOI 1–3 hari, BTO 40–50×/tahun berasal dari praktik
   Depkes 2005/SIRS. Simpan sebagai konfigurasi bertanggal, agar perubahan acuan
   tidak menulis ulang data historis.

4. **Fact table dengan versi definisi.** Simpan `indicator_definition_id` +
   `definition_version` pada setiap baris fakta. Ketika rumus berubah (misalnya cara
   menghitung hari perawatan), angka lama tetap terbaca dengan definisinya sendiri.

5. **Agregasi dua tingkat wajib.** BOR/ALOS/TOI/BTO harus tersedia per bangsal *dan*
   agregat RS. Skor Nabovati menunjukkan manajer menilai BOR per bangsal (8,93) jauh
   lebih tinggi daripada domainnya secara keseluruhan; dashboard yang hanya menyajikan
   agregat RS kehilangan bentuk yang paling bernilai.

6. **Metric layer terpisah dari LLM.** Lapisan konversasional memanggil metrik
   yang sudah didefinisikan; tidak ada jalur di mana model menghasilkan angka KPI.
   Ini sekaligus memenuhi syarat grounding pada §10.2.

7. **Dukungan tipologi sumber Indonesia.** Satu indikator dapat bersumber dari
   SIRS (BOR/ALOS/TOI/BTO), SIMAR (INM/HAIs), klaim BPJS (piutang, denial), dan
   billing internal. Model data sebaiknya memisahkan *sumber* dari *indikator* agar
   satu indikator bisa dipasok beberapa sistem tanpa duplikasi.

8. **Rujukan yang boleh dikutip di UI.** Tampilkan atribusi target di tooltip
   ("target: Depkes 2005 via SIRS", "wajib: Permenkes 30/2022") agar pengguna tahu
   bedanya kewajiban hukum dan praktik umum. Ini juga mencegah kesalahan atribusi
   yang dijelaskan di §4.

---

## 14. Batasan bukti dan koreksi klaim lama

### 14.1 Batasan

1. Empat artikel inti (§6) semuanya meneliti **RS publik di Iran**. Transferabilitas
   ke RS swasta Indonesia belum diuji. Yang diambil adalah pola pemilihan indikator,
   bukan angka absolutnya.
2. Nabovati 2023 memakai skala 1–10 pada 51 KPI yang telah disaring dari 3.393;
   skor mencerminkan penilaian manajer, bukan kinerja RS.
3. Skor per butir Nabovati tidak dikutip karena masalah ekstraksi tabel (§9).
4. Nilai ideal BOR/ALOS/TOI/BTO/GDR/NDR berasal dari praktik **Depkes 2005** dan
   pelaporan SIRS/BPS, bukan dari pasal Permenkes yang berlaku.
5. Target angka untuk 13 INM belum lengkap diverifikasi dari Lampiran
   Permenkes 30/2022; hanya dua contoh yang terkonfirmasi (kebersihan tangan >85%,
   waktu tunggu rawat jalan >80%/≤60 menit).
6. Target numerik SPM pada Kepmenkes 129/2008 belum diperiksa langsung dari Lampiran.
7. Hadian 2024 menggunakan **14 subkategori** (abstrak dan hasil konsisten); angka 15
   yang muncul di draf awal adalah salah baca.
8. Untuk dimensi *safety*, artikel menyebut 38 studi di satu paragraf dan 46 di
   paragraf lain; 46 dipakai untuk prevalensi subkategori karena konsisten dengan
   abstrak dan Table 4.
9. Seluruh §8 (rujukan pendukung) belum diverifikasi ulang di sesi ini.
10. Lapisan konversasional (§10–§12) bersandar pada rujukan §8.3 yang belum
    diverifikasi, sehingga angka akurasi (94%, 29,6%, 86,3%) harus diperlakukan
    sebagai klaim dari dokumen sumber, bukan hasil ukur independen.
11. Tidak ada uji pengguna. Rekomendasi desain di §5 dan §3 adalah sintesis literatur,
    bukan hasil evaluasi pada populasi pengguna nyata.

### 14.2 Koreksi terhadap klaim dokumen lama

| Klaim lama | Koreksi |
|---|---|
| Indikator rawat inap bersumber dari **Permenkes 24/2022** | Permenkes 24/2022 mengatur **Rekam Medis Elektronik**. Indikator rawat inap berasal dari praktik Depkes 2005, SIRS, dan BPS Sirusa; SPM dari Kepmenkes 129/2008 |
| **GDR <25‰, NDR <45‰** | Terbalik. **GDR ≤45‰, NDR ≤25‰** — NDR adalah bagian dari GDR (kematian ≥48 jam), sehingga angkanya harus lebih kecil |
| GDR = **readmisi** ≥30 hari per 1.000 pasien keluar | GDR adalah angka kematian umum per 1.000 pasien keluar. Readmisi adalah indikator terpisah |
| Rabiei & Almasi 2022 = **BMC MIDM 22:302** | **22:287**, PMID 36348339, PMCID PMC9644506 |
| 25 KPI Nabovati **tersebar merata** di 5 domain | Tidak merata: keuangan 10, operasional 22, SDM 6, mutu 10, pelayanan pasien 3 (total 51 kandidat) |
| BOR per bangsal **8,07**, ALOS **8,93** | Tertukar akibat ekstraksi tabel. Teks artikel menyatakan **BOR per bangsal 8,93** |
| Kepuasan personel **7,40** (tabel) vs 8,83 (teks) dianggap tidak konsisten | Teks artikel eksplisit: *personnel satisfaction rate (mean = 8,83) was the most important indicator in human resources domain*. Tabel yang diekstrak bergeser kolom |
| Hadian 2024 memiliki **14 vs 15 subkategori** (inkonsistensi) | Tidak ada inkonsistensi. Angka yang benar **14 subkategori** |
| ALOS dilaporkan di **47% studi** | 47% adalah proporsi dalam dimensi *productivity*. LOS muncul di 43 dari 53 studi dimensi itu (80%); BOR 21/53 (40%) |
| "Sepuluh indikator di tabel bersifat mengikat" | Tidak ada hitungan begitu. Yang mengikat: **13 INM** (Permenkes 30/2022) + **6 indikator SIRS** |

---

## 15. Pernyataan penggunaan AI

Dokumen ini disusun dengan bantuan asisten AI (OpenClaude) atas arahan pengguna.
Pencarian literatur dilakukan melalui pencarian web; verifikasi metadata sitasi dan
regulasi dilakukan satu per satu terhadap sumber daring pada 2026-11-23. Bagian §8
diwarisi dari riset 2026-11-19 dan belum diverifikasi ulang.

Pembaca yang akan memakai dokumen ini untuk publikasi atau keputusan kebijakan
disarankan memeriksa ulang §6 dan §7 terhadap naskah aslinya, dan menganggap §8
sebagai daftar petunjuk pencarian.

---

## Lampiran: asal isi

Isi dokumen ini dilebur dari dua berkas riset yang kini **sudah dihapus**:

| Berkas asal (dihapus) | Peran dalam gabungan |
|---|---|
| `RESEARCH_CONVERSATIONAL_HOSPITAL_DASHBOARD.md` (2026-11-19) | Sumber §5.1 dan §5.3, §10, §11, §12, serta seluruh §8 |
| `RESEARCH_KPI_DASHBOARD_RUMAH_SAKIT.md` (2026-11-23) | Sumber §1–§4, §5.2, §6, §7, §9, §13, §14 |

Dokumen ini adalah satu-satunya sumber yang berlaku. Koreksi pada §14.2 sudah
diterapkan di sini.
