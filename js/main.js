// ==========================================================
// INISIALISASI UTAMA
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Jalankan fitur umum (Navbar, Menu, Footer, Search)
  initializeCommonFeatures();

  // 2. Cek apakah kita di Halaman Homepage
  if (document.querySelector(".hero-static")) {
    // === [INI KODE BARU ANDA] ===
    // Memanggil fungsi untuk memuat produk unggulan di index.html
    loadFeaturedProducts();
    // =============================
  }

  // 3. Cek apakah kita di Halaman Katalog
  if (document.querySelector(".catalog-section")) {
    initializeAppProductPages();
  }

  // 4. Cek apakah kita di Halaman Detail Produk
  if (document.querySelector(".product-detail-grid")) {
    initializeAppProductPages(); // Fungsi ini juga menangani detail
  }

  // 5. Cek apakah kita di Halaman Artikel
  if (document.querySelector(".article-section")) {
    initializeAppArticlePages();
  }
});

// ==========================================================
// PRELOADER LOGIC (Sudah benar dengan perbaikan sessionStorage)
// ==========================================================
window.onload = function () {
  const preloader = document.getElementById("preloader");
  if (!preloader) return; // Keluar jika preloader tidak ada

  // Cek apakah sudah pernah berkunjung di sesi ini
  if (sessionStorage.getItem("hasVisited")) {
    // --- SUDAH BERKUNJUNG ---
    preloader.style.transition = "none";
    preloader.classList.add("hidden");
  } else {
    // --- KUNJUNGAN PERTAMA ---
    setTimeout(() => {
      preloader.classList.add("hidden");
    }, 1500); // Waktu loading 1.5 detik
    sessionStorage.setItem("hasVisited", "true");
  }
};

// ==========================================================
// FUNGSI UMUM (Gabungan)
// ==========================================================

/**
 * Menjalankan skrip umum seperti navbar, menu, footer, dan search.
 */
function initializeCommonFeatures() {
  // --- LOGIKA NAVBAR SCROLL ---
  const navbar = document.getElementById("navbar");
  if (navbar) {
    let lastScrollY = window.scrollY;

    // Fungsi untuk cek status scroll
    const updateNavbar = () => {
      const currentScrollY = window.scrollY;

      // Tentukan apakah navbar harus 'scrolled' (background putih)
      // Di halaman katalog, navbar SELALU 'scrolled'
      if (
        document.querySelector(".catalog-section") ||
        document.querySelector(".product-detail-grid") ||
        document.querySelector(".article-section")
      ) {
        navbar.classList.add("scrolled");
      } else {
        // Hanya di homepage, cek posisi scroll
        if (currentScrollY > 50) {
          navbar.classList.add("scrolled");
        } else {
          navbar.classList.remove("scrolled");
        }
      }

      // Logika Sembunyi/Tampil (Auto-hide)
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        navbar.classList.add("hidden");
      } else {
        navbar.classList.remove("hidden");
      }

      lastScrollY = currentScrollY;
    };

    // Panggil sekali saat load
    updateNavbar();
    // Panggil setiap kali scroll
    window.addEventListener("scroll", updateNavbar);
  }

  // --- LOGIKA MENU TOGGLE ---
  const menuToggle = document.querySelector(".menu-toggle");
  const menuCloseBtn = document.querySelector(".menu-close-btn");
  const menuOverlay = document.getElementById("menu-overlay");
  if (menuToggle && menuCloseBtn && menuOverlay) {
    const toggleMenu = () => {
      menuOverlay.classList.toggle("open");
      document.body.style.overflow = menuOverlay.classList.contains("open")
        ? "hidden"
        : "auto";
    };
    menuToggle.addEventListener("click", toggleMenu);
    menuCloseBtn.addEventListener("click", toggleMenu);
  }

  // --- LOGIKA FOOTER ACCORDION ---
  const footerToggles = document.querySelectorAll(".footer-toggle");
  footerToggles.forEach((toggle) => {
    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      const submenu = toggle.nextElementSibling;
      toggle.classList.toggle("active");
      if (submenu) submenu.classList.toggle("open");
    });
  });

  // --- LOGIKA SEARCH OVERLAY ---
  const searchIcons = document.querySelectorAll(
    ".search-icon-mobile, .search-icon-desktop"
  );
  const searchOverlay = document.getElementById("search-overlay");
  const searchCloseBtn = document.getElementById("search-close-btn");
  const searchInput = document.getElementById("catalog-search-input");

  if (searchIcons.length > 0 && searchOverlay && searchCloseBtn) {
    searchIcons.forEach((icon) => {
      icon.addEventListener("click", (e) => {
        e.preventDefault();
        searchOverlay.classList.add("show");
        if (searchInput) {
          searchInput.focus();
        }
      });
    });

    searchCloseBtn.addEventListener("click", () => {
      searchOverlay.classList.remove("show");
    });
  }
}

