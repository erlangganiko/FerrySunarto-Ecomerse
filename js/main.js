// ==========================================================
// INISIALISASI UTAMA
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Jalankan fitur umum (Navbar, Menu, Footer, Search)
  initializeCommonFeatures();

  // 2. Cek apakah kita di Halaman Homepage
  if (document.querySelector(".hero-static")) {
    loadFeaturedProducts();
  }

  // 3. Cek apakah kita di Halaman Katalog
  if (document.querySelector(".catalog-section")) {
    initializeAppProductPages();
  }

  // 4. Cek apakah kita di Halaman Detail
  //    (Kita gunakan '.product-main' karena itu unik untuk detail-barang.html)
  if (document.querySelector(".product-main")) {
    initializeProductDetail();
  }
});

// ==========================================================
// PRELOADER LOGIC
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
      // Di halaman katalog atau detail, navbar SELALU 'scrolled'
      if (
        document.querySelector(".catalog-section") ||
        document.querySelector(".product-main") // Tambahkan cek halaman detail
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

  // --- Update Wishlist Counter di Header ---
  updateWishlistCounter();
}

// ==========================================================
// FUNGSI KHUSUS HALAMAN PRODUK (KATALOG)
// ==========================================================

/**
 * Memulai logika untuk halaman Katalog (Fetch, Populate, Render).
 */
