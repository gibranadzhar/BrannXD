/**
 * BrannnXD - Storefront Application Logic (Production)
 * Interactive UI, search, category filter, sorting, dynamic QRIS checkout modal with invoice,
 * HTML5 Canvas Struk Generator, and Telegram order routing.
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = window.Store;
  const settings = store.getSettings();

  // State
  let currentCategory = 'Semua';
  let searchQuery = '';
  let currentSort = 'popular';
  let activeProduct = null;
  let activeInvoice = null;

  // DOM Elements - Navigation & Search
  const productsGrid = document.getElementById('productsGrid');
  const emptyState = document.getElementById('emptyState');
  const categoryFilters = document.getElementById('categoryFilters');
  const searchInput = document.getElementById('searchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const sortSelect = document.getElementById('sortSelect');
  const productCountBadge = document.getElementById('productCountBadge');
  
  // Product Detail Modal Elements
  const productModal = document.getElementById('productModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalImage = document.getElementById('modalImage');
  const modalBadge = document.getElementById('modalBadge');
  const modalCategory = document.getElementById('modalCategory');
  const modalTitle = document.getElementById('modalTitle');
  const modalPrice = document.getElementById('modalPrice');
  const modalOriginalPrice = document.getElementById('modalOriginalPrice');
  const modalDiscountTag = document.getElementById('modalDiscountTag');
  const modalDeliveryTag = document.getElementById('modalDeliveryTag');
  const modalDescription = document.getElementById('modalDescription');
  const modalFeaturesList = document.getElementById('modalFeaturesList');
  const modalPayQrisBtn = document.getElementById('modalPayQrisBtn');

  // Unified Checkout & QRIS Modal Elements
  const qrisModal = document.getElementById('qrisModal');
  const qrisCloseBtn = document.getElementById('qrisCloseBtn');
  const qrisProductTitle = document.getElementById('qrisProductTitle');
  const qrisProductCategory = document.getElementById('qrisProductCategory');
  const qrisProductPrice = document.getElementById('qrisProductPrice');
  const qrisNmid = document.getElementById('qrisNmid');
  const qrisImageEl = document.getElementById('qrisImageEl');
  const downloadQrisImageBtn = document.getElementById('downloadQrisImageBtn');

  // Struk View Elements
  const strukInvoiceNo = document.getElementById('strukInvoiceNo');
  const strukDateTime = document.getElementById('strukDateTime');
  const strukPrice = document.getElementById('strukPrice');
  const downloadReceiptBtn = document.getElementById('downloadReceiptBtn');
  const sendTelegramReceiptBtn = document.getElementById('sendTelegramReceiptBtn');
  const copyInvoiceTextBtn = document.getElementById('copyInvoiceTextBtn');

  // Top & Floating Info Elements
  const announcementText = document.getElementById('announcementText');
  const telegramUsernameElements = document.querySelectorAll('.telegram-username-text');
  const telegramDirectLinks = document.querySelectorAll('.telegram-direct-link');
  const copyTelegramBtns = document.querySelectorAll('.copy-telegram-btn');

  // Initialize store branding in UI
  if (announcementText && settings.announcement) {
    announcementText.textContent = settings.announcement;
  }

  const cleanTelegram = settings.telegramUsername.replace('@', '');
  telegramUsernameElements.forEach(el => {
    el.textContent = `@${cleanTelegram}`;
  });
  telegramDirectLinks.forEach(link => {
    link.href = `https://t.me/${cleanTelegram}`;
  });

  // Toast Notification System
  function showToast(message, icon = 'check-circle') {
    const existing = document.getElementById('brannToast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'brannToast';
    toast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900/95 text-white font-medium text-xs sm:text-sm border border-emerald-500/40 shadow-2xl backdrop-blur-xl flex items-center gap-2.5 transition-all duration-300 transform translate-y-3 opacity-0';
    toast.innerHTML = `
      <i data-lucide="${icon}" class="w-4 h-4 text-emerald-400 shrink-0"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-3', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('translate-y-3', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // Copy Telegram Username Buttons
  copyTelegramBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(`@${cleanTelegram}`).then(() => {
        showToast(`Username Telegram @${cleanTelegram} berhasil disalin!`, 'copy');
      }).catch(() => {
        showToast(`Hubungi @${cleanTelegram} di Telegram!`, 'send');
      });
    });
  });

  // Render Category Pills
  function renderCategories() {
    if (!categoryFilters) return;
    const categories = store.getCategories();
    categoryFilters.innerHTML = '';

    categories.forEach(cat => {
      const btn = document.createElement('button');
      const isActive = currentCategory === cat;
      btn.className = `px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
        isActive
          ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25 border border-emerald-400 scale-[1.02]'
          : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
      }`;
      btn.innerHTML = `<span>${cat}</span>`;
      btn.addEventListener('click', () => {
        currentCategory = cat;
        renderCategories();
        renderProducts();
      });
      categoryFilters.appendChild(btn);
    });
  }

  // Render Product Grid
  function renderProducts() {
    if (!productsGrid) return;
    const filtered = store.filterAndSortProducts(currentCategory, searchQuery, currentSort);

    if (productCountBadge) {
      productCountBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span> ${filtered.length} Produk Siap Order`;
    }

    if (filtered.length === 0) {
      productsGrid.classList.add('hidden');
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    productsGrid.classList.remove('hidden');
    if (emptyState) emptyState.classList.add('hidden');

    productsGrid.innerHTML = '';

    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'glass-panel glass-panel-hover rounded-3xl overflow-hidden flex flex-col group border border-white/10 relative bg-[#0e1320]/80 transition-all duration-300';

      const priceFormatted = store.formatRupiah(p.price);
      let originalPriceHtml = '';
      let discountBadgeHtml = '';

      if (p.originalPrice && p.originalPrice > p.price) {
        const discountPercent = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
        originalPriceHtml = `<span class="text-xs text-slate-500 line-through font-mono">${store.formatRupiah(p.originalPrice)}</span>`;
        discountBadgeHtml = `<span class="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full">-${discountPercent}%</span>`;
      }

      // Feature bullet snippets
      const featureSnippets = p.features && p.features.length > 0 
        ? p.features.slice(0, 3).map(f => `
            <li class="flex items-center gap-2 text-xs text-slate-300">
              <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400 shrink-0"></i>
              <span class="truncate">${f}</span>
            </li>
          `).join('')
        : '';

      card.innerHTML = `
        <!-- Image & Badges -->
        <div class="relative h-52 w-full overflow-hidden bg-slate-900 cursor-pointer" onclick="window.openDetailModal('${p.id}')">
          <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'" />
          <div class="absolute inset-0 bg-gradient-to-t from-[#0e1320] via-black/30 to-transparent opacity-90"></div>
          
          <!-- Category & Badge -->
          <div class="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span class="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-black/75 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
              ${p.category}
            </span>
            ${p.badge ? `<span class="shimmer-badge px-2.5 py-1 text-[10px] font-black rounded-lg bg-emerald-500 text-black uppercase tracking-wider">${p.badge}</span>` : ''}
          </div>

          <!-- Rating -->
          <div class="absolute top-3 right-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5 text-[11px] text-amber-300 font-bold">
            <i data-lucide="star" class="w-3 h-3 fill-amber-400 text-amber-400"></i>
            <span>${p.rating || 5.0}</span>
            <span class="text-slate-500 font-normal">(${p.soldCount || 100}+)</span>
          </div>

          <!-- Delivery tag bar -->
          <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 z-10">
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-emerald-300 text-[10px] font-semibold">
              <i data-lucide="zap" class="w-3 h-3 text-emerald-400"></i> ${p.deliveryType || 'Instan Delivery'}
            </span>
            <span class="text-[10px] text-slate-400 flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
              <i data-lucide="shield-check" class="w-3 h-3 text-cyan-400"></i> Terjamin
            </span>
          </div>
        </div>

        <!-- Content Area -->
        <div class="p-6 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="text-base sm:text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1 cursor-pointer mb-2 font-heading" onclick="window.openDetailModal('${p.id}')">
              ${p.name}
            </h3>
            <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
              ${p.description}
            </p>

            <!-- Key Features Checklist -->
            ${featureSnippets ? `<ul class="space-y-1.5 mb-5 py-3 border-y border-white/5">${featureSnippets}</ul>` : ''}
          </div>

          <!-- Price & Order CTA -->
          <div class="pt-2">
            <div class="flex items-baseline justify-between mb-4">
              <div>
                <span class="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Total Harga</span>
                <div class="flex items-center gap-2">
                  <span class="text-xl sm:text-2xl font-black text-white font-heading">${priceFormatted}</span>
                  ${originalPriceHtml}
                </div>
              </div>
              <div>${discountBadgeHtml}</div>
            </div>

            <div class="grid grid-cols-5 gap-2">
              <button onclick="window.openDetailModal('${p.id}')" class="col-span-2 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer" title="Lihat Spesifikasi & Detail Lengkap">
                <i data-lucide="info" class="w-3.5 h-3.5 text-cyan-400"></i>
                <span>Detail</span>
              </button>

              <button onclick="window.openQrisPayment('${p.id}')" class="col-span-3 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black text-xs font-black transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer shadow-lg shadow-emerald-500/20" title="Beli sekarang & lanjut ke pembayaran QRIS">
                <i data-lucide="credit-card" class="w-3.5 h-3.5 text-black"></i>
                <span>Beli Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      `;

      productsGrid.appendChild(card);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Open Product Detail Modal
  window.openDetailModal = function(id) {
    const product = store.getProductById(id);
    if (!product) return;
    activeProduct = product;

    modalImage.src = product.image;
    modalCategory.textContent = product.category;
    modalTitle.textContent = product.name;
    modalDescription.textContent = product.description;
    modalPrice.textContent = store.formatRupiah(product.price);

    if (modalDeliveryTag) {
      modalDeliveryTag.textContent = product.deliveryType || 'Instan Delivery';
    }

    if (product.originalPrice && product.originalPrice > product.price) {
      const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
      modalOriginalPrice.textContent = store.formatRupiah(product.originalPrice);
      modalOriginalPrice.classList.remove('hidden');
      modalDiscountTag.textContent = `Hemat ${discountPercent}%`;
      modalDiscountTag.classList.remove('hidden');
    } else {
      modalOriginalPrice.classList.add('hidden');
      modalDiscountTag.classList.add('hidden');
    }

    if (product.badge) {
      modalBadge.textContent = product.badge;
      modalBadge.classList.remove('hidden');
    } else {
      modalBadge.classList.add('hidden');
    }

    // Features
    modalFeaturesList.innerHTML = '';
    if (product.features && product.features.length > 0) {
      product.features.forEach(feat => {
        const li = document.createElement('li');
        li.className = 'flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 bg-white/[0.03] p-3 rounded-xl border border-white/5';
        li.innerHTML = `
          <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"></i>
          <span>${feat}</span>
        `;
        modalFeaturesList.appendChild(li);
      });
    }

    // Pay button in detail modal -> opens QRIS checkout directly
    if (modalPayQrisBtn) {
      modalPayQrisBtn.onclick = () => {
        closeDetailModal();
        window.openQrisPayment(product.id);
      };
    }

    productModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (window.lucide) window.lucide.createIcons();
  };

  function closeDetailModal() {
    productModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeDetailModal);
  if (productModal) {
    productModal.addEventListener('click', (e) => {
      if (e.target === productModal) closeDetailModal();
    });
  }

  // ================= UNIFIED CHECKOUT & QRIS MODAL WITH INVOICE =================
  window.openQrisPayment = function(id) {
    const product = store.getProductById(id);
    if (!product) return;
    activeProduct = product;

    // Generate real invoice
    activeInvoice = store.createInvoice(product);

    // Setup Modal Info
    const qrisInfo = settings.qris || {
      merchantName: 'BRANN DIGITAL HUB, DIGITAL & KREATIF',
      nmid: 'ID1026607305962',
      image: 'assets/images/qris-brann.png'
    };

    if (qrisProductTitle) qrisProductTitle.textContent = product.name;
    if (qrisProductCategory) qrisProductCategory.textContent = product.category;
    if (qrisProductPrice) qrisProductPrice.textContent = store.formatRupiah(product.price);
    if (qrisNmid) qrisNmid.textContent = `NMID: ${qrisInfo.nmid}`;
    if (qrisImageEl) qrisImageEl.src = qrisInfo.image;

    // Setup Struk Box Info
    if (strukInvoiceNo) strukInvoiceNo.textContent = activeInvoice.invoiceNumber;
    if (strukDateTime) strukDateTime.textContent = `${activeInvoice.date}, ${activeInvoice.time}`;
    if (strukPrice) strukPrice.textContent = activeInvoice.priceFormatted;

    // Set Telegram Link with pre-filled invoice message
    const telegramUrl = store.getTelegramInvoiceUrl(activeInvoice);
    if (sendTelegramReceiptBtn) sendTelegramReceiptBtn.href = telegramUrl;

    qrisModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (window.lucide) window.lucide.createIcons();
  };

  function closeQrisModal() {
    qrisModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (qrisCloseBtn) qrisCloseBtn.addEventListener('click', closeQrisModal);
  if (qrisModal) {
    qrisModal.addEventListener('click', (e) => {
      if (e.target === qrisModal) closeQrisModal();
    });
  }

  // Download QRIS Image
  if (downloadQrisImageBtn) {
    downloadQrisImageBtn.addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = 'QRIS-BRANN-DIGITAL-HUB.png';
      link.href = settings.qris?.image || 'assets/images/qris-brann.png';
      link.click();
      showToast('Gambar barcode QRIS berhasil didownload!');
    });
  }

  // Handle Copy Invoice Text
  if (copyInvoiceTextBtn) {
    copyInvoiceTextBtn.addEventListener('click', () => {
      if (!activeInvoice) return;
      const text = 
`🧾 *INVOICE PEMBELIAN BRANNNXD*
No. Invoice: ${activeInvoice.invoiceNumber}
Produk: ${activeInvoice.productName}
Kategori: ${activeInvoice.category}
Total Bayar: ${activeInvoice.priceFormatted}
Waktu Transaksi: ${activeInvoice.date}, ${activeInvoice.time}
Merchant QRIS: ${activeInvoice.merchantName} (${activeInvoice.nmid})

Kirimkan teks ini bersama screenshot bukti transfer ke Telegram @brannnn22`;

      navigator.clipboard.writeText(text).then(() => {
        showToast('Teks invoice berhasil disalin ke clipboard!', 'copy');
      });
    });
  }

  // ================= CANVAS STRUK GENERATOR =================
  function generateReceiptCanvas(invoice) {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 920;
    const ctx = canvas.getContext('2d');

    // Background Dark Slate
    ctx.fillStyle = '#0a0e17';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Outer Border Glow
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
    ctx.lineWidth = 4;
    ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);

    // Decorative Header Tag
    ctx.fillStyle = '#10b981';
    ctx.font = '900 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BRANNNXD DIGITAL STORE', 320, 75);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 13px sans-serif';
    ctx.fillText('STRUK BUKTI PEMESANAN & TRANSAKSI RESMI', 320, 105);

    // Merchant Info Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fillRect(40, 125, 560, 65);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeRect(40, 125, 560, 65);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(invoice.merchantName, 320, 152);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px monospace';
    ctx.fillText('NMID: ' + invoice.nmid + ' • GPN QRIS A01', 320, 175);

    // Dashed divider line
    const drawDashedLine = (y) => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(600, y);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    drawDashedLine(215);

    // Key-Value rows
    const drawRow = (label, val, y, isGreen = false) => {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.fillText(label, 45, y);

      ctx.textAlign = 'right';
      ctx.fillStyle = isGreen ? '#34d399' : '#ffffff';
      ctx.font = isGreen ? 'bold 17px monospace' : 'bold 14px monospace';
      ctx.fillText(val, 595, y);
    };

    drawRow('NO. INVOICE', invoice.invoiceNumber, 255, true);
    drawRow('WAKTU PESANAN', `${invoice.date}, ${invoice.time}`, 295);
    drawRow('METODE BAYAR', 'QRIS (Bank & E-Wallet)', 335);
    drawRow('STATUS KIRIM', invoice.deliveryType, 375);

    drawDashedLine(410);

    // Item Info
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('RINCIAN PRODUK DIGITAL:', 45, 445);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(invoice.productName, 45, 478);

    ctx.fillStyle = '#06b6d4';
    ctx.font = '13px sans-serif';
    ctx.fillText('Kategori: ' + invoice.category, 45, 506);

    drawDashedLine(540);

    // Total Amount Row
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 18px sans-serif';
    ctx.fillText('TOTAL TRANSFER:', 45, 585);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#34d399';
    ctx.font = '900 28px monospace';
    ctx.fillText(invoice.priceFormatted, 595, 585);

    // Verification Status Banner
    ctx.fillStyle = 'rgba(234, 179, 8, 0.12)';
    ctx.fillRect(45, 625, 550, 52);
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
    ctx.strokeRect(45, 625, 550, 52);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⏳ STATUS: MENUNGGU VERIFIKASI OWNER', 320, 657);

    // Notice Box
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('SERTAKAN STRUK INI & BUKTI TRANSFER KE TELEGRAM:', 320, 715);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('@brannnn22 (t.me/brannnn22)', 320, 745);

    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.fillText('Owner akan memberikan file / akses produk setelah bukti & invoice terverifikasi.', 320, 785);

    // Footer Copyright
    ctx.fillStyle = '#334155';
    ctx.font = '11px sans-serif';
    ctx.fillText('Simpan struk ini sebagai referensi resmi transaksi Anda • BrannnXD Store', 320, 875);

    return canvas;
  }

  // Handle Download Struk Button
  if (downloadReceiptBtn) {
    downloadReceiptBtn.addEventListener('click', () => {
      if (!activeInvoice) return;
      const canvas = generateReceiptCanvas(activeInvoice);
      const link = document.createElement('a');
      link.download = `STRUK-${activeInvoice.invoiceNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('Gambar Struk Pembelian berhasil didownload!', 'download');
    });
  }

  // Keyboard Escape for modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDetailModal();
      closeQrisModal();
    }
  });

  // Search Input Handlers
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      if (searchClearBtn) {
        if (searchQuery) searchClearBtn.classList.remove('hidden');
        else searchClearBtn.classList.add('hidden');
      }
      renderProducts();
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      searchClearBtn.classList.add('hidden');
      renderProducts();
      searchInput.focus();
    });
  }

  // Sort Dropdown
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderProducts();
    });
  }

  // Initial Run
  renderCategories();
  renderProducts();

  // Re-render when localStorage changes
  window.addEventListener('storage', (e) => {
    if (e.key === 'brannnxd_products_v2' || e.key === 'brannnxd_settings_v2') {
      renderCategories();
      renderProducts();
    }
  });
});
