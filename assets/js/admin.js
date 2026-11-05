/**
 * BrannnXD - Owner / Admin Dashboard Logic
 * Authentication, Product CRUD, Image Upload (Base64/URL), Settings & Backup.
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = window.Store;

  // DOM Elements - Sections
  const loginSection = document.getElementById('loginSection');
  const adminDashboard = document.getElementById('adminDashboard');
  const loginForm = document.getElementById('loginForm');
  const loginPassword = document.getElementById('loginPassword');
  const rememberMeCheck = document.getElementById('rememberMeCheck');
  const loginErrorMsg = document.getElementById('loginErrorMsg');
  const logoutBtn = document.getElementById('logoutBtn');

  // Tabs
  const tabButtons = document.querySelectorAll('.admin-tab-btn');
  const tabContents = document.querySelectorAll('.admin-tab-content');

  // Stats Elements
  const statTotalProducts = document.getElementById('statTotalProducts');
  const statActiveProducts = document.getElementById('statActiveProducts');
  const statTotalValue = document.getElementById('statTotalValue');
  const statTotalCategories = document.getElementById('statTotalCategories');

  // Product Table & Form Elements
  const productTableBody = document.getElementById('productTableBody');
  const productModal = document.getElementById('productModal');
  const productModalTitle = document.getElementById('productModalTitle');
  const productForm = document.getElementById('productForm');
  const openAddProductBtn = document.getElementById('openAddProductBtn');
  const closeProductModalBtn = document.getElementById('closeProductModalBtn');
  const cancelProductModalBtn = document.getElementById('cancelProductModalBtn');

  // Form Fields
  const formProductId = document.getElementById('formProductId');
  const formProductName = document.getElementById('formProductName');
  const formProductCategory = document.getElementById('formProductCategory');
  const formProductPrice = document.getElementById('formProductPrice');
  const formProductOriginalPrice = document.getElementById('formProductOriginalPrice');
  const formProductBadge = document.getElementById('formProductBadge');
  const formProductStatus = document.getElementById('formProductStatus');
  const formProductDescription = document.getElementById('formProductDescription');
  const formProductFeatures = document.getElementById('formProductFeatures');
  const formProductImageUrl = document.getElementById('formProductImageUrl');
  const formProductImageFile = document.getElementById('formProductImageFile');
  const formImagePreview = document.getElementById('formImagePreview');
  const formImagePreviewContainer = document.getElementById('formImagePreviewContainer');

  // Settings Elements
  const settingsForm = document.getElementById('settingsForm');
  const setStoreName = document.getElementById('setStoreName');
  const setTelegramUsername = document.getElementById('setTelegramUsername');
  const setTagline = document.getElementById('setTagline');
  const setAnnouncement = document.getElementById('setAnnouncement');
  const changePasswordForm = document.getElementById('changePasswordForm');
  const oldPasswordInput = document.getElementById('oldPasswordInput');
  const newPasswordInput = document.getElementById('newPasswordInput');
  const confirmPasswordInput = document.getElementById('confirmPasswordInput');

  // Backup Elements
  const exportJsonBtn = document.getElementById('exportJsonBtn');
  const importJsonInput = document.getElementById('importJsonInput');
  const resetDefaultBtn = document.getElementById('resetDefaultBtn');

  // Toast Notification
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    const bgClass = type === 'success' ? 'bg-emerald-500 text-black font-semibold' : 'bg-rose-500 text-white font-semibold';
    toast.className = `fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 transform translate-y-2 opacity-0 transition-all duration-300 ${bgClass}`;
    toast.innerHTML = `
      <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}" class="w-5 h-5"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
      toast.classList.add('translate-y-2', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Check Auth State
  function checkAuth() {
    if (store.isOwnerLoggedIn()) {
      loginSection.classList.add('hidden');
      adminDashboard.classList.remove('hidden');
      loadDashboard();
    } else {
      loginSection.classList.remove('hidden');
      adminDashboard.classList.add('hidden');
    }
    if (window.lucide) window.lucide.createIcons();
  }

  // Handle Login
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const pwd = loginPassword.value.trim();
      const remember = rememberMeCheck ? rememberMeCheck.checked : false;

      if (store.ownerLogin(pwd, remember)) {
        loginPassword.value = '';
        if (loginErrorMsg) loginErrorMsg.classList.add('hidden');
        showToast('Login berhasil! Selamat datang, Owner BrannnXD.');
        checkAuth();
      } else {
        if (loginErrorMsg) {
          loginErrorMsg.classList.remove('hidden');
          loginErrorMsg.textContent = 'Password salah! Default password adalah "brannn123"';
        }
      }
    });
  }

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Yakin ingin keluar dari Owner Dashboard?')) {
        store.ownerLogout();
        showToast('Berhasil logout.');
        checkAuth();
      }
    });
  }

  // Tab Navigation
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      tabButtons.forEach(b => {
        b.classList.remove('bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/40');
        b.classList.add('text-slate-400', 'border-transparent');
      });
      btn.classList.add('bg-emerald-500/10', 'text-emerald-400', 'border-emerald-500/40');
      btn.classList.remove('text-slate-400', 'border-transparent');

      tabContents.forEach(content => {
        if (content.id === `tab-${targetTab}`) {
          content.classList.remove('hidden');
        } else {
          content.classList.add('hidden');
        }
      });
      if (window.lucide) window.lucide.createIcons();
    });
  });

  // Load Dashboard Data & Stats
  function loadDashboard() {
    const products = store.getProducts();
    const activeProducts = products.filter(p => p.status === 'active');
    const totalValue = products.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
    const categories = new Set(products.map(p => p.category).filter(Boolean));

    if (statTotalProducts) statTotalProducts.textContent = products.length;
    if (statActiveProducts) statActiveProducts.textContent = activeProducts.length;
    if (statTotalValue) statTotalValue.textContent = store.formatRupiah(totalValue);
    if (statTotalCategories) statTotalCategories.textContent = categories.size;

    renderProductTable();
    loadSettingsInputs();
  }

  // Render Product Table
  function renderProductTable() {
    if (!productTableBody) return;
    const products = store.getProducts();
    productTableBody.innerHTML = '';

    if (products.length === 0) {
      productTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-12 text-slate-400 text-sm">
            Belum ada produk di katalog. Klik <b>"+ Tambah Produk"</b> untuk memulai.
          </td>
        </tr>
      `;
      return;
    }

    products.forEach((p, idx) => {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-white/5 hover:bg-white/[0.02] transition-colors';

      const statusBadge = p.status === 'active'
        ? '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>Aktif</span>'
        : '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">Draft</span>';

      tr.innerHTML = `
        <td class="py-3.5 px-4 text-xs text-slate-500 font-mono">${idx + 1}</td>
        <td class="py-3.5 px-4">
          <div class="flex items-center gap-3">
            <img src="${p.image}" alt="${p.name}" class="w-11 h-11 rounded-lg object-cover bg-slate-800 border border-white/10 shrink-0" onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'" />
            <div>
              <div class="text-sm font-bold text-white line-clamp-1">${p.name}</div>
              <div class="text-[11px] text-slate-400">${p.badge ? `<span class="text-emerald-400 font-semibold">[${p.badge}]</span> ` : ''}${p.category}</div>
            </div>
          </div>
        </td>
        <td class="py-3.5 px-4 text-xs font-semibold text-emerald-400 whitespace-nowrap">
          ${store.formatRupiah(p.price)}
          ${p.originalPrice ? `<div class="text-[10px] text-slate-500 line-through">${store.formatRupiah(p.originalPrice)}</div>` : ''}
        </td>
        <td class="py-3.5 px-4 text-xs whitespace-nowrap">${statusBadge}</td>
        <td class="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
          ${p.features ? `${p.features.length} Fitur` : '0 Fitur'}
        </td>
        <td class="py-3.5 px-4 text-right whitespace-nowrap">
          <div class="flex items-center justify-end gap-1.5">
            <button onclick="window.editProduct('${p.id}')" class="p-2 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-300 transition-colors cursor-pointer" title="Edit Produk">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button onclick="window.deleteProduct('${p.id}')" class="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 transition-colors cursor-pointer" title="Hapus Produk">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </td>
      `;
      productTableBody.appendChild(tr);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // Image Upload & Preview Handling
  function updateImagePreview(src) {
    if (src) {
      formImagePreview.src = src;
      formImagePreviewContainer.classList.remove('hidden');
    } else {
      formImagePreviewContainer.classList.add('hidden');
    }
  }

  if (formProductImageUrl) {
    formProductImageUrl.addEventListener('input', (e) => {
      const url = e.target.value.trim();
      if (url) updateImagePreview(url);
    });
  }

  if (formProductImageFile) {
    formProductImageFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          alert('Ukuran foto maksimal 2MB cuyy!');
          formProductImageFile.value = '';
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result;
          formProductImageUrl.value = base64;
          updateImagePreview(base64);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Open Add Product Modal
  function openAddModal() {
    productForm.reset();
    formProductId.value = '';
    productModalTitle.textContent = 'Tambah Produk Baru';
    formProductStatus.value = 'active';
    updateImagePreview('');
    productModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (window.lucide) window.lucide.createIcons();
  }

  // Open Edit Product Modal
  window.editProduct = function(id) {
    const product = store.getProductById(id);
    if (!product) return;

    formProductId.value = product.id;
    formProductName.value = product.name;
    formProductCategory.value = product.category;
    formProductPrice.value = product.price;
    formProductOriginalPrice.value = product.originalPrice || '';
    formProductBadge.value = product.badge || '';
    formProductStatus.value = product.status || 'active';
    formProductDescription.value = product.description;
    formProductFeatures.value = Array.isArray(product.features) ? product.features.join('\n') : '';
    formProductImageUrl.value = product.image;

    updateImagePreview(product.image);

    productModalTitle.textContent = 'Edit Produk';
    productModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (window.lucide) window.lucide.createIcons();
  };

  // Delete Product
  window.deleteProduct = function(id) {
    const product = store.getProductById(id);
    if (!product) return;
    if (confirm(`Yakin mau hapus produk "${product.name}"?`)) {
      store.deleteProduct(id);
      showToast(`Produk "${product.name}" berhasil dihapus.`);
      loadDashboard();
    }
  };

  // Close Product Modal
  function closeProductModal() {
    productModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (openAddProductBtn) openAddProductBtn.addEventListener('click', openAddModal);
  if (closeProductModalBtn) closeProductModalBtn.addEventListener('click', closeProductModal);
  if (cancelProductModalBtn) cancelProductModalBtn.addEventListener('click', closeProductModal);

  // Submit Product Form (Add / Edit)
  if (productForm) {
    productForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const id = formProductId.value.trim();
      const productData = {
        name: formProductName.value.trim(),
        category: formProductCategory.value.trim(),
        price: Number(formProductPrice.value),
        originalPrice: formProductOriginalPrice.value ? Number(formProductOriginalPrice.value) : null,
        badge: formProductBadge.value.trim().toUpperCase(),
        status: formProductStatus.value,
        description: formProductDescription.value.trim(),
        features: formProductFeatures.value.split('\n').map(s => s.trim()).filter(Boolean),
        image: formProductImageUrl.value.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
      };

      if (!productData.name || !productData.price) {
        alert('Nama produk dan harga wajib diisi ya cuyy!');
        return;
      }

      if (id) {
        // Edit existing
        store.updateProduct(id, productData);
        showToast(`Produk "${productData.name}" berhasil diperbarui!`);
      } else {
        // Add new
        store.addProduct(productData);
        showToast(`Produk "${productData.name}" berhasil ditambahkan!`);
      }

      closeProductModal();
      loadDashboard();
    });
  }

  // Load Settings into Inputs
  function loadSettingsInputs() {
    const settings = store.getSettings();
    if (setStoreName) setStoreName.value = settings.storeName || '';
    if (setTelegramUsername) setTelegramUsername.value = settings.telegramUsername || '';
    if (setTagline) setTagline.value = settings.tagline || '';
    if (setAnnouncement) setAnnouncement.value = settings.announcement || '';
  }

  // Save Store Settings
  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      store.saveSettings({
        storeName: setStoreName.value.trim() || 'BrannnXD',
        telegramUsername: setTelegramUsername.value.trim() || 'brannnn22',
        tagline: setTagline.value.trim(),
        announcement: setAnnouncement.value.trim()
      });
      showToast('Pengaturan toko berhasil disimpan!');
    });
  }

  // Change Password
  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const oldPwd = oldPasswordInput.value.trim();
      const newPwd = newPasswordInput.value.trim();
      const confPwd = confirmPasswordInput.value.trim();

      if (newPwd.length < 5) {
        alert('Password baru minimal 5 karakter ya cuyy!');
        return;
      }

      if (newPwd !== confPwd) {
        alert('Konfirmasi password baru tidak cocok!');
        return;
      }

      if (store.changeOwnerPassword(oldPwd, newPwd)) {
        changePasswordForm.reset();
        showToast('Password Owner berhasil diubah! Ingat baik-baik ya.');
      } else {
        alert('Password lama salah cuyy!');
      }
    });
  }

  // Export JSON
  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', () => {
      const data = {
        products: store.getProducts(),
        settings: store.getSettings(),
        exportedAt: new Date().toISOString()
      };
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brannnxd-catalog-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('File backup JSON berhasil didownload!');
    });
  }

  // Import JSON
  if (importJsonInput) {
    importJsonInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (Array.isArray(parsed.products)) {
            store.saveProducts(parsed.products);
          } else if (Array.isArray(parsed)) {
            store.saveProducts(parsed);
          }
          if (parsed.settings) {
            store.saveSettings(parsed.settings);
          }
          showToast('Data katalog berhasil diimpor!');
          loadDashboard();
        } catch (err) {
          alert('Format file JSON tidak valid!');
        }
      };
      reader.readAsText(file);
    });
  }

  // Reset to Default Catalog
  if (resetDefaultBtn) {
    resetDefaultBtn.addEventListener('click', () => {
      if (confirm('YAKIN mau reset semua produk ke katalog bawaan BrannnXD? Data produk custom kamu akan tertimpa.')) {
        store.resetProductsToDefault();
        showToast('Katalog berhasil direset ke bawaan!');
        loadDashboard();
      }
    });
  }

  // Initialize
  checkAuth();
});
