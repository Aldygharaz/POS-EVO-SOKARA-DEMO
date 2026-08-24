import { useState } from 'react';
import {
  BookOpen, ShoppingCart, Package, BarChart3, Users,
  Settings, Keyboard, ChevronDown, ChevronRight,
  Monitor, Zap, Shield, Database, Wifi, WifiOff
} from 'lucide-react';

interface GuideSection {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  steps: {
    title: string;
    content: string;
    tip?: string;
  }[];
}

const guideSections: GuideSection[] = [
  {
    id: 'getting-started',
    icon: Monitor,
    title: 'Memulai Aplikasi',
    description: 'Langkah pertama untuk menggunakan Sokara POS.',
    steps: [
      {
        title: 'Login ke Sistem',
        content: 'Buka aplikasi dan masukkan username serta password Anda. Untuk akun demo, gunakan username "demo" dan password "demo". Setelah berhasil login, Anda akan langsung diarahkan ke halaman Dashboard.',
        tip: 'Gunakan tombol "Login Instan" di halaman login untuk masuk cepat tanpa mengetik.'
      },
      {
        title: 'Memahami Dashboard',
        content: 'Dashboard menampilkan ringkasan operasional toko Anda secara real-time: total pendapatan hari ini, jumlah transaksi, produk terlaris, dan status stok. Semua data dihitung langsung dari transaksi yang tersimpan di perangkat Anda.',
      },
      {
        title: 'Navigasi Menu',
        content: 'Gunakan sidebar di sebelah kiri untuk berpindah antar halaman. Menu dikelompokkan menjadi: Utama (Dashboard, Kasir), Manajemen (Produk, Kategori, Pelanggan, Transaksi, Stok), Analitik (Laporan, BI), dan Sistem (Pengaturan, Audit Log).',
        tip: 'Klik ikon panah di pojok atas sidebar untuk melipat/meringkas sidebar. Hover pada ikon menu saat sidebar dilipat untuk melihat nama menu.'
      },
    ]
  },
  {
    id: 'pos-transaction',
    icon: ShoppingCart,
    title: 'Melakukan Transaksi (POS)',
    description: 'Panduan lengkap proses kasir dari awal hingga cetak struk.',
    steps: [
      {
        title: 'Buka Sesi Kasir',
        content: 'Saat pertama kali masuk ke halaman Kasir (POS), Anda akan diminta memasukkan saldo awal laci kas (Opening Balance). Masukkan jumlah uang tunai yang tersedia di laci, lalu klik "Mulai Sesi". Sesi ini akan mencatat seluruh aktivitas kasir Anda hingga ditutup.',
      },
      {
        title: 'Menambahkan Produk ke Keranjang',
        content: 'Ada 3 cara menambahkan produk: (1) Ketik nama produk di kolom pencarian, lalu klik produk yang muncul. (2) Gunakan barcode scanner hardware yang langsung terdeteksi otomatis. (3) Filter berdasarkan kategori untuk mempersempit daftar produk. Setiap produk yang ditambahkan akan masuk ke panel keranjang di sisi kanan.',
        tip: 'Tekan F1 untuk langsung fokus ke kolom pencarian produk.'
      },
      {
        title: 'Mengatur Jumlah & Diskon',
        content: 'Di panel keranjang, gunakan tombol + dan - untuk mengubah jumlah item. Anda juga bisa memasukkan diskon manual (dalam Rupiah) di bagian ringkasan. Jika pelanggan memiliki poin loyalitas, centang opsi "Gunakan Poin" untuk menukarkan poin sebagai potongan harga.',
      },
      {
        title: 'Memilih Metode Pembayaran',
        content: 'Klik "Bayar" (atau tekan F4) untuk membuka panel pembayaran. Pilih metode: Tunai, Transfer Bank, QRIS, atau Debit. Untuk pembayaran tunai, masukkan jumlah uang yang diterima dan sistem akan menghitung kembalian secara otomatis. Tekan F8 untuk mengisi jumlah "Uang Pas".',
        tip: 'Pembayaran tunai otomatis dibulatkan ke kelipatan Rp100 terdekat karena koin di bawah Rp100 jarang digunakan di Indonesia.'
      },
      {
        title: 'Menyelesaikan Transaksi',
        content: 'Setelah memilih metode dan memasukkan nominal, klik "Proses Pembayaran". Sistem akan otomatis: memotong stok produk, mencatat mutasi stok, menyimpan transaksi, menambah poin loyalitas pelanggan (jika ada), dan memperbarui audit log. Struk digital akan muncul dan bisa dicetak.',
      },
      {
        title: 'Menutup Sesi Kasir',
        content: 'Di topbar bagian atas, klik tombol "Tutup Sesi" (ikon stop). Masukkan saldo akhir laci kas yang sebenarnya. Sistem akan membandingkan saldo yang diharapkan dengan saldo aktual untuk mendeteksi selisih (discrepancy).',
      },
    ]
  },
  {
    id: 'inventory',
    icon: Package,
    title: 'Manajemen Produk & Stok',
    description: 'Mengelola katalog produk, stok, dan mutasi barang.',
    steps: [
      {
        title: 'Menambah Produk Baru',
        content: 'Buka halaman Produk, klik "Tambah Produk". Isi detail: nama, SKU, barcode, kategori, harga beli, harga jual, stok awal, stok minimum, dan satuan. Setiap produk memiliki SKU unik yang juga bisa digunakan sebagai identitas barcode.',
      },
      {
        title: 'Mengelola Kategori',
        content: 'Buka halaman Kategori untuk membuat, mengedit, atau menonaktifkan kategori produk. Kategori membantu mengelompokkan produk di halaman POS dan laporan analitik.',
      },
      {
        title: 'Memantau Stok Rendah',
        content: 'Dashboard secara otomatis menampilkan daftar produk dengan stok di bawah batas minimum (threshold). Setiap produk yang stoknya menipis akan muncul dengan indikator merah. Klik tombol "Fix" untuk melakukan restock instan langsung dari dashboard.',
        tip: 'Batas minimum stok bisa diatur per produk saat mengedit produk, atau secara global di halaman Pengaturan.'
      },
      {
        title: 'Riwayat Mutasi Stok',
        content: 'Halaman Stok mencatat seluruh pergerakan barang: masuk (pembelian dari supplier), keluar (terjual via POS), dan penyesuaian (adjustment untuk barang rusak/hilang). Setiap mutasi mencatat stok sebelum dan sesudah, alasan, dan siapa yang melakukannya.',
      },
    ]
  },
  {
    id: 'customers',
    icon: Users,
    title: 'Manajemen Pelanggan & Loyalitas',
    description: 'Sistem membership dan program poin loyalitas.',
    steps: [
      {
        title: 'Menambah Pelanggan',
        content: 'Buka halaman Pelanggan, klik "Tambah Pelanggan". Isi nama, nomor telepon, email (opsional), dan alamat. Setiap pelanggan baru otomatis mendapat tier membership "Bronze".',
      },
      {
        title: 'Sistem Tier Membership',
        content: 'Ada 4 tier membership: Bronze, Silver, Gold, dan Platinum. Tier naik secara otomatis berdasarkan total belanja kumulatif pelanggan. Tier yang lebih tinggi bisa diberikan benefit khusus seperti diskon atau poin ganda.',
      },
      {
        title: 'Poin Loyalitas',
        content: 'Setiap transaksi yang dikaitkan dengan pelanggan akan menghasilkan poin loyalitas. Poin ini bisa ditukarkan sebagai potongan harga pada transaksi berikutnya (1 poin = Rp10). Aktivasi fitur ini dengan mencentang "Gunakan Poin" di panel checkout POS.',
      },
    ]
  },
  {
    id: 'reports',
    icon: BarChart3,
    title: 'Laporan & Analitik',
    description: 'Grafik penjualan, analisis kategori, dan target bisnis.',
    steps: [
      {
        title: 'Grafik Pendapatan',
        content: 'Dashboard menampilkan grafik area interaktif yang memvisualisasikan pendapatan harian selama 30 hari terakhir. Hover pada titik di grafik untuk melihat detail pendapatan per tanggal.',
      },
      {
        title: 'Analisis Kategori',
        content: 'Panel "Penjualan per Kategori" di Dashboard menunjukkan distribusi penjualan berdasarkan kategori produk. Data ini membantu Anda memahami kategori mana yang paling laris dan mana yang perlu didorong promosinya.',
      },
      {
        title: 'Target Bisnis',
        content: 'Di halaman Pengaturan, Anda bisa mengatur target bulanan untuk 4 metrik: Pendapatan, Profit, Jumlah Transaksi, dan Jumlah Pelanggan Baru. Progress target ini ditampilkan di Dashboard dengan bar visual dan persentase pencapaian.',
      },
    ]
  },
  {
    id: 'shortcuts',
    icon: Keyboard,
    title: 'Pintasan Keyboard',
    description: 'Navigasi cepat tanpa mouse untuk efisiensi kasir.',
    steps: [
      {
        title: 'Pintasan Halaman POS',
        content: 'F1: Fokus ke kolom pencarian produk. F2: Kosongkan seluruh keranjang. F4: Buka panel pembayaran. F8: Isi jumlah "Uang Pas" secara otomatis. Escape: Tutup panel pembayaran atau bersihkan pencarian.',
      },
      {
        title: 'Barcode Scanner',
        content: 'Hubungkan barcode scanner USB ke komputer. Sistem secara otomatis mendeteksi input dari scanner (input cepat < 50ms diakhiri Enter) dan langsung menambahkan produk yang cocok ke keranjang tanpa perlu fokus ke kolom pencarian.',
        tip: 'Pastikan barcode scanner Anda dikonfigurasi untuk mengirim karakter Enter di akhir setiap pemindaian.'
      },
    ]
  },
  {
    id: 'offline-pwa',
    icon: Wifi,
    title: 'Mode Offline & PWA',
    description: 'Cara kerja aplikasi saat tidak ada koneksi internet.',
    steps: [
      {
        title: 'Arsitektur Offline-First',
        content: 'Sokara POS EVO menyimpan seluruh data secara lokal di perangkat Anda menggunakan IndexedDB dan localStorage. Artinya, semua fitur utama (transaksi, manajemen stok, pencarian produk) tetap berfungsi 100% bahkan tanpa koneksi internet sama sekali.',
      },
      {
        title: 'Instal sebagai Aplikasi (PWA)',
        content: 'Di browser Chrome, klik ikon "Install" di address bar untuk menginstal Sokara POS sebagai aplikasi desktop/mobile. Aplikasi akan terbuka dalam jendela tersendiri tanpa address bar, mirip aplikasi native.',
        tip: 'Di perangkat mobile, buka menu browser dan pilih "Add to Home Screen" untuk membuat shortcut di layar utama.'
      },
      {
        title: 'Sinkronisasi Data',
        content: 'Jika terjadi transaksi saat offline, data akan disimpan di antrian lokal (Sync Queue). Saat koneksi internet kembali tersedia, data otomatis dikirim ke server cloud (jika dikonfigurasi).',
      },
    ]
  },
  {
    id: 'settings-admin',
    icon: Settings,
    title: 'Pengaturan & Administrasi',
    description: 'Konfigurasi toko, pajak, dan hak akses pengguna.',
    steps: [
      {
        title: 'Informasi Toko',
        content: 'Di halaman Pengaturan, isi nama toko, alamat, dan nomor telepon. Informasi ini akan muncul di struk pembayaran.',
      },
      {
        title: 'Konfigurasi Pajak',
        content: 'Atur persentase pajak (PPN) yang akan diterapkan pada setiap transaksi. Default: 11% sesuai tarif PPN Indonesia. Set ke 0 jika toko Anda tidak dikenakan pajak.',
      },
      {
        title: 'Manajemen User & Hak Akses',
        content: 'Ada 4 role pengguna: Admin (akses penuh), Owner (akses penuh kecuali manajemen user), Supervisor (akses operasional + laporan), dan Kasir (hanya akses POS dan dashboard). Setiap role memiliki batasan halaman yang bisa diakses.',
      },
      {
        title: 'Audit Log',
        content: 'Seluruh aktivitas penting (login, transaksi, perubahan stok, pembatalan transaksi) dicatat secara otomatis di Audit Log. Data ini tidak bisa dihapus dan berfungsi sebagai jejak akuntabilitas operasional.',
      },
    ]
  },
];

