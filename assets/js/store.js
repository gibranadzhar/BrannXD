/**
 * BrannnXD - Data Store & LocalStorage Manager (Production with QRIS & Invoice)
 * Production-ready catalog store, localStorage persistence, QRIS metadata, and Invoice generator.
 */

const STORAGE_KEYS = {
  PRODUCTS: 'brannnxd_products_v2',
  SETTINGS: 'brannnxd_settings_v2',
  AUTH: 'brannnxd_auth_session',
  INVOICES: 'brannnxd_invoices_v1'
};

// Official Store Settings
const DEFAULT_SETTINGS = {
  storeName: 'BrannnXD',
  telegramUsername: 'brannnn22',
  tagline: 'Platform Resmi Produk Digital, Bot WhatsApp & Cloud Workstation',
  ownerPasswordHash: 'brannn123',
  currencySymbol: 'Rp',
  announcement: '🔥 Pembayaran Resmi via QRIS (BRANN DIGITAL HUB) • Konfirmasi Instan ke Telegram @brannnn22',
  qris: {
    merchantName: 'BRANN DIGITAL HUB, DIGITAL & KREATIF',
    nmid: 'ID1026607305962',
    printedBy: '93600914',
    code: 'A01',
    image: 'assets/images/qris-brann.png'
  }
};

// Curated High-Grade Products (BrannnXD Official Catalog)
const DEFAULT_PRODUCTS = [
  {
    id: 'prod_1',
    name: 'BRANNAI Premium API & Workstation',
    category: 'Bot & AI',
    price: 75000,
    originalPrice: 125000,
    badge: 'BEST SELLER',
    deliveryType: 'Instan Delivery',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    description: 'Workstation AI canggih dan integrasi API super responsif. Cocok untuk kebutuhan otomasi chat, coding partner, asisten riset, dan produktivitas harian tanpa limit token ribet.',
    features: [
      'High Speed Response 24/7 (Latency Rendah)',
      'OpenRouter & Cloud Engine Ready',
      'Kustomisasi System Prompt & Personality AI',
      'Support Integrasi REST API Web & Bot WA',
      'Full Garansi 30 Hari & Panduan Setup Step-by-Step'
    ],
    status: 'active',
    rating: 4.9,
    soldCount: 184,
    createdAt: '2026-10-15T10:00:00Z'
  },
  {
    id: 'prod_2',
    name: 'BrannMotion Preset Pack Ultimate Pro',
    category: 'Motion & Design',
    price: 45000,
    originalPrice: 85000,
    badge: 'HOT TRENDING',
    deliveryType: 'File Langsung Terkirim',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    description: 'Kumpulan 250+ preset transisi sinematik, color grading aesthetic, shake dinamis, dan motion grafis profesional untuk Alight Motion & XML. Cocok untuk editor TikTok, Reels & YouTube.',
    features: [
      '250+ Preset XML & Alight Motion Project',
      'Smooth Easing Kurva Modern & Efek Glow Sinematik',
      'Kompatibel Android, iOS & Semua Versi Alight Motion',
      'Free Update & Tambahan File Berkala via Google Drive',
      'Bonus Sound Effects (SFX) & Font Pack Premium'
    ],
    status: 'active',
    rating: 5.0,
    soldCount: 428,
    createdAt: '2026-10-18T12:00:00Z'
  },
  {
    id: 'prod_3',
    name: 'WhatsApp Bot Multi-Device Automation v5',
    category: 'Source Code',
    price: 125000,
    originalPrice: 220000,
    badge: 'EXCLUSIVE',
    deliveryType: 'Akses GitHub / ZIP',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    description: 'Source code bot WhatsApp mutakhir berbasis Node.js & Baileys terbaru. Dilengkapi proteksi anti-ban, auto-reply bisnis, media downloader otomatis (TikTok no watermark, IG, YT), serta AI chatbot.',
    features: [
      'Full Source Code Terstruktur (Node.js/ESM)',
      'Anti-Ban Connection Safety Mechanism',
      'Fitur Lengkap: Downloader, Game, AI, & Admin Grup',
      'Siap Deploy di Panel Pterodactyl, VPS, atau Localhost',
      'Dokumentasi Instalasi Pemula + Grup Diskusi Khusus'
    ],
    status: 'active',
    rating: 4.9,
    soldCount: 112,
    createdAt: '2026-10-20T14:30:00Z'
  },
  {
    id: 'prod_4',
    name: 'BrannGate QRIS Otomatis & Webhook Script',
    category: 'Source Code',
    price: 95000,
    originalPrice: 175000,
    badge: 'REKOMENDASI',
    deliveryType: 'Source Code + Dokumentasi',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
    description: 'Script integrasi pembayaran QRIS otomatis dan webhook verifikasi real-time untuk website toko online atau bot dagang kamu. Tanpa biaya admin bulanan dan transaksi tercatat rapi.',
    features: [
      'Verifikasi Mutasi QRIS Otomatis & Cek Saldo Real-time',
      'Webhook Notifikasi Instan ke Telegram / WhatsApp',
      'Keamanan Enkripsi End-to-End dengan Signature Hash',
      'Mudah Diintegrasikan ke Berbagai Stack (PHP, Node.js, Python)',
      'Tanpa Potongan Biaya Per Transaksi / Langganan Bulanan'
    ],
    status: 'active',
    rating: 4.8,
    soldCount: 89,
    createdAt: '2026-10-25T09:15:00Z'
  },
  {
    id: 'prod_5',
    name: 'Cloud Workstation Server VIP (Ubuntu 24.04)',
    category: 'Layanan Cloud',
    price: 150000,
    originalPrice: 280000,
    badge: 'HIGH PERFORMANCE',
    deliveryType: 'Akses SSH Langsung',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    description: 'Layanan setup server Ubuntu / Cloud Workstation berkecepatan tinggi dengan akses Full Root (SSH). Siap untuk menjalankan bot 24 jam non-stop, hosting script, API backend, dan remote developer environment.',
    features: [
      'Full Root Access via SSH Kunci Enkripsi Aman',
      'Pre-installed Node.js, Python3, Git, & Docker',
      'Jaminan Uptime 99.9% dengan Koneksi Port 1 Gbps',
      'Bandwidth Unlimited tanpa FUP Mencekik',
      'Gratis Setup Awal & Bantuan Teknis Telegram Langsung'
    ],
    status: 'active',
    rating: 5.0,
    soldCount: 67,
    createdAt: '2026-10-28T16:00:00Z'
  },
  {
    id: 'prod_6',
    name: 'HD Media & Video Enhancer 4K Pro',
    category: 'Tools & Apps',
    price: 35000,
    originalPrice: 65000,
    badge: 'SUPER VALUE',
    deliveryType: 'Akses VIP Lifetime',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    description: 'Tool penjernih foto dan video hingga resolusi 4K Ultra HD. Mengubah media buram, pecah, atau noise menjadi super jernih dengan algoritma neural AI restoration tanpa watermark.',
    features: [
      'Upscale Resolusi Foto & Video hingga 4K Ultra HD',
      'Teknologi Neural Facial Detail Restorer',
      'Bebas Watermark & Bebas Iklan Selamanya',
      'Waktu Proses Render Cepat Berbasis Cloud Server',
      'Lisensi Akses Permanen (Lifetime)'
    ],
    status: 'active',
    rating: 4.9,
    soldCount: 265,
    createdAt: '2026-11-01T11:00:00Z'
  }
];

