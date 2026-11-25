/* =================================================================
   MOCK DATA — Dashboard Manajemen RS Nusantara
   Semua angka fiktif tetapi disusun mengikuti rentang praktik:
   BOR 60–85%, ALOS 6–9 hari, TOI 1–3 hari, BTO 40–50×/tahun,
   GDR ≤45‰, NDR ≤25‰, 13 INM Permenkes 30/2022.
   Periode: November 2026 (berjalan). Dimuat sebelum dashboard.js.
   ================================================================= */
"use strict";

const RS_INFO = {
  name: "RS Nusantara",
  klass: "Rumah Sakit Umum Tipe B · 180 tempat tidur",
  city: "Bandung",
  period: "November 2026",
  updated: "24 Nov 2026 · 07:42",
  owner: "Direktorat Pelayanan Medis & Keperawatan",
  sources: "SIRS Online · SIMAR · Klaim BPJS · Billing internal · ValidAI & ESOPT (mock)"
};

/* ---------- KPI eksekutif: 6 angka RS ---------- */
const execKpis = [
  { k:"BOR", name:"Bed Occupancy Rate", value:87, unit:"%", target:"60–85%",
    band:[60,85], dir:"in", status:"crit", delta:4.2, good:"down",
    series:[78,80,82,84,86,85,87], labels:["1 Okt","8","15","22","29","5 Nov","12"],
    note:"3 pasien IGD menunggu bed; 5 rencana pulang tertunda menunggu hasil lab.",
    source:"SIRS RL 1.2 · sensor bed", definition:"Hari perawatan ÷ (TT × hari periode) × 100%." },
  { k:"ALOS", name:"Average Length of Stay", value:7.1, unit:"hari", target:"6–9 hari",
    band:[6,9], dir:"in", status:"ok", delta:0.3, good:"down",
    series:[6.4,6.6,6.9,7.0,6.8,7.2,7.1], labels:["1 Okt","8","15","22","29","5 Nov","12"],
    note:"Dalam rentang target; 3 kasus rawat >12 hari menahan rata-rata.",
    source:"SIRS RL 1.2", definition:"Jumlah lama dirawat ÷ pasien keluar (hidup + mati)." },
  { k:"TOI", name:"Turn Over Interval", value:1.4, unit:"hari", target:"1–3 hari",
    band:[1,3], dir:"in", status:"ok", delta:-0.2, good:"down",
    series:[2.1,2.0,1.8,1.7,1.6,1.5,1.4], labels:["1 Okt","8","15","22","29","5 Nov","12"],
    note:"Bed kosong tidak terlalu lama; replenishment dari IGD berjalan baik.",
    source:"SIRS RL 1.2", definition:"((TT × hari) − hari perawatan) ÷ pasien keluar." },
  { k:"BTO", name:"Bed Turn Over", value:46, unit:"×/th", target:"40–50×",
    band:[40,50], dir:"in", status:"ok", delta:2, good:"up",
    series:[41,42,43,44,45,45,46], labels:["1 Okt","8","15","22","29","5 Nov","12"],
    note:"Mendekati batas atas; perputaran tinggi karena banyak pasien pulang cepat.",
    source:"SIRS RL 1.2", definition:"Pasien keluar ÷ jumlah tempat tidur." },
  { k:"GDR", name:"Gross Death Rate", value:41, unit:"‰", target:"≤45‰",
    band:[0,45], dir:"low", status:"warn", delta:2, good:"down",
    series:[38,36,39,42,40,39,41], labels:["Des","Jan","Mar","Mei","Jul","Sep","Nov"],
    note:"Mendekati ambang; 2 kematian bulan ini sudah masuk audit kematian.",
    source:"SIRS RL 3.1", definition:"Kematian seluruhnya ÷ pasien keluar × 1.000." },
  { k:"NDR", name:"Net Death Rate", value:21, unit:"‰", target:"≤25‰",
    band:[0,25], dir:"low", status:"ok", delta:-1, good:"down",
    series:[19,18,20,21,20,22,21], labels:["Des","Jan","Mar","Mei","Jul","Sep","Nov"],
    note:"Stabil tiga bulan; NDR selalu lebih kecil dari GDR karena hanya ≥48 jam.",
    source:"SIRS RL 3.1", definition:"Kematian ≥48 jam ÷ pasien keluar × 1.000." }
];

/* ---------- Unit / bangsal ---------- */
const units = [
  { name:"ICU", beds:12, bor:92, alos:8.2, toi:0.7, bto:58, status:"crit" },
  { name:"HCU", beds:18, bor:89, alos:7.8, toi:0.9, bto:52, status:"warn" },
  { name:"Rawat Inap A", beds:40, bor:88, alos:7.6, toi:1.0, bto:50, status:"warn" },
  { name:"Rawat Inap B", beds:44, bor:81, alos:6.8, toi:1.6, bto:43, status:"ok" },
  { name:"Rawat Inap C", beds:38, bor:74, alos:6.2, toi:2.1, bto:39, status:"ok" },
  { name:"VIP / Paviliun", beds:22, bor:58, alos:5.4, toi:3.9, bto:31, status:"warn" },
  { name:"IGD (holding)", beds:6, bor:84, alos:0.9, toi:0.2, bto:120, status:"warn" }
];

/* ---------- Matriks mutu & keselamatan: unit × indikator ---------- */
const safetyIndicators = [
  { key:"hand", name:"Kebersihan tangan", target:">85%", dir:"high", unit:"%" },
  { key:"apd", name:"Kepatuhan APD", target:">90%", dir:"high", unit:"%" },
  { key:"ident", name:"Identifikasi pasien", target:"100%", dir:"high", unit:"%" },
  { key:"fall", name:"Pencegahan risiko jatuh", target:"100%", dir:"high", unit:"%" },
  { key:"ido", name:"IDO / HAIs", target:"<1,5%", dir:"low", unit:"%" }
];
const safetyMatrix = [
  { unit:"ICU",          hand:84, apd:98, ident:99.1, fall:96, ido:2.1 },
  { unit:"HCU",          hand:81, apd:96, ident:98.4, fall:93, ido:1.2 },
  { unit:"Rawat Inap A", hand:80, apd:96, ident:98.0, fall:92, ido:1.6 },
  { unit:"Rawat Inap B", hand:83, apd:97, ident:99.0, fall:94, ido:0.9 },
  { unit:"Rawat Inap C", hand:79, apd:95, ident:97.2, fall:91, ido:0.6 },
  { unit:"VIP / Paviliun", hand:86, apd:98, ident:99.4, fall:97, ido:0.3 },
  { unit:"IGD",          hand:76, apd:94, ident:96.0, fall:88, ido:0.8 }
];

