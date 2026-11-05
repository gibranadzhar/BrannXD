# BrannnXD — Official Digital Product Showcase & Store

Platform showcase produk & promosi digital eksklusif karya **BrannnXD**, mencakup bot WhatsApp mutakhir, source code, preset motion, tools otomatisasi, dan layanan cloud workstation.

---

## 🌟 Fitur Utama

- **Desain Modern Non-Slop AI**: Mengusung estetika dark-tech cyberpunk premium, glassmorphism halus, micro-interactions, tipografi modern (Outfit & Plus Jakarta Sans), dan performa kilat.
- **Katalog Interaktif**:
  - Pencarian produk real-time (live search).
  - Filter kategori dinamis (Bot & AI, Motion & Design, Source Code, Cloud, dll).
  - Modal detail spesifikasi lengkap dengan checklist fitur unggulan.
  - Perhitungan diskon otomatis (% hemat) & badge produk (Best Seller, Promo, dll).
- **Sistem Pembayaran Manual Terintegrasi Telegram**:
  - Tombol **"Beli via Telegram"** langsung mengarahkan pembeli ke chat Telegram [**@brannnn22**](https://t.me/brannnn22).
  - Format pesan otomatis terisi rapi dengan Nama Produk, Kategori, dan Total Harga dalam Rupiah.
- **Owner Portal / Admin Dashboard (`admin.html`)**:
  - Sistem login terproteksi password untuk owner.
  - Manajemen Produk Lengkap (CRUD): Tambah, Edit, Hapus, dan ubah status (Aktif/Draft).
  - Dukungan Upload Foto: Bisa upload file foto langsung dari perangkat (disimpan aman sebagai base64) atau input URL gambar.
  - Pengaturan Toko: Ganti nama toko, tagline, banner atas, dan username Telegram penerima order.
  - Backup & Restore Database: Download backup data katalog dalam format JSON atau import kembali sewaktu-waktu.
- **100% Siap Deploy ke Vercel**: Dilengkapi konfigurasi `vercel.json` dengan caching & security headers.

---

## 🚀 Panduan Deploy ke Vercel

Website ini dibuat tanpa dependency build rumit sehingga dapat dideploy ke Vercel dalam hitungan detik:

1. **Push ke GitHub**:
   ```bash
   git add .
   git commit -m "feat: setup BrannnXD storefront & owner portal"
   git push origin main
   ```
2. **Buka [Vercel](https://vercel.com/)**:
   - Login dengan akun GitHub kamu.
   - Klik **"Add New Project"** dan pilih repositori `gibranadzhar/BrannXD`.
   - Pada pengaturan Framework Preset, pilih **Other** (karena website ini adalah modern pure static HTML/Tailwind).
   - Klik **Deploy**.
3. Website kamu langsung aktif dan online secara global dengan URL Vercel (e.g. `brannxd.vercel.app`)!

---

## 🔐 Akses Owner Portal

1. Buka halaman `/admin.html` pada browser kamu (atau klik ikon kunci gembok di header storefront).
2. Masukkan password default:
   - **Password Default**: `brannn123`
3. Setelah login, kamu bisa:
   - Menambahkan produk baru lengkap dengan foto, harga, dan fitur.
   - Mengubah username Telegram tujuan pemesanan jika berganti akun.
   - Mengganti password owner melalui tab **"Pengaturan Toko & Akun"**.
   - Melakukan backup JSON sebelum mengubah katalog besar.

---

## 📁 Struktur Berkas

```
Website/
├── index.html           # Halaman utama katalog & promosi produk
├── admin.html           # Halaman Owner Portal / CMS Produk
├── vercel.json          # Konfigurasi deployment & cache Vercel
├── README.md            # Dokumentasi proyek
└── assets/
    ├── css/
    │   └── style.css    # Custom CSS, glassmorphism, animations, & typography
    └── js/
        ├── store.js     # Data store, local storage persistence & Telegram generator
        ├── app.js       # Logika interaktif storefront (search, filter, modal)
        └── admin.js     # Logika Owner Portal (auth, CRUD, image upload, backup)
```

---

## 📞 Kontak & Dukungan

- **Telegram Owner**: [@brannnn22](https://t.me/brannnn22)
- **Repository**: [github.com/gibranadzhar/BrannXD](https://github.com/gibranadzhar/BrannXD)