async function initializeAppProductPages() {
  const catalogGrid = document.querySelector(".product-grid-catalog");

  // Jika tidak ada grid katalog, keluar
  if (!catalogGrid) {
    return;
  }

  try {
    const response = await fetch("products.json"); // Memuat JSON Anda
    if (!response.ok) throw new Error("Gagal memuat data produk");
    const allProductsData = await response.json();

    // Jalankan logika katalog
    populateFilters(allProductsData);
    renderProductCatalog(catalogGrid, allProductsData);
  } catch (error) {
    console.error("Error memuat data produk:", error);
    if (catalogGrid) {
      catalogGrid.innerHTML = "<p>Gagal memuat produk. Coba lagi nanti.</p>";
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
  const productsPerPage = 8;

  // Perbaikan URL Filter
  const params = new URLSearchParams(window.location.search);

  const tipeFromURL = params.get("tipe");
  if (tipeFromURL && tipeFilter) {
    tipeFilter.value = tipeFromURL;
  }
  const kategoriFromURL = params.get("kategori");
  if (kategoriFromURL && categoryFilter) {
    categoryFilter.value = kategoriFromURL;
  }

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

// ==========================================================
// FUNGSI UNTUK HOMEPAGE (INDEX.HTML)
// ==========================================================

/**
 * Memuat produk unggulan di halaman utama (index.html)
 */
async function loadFeaturedProducts() {
  // --- Ganti ID ini dengan 4 produk favorit Anda ---
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

// ==========================================================
// FUNGSI BARU UNTUK HALAMAN DETAIL (detail-barang.html)
// ==========================================================

/**
 * Memulai logika untuk halaman Detail Produk (mengambil ID dari URL).
 */
async function initializeProductDetail() {
  // Ambil elemen utama sebagai penanda
  const productMain = document.querySelector(".product-main");
  if (!productMain) return;

  try {
    // 1. Ambil 'id' dari parameter URL
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    if (!productId) {
      throw new Error("ID Produk tidak ditemukan di URL.");
    }

    // 2. Ambil semua data produk dari JSON
    const response = await fetch("products.json"); //
    if (!response.ok) throw new Error("Gagal memuat data produk.");
    const allProductsData = await response.json(); //

    // 3. Cari produk yang sesuai dengan ID
    const product = allProductsData.find((p) => p.id === productId);

    if (!product) {
      throw new Error(`Produk dengan ID "${productId}" tidak ditemukan.`);
    }

    // 4. Jika produk ditemukan, render datanya ke halaman
    renderProductDetail(product);

    // --- LOGIKA TAB BARU ---
    const tabLinks = document.querySelectorAll(".tab-link");
    const tabContents = document.querySelectorAll(".tab-content");

    tabLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const tabId = link.getAttribute("data-tab"); // misal: "tab-deskripsi"

        // 1. Nonaktifkan semua link
        tabLinks.forEach((item) => item.classList.remove("active"));

        // 2. Nonaktifkan semua konten
        tabContents.forEach((item) => item.classList.remove("active"));

        // 3. Aktifkan link yang di-klik
        link.classList.add("active");

        // 4. Aktifkan konten yang sesuai
        document.getElementById(tabId).classList.add("active");
      });
    });
    // --- AKHIR LOGIKA TAB ---

    // --- LOGIKA TOMBOL WHATSAPP ---
    const waButton = document.querySelector(".btn-whatsapp");
    if (waButton) {
      // --- (!! PENTING !!) GANTI NOMOR INI DENGAN NOMOR WA ANDA ---
      const waPhoneNumber = "6281234567890"; // Format: 62xxxx (tanpa + atau 0)

      // 1. Ambil detail produk dari variabel 'product' yang sudah ada
      const productName = product.name;
      const productCollection = capitalizeFirstLetter(product.collection);
      const productURL = window.location.href; // URL halaman saat ini

      // 2. Buat template pesan
      const messageTemplate = `Halo, saya tertarik dengan produk Anda:

Koleksi: ${productCollection}
Produk: ${productName}
Link: ${productURL}

Bisakah saya mendapatkan informasi lebih lanjut? Terima kasih.`;

      // 3. Encode pesan untuk URL (agar spasi dan baris baru berfungsi)
      const encodedMessage = encodeURIComponent(messageTemplate);

      // 4. Buat URL final
      const waURL = `https://wa.me/${waPhoneNumber}?text=${encodedMessage}`;

      // 5. Tambahkan event listener ke tombol
      waButton.addEventListener("click", () => {
        window.open(waURL, "_blank"); // Buka di tab baru
      });
    }
    // --- AKHIR LOGIKA WHATSAPP ---

    // --- LOGIKA MODAL APPOINTMENT ---
    const apptButton = document.querySelector(".btn-appointment");
    const modalOverlay = document.getElementById("appointment-modal");
    const closeButton = document.getElementById("appointment-close-btn");
    const apptForm = document.getElementById("appointment-form");

    if (apptButton && modalOverlay && closeButton && apptForm) {
      const openModal = (e) => {
        e.preventDefault(); // Mencegah perilaku default
        modalOverlay.classList.add("show");
        document.body.style.overflow = "hidden"; // Mencegah body scroll
      };

      const closeModal = () => {
        modalOverlay.classList.remove("show");
        document.body.style.overflow = "auto"; // Mengembalikan body scroll
      };

      // 1. Klik tombol "APPOINTMENT" untuk membuka modal
      apptButton.addEventListener("click", openModal);

      // 2. Klik tombol close (X) untuk menutup modal
      closeButton.addEventListener("click", closeModal);

      // 3. Klik di luar area modal (di background) untuk menutup
      modalOverlay.addEventListener("click", (e) => {
        // Cek jika yang diklik adalah overlay-nya, bukan konten di dalamnya
        if (e.target === modalOverlay) {
          closeModal();
        }
      });

      // 4. Handle saat form di-submit
      apptForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Mencegah form me-reload halaman

        // Ambil data dari form
        const name = document.getElementById("appt-name").value;
        const email = document.getElementById("appt-email").value;

        // Tampilkan pesan sukses (Contoh)
        // Di aplikasi nyata, Anda akan mengirim data ini ke server
        alert(
          `Terima kasih, ${name}!\n\nPermintaan appointment Anda telah terkirim. Kami akan segera menghubungi Anda di ${email}.`
        );

        // Reset form setelah submit
        apptForm.reset();

        // Tutup modal
        closeModal();
      });
    }
    // --- AKHIR LOGIKA MODAL ---

    // --- LOGIKA TOMBOL FAVORITE ---
    const favoriteButton = document.querySelector(".btn-favorite");
    // 'productId' sudah kita dapatkan di bagian atas fungsi ini

    if (favoriteButton && productId) {
      // Fungsi lokal untuk update tampilan tombol
      const updateButtonVisuals = () => {
        if (isItemInWishlist(productId)) {
          favoriteButton.textContent = "REMOVE FROM LOOKBAG";
          favoriteButton.classList.add("active");
        } else {
          favoriteButton.textContent = "SAVE TO LOOKBAG";
          favoriteButton.classList.remove("active");
        }
      };

      // 1. Atur tampilan tombol saat halaman dimuat
      updateButtonVisuals();

      // 2. Tambahkan event klik pada tombol
      favoriteButton.addEventListener("click", () => {
        // Cek status saat ini
        if (isItemInWishlist(productId)) {
          // Jika sudah ada, hapus
          removeItemFromWishlist(productId);
        } else {
          // Jika belum ada, tambahkan
          addItemToWishlist(productId);
        }

        // 3. Update tampilan tombol lagi
        updateButtonVisuals();

        // 4. Update counter di header
        updateWishlistCounter();
      });
    }
    // --- AKHIR LOGIKA FAVORITE ---
  } catch (error) {
    console.error("Error memuat detail produk:", error);
    // Tampilkan pesan error di halaman
    productMain.innerHTML = `<p style='text-align: center; width: 100%; padding: 5rem 0;'>Gagal memuat detail produk. ${error.message}</p>`;
  }
}