/* ---------- Tren mutu ---------- */
const qualityTrend = {
  labels:["Des","Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov"],
  gdr:[38,36,39,42,40,37,35,38,40,43,39,41],
  ndr:[19,18,20,21,20,18,17,19,20,22,20,21],
  readmisi:[5.2,5.4,5.1,5.6,5.9,5.7,5.5,6.0,6.2,6.5,6.3,6.4],
  readmisiTarget:5.0
};

/* ---------- Pengalaman pasien ---------- */
const experience = {
  satisfaction:86.4, satisfactionTarget:85,
  satisfactionSeries:[83.1,84.0,84.6,84.2,85.3,85.8,86.4],
  complaints:12, complaintsTarget:10,
  response48h:85, responseTarget:80,
  dama:2.1, damaTarget:2.0,
  pareto:[
    { label:"Waktu tunggu", n:5 },
    { label:"Komunikasi petugas", n:3 },
    { label:"Kebersihan ruang", n:2 },
    { label:"Kejelasan tagihan", n:1 },
    { label:"Lain-lain", n:1 }
  ]
};

/* ---------- Akses & waktu tunggu ---------- */
const access = {
  waitCompliance:88, waitTarget:80,
  scResponse:74, scTarget:80,
  electiveDelay:6.8, electiveTarget:5,
  visitCompliance:91, visitTarget:80,
  byHour:[
    { h:"06", p90:18 }, { h:"07", p90:26 }, { h:"08", p90:41 },
    { h:"09", p90:58 }, { h:"10", p90:64 }, { h:"11", p90:55 },
    { h:"12", p90:38 }, { h:"13", p90:47 }, { h:"14", p90:52 },
    { h:"15", p90:44 }, { h:"16", p90:39 }, { h:"17", p90:31 }
  ],
  breaches:[
    { unit:"IGD", indikator:"Waktu tunggu ≤60 menit", value:"64 mnt p90", target:"≤60", owner:"Kepala IGD" },
    { unit:"OK / Bedah", indikator:"SC emergensi ≤30 menit", value:"74%", target:"≥80%", owner:"Kepala OK" },
    { unit:"Rawat Inap A", indikator:"Penundaan operasi elektif", value:"8,4%", target:"<5%", owner:"Kepala Bedah" },
    { unit:"Rawat Jalan", indikator:"Waktu tunggu poli", value:"88%", target:">80%", owner:"Kepala Rawat Jalan" }
  ]
};

/* ---------- Keuangan (miliar rupiah) ---------- */
const finance = {
  revenue:28.4, revenueTarget:30.0,
  revenueComponents:[
    { label:"Rawat inap", v:10.8 },
    { label:"Rawat jalan", v:7.4 },
    { label:"IGD", v:3.6 },
    { label:"Penunjang & lab", v:4.2 },
    { label:"Farmasi", v:2.4 }
  ],
  arDays:38, arTarget:30,
  aging:[
    { bucket:"0–30 hari", v:1.62 },
    { bucket:"31–60 hari", v:1.08 },
    { bucket:"61–90 hari", v:0.74 },
    { bucket:">90 hari", v:0.49 }
  ],
  denialRate:8.2, denialTarget:5.0,
  denialPareto:[
    { label:"Kode INA-CBG tidak sesuai", n:34 },
    { label:"Dokumen tidak lengkap", n:22 },
    { label:"Rujukan tidak valid", n:12 },
    { label:"Batas waktu klaim", n:9 },
    { label:"Lain-lain", n:7 }
  ],
  pendingClaims:1.42, collectionRate:94.2,
  trendLabels:["Mei","Jun","Jul","Agu","Sep","Okt","Nov"],
  revenueSeries:[27.6,28.1,28.9,28.0,27.9,28.6,28.4],
  revenueTargetSeries:[28.0,28.3,28.6,29.0,29.3,29.6,30.0],
  arSeries:[31,30,32,33,35,37,38]
};

/* ---------- SDM ---------- */
const hr = {
  satisfaction:78, satisfactionTarget:80,
  turnover:9.4, turnoverTarget:10,
  absence:4.2,
  headcount:[
    { role:"Perawat", n:236 }, { role:"Dokter", n:64 },
    { role:"Bidan", n:38 }, { role:"Farmasi", n:28 },
    { role:"Penunjang", n:46 }
  ],
  ratio:[
    { unit:"ICU", ratio:"1:2", target:"1:2", status:"ok" },
    { unit:"HCU", ratio:"1:3", target:"1:3", status:"ok" },
    { unit:"Rawat Inap A", ratio:"1:5", target:"1:4", status:"warn" },
    { unit:"Rawat Inap B", ratio:"1:4", target:"1:4", status:"ok" },
    { unit:"Rawat Inap C", ratio:"1:4", target:"1:4", status:"ok" },
    { unit:"IGD", ratio:"1:3", target:"1:2", status:"crit" }
  ],
  turnoverSeries:[8.1,8.4,8.8,8.9,9.6,10.1,9.4],
  turnoverLabels:["Mei","Jun","Jul","Agu","Sep","Okt","Nov"]
};