// ==========================================================
// FUNGSI KHUSUS HALAMAN PRODUK (KATALOG & DETAIL)
// ==========================================================

/**
 * Memulai logika untuk halaman Katalog & Detail (Fetch, Populate, Render).
 */
async function initializeAppProductPages() {
  const catalogGrid = document.querySelector(".product-grid-catalog");
  const productDetailGrid = document.querySelector(".product-detail-grid");

  // Jika tidak ada grid katalog ATAU grid detail, keluar
  if (!catalogGrid && !productDetailGrid) {
    return;
  }

  try {
    const response = await fetch("products.json"); // Memuat JSON Anda
    if (!response.ok) throw new Error("Gagal memuat data produk");
    const allProductsData = await response.json();

    // Jika kita di halaman KATALOG, jalankan logika katalog
    if (catalogGrid) {
      populateFilters(allProductsData);
      renderProductCatalog(catalogGrid, allProductsData);
    }

    // Jika kita di halaman DETAIL, jalankan logika detail
    if (productDetailGrid) {
      // (Fungsi ini kosong, Anda bisa isi nanti saat membuat halaman detail)
      // renderProductDetail(productDetailGrid, allProductsData);
    }
  } catch (error) {
    console.error("Error memuat data produk:", error);
    const container = catalogGrid || productDetailGrid;
    if (container) {
      container.innerHTML = "<p>Gagal memuat produk. Coba lagi nanti.</p>";
    }
  }
}

/**
 * Helper: Kapitalisasi huruf pertama
 */
function capitalizeFirstLetter(string) {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Mengisi dropdown filter (Tipe, Kategori, Collection)
 */
function populateFilters(products) {
  const tipeFilter = document.getElementById("filter-tipe");
  const categoryFilter = document.getElementById("filter-category");
  const collectionFilter = document.getElementById("filter-collection");

  const uniqueTipes = new Set();
  const uniqueCategories = new Set();
  const uniqueCollections = new Set();

  products.forEach((product) => {
    if (product.tipe) uniqueTipes.add(product.tipe);
    if (product.category) uniqueCategories.add(product.category);
    if (product.collection) uniqueCollections.add(product.collection);
  });

  function appendOptions(selectElement, valuesSet) {
    if (!selectElement) return;
    const sortedValues = [...valuesSet].sort();
    sortedValues.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = capitalizeFirstLetter(value);
      selectElement.appendChild(option);
    });
  }

  appendOptions(tipeFilter, uniqueTipes);
  appendOptions(categoryFilter, uniqueCategories);
  appendOptions(collectionFilter, uniqueCollections);
}

/**
 * Fungsi Utama Halaman Katalog (Filter, Paginasi, Render Grid)
 */