/**
 * [DIMODIFIKASI]
 * Mengisi halaman detail-barang.html dengan data.
 * Logika galeri utama sekarang hanya untuk membuka modal.
 */
function renderProductDetail(product) {
  // 1. Update Judul Halaman dan Nama Produk (DARI ORIGINAL)
  document.title = product.name;
  const titleElement = document.querySelector(".product-title h1");
  const subtitleElement = document.querySelector(".product-title p");

  // SESUAI PERMINTAAN:
  if (titleElement) {
    // JUDUL (H1) diisi oleh Collection
    titleElement.textContent = capitalizeFirstLetter(product.collection);
  }
  if (subtitleElement) {
    // SUBJUDUL (P) diisi oleh Nama Produk
    subtitleElement.textContent = product.name;
  }

  // 2. Update Deskripsi Produk (DARI ORIGINAL)
  // (Sekarang berada di dalam tab-deskripsi)
  const descriptionElement = document.querySelector(".product-description p");
  if (descriptionElement) descriptionElement.textContent = product.description; //

  // 3. Update Spesifikasi (DARI ORIGINAL)
  // (Sekarang berada di dalam tab-spesifikasi)
  const specsElement = document.querySelector(".product-sizes");
  if (specsElement) {
    specsElement.innerHTML = ""; // Kosongkan placeholder statis
    if (product.specifications && product.specifications.length > 0) {
      //
      product.specifications.forEach((spec) => {
        const p = document.createElement("p");
        p.textContent = spec;
        specsElement.appendChild(p);
      });
    } else {
      specsElement.innerHTML = "<p>Spesifikasi tidak tersedia.</p>";
    }
  }

  // 4. Update Galeri Gambar (DIMODIFIKASI UNTUK MODAL)
  const mainImageWrapper = document.querySelector(".main-image-wrapper");
  const thumbnailGallery = document.querySelector(".thumbnail-gallery");

  if (
    mainImageWrapper &&
    thumbnailGallery &&
    product.images &&
    product.images.length > 0
  ) {
    // Hapus placeholder statis
    mainImageWrapper.innerHTML = ""; // Ini yang menghapus panah
    thumbnailGallery.innerHTML = "";

    let currentImageIndex = 0; // Untuk melacak gambar yang sedang aktif

    // Buat gambar utama
    const mainImage = document.createElement("img");
    mainImage.src = product.images[currentImageIndex]; // Set gambar pertama
    mainImage.alt = product.name;
    // [MODIFIKASI] Tambahkan cursor pointer untuk menandakan bisa diklik
    mainImage.style.cssText =
      "width: 100%; height: 100%; object-fit: cover; cursor: pointer;";

    // --- [BARU] LOGIKA BUKA MODAL ---
    mainImage.addEventListener("click", () => {
      // Panggil fungsi setup modal baru
      setupModalGallery(product.images, currentImageIndex);
    });
    // --- [AKHIR BARU] ---

    // -- BUAT ULANG PANAH KIRI --
    const arrowLeft = document.createElement("button");
    arrowLeft.className = "nav-arrow arrow-left"; // Ambil style dari CSS
    arrowLeft.innerHTML = "&lt;"; // Karakter '<'

    // -- BUAT ULANG PANAH KANAN --
    const arrowRight = document.createElement("button");
    arrowRight.className = "nav-arrow arrow-right"; // Ambil style dari CSS
    arrowRight.innerHTML = "&gt;"; // Karakter '>'

    // -- MASUKKAN SEMUA KE WRAPPER --
    mainImageWrapper.appendChild(mainImage);
    mainImageWrapper.appendChild(arrowLeft);
    mainImageWrapper.appendChild(arrowRight);

    // -- Fungsi untuk update gambar (HANYA di halaman utama) --
    const updateMainImage = (index) => {
      mainImage.src = product.images[index];
    };

    // -- FUNGSI PANAH KIRI (Halaman Utama) --
    arrowLeft.addEventListener("click", () => {
      currentImageIndex--;
      if (currentImageIndex < 0) {
        currentImageIndex = product.images.length - 1; // Kembali ke akhir
      }
      updateMainImage(currentImageIndex);
    });

    // -- FUNGSI PANAH KANAN (Halaman Utama) --
    arrowRight.addEventListener("click", () => {
      currentImageIndex++;
      if (currentImageIndex >= product.images.length) {
        currentImageIndex = 0; // Kembali ke awal
      }
      updateMainImage(currentImageIndex);
    });

    // Buat gambar thumbnail (Halaman Utama)
    product.images.forEach((imgSrc, index) => {
      const thumbWrapper = document.createElement("div");
      thumbWrapper.className = "thumbnail";

      const thumbImage = document.createElement("img");
      thumbImage.src = imgSrc;
      thumbImage.alt = "Thumbnail";
      thumbImage.style.cssText =
        "width: 100%; height: 100%; object-fit: cover; cursor: pointer;";

      // Tambahkan event 'click' pada thumbnail
      thumbImage.addEventListener("click", () => {
        currentImageIndex = index; // Update index saat thumbnail diklik
        updateMainImage(currentImageIndex); // Ganti gambar utama
      });

      thumbWrapper.appendChild(thumbImage);
      thumbnailGallery.appendChild(thumbWrapper);
    });

    // Sembunyikan panah jika hanya ada 1 gambar
    if (product.images.length <= 1) {
      arrowLeft.style.display = "none";
      arrowRight.style.display = "none";
    }
  }
}