/* ---------- Beban kerja & kapasitas hari ini ---------- */
const capacity = {
  totalBeds:180, occupied:157, available:23,
  icu:{ occupied:11, total:12 },
  igdWaiting:3,
  dischargesPlanned:17, dischargesDone:11,
  occupancySeries:[78,80,82,84,86,85,87,88,86,87,89,88,87,87],
  occupancyLabels:["11","12","13","14","15","16","17","18","19","20","21","22","23","24"]
};

/* ---------- Kepatuhan regulasi ---------- */
const inm = [
  { k:"Kebersihan tangan", target:">85%", value:82, numeric:82, dir:"high", status:"warn" },
  { k:"Kepatuhan APD", target:">90%", value:96, numeric:96, dir:"high", status:"ok" },
  { k:"Identifikasi pasien", target:"100%", value:98.4, numeric:98.4, dir:"high", status:"warn" },
  { k:"Tanggap SC emergensi", target:"≥80% ≤30 mnt", value:74, numeric:74, dir:"high", status:"crit" },
  { k:"Waktu tunggu rawat jalan", target:">80% ≤60 mnt", value:88, numeric:88, dir:"high", status:"ok" },
  { k:"Penundaan operasi elektif", target:"<5%", value:6.8, numeric:6.8, dir:"low", status:"warn" },
  { k:"Kepatuhan visite dokter", target:">80%", value:91, numeric:91, dir:"high", status:"ok" },
  { k:"Pelaporan hasil kritis lab", target:"100%", value:94, numeric:94, dir:"high", status:"warn" },
  { k:"Kepatuhan Formularium Nasional", target:">80%", value:89, numeric:89, dir:"high", status:"ok" },
  { k:"Kepatuhan alur klinis", target:">80%", value:76, numeric:76, dir:"high", status:"crit" },
  { k:"Pencegahan risiko jatuh", target:"100%", value:93.2, numeric:93.2, dir:"high", status:"crit" },
  { k:"Kecepatan tanggap komplain", target:">80% ≤48 jam", value:85, numeric:85, dir:"high", status:"ok" },
  { k:"Kepuasan pasien", target:">85", value:86.4, numeric:86.4, dir:"high", status:"ok" }
];

/* Ringkasan profil 13 INM (Lampiran Permenkes 30/2022); kunci INM1..INM13 mengikuti urutan array inm */
const inmFormulas = [
  "Tindakan kebersihan tangan yang dilakukan ÷ peluang kebersihan tangan yang diamati × 100%",
  "Petugas yang memakai APD sesuai indikasi ÷ petugas yang diamati × 100%",
  "Pelayanan dengan identifikasi pasien yang benar ÷ pelayanan yang diamati × 100%",
  "SC emergensi kategori I dengan waktu tanggap ≤30 menit ÷ seluruh SC emergensi kategori I × 100%",
  "Pasien rawat jalan dengan waktu tunggu ≤60 menit ÷ pasien rawat jalan yang disurvei × 100%",
  "Operasi elektif yang tertunda >1 jam dari jadwal ÷ seluruh operasi elektif × 100%",
  "Visite dokter penanggung jawab pukul 06.00–14.00 ÷ visite yang diamati × 100%",
  "Hasil kritis yang dilaporkan ≤30 menit ÷ seluruh hasil kritis × 100%",
  "Resep yang sesuai Formularium Nasional ÷ resep yang ditelaah × 100%",
  "Pelayanan yang sesuai clinical pathway ÷ pelayanan dengan clinical pathway yang diaudit × 100%",
  "Pasien berisiko jatuh yang mendapat upaya pencegahan lengkap ÷ pasien berisiko jatuh × 100%",
  "Komplain yang ditanggapi sesuai waktu standar ÷ seluruh komplain × 100%",
  "Indeks kepuasan pasien dari survei kepuasan"
];

const sirs = [
  { k:"BOR", target:"60–85%", value:87, status:"crit" },
  { k:"ALOS", target:"6–9 hari", value:"7,1", status:"ok" },
  { k:"TOI", target:"1–3 hari", value:"1,4", status:"ok" },
  { k:"BTO", target:"40–50×", value:"46", status:"ok" },
  { k:"GDR", target:"≤45‰", value:"41", status:"warn" },
  { k:"NDR", target:"≤25‰", value:"21", status:"ok" }
];

const compliance = {
  akreditasi:"KARS paripurna · survei berikutnya Juni 2027",
  deadlines:[
    { date:"30 Nov 2026", label:"Laporan INM bulanan ke SIMAR", status:"due", days:6 },
    { date:"5 Des 2026", label:"Rekonsiliasi klaim BPJS periode Nov", status:"upcoming", days:11 },
    { date:"10 Des 2026", label:"Laporan SIRS RL 1.2 & 3.1", status:"upcoming", days:16 },
    { date:"15 Des 2026", label:"Audit internal mutu & keselamatan", status:"upcoming", days:21 },
    { date:"31 Des 2026", label:"Penutupan buku tahun 2026", status:"upcoming", days:37 }
  ]
};

/* ---------- Kinerja strategis (BSC) ---------- */
const bsc = [
  { p:"Keuangan", score:78, status:"warn", note:"Pendapatan 94,7% target; AR days 38.",
    items:[{ k:"Pendapatan", value:"28,4 M", target:"30,0 M", status:"warn" },
           { k:"AR days", value:"38 hari", target:"≤30", status:"warn" },
           { k:"Collection rate", value:"94,2%", target:"≥95%", status:"warn" }] },
  { p:"Pelanggan", score:86, status:"ok", note:"Kepuasan pasien di atas target; komplain 12.",
    items:[{ k:"Kepuasan pasien", value:"86,4", target:">85", status:"ok" },
           { k:"Komplain", value:"12", target:"≤10", status:"warn" },
           { k:"DAMA", value:"2,1%", target:"<2%", status:"warn" }] },
  { p:"Proses internal", score:81, status:"warn", note:"Alur klinis 76%; SC emergensi 74%.",
    items:[{ k:"Alur klinis", value:"76%", target:">80%", status:"crit" },
           { k:"SC emergensi", value:"74%", target:"≥80%", status:"crit" },
           { k:"BOR", value:"87%", target:"60–85%", status:"crit" }] },
  { p:"Pembelajaran & pertumbuhan", score:74, status:"crit", note:"Kepuasan staf 78; turnover 9,4%.",
    items:[{ k:"Kepuasan staf", value:"78", target:"≥80", status:"warn" },
           { k:"Turnover", value:"9,4%", target:"<10%", status:"ok" },
           { k:"Rasio IGD", value:"1:3", target:"1:2", status:"crit" }] }
];