export default function GuidebookPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>('getting-started');
  const [expandedStep, setExpandedStep] = useState<string | null>('getting-started-0');

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
    setExpandedStep(null);
  };

  const toggleStep = (key: string) => {
    setExpandedStep(expandedStep === key ? null : key);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/10 border border-emerald-500/20">
          <BookOpen className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Buku Panduan</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Panduan lengkap penggunaan Sokara POS Enterprise</p>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="pos-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Database className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Penyimpanan Data</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">IndexedDB + localStorage</p>
          </div>
        </div>
        <div className="pos-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <WifiOff className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Mode Offline</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">100% Offline-First PWA</p>
          </div>
        </div>
        <div className="pos-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Shield className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Keamanan</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Role-Based Access + Audit</p>
          </div>
        </div>
      </div>

      {/* Accordion Guide */}
      <div className="space-y-3">
        {guideSections.map((section) => {
          const isOpen = expandedSection === section.id;
          const Icon = section.icon;

          return (
            <div
              key={section.id}
              className="pos-card overflow-hidden transition-all duration-300"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className={`p-2.5 rounded-xl transition-colors duration-200 ${
                  isOpen
                    ? 'bg-emerald-500/15 border border-emerald-500/25'
                    : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }`}>
                  <Icon className={`w-5 h-5 transition-colors ${
                    isOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{section.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{section.description}</p>
                </div>
                <div className="shrink-0">
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Section Content */}
              {isOpen && (
                <div className="px-4 pb-4 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  {section.steps.map((step, stepIdx) => {
                    const stepKey = `${section.id}-${stepIdx}`;
                    const isStepOpen = expandedStep === stepKey;

                    return (
                      <div
                        key={stepKey}
                        className={`rounded-lg border transition-all duration-200 ${
                          isStepOpen
                            ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/5'
                            : 'border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <button
                          onClick={() => toggleStep(stepKey)}
                          className="w-full flex items-center gap-3 p-3 text-left"
                        >
                          <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 transition-colors ${
                            isStepOpen
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}>
                            {stepIdx + 1}
                          </div>
                          <span className={`text-sm font-medium flex-1 ${
                            isStepOpen ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'
                          }`}>
                            {step.title}
                          </span>
                          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isStepOpen ? 'rotate-90' : ''}`} />
                        </button>

                        {isStepOpen && (
                          <div className="px-3 pb-3 pl-12 space-y-2">
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                              {step.content}
                            </p>
                            {step.tip && (
                              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20">
                                <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                                  <span className="font-semibold">Tips:</span> {step.tip}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pos-card p-4 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Sokara POS Enterprise v6.0 &mdash; Dokumentasi ini diperbarui secara otomatis sesuai fitur terbaru.
        </p>
      </div>
    </div>
  );
}