function renderProductCatalog(catalogGrid, allProductsData) {
  const availabilityFilter = document.getElementById("filter-availability");
  const tipeFilter = document.getElementById("filter-tipe");
  const categoryFilter = document.getElementById("filter-category");
  const collectionFilter = document.getElementById("filter-collection");
  const searchInput = document.getElementById("catalog-search-input");
  const searchForm = document.getElementById("catalog-search-form");
  const sortBy = document.getElementById("sort-by");
  const productCount = document.querySelector(".product-count");
  const paginationControls = document.getElementById("pagination-controls");

  let currentPage = 1;
  const productsPerPage = 8; // Anda punya banyak produk, 8 adalah angka yg baik

  // === [INI PERBAIKAN URL FILTER] ===
  const params = new URLSearchParams(window.location.search);

  // 1. Baca parameter ?tipe= (cth: ?tipe=pria)
  const tipeFromURL = params.get("tipe");
  if (tipeFromURL && tipeFilter) {
    tipeFilter.value = tipeFromURL; // Set nilai dropdown Tipe
  }

  // 2. Baca parameter ?kategori= (cth: ?kategori=Kebaya)
  const kategoriFromURL = params.get("kategori");
  if (kategoriFromURL && categoryFilter) {
    categoryFilter.value = kategoriFromURL; // Set nilai dropdown Kategori
  }
  // ===================================

  function renderProducts() {
    const availabilityValue = availabilityFilter.value;
    const tipeValue = tipeFilter.value;
    const categoryValue = categoryFilter.value;
    const collectionValue = collectionFilter.value;
    const searchValue = searchInput.value.toLowerCase().trim();
    const sortValue = sortBy.value;

    let filteredProducts = allProductsData.filter((product) => {
      if (searchValue && !product.name.toLowerCase().includes(searchValue))
        return false;
      if (availabilityValue === "in-stock" && !product.available) return false;
      if (tipeValue !== "all" && product.tipe !== tipeValue) return false;
      if (categoryValue !== "all" && product.category !== categoryValue)
        return false;
      if (collectionValue !== "all" && product.collection !== collectionValue)
        return false;
      return true;
    });

    filteredProducts.sort((a, b) => {
      switch (sortValue) {
        case "date-asc":
          return a.date - b.date;
        case "coming-soon":
          if (a.available !== b.available) return a.available - b.available;
          return b.date - a.date;
        case "date-desc":
        default:
          return b.date - a.date;
      }
    });

    const totalProducts = filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    currentPage = Math.max(1, Math.min(currentPage, totalPages || 1));

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToRender = filteredProducts.slice(startIndex, endIndex);

    catalogGrid.innerHTML = "";
    if (productsToRender.length === 0) {
      catalogGrid.innerHTML =
        "<p style='text-align: center; width: 100%; grid-column: 1 / -1;'>Produk tidak ditemukan.</p>";
    } else {
      productsToRender.forEach((product) => {
        const productHTML = `
          <a href="detail-barang.html?id=${product.id}" class="product-item-catalog" data-id="${product.id}">
            <span class="wishlist-icon"><i class="far fa-heart"></i><i class="fas fa-heart"></i></span>
            <img src="${product.images[0]}" alt="${product.name}" loading="lazy"/>
            <p class="product-code">${product.name}</p>
          </a>`;
        catalogGrid.insertAdjacentHTML("beforeend", productHTML);
      });
    }

    productCount.textContent = `${totalProducts} products`;

    renderPagination(totalPages, currentPage, (page) => {
      currentPage = page;
      renderProducts();
      catalogGrid.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function renderPagination(totalPages, currentPage, onPageClick) {
    if (!paginationControls) return;
    paginationControls.innerHTML = "";
    if (totalPages <= 1) return;

    const createPageButton = (page) => {
      const pageButton = document.createElement("button");
      pageButton.textContent = page;
      if (page === currentPage) pageButton.classList.add("active");
      pageButton.addEventListener("click", () => onPageClick(page));
      paginationControls.appendChild(pageButton);
    };
    const createEllipsis = () => {
      const ellipsis = document.createElement("span");
      ellipsis.textContent = "...";
      ellipsis.classList.add("pagination-ellipsis");
      paginationControls.appendChild(ellipsis);
    };

    const prevButton = document.createElement("button");
    prevButton.textContent = "Prev";
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener("click", () => {
      if (currentPage > 1) onPageClick(currentPage - 1);
    });
    paginationControls.appendChild(prevButton);

    const siblingCount = 1;
    let lastPageRendered = 0;
    for (let i = 1; i <= totalPages; i++) {
      const shouldShowPage =
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - siblingCount && i <= currentPage + siblingCount);
      if (shouldShowPage) {
        const gap = i - lastPageRendered;
        if (gap > 1) {
          if (gap === 2) createPageButton(i - 1);
          else createEllipsis();
        }
        createPageButton(i);
        lastPageRendered = i;
      }
    }

    const nextButton = document.createElement("button");
    nextButton.textContent = "Next";
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener("click", () => {
      if (currentPage < totalPages) onPageClick(currentPage + 1);
    });
    paginationControls.appendChild(nextButton);

    const skipInput = document.createElement("input");
    skipInput.type = "number";
    skipInput.placeholder = `... (1-${totalPages})`;
    skipInput.min = "1";
    skipInput.max = totalPages;
    skipInput.classList.add("pagination-skip-input");
    const skipButton = document.createElement("button");
    skipButton.textContent = "Go";
    skipButton.classList.add("pagination-skip-button");
    const handleSkip = () => {
      const pageNum = parseInt(skipInput.value, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages)
        onPageClick(pageNum);
      else skipInput.value = "";
    };
    skipButton.addEventListener("click", handleSkip);
    skipInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSkip();
      }
    });
    paginationControls.appendChild(skipInput);
    paginationControls.appendChild(skipButton);
  }

  function onFilterChange() {
    currentPage = 1;
    renderProducts();
  }

  availabilityFilter.addEventListener("change", onFilterChange);
  tipeFilter.addEventListener("change", onFilterChange);
  categoryFilter.addEventListener("change", onFilterChange);
  collectionFilter.addEventListener("change", onFilterChange);
  sortBy.addEventListener("change", onFilterChange);
  searchInput.addEventListener("input", onFilterChange);
  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      onFilterChange();
      searchInput.blur();
    });
  }

  renderProducts();
}

