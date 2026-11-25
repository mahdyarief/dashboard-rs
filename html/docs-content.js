/* =================================================================
   Konten tab "Panduan" — penjelasan untuk pembaca awam.
   Alasan teknis lengkap ada di docs/DASHBOARD_COMPONENT_MATRIX.md
   dan docs/RESEARCH_DASHBOARD_RS.md. Ubah teks di sini; render ada
   di dashboard.js → renderDocs().
   ================================================================= */
"use strict";

const docsContent = {
  intro: {
    title: "Untuk apa dashboard ini?",
    refs:["rabiei","nabovati","hadian","talebpour"],
    paragraphs: [
      "Pimpinan rumah sakit setiap hari harus memutuskan banyak hal: apakah tempat tidur cukup, apakah pasien aman, apakah klaim BPJS sudah cair, apakah perawat kelelahan. Dashboard ini mengumpulkan angka-angka yang paling menentukan keputusan itu dalam satu layar.",
      "Isinya sengaja dibatasi. Ada ratusan indikator rumah sakit yang bisa diukur, tetapi kalau semuanya ditampilkan, yang penting justru tenggelam. Yang dipilih hanya angka yang menjawab pertanyaan nyata pimpinan, yang wajib dilaporkan ke pemerintah, atau yang paling sering dinilai penting oleh para manajer rumah sakit dalam penelitian."
    ],
    colorsTitle: "Cara membaca warna",
    colorsRefs:["jayawardena","depkes","inm"],
    colors: [
      { status:"ok", label:"ON-TARGET", text:"Aman. Angkanya sudah sesuai target." },
      { status:"warn", label:"WATCH", text:"Perlu diawasi. Mendekati batas, belum berbahaya." },
      { status:"crit", label:"BREACH", text:"Perlu tindakan. Angkanya sudah lewat batas." },
      { status:"na", label:"TARGET BELUM DITETAPKAN", text:"Belum bisa dinilai baik atau buruk, karena rumah sakit belum menyepakati targetnya. Daripada memberi warna yang menyesatkan, angkanya ditampilkan abu-abu." }
    ],
    tipsTitle: "Tips memakai",
    tips: [
      "Klik angka besar di kartu mana pun untuk melihat cara menghitungnya, targetnya dari mana, dan datanya diambil dari sistem apa.",
      "Klik nama unit di tabel untuk melihat data unit itu saja. Jejak klik Anda terlihat di baris atas (RS Nusantara › … ) dan bisa diklik untuk kembali.",
      "Tidak menemukan angka yang dicari? Tanyakan ke Asisten Data di sebelah kanan dengan bahasa biasa."
    ]
  },

  /* Satu entri per tab yang terlihat pengguna */
  sections: [
    {
      tab:"ringkasan", title:"Ringkasan", refs:["sirusa","depkes","rabiei"],
      question:"Kalau hanya punya waktu dua menit pagi ini, apa yang harus saya ketahui?",
      why:"Pimpinan jarang sempat membuka semua halaman. Halaman ini menaruh hal yang butuh tindakan hari ini di paling atas, lalu kondisi umum di bawahnya.",
      items: [
        { what:"Enam kartu angka utama (BOR, ALOS, TOI, BTO, GDR, NDR)",
          why:"Ini enam angka rawat inap yang wajib dilaporkan setiap rumah sakit ke Kementerian Kesehatan. Karena sudah wajib dihitung, angkanya paling bisa dipercaya dan bisa dibandingkan dengan rumah sakit lain. Garis kecil di tiap kartu menunjukkan posisi angka terhadap rentang yang dianggap sehat." },
        { what:"Papan prioritas",
          why:"Daftar pendek masalah yang butuh tindakan sekarang, lengkap dengan siapa penanggung jawabnya. Sengaja dibatasi beberapa item saja, supaya tidak menjadi tumpukan peringatan yang akhirnya diabaikan." },
        { what:"Kapasitas hari ini dan status per domain",
          why:"Menjawab dua pertanyaan pagi yang paling sering muncul: masih ada tempat tidur kosong atau tidak, dan bagian mana dari rumah sakit yang sedang bermasalah." }
      ],
      source:"Laporan rawat inap bulanan (SIRS) dan data keluar-masuk pasien dari sistem informasi rumah sakit (SIMRS)."
    },
    {
      tab:"mutu", title:"Mutu & keselamatan", refs:["talebpour","hadian","permenkes30","tjomsland"],
      question:"Apakah ada pasien yang dirugikan oleh hal yang sebenarnya bisa dicegah?",
      why:"Keselamatan pasien adalah kewajiban hukum sekaligus risiko terbesar reputasi rumah sakit. Infeksi di rumah sakit dan kejadian tidak diharapkan adalah hal yang paling sering diukur dalam penelitian rumah sakit di seluruh dunia.",
      items: [
        { what:"Tabel warna unit × indikator",
          why:"Satu pandangan untuk melihat unit mana yang lemah di indikator mana, misalnya cuci tangan atau pencegahan jatuh. Kotak merah langsung menunjukkan ke mana tim mutu harus pergi, tanpa membaca angka satu per satu." },
        { what:"Grafik tren angka kematian dan pasien kembali dirawat",
          why:"Satu angka bulan ini tidak berarti banyak. Yang penting adalah arahnya: membaik atau memburuk selama setahun." },
        { what:"Status 13 indikator mutu nasional",
          why:"Ke-13 indikator ini wajib dilaporkan ke Kementerian Kesehatan. Menampilkannya di sini membuat pimpinan tahu lebih dulu sebelum laporan dikirim." },
        { what:"Diagram kotak antar unit",
          why:"Rata-rata bisa menipu. Diagram ini menunjukkan apakah ada unit yang jauh berbeda dari yang lain, sesuatu yang biasanya ditanyakan dewan pengawas." },
        { what:"Corong review kematian",
          why:"Setiap kematian pasien seharusnya ditinjau sampai ada perbaikan. Corong ini menunjukkan di tahap mana proses itu macet." },
        { what:"Kartu abu-abu",
          why:"Indikator yang penting tetapi targetnya belum disepakati rumah sakit. Tetap ditampilkan supaya tidak terlupa, tapi tidak diberi warna." }
      ],
      source:"Laporan mutu bulanan ke Kemenkes (SIMAR), laporan insiden keselamatan pasien, dan rekam medis elektronik."
    },
    {
      tab:"pengalaman", title:"Pengalaman pasien", refs:["nabovati","talebpour","permenkes30"],
      question:"Apakah pasien puas, dan apakah keluhannya cepat ditangani?",
      why:"Dalam survei terhadap ratusan manajer rumah sakit, pelayanan pasien dinilai sebagai bidang paling penting. Kepuasan pasien dan kecepatan menanggapi keluhan juga termasuk indikator wajib nasional.",
      items: [
        { what:"Meteran kepuasan pasien",
          why:"Satu skor dengan satu target paling cepat dibaca seperti spidometer: sudah lewat garis atau belum." },
        { what:"Grafik penyebab keluhan (Pareto)",
          why:"Biasanya sebagian besar keluhan berasal dari satu atau dua penyebab saja. Grafik ini menunjukkan mana yang perlu dibereskan dulu supaya dampaknya paling besar." },
        { what:"Penutupan keluhan dan pasien pulang paksa",
          why:"Pasien yang memilih pulang sebelum dinyatakan boleh pulang sering menjadi tanda awal ketidakpuasan." }
      ],
      source:"Survei kepuasan pasien dan catatan keluhan dari bagian pelayanan pelanggan."
    },
    {
      tab:"akses", title:"Akses & waktu tunggu", refs:["talebpour","permenkes30","inm"],
      question:"Berapa lama pasien menunggu, dan pada jam berapa antrean paling macet?",
      why:"Waktu tunggu adalah keluhan pasien paling umum. Rata-rata bulanan tidak membantu karena kemacetan terjadi pada jam-jam tertentu. Yang dibutuhkan adalah pola jam dan hari supaya jadwal dokter dan loket bisa disesuaikan.",
      items: [
        { what:"Grafik waktu tunggu per jam",
          why:"Langsung terlihat jam mana yang melewati batas 60 menit." },
        { what:"Peta jam × hari",
          why:"Menunjukkan pola mingguan, misalnya Senin pagi selalu padat. Dari sini penjadwalan bisa diubah." },
        { what:"Tabel titik yang melewati batas",
          why:"Daftar konkret apa yang melewati target dan siapa penanggung jawabnya, supaya tidak berhenti di grafik." }
      ],
      source:"Catatan waktu pendaftaran, pemanggilan, dan pelayanan di sistem informasi rumah sakit (SIMRS)."
    },
    {
      tab:"operasional", title:"Operasional & kapasitas", refs:["nabovati","hadian","sirusa","depkes"],
      question:"Apakah tempat tidur dipakai dengan baik, dan di unit mana terjadi penumpukan?",
      why:"Para manajer rumah sakit menilai keterisian tempat tidur per bangsal sebagai angka operasional paling penting. Angka satu rumah sakit tidak cukup: rumah sakit bisa terlihat 80% terisi padahal ICU penuh dan paviliun setengah kosong.",
      items: [
        { what:"Grafik Barber Johnson",
          why:"Empat angka rawat inap (keterisian, lama rawat, jeda tempat tidur kosong, perputaran) dibaca sekaligus dalam satu gambar. Kotak hijau adalah zona efisien, dan setiap titik adalah satu unit. Unit di luar kotak perlu diperhatikan." },
        { what:"Tabel per unit",
          why:"Angka rinci di balik grafik. Klik nama unit untuk melihat data unit itu saja." },
        { what:"Papan tempat tidur",
          why:"Mengikuti cara kerja petugas pengatur tempat tidur: berapa yang terisi, berapa yang sudah bersih dan siap dipakai, berapa pasien IGD yang menunggu kamar." }
      ],
      source:"Data keluar-masuk dan pindah pasien dari SIMRS, ditambah status kebersihan kamar."
    },
    {
      tab:"keuangan", title:"Keuangan", refs:["nabovati","hadian"],
      question:"Apakah pendapatan sesuai rencana, dan apakah uangnya benar-benar masuk?",
      why:"Pendapatan total adalah angka yang dinilai paling penting dari seluruh indikator oleh para manajer rumah sakit. Bagi rumah sakit di Indonesia, sebagian besar pendapatan bergantung pada klaim BPJS, sehingga klaim yang tertahan atau ditolak sama pentingnya dengan pendapatan itu sendiri.",
      items: [
        { what:"Kartu pendapatan, umur piutang (AR days), klaim ditolak",
          why:"Pendapatan yang tercatat belum tentu sudah diterima. Umur piutang menunjukkan rata-rata berapa hari uang itu baru masuk." },
        { what:"Komposisi pendapatan",
          why:"Menunjukkan dari layanan mana uang berasal dan seberapa jauh dari target." },
        { what:"Umur piutang dan penyebab klaim ditolak",
          why:"Piutang yang terlalu lama makin sulit ditagih. Penyebab klaim ditolak menunjukkan apa yang harus diperbaiki di bagian pengajuan klaim." },
        { what:"Tren pendapatan dan umur piutang",
          why:"Memperlihatkan apakah selisih dengan target makin lebar atau makin sempit dari bulan ke bulan." }
      ],
      source:"Sistem tagihan rumah sakit dan status klaim dari aplikasi klaim BPJS (e-Klaim INA-CBG)."
    },
    {
      tab:"sdm", title:"SDM", refs:["nabovati"],
      question:"Apakah jumlah staf cukup, dan apakah mereka bertahan?",
      why:"Dalam penelitian, para manajer menilai kepuasan staf sebagai angka SDM paling penting, bahkan lebih tinggi dari indikator mutu. Staf yang kelelahan atau sering berganti biasanya terlihat lebih dulu di sini sebelum muncul sebagai masalah mutu.",
      items: [
        { what:"Kepuasan staf, pergantian staf, ketidakhadiran",
          why:"Tiga tanda awal kelelahan dan ketidakpuasan staf." },
        { what:"Rasio perawat per pasien per unit",
          why:"Menunjukkan unit mana yang kekurangan perawat dibanding standar." },
        { what:"Peta kehadiran unit × shift",
          why:"Kekurangan staf biasanya terjadi di shift tertentu (misalnya malam), bukan sepanjang hari." }
      ],
      source:"Sistem kepegawaian, mesin absensi, dan survei kepuasan staf."
    },
    {
      tab:"kepatuhan", title:"Kepatuhan", refs:["permenkes30","sirusa"],
      question:"Apakah semua laporan wajib sudah dikirim tepat waktu dan lengkap?",
      why:"Terlambat atau tidak lengkap melapor bisa menjadi temuan akreditasi, walaupun pelayanannya sendiri baik. Halaman ini mencegah tenggat terlewat.",
      items: [
        { what:"Daftar periksa indikator wajib",
          why:"Kepatuhan itu sifatnya ya/tidak per item, jadi daftar centang lebih jelas daripada grafik." },
        { what:"Kalender tenggat",
          why:"Mengingatkan laporan apa yang jatuh tempo dan berapa hari lagi." }
      ],
      source:"Status pengiriman ke SIMAR dan SIRS Kemenkes, serta jadwal akreditasi."
    },
    {
      tab:"strategi", title:"Strategi (BSC)", refs:["kaplan"],
      question:"Apakah rencana strategis rumah sakit berjalan, dan masalahnya berawal dari mana?",
      why:"Halaman ini tidak menambah angka baru. Angka yang sama dari halaman lain disusun ulang menjadi rantai sebab-akibat: staf yang puas → proses yang baik → pasien yang puas → keuangan yang sehat. Dengan begitu dewan bisa melihat akar masalah, bukan hanya gejalanya di keuangan.",
      items: [
        { what:"Skor empat sudut pandang",
          why:"Ringkasan satu angka per sudut pandang (keuangan, pasien, proses kerja, pengembangan staf)." },
        { what:"Peta strategi",
          why:"Panah menunjukkan sudut pandang mana yang memengaruhi yang lain." },
        { what:"Daftar inisiatif",
          why:"Menghubungkan angka dengan program kerja nyata, penanggung jawab, dan tenggatnya." }
      ],
      source:"Rencana strategis dan anggaran rumah sakit, ditambah angka dari halaman lain."
    }
  ],

  assistant: {
    title:"Asisten Data di sebelah kanan",
    text:"Asisten membantu mencari dan menjelaskan angka dengan bahasa biasa, misalnya \"kenapa BOR 87%?\". Asisten tidak pernah mengarang atau menghitung angka sendiri. Semua angka diambil dari sumber yang sama dengan dashboard, dan setiap jawaban menyertakan rumus serta sumbernya. Setiap pertanyaan dicatat di jejak audit."
  },

  notShown: {
    title:"Kenapa tidak semua angka ditampilkan?",
    refs:["hadian","rabiei"],
    items: [
      "Penelitian mencatat lebih dari seribu indikator rumah sakit. Menampilkan semuanya membuat layar penuh tetapi tidak membantu mengambil keputusan.",
      "Angka yang targetnya belum jelas tidak diberi warna, supaya tidak ada yang panik atau lega karena warna yang salah.",
      "Data per pasien tidak muncul di tampilan pimpinan. Data itu hanya bisa dibuka oleh orang yang berwenang, lewat klik bertahap.",
      "Tidak ada ramalan angka tanpa penjelasan seberapa yakin ramalan itu."
    ]
  },

  mock: {
    title:"Angka di prototipe ini dari mana?",
    text:"Semua angka di prototipe ini adalah contoh buatan untuk sebuah rumah sakit fiktif (tipe B, 180 tempat tidur, November 2026). Angkanya sengaja dibuat masuk akal, yaitu berada di rentang yang lazim untuk rumah sakit di Indonesia, dan beberapa sengaja dibuat bermasalah supaya terlihat bagaimana dashboard memberi peringatan. Saat dipakai sungguhan, angka akan diambil langsung dari sistem rumah sakit yang disebut di bagian \"Datanya dari mana\" pada setiap halaman.",
    readiness: [
      { status:"ok", label:"Sudah ada", text:"Sebagian besar angka rawat inap dan mutu sudah dihitung rumah sakit karena wajib dilaporkan ke Kemenkes. Tinggal disambungkan." },
      { status:"warn", label:"Perlu disambungkan", text:"Waktu tunggu, tempat tidur, klaim BPJS, dan data staf sudah ada di sistem rumah sakit, tetapi perlu dihubungkan ke dashboard." },
      { status:"crit", label:"Perlu dibangun", text:"Keluhan pasien yang masih dicatat manual dan data jangka panjang (misalnya kesintasan pasien kanker) perlu cara pencatatan baru." }
    ]
  },

  /* verified:true = metadata diperiksa ke sumber asli (riset §6–§7);
     false = dari riset awal, belum diverifikasi ulang (riset §8). */
  references: [
    { id:"nabovati", verified:true,
      cite:"Nabovati E, Farrahi R, Sadeqi Jabali M, Khajouei R, Abbasi R. Identifying and prioritizing the key performance indicators for hospital management dashboard at a national level: Viewpoint of hospital managers. Health Informatics Journal. 2023;29(4).",
      u:"https://doi.org/10.1177/14604582231221139",
      usedFor:"Urutan kepentingan bidang menurut 234 manajer RS: pelayanan pasien tertinggi; pendapatan total (9,36), BOR per bangsal (8,93), dan kepuasan staf (8,83) sebagai angka terpenting di bidangnya." },
    { id:"hadian", verified:true,
      cite:"Hadian SA, Rezayatmand R, Shaarbafchizadeh N, Ketabi S, Pourghaderi AR. Hospital performance evaluation indicators: a scoping review. BMC Health Services Research. 2024;24:561.",
      u:"https://doi.org/10.1186/s12913-024-10940-1",
      usedFor:"Peta 1.161 indikator dari 91 studi: pemanfaatan tempat tidur dan keselamatan pasien paling sering diukur (masing-masing 46 studi); kematian 29 studi, readmisi 23 studi, keuangan 38 studi." },
    { id:"talebpour", verified:true,
      cite:"Talebpour A, Sadeghi-Bazargani H, Janati A, Pashazadeh F, Gholizadeh M. Crucial key performance indicators for hospital evaluation: A scoping review. Journal of Education and Health Promotion. 2025;14:195.",
      u:"https://doi.org/10.4103/jehp.jehp_2102_23",
      usedFor:"Sepuluh indikator yang paling sering dipakai: lama rawat, infeksi rumah sakit, kepuasan pasien, kematian, BOR, insiden, kejadian tidak diharapkan, waktu tunggu, readmisi, biaya per pasien." },
    { id:"rabiei", verified:true,
      cite:"Rabiei R, Almasi S. Requirements and challenges of hospital dashboards: a systematic literature review. BMC Medical Informatics and Decision Making. 2022;22:287.",
      u:"https://doi.org/10.1186/s12911-022-02037-8",
      usedFor:"Jangan memilih terlalu banyak indikator; kebutuhan fitur dashboard RS: kustomisasi, peringatan, perbandingan dengan target/tren, ekspor laporan, data yang mutakhir." },
    { id:"permenkes30", verified:true,
      cite:"Peraturan Menteri Kesehatan RI Nomor 30 Tahun 2022 tentang Indikator Nasional Mutu Pelayanan Kesehatan (BN 2022 No. 1054).",
      u:"https://peraturan.bpk.go.id/Details/245550/permenkes-no-30-tahun-2022",
      usedFor:"13 indikator mutu wajib rumah sakit (Pasal 4 ayat 4) dan kewajiban pelaporan lewat sistem informasi Kemenkes (Pasal 5)." },
    { id:"inm", verified:true,
      cite:"Direktorat Jenderal Kesehatan Lanjutan, Kemenkes RI. Informasi Indikator Nasional Mutu.",
      u:"https://keslan.kemkes.go.id/inm/index",
      usedFor:"Target yang terkonfirmasi: kebersihan tangan >85%; waktu tunggu rawat jalan >80% pasien dilayani ≤60 menit." },
    { id:"sirusa", verified:true,
      cite:"Badan Pusat Statistik — Sirusa. Metadata indikator \"Indikator Kinerja Pelayanan di Rumah Sakit\".",
      u:"https://sirusa.bps.go.id/metadata/indikator/6f6f307b-6556-e2b5-557a-a4f274585336",
      usedFor:"Rumus BOR, ALOS, TOI, BTO, GDR, NDR dan nilai idealnya; sumber data pelaporan SIRS Online RL 1.2 dan 3.1." },
    { id:"depkes", verified:true,
      cite:"Departemen Kesehatan RI. Pedoman Penyelenggaraan Rekam Medis Rumah Sakit. 2005 (dirujuk melalui BPS Sirusa dan profil Dinas Kesehatan daerah).",
      u:"https://diskes.badungkab.go.id/storage/diskes/file/profil-dinkes-2025-final-20260629105027-XL268.pdf",
      usedFor:"Asal nilai ideal BOR 60–85%, ALOS 6–9 hari, TOI 1–3 hari, BTO 40–50×/tahun. Ini acuan praktik, bukan pasal peraturan." },
    { id:"tjomsland", verified:false,
      cite:"Tjomsland dkk. Dashboard variasi tak beralasan untuk dewan dan pimpinan rumah sakit. BMJ Leader. 2023.",
      u:"",
      usedFor:"Dewan RS perlu melihat variasi antarunit, kematian 30 hari, dan kesintasan kanker 5 tahun — dasar diagram kotak dan kartu outcome di halaman Mutu." },
    { id:"jayawardena", verified:false,
      cite:"Jayawardena dkk. Desain antarmuka pendukung keputusan klinis untuk deteksi perburukan pasien. International Journal of Medical Informatics. 2025.",
      u:"https://doi.org/10.1016/j.ijmedinf.2025.105946",
      usedFor:"Tampilan grafik bersama tabel paling disukai; warna lampu lalu lintas tiga tingkat paling umum — dasar kartu berwarna dan grafik+tabel." },
    { id:"kaplan", verified:false,
      cite:"Bohm dkk. Scoping review balanced scorecard di layanan kesehatan (87 BSC). BMJ Open Quality. 2021.",
      u:"",
      usedFor:"Empat sudut pandang Kaplan–Norton paling banyak dipakai di BSC kesehatan; pemilihan indikator harus terbatas dan bertahap." }
  ]
};
