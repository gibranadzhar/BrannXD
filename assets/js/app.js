/**
 * BrannnXD - Storefront Application Logic (Production)
 * Exact Flow & Anti-Fraud Security:
 * 1. Klik Produk / Tombol "Lihat Produk" -> Buka Modal Detail Produk ("Lihat Produk")
 * 2. Di Modal Detail Produk -> Klik "Lanjut ke Pembayaran"
 * 3. Buka Modal QRIS:
 *    - Ditambahkan 3 digit Kode Unik otomatis (contoh: Rp 50.318)
 *    - Timer countdown 15 menit
 *    - QRIS Barcode BRANN DIGITAL HUB (NMID ID1026607305962)
 *    - Form Wajib: Nama Rekening Pengirim + Upload Bukti Screenshot Transfer
 *    - Tombol "Sudah Bayar" terkunci sampai bukti & nama pengirim diisi
 * 4. Klik Tombol "Sudah Bayar" -> Terbit Struk / Invoice Resmi
 * 5. Instruksi Wajib: Chat ke Telegram @brannnn22 kirim bukti screenshot + invoice
 *    Owner cek mutasi rekening -> jika sesuai, kirimkan data produk!
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = window.Store;
  const settings = store.getSettings();

  // Application State
  let currentCategory = 'Semua';
  let searchQuery = '';
  let currentSort = 'popular';
  let activeProduct = null;
  let activeInvoice = null;
  let activeUniqueCode = 0;
  let activeTotalAmount = 0;
  let activeProofDataUrl = '';
  let countdownTimer = null;
  let countdownSeconds = 900; // 15 menit

  // DOM Elements - Catalog & Filters
  const productsGrid = document.getElementById('productsGrid');
  const emptyState = document.getElementById('emptyState');
  const categoryFilters = document.getElementById('categoryFilters');
  const searchInput = document.getElementById('searchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const sortSelect = document.getElementById('sortSelect');
  const productCountBadge = document.getElementById('productCountBadge');

  // DOM Elements - 1. Modal Lihat Produk (Detail Produk)
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
  const modalProceedToPaymentBtn = document.getElementById('modalProceedToPaymentBtn');

  // DOM Elements - 2. Modal Pembayaran (QRIS & Invoice)
  const paymentModal = document.getElementById('paymentModal');
  const paymentCloseBtn = document.getElementById('paymentCloseBtn');
  const paymentModalHeaderTitle = document.getElementById('paymentModalHeaderTitle');

  // Step 1: QRIS View Elements with Unique Code & Anti-Spam Form
  const stepQrisView = document.getElementById('stepQrisView');
  const qrisTimerBadge = document.getElementById('qrisTimerBadge');
  const qrisProductTitle = document.getElementById('qrisProductTitle');
  const qrisBasePrice = document.getElementById('qrisBasePrice');
  const qrisUniqueCode = document.getElementById('qrisUniqueCode');
  const qrisProductPrice = document.getElementById('qrisProductPrice');
  const btnCopyNominal = document.getElementById('btnCopyNominal');
  const qrisImageEl = document.getElementById('qrisImageEl');
  const qrisNmid = document.getElementById('qrisNmid');
  const inputSenderName = document.getElementById('inputSenderName');
  const inputProofFile = document.getElementById('inputProofFile');
  const btnSelectProof = document.getElementById('btnSelectProof');
  const selectProofLabel = document.getElementById('selectProofLabel');
  const proofPreviewContainer = document.getElementById('proofPreviewContainer');
  const proofPreviewImg = document.getElementById('proofPreviewImg');
  const proofFileName = document.getElementById('proofFileName');
  const btnRemoveProof = document.getElementById('btnRemoveProof');
  const btnSudahBayar = document.getElementById('btnSudahBayar');
  const sudahBayarHint = document.getElementById('sudahBayarHint');
  const downloadQrisImageBtn = document.getElementById('downloadQrisImageBtn');

  // Step 2: Invoice & Telegram Confirmation Elements
  const stepInvoiceView = document.getElementById('stepInvoiceView');
  const strukInvoiceNo = document.getElementById('strukInvoiceNo');
  const strukDateTime = document.getElementById('strukDateTime');
  const strukSenderName = document.getElementById('strukSenderName');
  const strukProductName = document.getElementById('strukProductName');
  const strukBasePrice = document.getElementById('strukBasePrice');
  const strukUniqueCode = document.getElementById('strukUniqueCode');
  const strukPrice = document.getElementById('strukPrice');
  const strukProofThumbBox = document.getElementById('strukProofThumbBox');
  const strukProofThumb = document.getElementById('strukProofThumb');
  const btnKirimTelegram = document.getElementById('btnKirimTelegram');
  const btnSalinInvoice = document.getElementById('btnSalinInvoice');
  const btnDownloadStruk = document.getElementById('btnDownloadStruk');
  const btnBackToQris = document.getElementById('btnBackToQris');

  // Announcement and Telegram Quick Action Elements
  const announcementText = document.getElementById('announcementText');
  const copyTelegramBtns = document.querySelectorAll('.copy-telegram-btn');
  const cleanTelegram = (settings.telegramUsername || 'brannnn22').replace('@', '');

  if (announcementText && settings.announcement) {
    announcementText.textContent = settings.announcement;
  }

  // Toast Notification System
  function showToast(message, icon = 'check-circle') {
    const existing = document.getElementById('brannToast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'brannToast';
    toast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-[#0b101c]/95 text-white font-medium text-xs sm:text-sm border border-emerald-500/40 shadow-2xl backdrop-blur-xl flex items-center gap-2.5 transition-all duration-300 transform translate-y-3 opacity-0';
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

  // Salin Username Telegram
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

  // Salin Nominal Unik Tepat
  if (btnCopyNominal) {
    btnCopyNominal.addEventListener('click', () => {
      if (!activeTotalAmount) return;
      navigator.clipboard.writeText(activeTotalAmount.toString()).then(() => {
        showToast(`Nominal Rp ${activeTotalAmount.toLocaleString('id-ID')} berhasil disalin!`, 'copy');
      });
    });
  }

  // Countdown Timer 15 Menit
  function startPaymentCountdown() {
    stopPaymentCountdown();
    countdownSeconds = 900; // 15 menit
    updateTimerBadge();

    countdownTimer = setInterval(() => {
      countdownSeconds--;
      if (countdownSeconds <= 0) {
        stopPaymentCountdown();
        if (qrisTimerBadge) {
          qrisTimerBadge.textContent = 'KEDALUWARSA';
          qrisTimerBadge.className = 'font-mono font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30';
        }
      } else {
        updateTimerBadge();
      }
    }, 1000);
  }

  function stopPaymentCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  function updateTimerBadge() {
    if (!qrisTimerBadge) return;
    const m = Math.floor(countdownSeconds / 60);
    const s = countdownSeconds % 60;
    const formatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    qrisTimerBadge.textContent = formatted;
    qrisTimerBadge.className = 'font-mono font-bold text-white bg-black/50 px-2 py-0.5 rounded border border-amber-500/20';
  }

  // Validasi Form Pembayaran (Anti-Spam)
  function validateCheckoutForm() {
    const senderName = inputSenderName ? inputSenderName.value.trim() : '';
    const hasProof = Boolean(activeProofDataUrl);
    const isValid = senderName.length >= 3 && hasProof;

    if (btnSudahBayar) {
      btnSudahBayar.disabled = !isValid;
      if (isValid) {
        btnSudahBayar.classList.remove('cursor-not-allowed', 'opacity-50');
        btnSudahBayar.classList.add('hover:bg-emerald-400', 'cursor-pointer', 'shadow-emerald-500/30');
        if (sudahBayarHint) {
          sudahBayarHint.innerHTML = '<span class="text-emerald-400 font-bold flex items-center justify-center gap-1"><i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> Data lengkap! Silakan klik tombol "Sudah Bayar" di atas.</span>';
          if (window.lucide) window.lucide.createIcons();
        }
      } else {
        btnSudahBayar.classList.add('cursor-not-allowed', 'opacity-50');
        btnSudahBayar.classList.remove('hover:bg-emerald-400', 'cursor-pointer', 'shadow-emerald-500/30');
        if (sudahBayarHint) {
          sudahBayarHint.innerHTML = '⚠️ Isi nama pengirim dan upload screenshot bukti transfer agar tombol "Sudah Bayar" aktif.';
        }
      }
    }
  }

  // Event Input Nama Pengirim
  if (inputSenderName) {
    inputSenderName.addEventListener('input', validateCheckoutForm);
  }

  // Event Trigger Pilih File Bukti
  if (btnSelectProof && inputProofFile) {
    btnSelectProof.addEventListener('click', () => {
      inputProofFile.click();
    });
  }

  // Handle File Input Change (Read as Base64)
  if (inputProofFile) {
    inputProofFile.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        showToast('Mohon pilih file gambar (JPG/PNG)!', 'alert-circle');
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        activeProofDataUrl = ev.target.result;
        if (proofPreviewImg) proofPreviewImg.src = activeProofDataUrl;
        if (proofFileName) proofFileName.textContent = file.name;
        if (proofPreviewContainer) proofPreviewContainer.classList.remove('hidden');
        if (selectProofLabel) selectProofLabel.textContent = 'Ganti Foto Bukti Transfer';
        validateCheckoutForm();
        showToast('Foto bukti transfer berhasil dipilih!', 'image');
      };
      reader.readAsDataURL(file);
    });
  }

  // Hapus Foto Bukti
  if (btnRemoveProof) {
    btnRemoveProof.addEventListener('click', () => {
      activeProofDataUrl = '';
      if (inputProofFile) inputProofFile.value = '';
      if (proofPreviewContainer) proofPreviewContainer.classList.add('hidden');
      if (selectProofLabel) selectProofLabel.textContent = 'Pilih Foto Bukti Transfer M-Banking / E-Wallet';
      validateCheckoutForm();
    });
  }

  // Render Kategori
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

  // Render Daftar Produk di Katalog
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
        <!-- Image & Badges (Klik membuka Modal Lihat Produk) -->
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

          <!-- Delivery Tag -->
          <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 z-10">
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-emerald-300 text-[10px] font-semibold">
              <i data-lucide="zap" class="w-3 h-3 text-emerald-400"></i> ${p.deliveryType || 'Instan Delivery'}
            </span>
            <span class="text-[10px] text-slate-400 flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
              <i data-lucide="shield-check" class="w-3 h-3 text-cyan-400"></i> Garansi
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

          <!-- Price & Tombol Lihat Produk -->
          <div class="pt-2">
            <div class="flex items-baseline justify-between mb-4">
              <div>
                <span class="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Harga</span>
                <div class="flex items-center gap-2">
                  <span class="text-xl sm:text-2xl font-black text-white font-heading">${priceFormatted}</span>
                  ${originalPriceHtml}
                </div>
              </div>
              <div>${discountBadgeHtml}</div>
            </div>

            <!-- Tombol UTAMA: Lihat Produk -->
            <button onclick="window.openDetailModal('${p.id}')" class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-black font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 text-center cursor-pointer shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40">
              <i data-lucide="eye" class="w-4 h-4 text-black"></i>
              <span>Lihat Produk</span>
            </button>
          </div>
        </div>
      `;

      productsGrid.appendChild(card);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // ================= 1. MODAL LIHAT PRODUK (DETAIL PRODUK) =================
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

    // Features List
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

    // Tombol "Lanjut ke Pembayaran" di dalam Modal Lihat Produk
    if (modalProceedToPaymentBtn) {
      modalProceedToPaymentBtn.onclick = () => {
        closeDetailModal();
        window.openPaymentModal(product.id);
      };
    }

    productModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (window.lucide) window.lucide.createIcons();
  };

  function closeDetailModal() {
    if (productModal) {
      productModal.classList.remove('active');
    }
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeDetailModal);
  if (productModal) {
    productModal.addEventListener('click', (e) => {
      if (e.target === productModal) closeDetailModal();
    });
  }

  // ================= 2. MODAL PEMBAYARAN (QRIS DENGAN KODE UNIK & FORM BUKTI) =================
  window.openPaymentModal = function(id) {
    const product = store.getProductById(id);
    if (!product) return;
    activeProduct = product;
    activeInvoice = null; // Belum terbit sebelum klik "Sudah Bayar"

    // Generate 3-Digit Unique Code (Anti-Troll & Anti-Fraud)
    activeUniqueCode = Math.floor(100 + Math.random() * 899);
    activeTotalAmount = Number(product.price) + activeUniqueCode;

    // Reset Form Input State
    activeProofDataUrl = '';
    if (inputSenderName) inputSenderName.value = '';
    if (inputProofFile) inputProofFile.value = '';
    if (proofPreviewContainer) proofPreviewContainer.classList.add('hidden');
    if (selectProofLabel) selectProofLabel.textContent = 'Pilih Foto Bukti Transfer M-Banking / E-Wallet';
    validateCheckoutForm();

    const qrisInfo = settings.qris || {
      merchantName: 'BRANN DIGITAL HUB, DIGITAL & KREATIF',
      nmid: 'ID1026607305962',
      image: 'assets/images/qris-brann.png'
    };

    // Set QRIS View Data with Unique Code
    if (qrisProductTitle) qrisProductTitle.textContent = product.name;
    if (qrisBasePrice) qrisBasePrice.textContent = store.formatRupiah(product.price);
    if (qrisUniqueCode) qrisUniqueCode.textContent = `+Rp ${activeUniqueCode}`;
    if (qrisProductPrice) qrisProductPrice.textContent = store.formatRupiah(activeTotalAmount);
    if (qrisNmid) qrisNmid.textContent = `NMID: ${qrisInfo.nmid}`;
    if (qrisImageEl) qrisImageEl.src = qrisInfo.image || 'assets/images/qris-brann.png';

    if (paymentModalHeaderTitle) {
      paymentModalHeaderTitle.textContent = 'Pembayaran QRIS Resmi';
    }

    // RESET STATE: Tampilkan HANYA QRIS, Sembunyikan Invoice!
    if (stepQrisView) stepQrisView.classList.remove('hidden');
    if (stepInvoiceView) stepInvoiceView.classList.add('hidden');

    // Mulai Timer 15 Menit
    startPaymentCountdown();

    paymentModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (window.lucide) window.lucide.createIcons();
  };

  function closePaymentModal() {
    stopPaymentCountdown();
    if (paymentModal) {
      paymentModal.classList.remove('active');
    }
    document.body.style.overflow = '';
  }

  if (paymentCloseBtn) paymentCloseBtn.addEventListener('click', closePaymentModal);
  if (paymentModal) {
    paymentModal.addEventListener('click', (e) => {
      if (e.target === paymentModal) closePaymentModal();
    });
  }

  // ================= 3. AKSI TOMBOL "SUDAH BAYAR" -> TERBITKAN INVOICE RESMI =================
  if (btnSudahBayar) {
    btnSudahBayar.addEventListener('click', () => {
      if (!activeProduct) return;
      const senderName = inputSenderName ? inputSenderName.value.trim() : '';

      if (!senderName || !activeProofDataUrl) {
        showToast('Wajib isi nama pengirim & upload screenshot bukti transfer!', 'alert-triangle');
        return;
      }

      // 1. Generate Invoice Baru dengan Kode Unik & Data Pengirim
      activeInvoice = store.createInvoice(activeProduct, senderName, activeUniqueCode, activeProofDataUrl);

      // 2. Isi Data ke Struk / Invoice Box
      if (strukInvoiceNo) strukInvoiceNo.textContent = activeInvoice.invoiceNumber;
      if (strukDateTime) strukDateTime.textContent = `${activeInvoice.date}, ${activeInvoice.time}`;
      if (strukSenderName) strukSenderName.textContent = activeInvoice.senderName;
      if (strukProductName) strukProductName.textContent = activeInvoice.productName;
      if (strukBasePrice) strukBasePrice.textContent = activeInvoice.basePriceFormatted;
      if (strukUniqueCode) strukUniqueCode.textContent = `+Rp ${activeInvoice.uniqueCode}`;
      if (strukPrice) strukPrice.textContent = activeInvoice.priceFormatted;

      // 3. Tampilkan Thumbnail Bukti Transfer di Struk
      if (strukProofThumbBox && strukProofThumb) {
        strukProofThumb.src = activeProofDataUrl;
        strukProofThumbBox.classList.remove('hidden');
      }

      // 4. Pasang URL Telegram dengan pesan invoice otomatis lengkap
      const telegramUrl = store.getTelegramInvoiceUrl(activeInvoice);
      if (btnKirimTelegram) {
        btnKirimTelegram.href = telegramUrl;
      }

      // 5. Ubah Tampilan: Sembunyikan QRIS, Munculkan Struk Invoice!
      if (stepQrisView) stepQrisView.classList.add('hidden');
      if (stepInvoiceView) {
        stepInvoiceView.classList.remove('hidden');
        stepInvoiceView.scrollTop = 0; // Scroll ke paling atas
      }

      if (paymentModalHeaderTitle) {
        paymentModalHeaderTitle.textContent = 'Invoice & Konfirmasi Pembayaran';
      }

      showToast(`Invoice ${activeInvoice.invoiceNumber} berhasil diterbitkan!`, 'file-text');

      if (window.lucide) window.lucide.createIcons();
    });
  }

  // Tombol Kembali ke Barcode QRIS jika ingin cek lagi
  if (btnBackToQris) {
    btnBackToQris.addEventListener('click', () => {
      if (stepInvoiceView) stepInvoiceView.classList.add('hidden');
      if (stepQrisView) stepQrisView.classList.remove('hidden');
      if (paymentModalHeaderTitle) {
        paymentModalHeaderTitle.textContent = 'Pembayaran QRIS';
      }
    });
  }

  // Download Gambar QRIS
  if (downloadQrisImageBtn) {
    downloadQrisImageBtn.addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = 'QRIS-BRANN-DIGITAL-HUB.png';
      link.href = settings.qris?.image || 'assets/images/qris-brann.png';
      link.click();
      showToast('Gambar barcode QRIS berhasil didownload!');
    });
  }

  // Tombol Salin Teks Invoice
  if (btnSalinInvoice) {
    btnSalinInvoice.addEventListener('click', () => {
      if (!activeInvoice) return;
      const text = 
`🧾 *INVOICE PEMBELIAN BRANNNXD*
No. Invoice: ${activeInvoice.invoiceNumber}
Produk: ${activeInvoice.productName}
Kategori: ${activeInvoice.category}
Atas Nama Pengirim: ${activeInvoice.senderName}
Harga Pokok: ${activeInvoice.basePriceFormatted}
Kode Unik: ${activeInvoice.uniqueCode}
TOTAL MUTASI TRANSFER: ${activeInvoice.priceFormatted}
Waktu Transaksi: ${activeInvoice.date}, ${activeInvoice.time}
Merchant QRIS: ${activeInvoice.merchantName} (${activeInvoice.nmid})

⚠️ *INSTRUKSI KONFIRMASI:*
Kirimkan teks invoice ini bersama screenshot bukti pembayaran ke Telegram @${cleanTelegram}. Owner HANYA memproses order jika dana mutasi REAL masuk ke rekening!`;

      navigator.clipboard.writeText(text).then(() => {
        showToast('Teks invoice berhasil disalin ke clipboard! Siap dikirim ke Telegram.', 'copy');
      }).catch(() => {
        showToast('Gagal menyalin invoice.', 'alert-triangle');
      });
    });
  }

  // ================= 4. CANVAS STRUK GENERATOR (DOWNLOAD PNG) =================
  function generateReceiptCanvas(invoice) {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 980;
    const ctx = canvas.getContext('2d');

    // Background Dark Slate
    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Outer Border Glow
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
    ctx.lineWidth = 4;
    ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);

    // Decorative Header
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
      ctx.font = isGreen ? 'bold 16px monospace' : 'bold 13px monospace';
      ctx.fillText(val, 595, y);
    };

    drawRow('NO. INVOICE', invoice.invoiceNumber, 255, true);
    drawRow('WAKTU PESANAN', `${invoice.date}, ${invoice.time}`, 290);
    drawRow('PENGIRIM', invoice.senderName, 325);
    drawRow('METODE BAYAR', 'QRIS (Bank & E-Wallet)', 360);
    drawRow('HARGA POKOK', invoice.basePriceFormatted, 395);
    drawRow('KODE UNIK MUTASI', `+Rp ${invoice.uniqueCode}`, 430, true);

    drawDashedLine(460);

    // Item Info
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('RINCIAN PRODUK DIGITAL:', 45, 495);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(invoice.productName, 45, 528);

    ctx.fillStyle = '#06b6d4';
    ctx.font = '13px sans-serif';
    ctx.fillText('Kategori: ' + invoice.category, 45, 554);

    drawDashedLine(585);

    // Total Amount Row
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 17px sans-serif';
    ctx.fillText('TOTAL TRANSFER MUTASI:', 45, 630);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#34d399';
    ctx.font = '900 28px monospace';
    ctx.fillText(invoice.priceFormatted, 595, 630);

    // Status Box
    ctx.fillStyle = 'rgba(234, 179, 8, 0.12)';
    ctx.fillRect(45, 670, 550, 52);
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
    ctx.strokeRect(45, 670, 550, 52);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`⏳ STATUS: MENUNGGU MUTASI KODE UNIK ${invoice.uniqueCode}`, 320, 702);

    // Telegram Instructions
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('SERTAKAN STRUK INI & SCREENSHOT BUKTI KE TELEGRAM:', 320, 760);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`@${cleanTelegram} (t.me/${cleanTelegram})`, 320, 790);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Owner HANYA memproses pesanan jika dana REAL masuk ke mutasi.', 320, 830);

    // Footer
    ctx.fillStyle = '#334155';
    ctx.font = '11px sans-serif';
    ctx.fillText('Simpan struk ini sebagai referensi resmi transaksi Anda • BrannnXD Store', 320, 935);

    return canvas;
  }

  // Handle Download Struk Button
  if (btnDownloadStruk) {
    btnDownloadStruk.addEventListener('click', () => {
      if (!activeInvoice) return;
      const canvas = generateReceiptCanvas(activeInvoice);
      const link = document.createElement('a');
      link.download = `STRUK-${activeInvoice.invoiceNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('Gambar Struk Pembelian berhasil didownload!', 'download');
    });
  }

  // Keyboard Escape untuk menutup modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDetailModal();
      closePaymentModal();
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

  // Sort Select Handlers
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderProducts();
    });
  }

  // Render Pertama Kali
  renderCategories();
  renderProducts();

  // Sinkronisasi bila LocalStorage berubah
  window.addEventListener('storage', (e) => {
    if (e.key === 'brannnxd_products_v2' || e.key === 'brannnxd_settings_v2') {
      renderCategories();
      renderProducts();
    }
  });
});