class StoreManager {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      this.saveProducts(DEFAULT_PRODUCTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.saveSettings(DEFAULT_SETTINGS);
    } else {
      // Ensure QRIS settings are attached
      const current = this.getSettings();
      if (!current.qris) {
        this.saveSettings({ qris: DEFAULT_SETTINGS.qris });
      }
    }
  }

  // --- PRODUCTS ---
  getProducts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : DEFAULT_PRODUCTS;
    } catch (e) {
      console.error('Gagal membaca data produk:', e);
      return DEFAULT_PRODUCTS;
    }
  }

  getActiveProducts() {
    return this.getProducts().filter(p => p.status === 'active');
  }

  getProductById(id) {
    return this.getProducts().find(p => p.id === id);
  }

  saveProducts(products) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }

  addProduct(productData) {
    const products = this.getProducts();
    const newProduct = {
      id: 'prod_' + Date.now(),
      name: productData.name,
      category: productData.category || 'Digital',
      price: Number(productData.price) || 0,
      originalPrice: productData.originalPrice ? Number(productData.originalPrice) : null,
      badge: productData.badge || 'NEW',
      deliveryType: productData.deliveryType || 'Instan Delivery',
      image: productData.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      description: productData.description || '',
      features: Array.isArray(productData.features) 
        ? productData.features 
        : (productData.features ? productData.features.split('\n').map(s => s.trim()).filter(Boolean) : []),
      status: productData.status || 'active',
      rating: 5.0,
      soldCount: 1,
      createdAt: new Date().toISOString()
    };
    products.unshift(newProduct);
    this.saveProducts(products);
    return newProduct;
  }

  updateProduct(id, updatedData) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = {
        ...products[index],
        ...updatedData,
        price: Number(updatedData.price) || products[index].price,
        originalPrice: updatedData.originalPrice ? Number(updatedData.originalPrice) : null,
        features: Array.isArray(updatedData.features) 
          ? updatedData.features 
          : (updatedData.features ? updatedData.features.split('\n').map(s => s.trim()).filter(Boolean) : products[index].features)
      };
      this.saveProducts(products);
      return products[index];
    }
    return null;
  }

  deleteProduct(id) {
    let products = this.getProducts();
    products = products.filter(p => p.id !== id);
    this.saveProducts(products);
    return true;
  }

  resetProductsToDefault() {
    this.saveProducts(DEFAULT_PRODUCTS);
    return DEFAULT_PRODUCTS;
  }

  // --- SORT & FILTER HELPER ---
  filterAndSortProducts(category = 'Semua', query = '', sortBy = 'popular') {
    let list = this.getActiveProducts();

    if (category && category !== 'Semua') {
      list = list.filter(p => p.category === category);
    }

    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.badge && p.badge.toLowerCase().includes(q))
      );
    }

    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'popular':
      default:
        list.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
        break;
    }

    return list;
  }

  // --- SETTINGS ---
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }

  saveSettings(newSettings) {
    const current = this.getSettings();
    const merged = { ...current, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
    return merged;
  }

  // --- AUTH ---
  isOwnerLoggedIn() {
    return sessionStorage.getItem(STORAGE_KEYS.AUTH) === 'authenticated' || 
           localStorage.getItem(STORAGE_KEYS.AUTH) === 'authenticated';
  }

  ownerLogin(password, rememberMe = false) {
    const settings = this.getSettings();
    if (password === settings.ownerPasswordHash) {
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEYS.AUTH, 'authenticated');
      }
      sessionStorage.setItem(STORAGE_KEYS.AUTH, 'authenticated');
      return true;
    }
    return false;
  }

  ownerLogout() {
    sessionStorage.removeItem(STORAGE_KEYS.AUTH);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }

  changeOwnerPassword(oldPassword, newPassword) {
    const settings = this.getSettings();
    if (oldPassword === settings.ownerPasswordHash) {
      this.saveSettings({ ownerPasswordHash: newPassword });
      return true;
    }
    return false;
  }

  // --- HELPERS ---
  formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  }

  getCategories() {
    const products = this.getProducts();
    const categories = new Set(products.map(p => p.category).filter(Boolean));
    return ['Semua', ...Array.from(categories)];
  }

  // --- INVOICE GENERATOR WITH ANTI-FRAUD UNIQUE CODE & SENDER PROOF ---
  createInvoice(product, senderName = 'Pembeli', uniqueCode = 0, proofDataUrl = '') {
    const now = new Date();
    const invoiceNumber = 'INV-BXD-' + Math.floor(100000 + Math.random() * 900000);
    const dateFormatted = now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const timeFormatted = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';

    const basePrice = Number(product.price) || 0;
    const finalUniqueCode = Number(uniqueCode) || Math.floor(100 + Math.random() * 899);
    const totalAmount = basePrice + finalUniqueCode;

    const invoice = {
      invoiceNumber,
      productId: product.id,
      productName: product.name,
      category: product.category,
      basePrice: basePrice,
      basePriceFormatted: this.formatRupiah(basePrice),
      uniqueCode: finalUniqueCode,
      totalAmount: totalAmount,
      priceFormatted: this.formatRupiah(totalAmount),
      senderName: senderName.trim() || 'Pembeli (Nama Tidak Diisi)',
      proofDataUrl: proofDataUrl || '',
      deliveryType: product.deliveryType || 'Instan Delivery',
      date: dateFormatted,
      time: timeFormatted,
      timestamp: now.toISOString(),
      merchantName: DEFAULT_SETTINGS.qris.merchantName,
      nmid: DEFAULT_SETTINGS.qris.nmid,
      status: `MENUNGGU VERIFIKASI MUTASI (KODE: ${finalUniqueCode})`
    };

    return invoice;
  }

  getTelegramInvoiceUrl(invoice) {
    const settings = this.getSettings();
    const username = settings.telegramUsername.replace('@', '');

    const message = 
`Halo Owner BrannnXD (@${username})! 👋
Saya telah melakukan transfer pembayaran QRIS dengan rincian berikut:

🧾 *NO. INVOICE:* ${invoice.invoiceNumber}
📦 *Produk:* ${invoice.productName}
👤 *Atas Nama Pengirim:* ${invoice.senderName}
💰 *TOTAL TRANSFER:* ${invoice.priceFormatted}
🔢 *KODE UNIK MUTASI:* ${invoice.uniqueCode} (Mohon cek mutasi ${invoice.priceFormatted})
🕒 *Waktu:* ${invoice.date}, ${invoice.time}
🏦 *Merchant QRIS:* ${invoice.merchantName} (${invoice.nmid})

Screenshot struk & bukti transfer telah saya siapkan di bawah pesan ini. Mohon dicek mutasi rekeningnya ya cuyy, jika sudah masuk mohon kirim data produknya. Terima kasih!`;

    return `https://t.me/${username}?text=${encodeURIComponent(message)}`;
  }

  getTelegramOrderUrl(product) {
    const invoice = this.createInvoice(product);
    return this.getTelegramInvoiceUrl(invoice);
  }
}

// Global instance
window.Store = new StoreManager();
