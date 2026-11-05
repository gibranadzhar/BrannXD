/**
 * BrannnXD - Storefront Application Logic
 * Interactive UI, search, category filter, dynamic modal, and Telegram order routing.
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = window.Store;
  const settings = store.getSettings();

  // State
  let currentCategory = 'Semua';
  let searchQuery = '';
  let activeModalProduct = null;

  // DOM Elements
  const productsGrid = document.getElementById('productsGrid');
  const emptyState = document.getElementById('emptyState');
  const categoryFilters = document.getElementById('categoryFilters');
  const searchInput = document.getElementById('searchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const productCountBadge = document.getElementById('productCountBadge');
  const productModal = document.getElementById('productModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalImage = document.getElementById('modalImage');
  const modalBadge = document.getElementById('modalBadge');
  const modalCategory = document.getElementById('modalCategory');
  const modalTitle = document.getElementById('modalTitle');
  const modalPrice = document.getElementById('modalPrice');
  const modalOriginalPrice = document.getElementById('modalOriginalPrice');
  const modalDiscountTag = document.getElementById('modalDiscountTag');
  const modalDescription = document.getElementById('modalDescription');
  const modalFeaturesList = document.getElementById('modalFeaturesList');
  const modalTelegramOrderBtn = document.getElementById('modalTelegramOrderBtn');
  const announcementText = document.getElementById('announcementText');
  const telegramUsernameElements = document.querySelectorAll('.telegram-username-text');
  const telegramDirectLinks = document.querySelectorAll('.telegram-direct-link');

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

  // Render Category Pills
  function renderCategories() {
    if (!categoryFilters) return;
    const categories = store.getCategories();
    categoryFilters.innerHTML = '';

    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
        currentCategory === cat
          ? 'bg-emerald-500 text-black font-semibold shadow-lg shadow-emerald-500/25 border border-emerald-400'
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
    const allActive = store.getActiveProducts();

    // Filter by Category and Search
    const filtered = allActive.filter(p => {
      const matchCat = currentCategory === 'Semua' || p.category === currentCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.badge && p.badge.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });

    if (productCountBadge) {
      productCountBadge.textContent = `${filtered.length} Produk`;
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
      card.className = 'glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col group border border-white/5 relative';

      const priceFormatted = store.formatRupiah(p.price);
      let originalPriceHtml = '';
      let discountBadgeHtml = '';

      if (p.originalPrice && p.originalPrice > p.price) {
        const discountPercent = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
        originalPriceHtml = `<span class="text-xs text-slate-500 line-through">${store.formatRupiah(p.originalPrice)}</span>`;
        discountBadgeHtml = `<span class="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">-${discountPercent}%</span>`;
      }

      const telegramUrl = store.getTelegramOrderUrl(p);

      // Feature bullet snippets
      const featureSnippets = p.features && p.features.length > 0 
        ? p.features.slice(0, 3).map(f => `
            <li class="flex items-center gap-1.5 text-xs text-slate-300">
              <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-400 shrink-0"></i>
              <span class="truncate">${f}</span>
            </li>
          `).join('')
        : '';

      card.innerHTML = `
        <!-- Image & Badges -->
        <div class="relative h-48 w-full overflow-hidden bg-slate-900 cursor-pointer" onclick="window.openDetailModal('${p.id}')">
          <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'" />
          <div class="absolute inset-0 bg-gradient-to-t from-[#0e121b] via-transparent to-transparent opacity-80"></div>
          
          <!-- Category & Badge -->
          <div class="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span class="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-black/60 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
              ${p.category}
            </span>
            ${p.badge ? `<span class="shimmer-badge px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-500 text-black uppercase tracking-wider">${p.badge}</span>` : ''}
          </div>

          <!-- Rating / Sales -->
          <div class="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1 text-[11px] text-amber-300 font-semibold">
            <i data-lucide="star" class="w-3 h-3 fill-amber-400 text-amber-400"></i>
            <span>${p.rating || 5.0}</span>
          </div>
        </div>

        <!-- Content -->
        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="text-base sm:text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1 cursor-pointer mb-1.5" onclick="window.openDetailModal('${p.id}')">
              ${p.name}
            </h3>
            <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
              ${p.description}
            </p>

            <!-- Key Features -->
            ${featureSnippets ? `<ul class="space-y-1.5 mb-4 py-2 border-y border-white/5">${featureSnippets}</ul>` : ''}
          </div>

          <!-- Footer Price & CTA Buttons -->
          <div class="pt-2">
            <div class="flex items-baseline justify-between mb-3.5">
              <div>
                <span class="text-xs text-slate-400 block mb-0.5">Harga</span>
                <div class="flex items-center gap-2">
                  <span class="text-lg sm:text-xl font-extrabold text-white">${priceFormatted}</span>
                  ${originalPriceHtml}
                </div>
              </div>
              <div>${discountBadgeHtml}</div>
            </div>

            <div class="grid grid-cols-5 gap-2">
              <button onclick="window.openDetailModal('${p.id}')" class="col-span-2 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer" title="Lihat Spesifikasi Lengkap">
                <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                <span>Detail</span>
              </button>

              <a href="${telegramUrl}" target="_blank" rel="noopener noreferrer" class="col-span-3 py-2.5 px-3 rounded-xl btn-telegram text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer shadow-md" title="Pesan sekarang ke Telegram @${cleanTelegram}">
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
        li.className = 'flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 bg-white/[0.03] p-2.5 rounded-xl border border-white/5';
        li.innerHTML = `
          <i data-lucide="check" class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"></i>
          <span>${feat}</span>
        `;
        modalFeaturesList.appendChild(li);
      });
    }

    // Set Telegram order URL
    const telegramUrl = store.getTelegramOrderUrl(product);
    modalTelegramOrderBtn.href = telegramUrl;

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

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (productModal) {
    productModal.addEventListener('click', (e) => {
      if (e.target === productModal) {
        closeModal();
      }
    });
  }

  // Keyboard Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  // Search Input Handlers
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      if (searchClearBtn) {
        if (searchQuery) {
          searchClearBtn.classList.remove('hidden');
        } else {
          searchClearBtn.classList.add('hidden');
        }
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

  // Initial Run
  renderCategories();
  renderProducts();

  // Re-render when localStorage changes (e.g. from Admin in another tab)
  window.addEventListener('storage', (e) => {
    if (e.key === 'brannnxd_products_v1' || e.key === 'brannnxd_settings_v1') {
      renderCategories();
      renderProducts();
    }
  });
});
