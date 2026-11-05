/**
 * BrannnXD - Data Store & LocalStorage Manager
 * Handles default catalog, localStorage persistence, and Telegram order link generation.
 */

const STORAGE_KEYS = {
  PRODUCTS: 'brannnxd_products_v1',
  SETTINGS: 'brannnxd_settings_v1',
  AUTH: 'brannnxd_auth_session'
};

// Default store settings
const DEFAULT_SETTINGS = {
  storeName: 'BrannnXD',
  telegramUsername: 'brannnn22',
  tagline: 'Platform Katalog Produk Digital, Bot & Layanan Eksklusif',
  ownerPasswordHash: 'brannn123', // Default owner password
  currencySymbol: 'Rp',
  announcement: '🚀 Selamat datang di BrannnXD! Hubungi Telegram @brannnn22 untuk order cepat & instan.'
};

// Curated starter products matching BrannnXD brand
const DEFAULT_PRODUCTS = [
  {
    id: 'prod_1',
    name: 'BRANNAI Premium API & Workstation',
    category: 'Bot & AI',
    price: 75000,
    originalPrice: 120000,
    badge: 'BEST SELLER',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    description: 'Workstation AI canggih dan integrasi API super responsif. Cocok untuk kebutuhan automation, chatting cerdas, coding partner, dan produktivitas harian tanpa limit repot.',
    features: [
      'High Speed Response 24/7',
      'OpenRouter & Cloud Engine Ready',
      'Custom System Prompt Setting',
      'Support Integrasi Web & Bot',
      'Garansi & Panduan Setup Lengkap'
    ],
    status: 'active',
    rating: 4.9,
    soldCount: 142
  },
  {
    id: 'prod_2',
    name: 'BrannMotion Preset Pack Ultimate',
    category: 'Motion & Design',
    price: 45000,
    originalPrice: 80000,
    badge: 'POPULAR',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    description: 'Kumpulan 200+ preset transisi, color grading, shake, dan motion grafis profesional untuk Alight Motion & XML. Bikin editan video kamu auto fyp dan berkelas tinggi.',
    features: [
      '200+ Preset XML & Alight Motion',
      'Smooth Easing & Modern Transitions',
      'Color Grading Sinematik Dark / Glow',
      'Support Android & iOS',
      'Free Update File Berkala'
    ],
    status: 'active',
    rating: 5.0,
    soldCount: 389
  },
  {
    id: 'prod_3',
    name: 'WhatsApp Bot Multi-Device Automation',
    category: 'Source Code',
    price: 125000,
    originalPrice: 200000,
    badge: 'EXCLUSIVE',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    description: 'Source code bot WhatsApp mutakhir berbasis Node.js & Baileys terbaru. Fitur auto-reply, media downloader (TikTok, IG, YT), game bot, dan integrasi AI pintar.',
    features: [
      'Full Source Code (Node.js/ESM)',
      'Anti-Ban Connection Safety Rules',
      'Downloader, AI, & Admin Group Tools',
      'Support Deploy Panel Pterodactyl / VPS',
      'Dokumentasi Instalasi Step-by-Step'
    ],
    status: 'active',
    rating: 4.9,
    soldCount: 96
  },
  {
    id: 'prod_4',
    name: 'BrannGate QRIS & Payment Script',
    category: 'Source Code',
    price: 95000,
    originalPrice: 150000,
    badge: 'REKOMENDASI',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
    description: 'Script verifikasi pembayaran QRIS otomatis dan webhook real-time untuk website atau bot dagang kamu. Transaksi tercatat rapi, aman, dan tanpa biaya langganan bulanan.',
    features: [
      'Mutasi Otomatis & Cek Saldo',
      'Webhook Notifikasi Real-time',
      'Keamanan Enkripsi End-to-End',
      'Bisa Diintegrasikan ke Bot / Web',
      'Tanpa Potongan Fee Bulanan'
    ],
    status: 'active',
    rating: 4.8,
    soldCount: 78
  },
  {
    id: 'prod_5',
    name: 'Cloud Web Service & VPS High-Performance',
    category: 'Layanan Cloud',
    price: 150000,
    originalPrice: 250000,
    badge: 'HIGH SPEED',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    description: 'Layanan setup server Ubuntu / Cloud Workstation berkecepatan tinggi dengan akses Full Root. Siap untuk deploy aplikasi, bot 24 jam non-stop, database, dan workstation remote.',
    features: [
      'Full Root Access (SSH)',
      'Pre-installed Node.js, Python & Git',
      'Uptime Guarantee 99.9%',
      'Bandwidth Unlimited',
      'Free Setup & Telegram Direct Support'
    ],
    status: 'active',
    rating: 5.0,
    soldCount: 54
  },
  {
    id: 'prod_6',
    name: 'HD Media & Video Enhancer VIP',
    category: 'Tools & Apps',
    price: 35000,
    originalPrice: 60000,
    badge: 'PROMO',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    description: 'Aplikasi & tool penjernih foto serta video hingga resolusi 4K Ultra HD. Mengubah file buram menjadi super jernih dengan teknologi neural enhancement tanpa watermark.',
    features: [
      'Ultra HD 4K Upscale AI',
      'Jernihkan Wajah & Detail Objek',
      'Bebas Watermark & Iklan',
      'Proses Rendering Kilat',
      'Akses Akun Selamanya (Lifetime)'
    ],
    status: 'active',
    rating: 4.9,
    soldCount: 215
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
    }
  }

  // --- PRODUCTS ---
  getProducts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : DEFAULT_PRODUCTS;
    } catch (e) {
      console.error('Failed to load products from localStorage:', e);
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
      badge: productData.badge || '',
      image: productData.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      description: productData.description || '',
      features: Array.isArray(productData.features) 
        ? productData.features 
        : (productData.features ? productData.features.split('\n').filter(f => f.trim()) : []),
      status: productData.status || 'active',
      rating: 5.0,
      soldCount: 0,
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
          : (updatedData.features ? updatedData.features.split('\n').filter(f => f.trim()) : products[index].features)
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

  getTelegramOrderUrl(product) {
    const settings = this.getSettings();
    const username = settings.telegramUsername.replace('@', '');
    const priceFormatted = this.formatRupiah(product.price);
    
    const message = 
`Halo Brannn (@${username})! 👋
Saya tertarik dan mau order produk berikut dari website *${settings.storeName}*:

🛒 *Produk:* ${product.name}
🏷️ *Kategori:* ${product.category}
💰 *Harga:* ${priceFormatted}

Mohon info nomor rekening / QRIS untuk pembayaran manualnya ya cuyy. Terima kasih!`;

    return `https://t.me/${username}?text=${encodeURIComponent(message)}`;
  }
}

// Global instance
window.Store = new StoreManager();