/**
 * [FUNGSI BARU, DIMODIFIKASI UNTUK HILANGKAN THUMBNAIL]
 * Menginisialisasi dan menampilkan modal galeri gambar dengan fungsionalitas zoom & pan.
 * @param {string[]} imagesArray Array URL gambar produk.
 * @param {number} initialIndex Index gambar yang akan ditampilkan pertama kali di modal.
 */
function setupModalGallery(imagesArray, initialIndex) {
  // Ambil elemen-elemen modal dari HTML
  const modal = document.getElementById("imageModal");
  const modalImage = modal.querySelector(".modal-image");
  const closeButton = modal.querySelector(".close-button");
  const modalArrowLeft = modal.querySelector(".modal-arrow-left");
  const modalArrowRight = modal.querySelector(".modal-arrow-right");
  // const modalThumbnailsContainer = modal.querySelector(".modal-thumbnails"); // <-- [DIHAPUS]
  const modalContentWrapper = modal.querySelector(".modal-content-wrapper");

  if (
    !modal ||
    !modalImage ||
    !closeButton ||
    !modalArrowLeft ||
    !modalArrowRight ||
    // !modalThumbnailsContainer || // <-- [DIHAPUS]
    !modalContentWrapper
  ) {
    console.error("Elemen modal tidak ditemukan!");
    return;
  }

  let currentModalImageIndex = initialIndex;

  // --- LOGIKA ZOOM & PAN (DI DALAM MODAL) ---
  let isZoomed = false;
  let isDragging = false;
  let startX, startY;
  let translateX = 0,
    translateY = 0;
  let lastTranslateX = 0,
    lastTranslateY = 0;
  const zoomScale = 2; // Skala zoom

  function applyModalTransform() {
    // Dapatkan batas clamp (batas geser)
    const imgWidth = modalImage.offsetWidth;
    const imgHeight = modalImage.offsetHeight;
    const wrapperWidth = modalContentWrapper.offsetWidth;
    const wrapperHeight = modalContentWrapper.offsetHeight;

    // Hitung seberapa banyak gambar 'lebih' dari wrapper saat di-zoom
    const maxTranslateX = Math.max(
      0,
      (imgWidth * zoomScale - wrapperWidth) / 2
    );
    const maxTranslateY = Math.max(
      0,
      (imgHeight * zoomScale - wrapperHeight) / 2
    );

    if (isZoomed) {
      // Batasi (clamp) nilai translate agar tidak keluar batas
      translateX = Math.max(
        -maxTranslateX,
        Math.min(maxTranslateX, translateX)
      );
      translateY = Math.max(
        -maxTranslateY,
        Math.min(maxTranslateY, translateY)
      );

      modalImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomScale})`;
      modalImage.style.objectFit = "contain"; // Gunakan 'contain' saat zoom
      modalContentWrapper.classList.add("is-zoomed"); // Tambahkan class ke wrapper
    } else {
      // Reset jika tidak di-zoom
      translateX = 0;
      translateY = 0;
      modalImage.style.transform = "translate(0, 0) scale(1)";
      modalImage.style.objectFit = "contain"; // Default 'contain'
      modalContentWrapper.classList.remove("is-zoomed"); // Hapus class dari wrapper
    }
  }

  function resetModalZoomAndPan() {
    isZoomed = false;
    isDragging = false;
    translateX = 0;
    translateY = 0;
    lastTranslateX = 0;
    lastTranslateY = 0;
    modalImage.classList.remove("zoomed", "grabbing");
    modalImage.style.cursor = "zoom-in";
    applyModalTransform(); // Terapkan reset
  }

  // Klik untuk Zoom In / Zoom Out
  modalImage.addEventListener("click", (e) => {
    if (isDragging) {
      return;
    }

    isZoomed = !isZoomed;

    if (isZoomed) {
      modalImage.classList.add("zoomed");
      modalImage.style.cursor = "grab";
      modalImage.style.transformOrigin = `center center`;
    } else {
      resetModalZoomAndPan(); // Panggil fungsi reset
    }
    applyModalTransform();
  });

  // Mulai Geser (Drag)
  modalImage.addEventListener("mousedown", (e) => {
    if (!isZoomed) return; // Hanya bisa geser saat di-zoom

    e.preventDefault(); // Mencegah drag gambar default browser
    isDragging = true; // Set 'isDragging' saat mousedown
    modalImage.classList.add("grabbing");
    modalImage.style.cursor = "grabbing";

    // Posisi awal mouse
    startX = e.clientX;
    startY = e.clientY;

    // Simpan posisi translate terakhir
    lastTranslateX = translateX;
    lastTranslateY = translateY;
  });

  // Menggeser
  modalContentWrapper.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // Hitung translate baru
    translateX = lastTranslateX + dx;
    translateY = lastTranslateY + dy;

    applyModalTransform(); // Terapkan pergeseran
  });

  // Berhenti Geser
  const stopDragging = (e) => {
    const moved = e.clientX !== startX || e.clientY !== startY;
    
    if (!isDragging) return;

    if (!moved && isZoomed) {
      isDragging = false;
    } else {
      setTimeout(() => {
        isDragging = false;
      }, 0);
    }
    
    isDragging = false; 
    modalImage.classList.remove("grabbing");
    if (isZoomed) {
      modalImage.style.cursor = "grab";
    } else {
      modalImage.style.cursor = "zoom-in";
    }
  };

  modalContentWrapper.addEventListener("mouseup", stopDragging);
  modalContentWrapper.addEventListener("mouseleave", stopDragging);
  // --- AKHIR LOGIKA ZOOM & PAN ---

  // Fungsi untuk menampilkan gambar di modal
  const showModalImage = (index) => {
    currentModalImageIndex = index;
    modalImage.src = imagesArray[currentModalImageIndex];
    resetModalZoomAndPan(); // Reset zoom setiap ganti gambar di modal

    // [DIHAPUS] Logika update thumbnail aktif
    
    // Sembunyikan panah jika hanya ada 1 gambar di modal
    if (imagesArray.length <= 1) {
      modalArrowLeft.style.display = "none";
      modalArrowRight.style.display = "none";
    } else {
      modalArrowLeft.style.display = "flex";
      modalArrowRight.style.display = "flex";
    }
  };

  // Fungsi untuk menutup modal
  const closeModal = () => {
    modal.classList.remove("active");
    document.body.style.overflow = "auto"; // Kembalikan scroll body
    resetModalZoomAndPan();
    // modalThumbnailsContainer.innerHTML = ""; // <-- [DIHAPUS]
    
    // Hapus event listener global agar tidak menumpuk
    document.removeEventListener("keydown", handleKeydown);
  };

  // Event listener untuk tombol close
  closeButton.onclick = closeModal;

  // Event listener untuk klik di luar gambar modal (di background)
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  // Event listener untuk panah navigasi modal
  modalArrowLeft.onclick = () => {
    currentModalImageIndex--;
    if (currentModalImageIndex < 0) {
      currentModalImageIndex = imagesArray.length - 1;
    }
    showModalImage(currentModalImageIndex);
  };

  modalArrowRight.onclick = () => {
    currentModalImageIndex++;
    if (currentModalImageIndex >= imagesArray.length) {
      currentModalImageIndex = 0;
    }
    showModalImage(currentModalImageIndex);
  };

  // Navigasi dengan keyboard (Esc, Panah Kiri, Panah Kanan)
  const handleKeydown = (e) => {
    if (e.key === "Escape") {
      closeModal();
    } else if (e.key === "ArrowLeft") {
      modalArrowLeft.onclick(); // Panggil fungsi klik panah
    } else if (e.key === "ArrowRight") {
      modalArrowRight.onclick(); // Panggil fungsi klik panah
    }
  };
  document.addEventListener("keydown", handleKeydown);


  // [DIHAPUS] Logika pembuatan thumbnail
  
  // Tampilkan modal dan gambar awal
  modal.classList.add("active");
  document.body.style.overflow = "hidden"; // Hentikan scroll body
  showModalImage(currentModalImageIndex);
}

// ==========================================================
// FUNGSI HELPER UNTUK WISHLIST (LOCALSTORAGE)
// ==========================================================

/**
 * Mengambil daftar wishlist dari localStorage
 * @returns {string[]} Array berisi ID produk
 */
function getWishlist() {
  const list = localStorage.getItem("wishlist");
  return list ? JSON.parse(list) : [];
}

/**
 * Menyimpan daftar wishlist ke localStorage
 * @param {string[]} list Array berisi ID produk
 */
function saveWishlist(list) {
  localStorage.setItem("wishlist", JSON.stringify(list));
}

/**
 * Menambahkan item ke wishlist
 * @param {string} productId ID produk yang akan ditambahkan
 */
function addItemToWishlist(productId) {
  const list = getWishlist();
  if (!list.includes(productId)) {
    list.push(productId);
    saveWishlist(list);
  }
}

/**
 * Menghapus item dari wishlist
 * @param {string} productId ID produk yang akan dihapus
 */
function removeItemFromWishlist(productId) {
  let list = getWishlist();
  list = list.filter((id) => id !== productId);
  saveWishlist(list);
}

/**
 * Cek apakah item ada di wishlist
 * @param {string} productId ID produk yang akan dicek
 * @returns {boolean} True jika ada, false jika tidak
 */
function isItemInWishlist(productId) {
  const list = getWishlist();
  return list.includes(productId);
}

/**
 * Memperbarui angka counter di ikon hati (header)
 */
function updateWishlistCounter() {
  const list = getWishlist();
  const countElement = document.querySelector(".wishlist-count");

  if (countElement) {
    countElement.textContent = list.length;
    if (list.length > 0) {
      countElement.classList.add("show");
    } else {
      countElement.classList.remove("show");
    }
  }
}