/* ---------- Papan prioritas ---------- */
const alerts = [
  { sev:"crit", domain:"Kapasitas", tab:"operasional",
    title:"ICU 92% — 3 pasien IGD menunggu bed", owner:"Manajer Operasional", age:"18 mnt",
    detail:"BOR RS 87% di atas ambang 85%. Buka 2 bed cadangan atau percepat 5 discharge tertunda.",
    action:"Lihat kapasitas" },
  { sev:"warn", domain:"Mutu", tab:"mutu",
    title:"Kepatuhan alur klinis 76% (target >80%)", owner:"Komite Mutu", age:"2 jam",
    detail:"Terendah di Rawat Inap C. Audit 30 rekam medis dalam 7 hari.",
    action:"Lihat 13 INM" },
  { sev:"crit", domain:"Akses", tab:"akses",
    title:"Tanggap SC emergensi 74% (target ≥80%)", owner:"Kepala OK", age:"3 jam",
    detail:"Rata-rata 34 menit; 6 kasus melewati 30 menit. Tinjau alur konsul anestesi.",
    action:"Lihat waktu tunggu" },
  { sev:"warn", domain:"Mutu", tab:"mutu",
    title:"Kebersihan tangan 82% (target >85%)", owner:"IPCN", age:"5 jam",
    detail:"Turun 3 poin dari Oktober. Jadwalkan audit kepatuhan per shift.",
    action:"Lihat matriks mutu" },
  { sev:"warn", domain:"Keuangan", tab:"keuangan",
    title:"AR days 38 hari (target ≤30)", owner:"Manajer Keuangan", age:"1 hari",
    detail:"Piutang 3,9 M; 12% berumur >90 hari. Prioritas rekonsiliasi klaim BPJS.",
    action:"Lihat keuangan" },
  { sev:"warn", domain:"SDM", tab:"sdm",
    title:"Kepuasan staf 78 (target ≥80)", owner:"SDM", age:"1 hari",
    detail:"Rasio perawat IGD 1:3 dari target 1:2. Survei lanjutan 20 Des.",
    action:"Lihat SDM" },
  { sev:"info", domain:"Regulasi", tab:"kepatuhan",
    title:"Laporan INM jatuh tempo 30 Nov", owner:"Komite Mutu", age:"hari ini",
    detail:"12 dari 13 indikator siap; kepatuhan alur klinis masih di bawah target.",
    action:"Lihat kepatuhan" }
];

/* ---------- Pasien prioritas (anonim) ---------- */
const priorityPatients = [
  { id:"ICU-03", name:"Tn. S", age:62, unit:"ICU", dx:"Sepsis — laktat 4,6", risk:"crit", note:"MAP <65, norepinefrin" },
  { id:"ICU-07", name:"Ny. R", age:71, unit:"ICU", dx:"Gagal jantung akut", risk:"crit", note:"SpO₂ 91%, diuretik IV" },
  { id:"HCU-02", name:"Tn. B", age:45, unit:"HCU", dx:"Pneumonia berat", risk:"warn", note:"CPAP, kultur menunggu" },
  { id:"RIA-11", name:"Ny. M", age:34, unit:"Rawat Inap A", dx:"Post SC — observasi", risk:"warn", note:"Hb 9,4 g/dL" },
  { id:"RIA-04", name:"Tn. H", age:58, unit:"Rawat Inap A", dx:"Nyeri dada", risk:"warn", note:"Troponin ulang 6 jam" },
  { id:"RIB-09", name:"Tn. A", age:41, unit:"Rawat Inap B", dx:"Post OR fraktur femur", risk:"ok", note:"Mobilisasi hari-2" }
];

/* ---------- Definisi & dasar target (untuk panel bukti) ---------- */
/* ---------- Pra-verifikasi berkas klaim (ValidAI; belum terintegrasi) ----------
   Field mengikuti model submission ValidAI: status Complete/Incomplete,
   total_items, verified_items, 4 kategori temuan, 10 butir checklist. */
const claimPrecheck = {
  source:"ValidAI (belum terintegrasi)",
  verified:412, complete:298, avgFixItems:3.4,
  categories:[
    { label:"Coding medis", n:96 },
    { label:"Aturan klinis", n:58 },
    { label:"BA kesepakatan", n:41 },
    { label:"Permenkes", n:23 }
  ],
  checklistFails:[
    { label:"INA-CBG / e-klaim", n:71 },
    { label:"SEP & identitas", n:44 },
    { label:"Resume medis", n:38 },
    { label:"Kewajaran LOS", n:27 },
    { label:"Diagnosis vs terapi", n:19 }
  ]
};

/* ---------- Kesiapan alat medis & utilitas kritis (PRD ESOPT FR-HC; belum terintegrasi) ----------
   Status kesiapan ESOPT dipetakan: READY → siap; READY_WITH_WARNING / WAITING_* /
   MISSING_* → peringatan; NOT_READY / QUARANTINED / OUT_OF_SERVICE → tidak siap. */
