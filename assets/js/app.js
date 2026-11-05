/**
 * BrannnXD - Storefront Application Logic (Production)
 * Interactive UI, search, category filter, sorting, dynamic modal, clipboard, and Telegram order routing.
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = window.Store;
  const settings = store.getSettings();

  // State
  let currentCategory = 'Semua';
  let searchQuery = '';
  let currentSort = 'popular';
  let activeModalProduct = null;

  // DOM Elements
  const productsGrid = document.getElementById('productsGrid');
  const emptyState = document.getElementById('emptyState');
  const categoryFilters = document.getElementById('categoryFilters');
  const searchInput = document.getElementById('searchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const sortSelect = document.getElementById('sortSelect');
  const productCountBadge = document.getElementById('productCountBadge');
  
  // Modal Elements
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
  const modalTelegramOrderBtn = document.getElementById('modalTelegramOrderBtn');
  const copyOrderTextBtn = document.getElementById('copyOrderTextBtn');

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
    toast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900/90 text-white font-medium text-xs sm:text-sm border border-emerald-500/40 shadow-2xl backdrop-blur-xl flex items-center gap-2.5 transition-all duration-300 transform translate-y-3 opacity-0';
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
      productCountBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span> ${filtered.length} Produk Tersedia`;
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

      const telegramUrl = store.getTelegramOrderUrl(p);

      // Feature bullet snippets (up to 3 items)
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

          <!-- Sales / Status -->
          <div class="absolute top-3 right-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5 text-[11px] text-amber-300 font-bold">
            <i data-lucide="star" class="w-3 h-3 fill-amber-400 text-amber-400"></i>
            <span>${p.rating || 5.0}</span>
            <span class="text-slate-500 font-normal">(${p.soldCount || 100}+)</span>
          </div>

          <!-- Delivery tag bar at bottom of image -->
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
                <span class="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Harga Produk</span>
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

              <a href="${telegramUrl}" target="_blank" rel="noopener noreferrer" class="col-span-3 py-2.5 px-3 rounded-xl btn-telegram text-white text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer shadow-lg shadow-sky-500/20" title="Beli langsung via Telegram @${cleanTelegram}">
                <i data-lucide="send" class="w-3.5 h-3.5"></i>
                <span>Beli via Telegram</span>
              </a>
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
    activeModalProduct = product;

    modalImage.src = product.image;
    modalCategory.textContent = product.category;
    modalTitle.textContent = product.name;
    modalDescription.textContent = product.description;
    modalPrice.textContent = store.formatRupiah(product.price);

    if (modalDeliveryTag) {
      modalDeliveryTag.textContent = product.deliveryType || 'Instan Delivery via Telegram';
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

    // Set Telegram order URL
    const telegramUrl = store.getTelegramOrderUrl(product);
    modalTelegramOrderBtn.href = telegramUrl;

    // Copy Order Format Text Button
    if (copyOrderTextBtn) {
      copyOrderTextBtn.onclick = () => {
        const formatText = `Halo BrannnXD (@${cleanTelegram}), saya mau pesan ${product.name} seharga ${store.formatRupiah(product.price)}. Mohon info QRIS / Rekening manualnya.`;
        navigator.clipboard.writeText(formatText).then(() => {
          showToast('Format pesan berhasil disalin ke clipboard!', 'clipboard');
        });
      };
    }

    // Show Modal
    productModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (window.lucide) {
      window.lucide.createIcons();
    }
  };

  // Close Product Detail Modal
  function closeModal() {
    productModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (productModal) {
    productModal.addEventListener('click', (e) => {
      if (e.target === productModal) closeModal();
    });
  }

  // Keyboard Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
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