/**
 * Fungsi Halaman Detail Produk
 */
function renderProductDetail(productDetailGrid, allProductsData) {
  // Anda bisa mengisi ini nanti saat membuat detail-barang.html
}

// ==========================================================
// FUNGSI KHUSUS HALAMAN ARTIKEL
// ==========================================================
async function initializeAppArticlePages() {
  // Anda bisa mengisi ini nanti saat membuat list-artikel.html
}

// ==========================================================
// FUNGSI BARU UNTUK HOMEPAGE (INDEX.HTML)
// ==========================================================

/**
 * Memuat produk unggulan di halaman utama (index.html)
 */
async function loadFeaturedProducts() {
  // --- Ganti ID ini dengan 4 produk favorit Anda ---
  // Saya ambil 4 produk dari JSON Anda sebagai contoh
  const featuredProductIDs = [
    "product-1", // -> Kebaya Pria Klasik Merah Maroon
    "product-13", // -> Kebaya Wanita
    "product-2", // -> Beskap Pria Modern Putih Gading
    "product-14", // -> Kebaya Wanita (lainnya)
  ];

  const grid = document.getElementById("featured-products-grid");
  if (!grid) return;

  try {
    const response = await fetch("products.json");
    const allProducts = await response.json();

    const featuredProducts = featuredProductIDs.map((id) => {
      return allProducts.find((product) => product.id === id);
    });

    grid.innerHTML = ""; // Kosongkan placeholder "Memuat..."

    featuredProducts.forEach((product) => {
      if (!product) {
        console.warn(`Produk unggulan dengan ID ${product} tidak ditemukan.`);
        return;
      }

      // Link, Gambar, dan Nama dibuat otomatis dari data JSON
      const productHTML = `
        <a href="i-catalog.html?kategori=${product.category}" class="product-item">
          <span class="wishlist-icon">
            <i class="far fa-heart"></i>
          </span>
          <img src="${product.images[0]}" alt="${product.name}" loading="lazy" />
          <p class="product-name">${product.name}</p>
        </a>
      `;

      grid.insertAdjacentHTML("beforeend", productHTML);
    });
  } catch (error) {
    console.error("Gagal memuat produk unggulan:", error);
    grid.innerHTML = "<p>Gagal memuat produk unggulan.</p>";
  }
}