const equipment = {
  source:"ESOPT Healthcare (belum terintegrasi)",
  readyTarget:95,
  units:[
    { unit:"ICU", total:38, ready:31, warn:4, down:3 },
    { unit:"Kamar Operasi", total:30, ready:27, warn:2, down:1 },
    { unit:"IGD (holding)", total:26, ready:22, warn:3, down:1 },
    { unit:"Rawat Inap A", total:24, ready:22, warn:1, down:1 },
    { unit:"HCU", total:20, ready:18, warn:2, down:0 },
    { unit:"Perinatologi", total:16, ready:15, warn:1, down:0 }
  ],
  readySeries:[86.4,87.1,85.9,88.0,87.3,86.8,87.7],
  readyLabels:["Mei","Jun","Jul","Agu","Sep","Okt","Nov"],
  calibration:{ inPeriod:412, required:448 },
  calibrationDue:[
    { name:"Ventilator ICU-03", unit:"ICU", due:"lewat 4 hari · dikarantina", st:"crit" },
    { name:"Defibrilator IGD-01", unit:"IGD (holding)", due:"jatuh tempo 3 hari lagi", st:"warn" },
    { name:"Syringe pump HCU-07", unit:"HCU", due:"jatuh tempo 9 hari lagi", st:"warn" },
    { name:"Inkubator Perina-02", unit:"Perinatologi", due:"jatuh tempo 21 hari lagi", st:"ok" }
  ],
  coldChain:{ storages:14, excursions:3, note:"Kulkas vaksin farmasi rawat jalan: pintu terbuka >5 menit (2×); 1× suhu 9,1 °C selama 22 menit." },
  utilities:[
    { name:"Oksigen sentral", value:"Tekanan 4,2 bar · tangki 68%", st:"ok", age:"1 mnt" },
    { name:"Vakum medis", value:"−0,6 bar · 2 pompa aktif", st:"ok", age:"1 mnt" },
    { name:"Genset 1 & 2", value:"Siaga · BBM 74% (± 31 jam)", st:"ok", age:"5 mnt" },
    { name:"UPS Kamar Operasi & ICU", value:"Baterai 61% · 1 modul fault", st:"warn", age:"2 mnt" },
    { name:"Cold chain farmasi", value:"14 unit · 1 di luar profil", st:"warn", age:"3 mnt" }
  ]
};

const definitions = {
  BOR:{ name:"Bed Occupancy Rate", formula:"Hari perawatan ÷ (TT × hari periode) × 100%",
        target:"60–85%", basis:"Praktik Depkes 2005 · SIRS RL 1.2", source:"Sensor bed + SIMRS" },
  ALOS:{ name:"Average Length of Stay", formula:"Jumlah lama dirawat ÷ pasien keluar",
         target:"6–9 hari", basis:"Praktik Depkes 2005 · SIRS RL 1.2", source:"SIMRS" },
  TOI:{ name:"Turn Over Interval", formula:"((TT × hari) − hari perawatan) ÷ pasien keluar",
        target:"1–3 hari", basis:"Praktik Depkes 2005 · SIRS RL 1.2", source:"SIMRS" },
  BTO:{ name:"Bed Turn Over", formula:"Pasien keluar ÷ jumlah TT",
        target:"40–50× per tahun", basis:"Praktik Depkes 2005 · SIRS RL 1.2", source:"SIMRS" },
  GDR:{ name:"Gross Death Rate", formula:"Kematian seluruhnya ÷ pasien keluar × 1.000",
        target:"≤45‰", basis:"Praktik Depkes 2005 · SIRS RL 3.1", source:"SIMRS" },
  NDR:{ name:"Net Death Rate", formula:"Kematian ≥48 jam ÷ pasien keluar × 1.000",
        target:"≤25‰", basis:"Praktik Depkes 2005 · SIRS RL 3.1", source:"SIMRS" },
  READM:{ name:"Readmisi 30 hari", formula:"Pasien dirawat ulang ≤30 hari dengan diagnosis terkait ÷ pasien keluar hidup × 100%",
          target:"<5%", basis:"Internal — usulan target RS, perlu ditetapkan komite medik", source:"SIMRS" },
  INM:{ name:"Indikator Nasional Mutu", formula:"13 indikator wajib RS",
        target:"Sesuai Permenkes 30/2022", basis:"Permenkes 30/2022 (wajib)", source:"SIMAR Kemenkes" },
  MORT30:{ name:"Mortalitas 30 hari", formula:"Kematian ≤30 hari pasca pulang/masuk ÷ pasien keluar × 100%",
          target:null, basis:"Internal — belum ditetapkan direksi", source:"SIMRS + data kematian Dukcapil" },
  SURV5:{ name:"Survival kanker 5 tahun", formula:"Pasien kanker hidup 5 tahun ÷ kohort terdiagnosis × 100%",
          target:null, basis:"Internal (P2) — registri kanker belum lengkap", source:"Registri kanker RS" },
  PJATUH:{ name:"Pasien jatuh per 1.000 hari rawat", formula:"Insiden jatuh ÷ hari rawat × 1.000",
          target:null, basis:"Belum verifikasi — angka acuan literatur belum diperiksa", source:"SIMAR · laporan insiden" },
  LOSIGD:{ name:"Length of stay IGD", formula:"Median waktu triase → keluar IGD (pulang/rawat/rujuk)",
          target:null, basis:"Belum verifikasi — INM hanya mengatur waktu tanggap", source:"SIMRS modul IGD" },
  TATRAD:{ name:"TAT hasil radiologi", formula:"p90 waktu order → ekspertise terbit",
          target:null, basis:"Internal — belum ditetapkan", source:"RIS/PACS" },
  ANTRIFAR:{ name:"Waktu tunggu obat jadi", formula:"Median resep diterima → obat diserahkan",
          target:null, basis:"Belum verifikasi — acuan SPM belum dicocokkan", source:"SIMRS farmasi" },
  KLAIM:{ name:"Klaim & piutang", formula:"AR days = piutang ÷ pendapatan harian rata-rata",
          target:"≤30 hari", basis:"Target internal direksi", source:"Billing + klaim BPJS" },
  REV:{ name:"Pendapatan", formula:"Jumlah pendapatan layanan (rawat inap, rawat jalan, IGD, penunjang, farmasi) pada periode",
        target:"30,0 M per bulan", basis:"Internal — target anggaran RS (RBA); angka mock", source:"Billing internal" },
  AR:{ name:"Hari piutang (AR days)", formula:"Saldo piutang ÷ pendapatan rata-rata per hari",
       target:"≤30 hari", basis:"Internal — usulan target RS, perlu ditetapkan direksi", source:"Billing internal · klaim BPJS" },
  DENIAL:{ name:"Klaim ditolak (denial rate)", formula:"Klaim ditolak atau dikembalikan BPJS ÷ klaim yang diajukan × 100%",
           target:"≤5%", basis:"Internal — usulan target RS, perlu ditetapkan direksi", source:"Klaim BPJS (e-klaim)" },
  COLL:{ name:"Tingkat penagihan (collection rate)", formula:"Pembayaran diterima ÷ tagihan jatuh tempo × 100%",
         target:"≥95%", basis:"Internal — usulan target RS, perlu ditetapkan direksi", source:"Billing internal" },
  PRAVER:{ name:"Pra-verifikasi berkas klaim", formula:"Berkas Complete ÷ berkas yang diverifikasi ValidAI × 100%",
          target:null, basis:"Belum verifikasi — aturan Complete/Incomplete ValidAI belum diketahui", source:"ValidAI (belum terintegrasi; data mock)" },
  ALATKRIT:{ name:"Kesiapan alat medis kritis", formula:"Alat kritis berstatus READY ÷ total alat kritis × 100%",
          target:"≥95%", basis:"Internal — usulan, perlu ditetapkan RS", source:"ESOPT Healthcare FR-HC-006/017 (belum terintegrasi; data mock)" },
  KALIB:{ name:"Kepatuhan kalibrasi alat", formula:"Alat dalam masa kalibrasi ÷ alat wajib kalibrasi × 100%",
          target:null, basis:"Belum verifikasi — rujukan akreditasi belum diperiksa", source:"ESOPT Healthcare FR-HC-013 (data mock)" },
  COLDCHAIN:{ name:"Excursion cold chain", formula:"Kejadian suhu/pintu/daya di luar profil penyimpanan per periode",
          target:"0 kejadian", basis:"Internal", source:"ESOPT Healthcare FR-HC-021/022 (data mock)" }
};

/* ---------- Indikator tanpa target terverifikasi (tampil abu-abu, bukan RAG) ---------- */
const unsetTargets = [
  { k:"MORT30", label:"Mortalitas 30 hari", value:"3,1", unit:"%", note:"Data kematian pasca pulang baru 64% tertaut." },
  { k:"SURV5", label:"Survival kanker 5 tahun", value:"—", unit:"", note:"Prioritas P2; registri kanker belum lengkap." },
  { k:"PJATUH", label:"Pasien jatuh / 1.000 hari rawat", value:"0,8", unit:"‰", note:"4 insiden bulan ini; acuan literatur 0,3–3‰ belum diverifikasi." },
  { k:"LOSIGD", label:"Length of stay IGD", value:"5,2", unit:"jam", note:"Median; 18% pasien >8 jam karena menunggu bed." },
  { k:"TATRAD", label:"TAT hasil radiologi", value:"6,4", unit:"jam", note:"p90 order → ekspertise; CT malam paling lama." },
  { k:"ANTRIFAR", label:"Waktu tunggu obat jadi", value:"38", unit:"mnt", note:"Median; racikan 71 menit." }
];

/* ---------- Katalog jawaban asisten (pattern-matched, berbasis data) ---------- */
/* pertanyaan cepat per tab; tab lain memakai daftar per peran di bawah */
const quickPromptsByTab = {
  mutu:[
    { q:"Bagaimana status 13 INM bulan ini?", t:"Status 13 INM" },
    { q:"Indikator mutu mana yang paling buruk?", t:"Indikator terburuk" },
    { q:"Kenapa GDR mendekati ambang?", t:"GDR & NDR" }
  ],
  keuangan:[
    { q:"Ringkas kinerja keuangan November", t:"Ringkas keuangan" },
    { q:"Bagaimana pra-verifikasi berkas klaim?", t:"Pra-verifikasi klaim" },
    { q:"Domain mana yang paling berisiko?", t:"Domain paling berisiko" }
  ],
  operasional:[
    { q:"Kenapa BOR 87% dan apa tindakannya?", t:"BOR 87% — kenapa?" },
    { q:"Berapa rencana pulang hari ini?", t:"Rencana pulang" },
    { q:"Bagaimana kesiapan alat kritis dan kalibrasi?", t:"Kesiapan alat" }
  ],
  sdm:[
    { q:"Bagaimana kondisi SDM dan rasio perawat?", t:"Rasio perawat" },
    { q:"Domain mana yang paling berisiko?", t:"Domain paling berisiko" }
  ],
  pengalaman:[
    { q:"Bagaimana pengalaman dan komplain pasien?", t:"Komplain pasien" },
    { q:"Domain mana yang paling berisiko?", t:"Domain paling berisiko" }
  ]
};
const quickPrompts = {
  direksi:[
    { q:"Kenapa BOR 87% dan apa tindakannya?", t:"BOR 87% — kenapa?" },
    { q:"Bagaimana status 13 INM bulan ini?", t:"Status 13 INM" },
    { q:"Ringkas kinerja keuangan November", t:"Ringkas keuangan" },
    { q:"Domain mana yang paling berisiko?", t:"Domain paling berisiko" },
    { q:"Bagaimana pra-verifikasi berkas klaim?", t:"Pra-verifikasi klaim" }
  ],
  unit:[
    { q:"Bagaimana kapasitas ICU dan HCU?", t:"Kapasitas ICU" },
    { q:"Unit mana yang butuh perhatian shift ini?", t:"Unit prioritas" },
    { q:"Berapa rencana pulang hari ini?", t:"Rencana pulang" },
    { q:"Bagaimana kesiapan alat kritis dan kalibrasi?", t:"Kesiapan alat" }
  ],
  mutu:[
    { q:"Bagaimana kepatuhan 13 INM bulan ini?", t:"Status 13 INM" },
    { q:"Indikator mutu mana yang paling buruk?", t:"Indikator terburuk" },
    { q:"Apa saja risiko keselamatan pasien minggu ini?", t:"Risiko keselamatan" }
  ]
};

const chatKnowledge = [
  { match:/pra-?verifikasi|validai|berkas klaim|checklist klaim/i, act:()=>{
      const c=claimPrecheck, rate=c.complete/c.verified*100;
      return { lede:`${fmt(rate,1)}% berkas lolos pra-verifikasi`,
        body:`${c.complete} dari ${c.verified} berkas yang diperiksa ValidAI berstatus Complete; rata-rata ${fmt(c.avgFixItems,1)} butir perlu diperbaiki per berkas. Temuan terbanyak di <b>${c.categories[0].label}</b> (${c.categories[0].n}) dan butir paling sering gagal <b>${c.checklistFails[0].label}</b>, sejalan dengan penyebab denial terbesar (kode INA-CBG tidak sesuai). Catatan: ValidAI belum terintegrasi, angka ini mock dan aturan Complete/Incomplete-nya belum diketahui.`,
        evidence:["PRAVER","KLAIM"], acts:[{t:"Buka Keuangan",f:()=>go("keuangan")}] };
  }},
  { match:/\balat\b|kalibrasi|cold ?chain|gas medis|oksigen|genset|\bups\b|utilitas/i, act:()=>{
      const e=equipment, tot=e.units.reduce((a,u)=>a+u.total,0), rdy=e.units.reduce((a,u)=>a+u.ready,0), down=e.units.filter(u=>u.down).map(u=>`${u.unit} ${u.down}`).join(", ");
      return { lede:`${fmt(rdy/tot*100,1)}% alat kritis siap pakai — di bawah target ≥${e.readyTarget}%`,
        body:`${rdy} dari ${tot} alat kritis berstatus READY. Tidak siap: ${down}. Kepatuhan kalibrasi ${fmt(e.calibration.inPeriod/e.calibration.required*100,1)}%; <b>${e.calibrationDue[0].name}</b> ${e.calibrationDue[0].due}. Utilitas: UPS Kamar Operasi & ICU 1 modul fault, cold chain farmasi ${e.coldChain.excursions} excursion bulan ini; oksigen, vakum, dan genset normal. Angka mock dari model ESOPT Healthcare.`,
        evidence:["ALATKRIT","KALIB","COLDCHAIN"], acts:[{t:"Buka Operasional",f:()=>go("operasional")}] };
  }},  { match:/bor|okupansi|kapasitas|bed|icu/i, act:()=>{
      const u=units.filter(x=>x.status!=="ok").map(x=>`${x.name} ${x.bor}%`).join(", ");
      return { lede:`BOR ${execKpis[0].value}% — di atas target 60–85%`,
        body:`Kapasitas tertekan: ${u}. ${capacity.occupied} dari ${capacity.totalBeds} bed terisi; ICU ${capacity.icu.occupied}/${capacity.icu.total}. IGD menahan <b>${capacity.igdWaiting} pasien</b> menunggu bed, dan ${capacity.dischargesPlanned-capacity.dischargesDone} dari ${capacity.dischargesPlanned} rencana pulang belum tuntas.`,
        evidence:["BOR","ALOS"], acts:[{t:"Buka Operasional",f:()=>go("operasional")}] };
  }},
  { match:/inm|mutu|kepatuhan|alur klinis|kebersihan/i, act:()=>{
      const bad=inm.filter(x=>x.status!=="ok");
      return { lede:`${bad.length} dari 13 INM belum memenuhi target`,
        body:`Perlu tindakan: ${bad.map(x=>`<b>${x.k}</b> ${x.value} (target ${x.target})`).join("; ")}. Sementara kepatuhan APD dan Formularium Nasional sudah di atas target.`,
        evidence:["INM"], acts:[{t:"Buka Kepatuhan",f:()=>go("kepatuhan")},{t:"Buka Mutu",f:()=>go("mutu")}] };
  }},
  { match:/keuangan|pendapatan|klaim|piutang|ar days|denial/i, act:()=>{
      return { lede:`Pendapatan ${fmt(finance.revenue,1)} M dari target ${fmt(finance.revenueTarget,1)} M`,
        body:`Tercapai <b>${fmt(finance.revenue/finance.revenueTarget*100,1)}%</b> target. AR days <b>${finance.arDays} hari</b> (target ≤${finance.arTarget}); denial klaim ${fmt(finance.denialRate,1)}% (target ≤${fmt(finance.denialTarget,1)}%). Piutang tertahan ${fmt(finance.pendingClaims,2)} M, sebagian besar dari kode INA-CBG yang tidak sesuai.`,
        evidence:["KLAIM"], acts:[{t:"Buka Keuangan",f:()=>go("keuangan")}] };
  }},
  { match:/sdm|staf|perawat|turnover|kepuasan staf|rasio/i, act:()=>{
      return { lede:`Kepuasan staf ${hr.satisfaction} — di bawah target ${hr.satisfactionTarget}`,
        body:`Turnover ${fmt(hr.turnover,1)}% per tahun (target <${hr.turnoverTarget}%), absensi ${fmt(hr.absence,1)}%. Rasio perawat terendah di <b>IGD 1:3</b> (target 1:2) dan Rawat Inap A 1:5 (target 1:4).`,
        evidence:[], acts:[{t:"Buka SDM",f:()=>go("sdm")}] };
  }},
  { match:/pasien|pengalaman|komplain|kepuasan pasien|dama/i, act:()=>{
      return { lede:`Kepuasan pasien ${fmt(experience.satisfaction,1)} (target >${experience.satisfactionTarget})`,
        body:`Komplain ${experience.complaints} bulan ini (target ≤${experience.complaintsTarget}), terbesar soal <b>waktu tunggu (5)</b>. DAMA ${fmt(experience.dama,1)}% sedikit di atas batas ${experience.damaTarget}%.`,
        evidence:[], acts:[{t:"Buka Pengalaman",f:()=>go("pengalaman")}] };
  }},
  { match:/prioritas|risiko|berisiko|butuh perhatian|terburuk/i, act:()=>{
      return { lede:"Tiga prioritas tindakan hari ini",
        body:`<b>1. Kapasitas</b> — ICU 92%, 3 pasien IGD menunggu bed. <b>2. Alur klinis</b> — kepatuhan 76%, terendah di Rawat Inap C. <b>3. SC emergensi</b> — 74% dalam 30 menit, target ≥80%.`,
        evidence:[], acts:[{t:"Buka prioritas",f:()=>go("ringkasan")}] };
  }},
  { match:/pulang|discharge/i, act:()=>{
      return { lede:`${capacity.dischargesDone} dari ${capacity.dischargesPlanned} rencana pulang selesai`,
        body:`Sisa ${capacity.dischargesPlanned-capacity.dischargesDone} pasien menunggu hasil lab atau administrasi. Menyelesaikan 5 di antaranya menurunkan BOR sekitar 3 poin.`,
        evidence:["BOR"], acts:[{t:"Buka Operasional",f:()=>go("operasional")}] };
  }},
  { match:/gdr|ndr|kematian|mortalitas|readmisi/i, act:()=>{
      return { lede:`GDR ${execKpis[4].value}‰ (≤45) · NDR ${execKpis[5].value}‰ (≤25)`,
        body:`GDR mendekati ambang; NDR stabil. Readmisi 30 hari ${fmt(qualityTrend.readmisi[11],1)}% (target <5%). Kematian ≥48 jam bulan ini sudah masuk audit kematian komite.`,
        evidence:["GDR","NDR"], acts:[{t:"Buka Mutu",f:()=>go("mutu")}] };
  }}
];

const chatFallback = () => ({
  lede:"Pertanyaan belum dikenali mesin demo",
  body:`Demo ini menjawab topik: BOR/kapasitas, 13 INM/mutu, keuangan & klaim, SDM, pengalaman pasien, GDR/NDR, dan prioritas tindakan. Untuk angka di luar itu, jawaban akan diambil dari data indikator RS pada implementasi nyata.`,
  evidence:[], acts:[]
});

/* ==== data mock untuk komponen matriks tambahan ==== */

// Boxplot variasi GDR per unit (per-kelompok: min, q1, median, q3, max; + outlier ‰)
const unitBoxes = {
  metric:"GDR", unit:"‰", target:45,
  groups:[
    { name:"ICU",           min:22, q1:30, median:38, q3:47, max:61, out:[74] },
    { name:"HCU",           min:14, q1:21, median:28, q3:35, max:46, out:[] },
    { name:"Rawat Inap A",  min:12, q1:19, median:25, q3:31, max:42, out:[] },
    { name:"Rawat Inap B",  min:8,  q1:15, median:20, q3:26, max:35, out:[41] },
    { name:"Rawat Inap C",  min:10, q1:16, median:22, q3:29, max:38, out:[] },
    { name:"VIP / Paviliun", min:4, q1:11, median:16, q3:22, max:30, out:[] }
  ]
};

// Funnel review mortalitas (bulan berjalan)
const mortalityFunnel = {
  stages:[
    { label:"Pasien keluar (seluruh)", n:486 },
    { label:"Kematian ≥48 jam", n:11 },
    { label:"Audit kematian oleh komite", n:8 },
    { label:"Rekomendasi tertulis", n:7 },
    { label:"Tindak lanjut tervalidasi", n:5 }
  ]
};

// Waktu tunggu p90 menit per (hari × jam) — jam 06–17, Sen–Min
const accessDay = ["Sen","Sel","Rab","Kam","Jum","Sab","Min"];
const accessHours = ["06","07","08","09","10","11","12","13","14","15","16","17"];
access.byDayHour = [
  [20,30,46,60,52,40,34,44,50,46,36,26],
  [18,28,44,58,54,42,32,42,48,44,34,24],
  [16,26,42,55,50,44,30,40,46,42,32,22],
  [22,34,50,64,58,46,38,48,54,50,38,28],
  [24,38,56,70,64,52,42,54,60,54,42,30],
  [14,22,36,48,44,34,26,34,38,34,26,18],
  [10,16,26,36,32,26,18,24,28,24,18,12]
];

// Kehadiran perawat per unit × shift (%)
hr.shiftHeat = {
  shifts:["Pagi","Siang","Malam"],
  units:[
    { unit:"ICU",          v:[96,92,84] },
    { unit:"HCU",          v:[94,90,86] },
    { unit:"Rawat Inap A", v:[91,88,80] },
    { unit:"Rawat Inap B", v:[95,93,89] },
    { unit:"Rawat Inap C", v:[92,87,78] },
    { unit:"IGD",          v:[88,82,74] }
  ]
};

// Bed board: okupansi per unit × 4 jendela jam
capacity.bedBoard = [
  { unit:"ICU",           beds:12, occupied:[10,11,12,12], clean:1, hold:0 },
  { unit:"HCU",           beds:18, occupied:[15,16,17,16], clean:1, hold:0 },
  { unit:"Rawat Inap A",  beds:40, occupied:[35,36,37,35], clean:3, hold:2 },
  { unit:"Rawat Inap B",  beds:44, occupied:[34,35,36,34], clean:4, hold:1 },
  { unit:"Rawat Inap C",  beds:38, occupied:[28,29,30,28], clean:5, hold:0 },
  { unit:"VIP / Paviliun",beds:22, occupied:[13,13,14,13], clean:2, hold:0 },
  { unit:"IGD (holding)", beds:6,  occupied:[6,6,6,5],   clean:0, hold:3 }
];

/* definisi per INM (setelah objek definitions terbentuk) */
inm.forEach((i, n) => { definitions["INM" + (n + 1)] = { name: i.k, formula: inmFormulas[n], target: i.target,
  basis: "Permenkes 30/2022 (Lampiran profil indikator)", source: "SIMAR Kemenkes · audit internal (mock)" }; });
