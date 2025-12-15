// ==========================================================
// INISIALISASI UTAMA
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Jalankan fitur umum (Navbar, Menu, Footer, Search)
  initializeCommonFeatures();

  // 2. Cek apakah kita di Halaman Homepage (index.html)
  if (document.querySelector(".hero-static")) {
    loadFeaturedProducts();
    if (document.querySelector(".news-grid")) {
      loadFeaturedArticles();
    }
  }

  // 3. Cek apakah kita di Halaman Transisi (transition/transition.html)
  if (document.querySelector(".transition-grid")) {
    initializeTransitionPage();
  }

  // 4. Cek apakah kita di Halaman Katalog (i-catalog/i-catalog.html)
  // Pastikan bukan halaman transisi
  if (
    document.querySelector(".catalog-section") &&
    !document.querySelector(".transition-grid")
  ) {
    initializeAppProductPages();
  }

  // 5. Cek apakah kita di Halaman Detail Produk (i-catalog/detail-barang/detail-barang.html)
  if (document.querySelector(".product-main")) {
    initializeProductDetail();
  }

  // 6. Cek apakah kita di Halaman List Artikel (artikel/list-artikel.html)
  if (document.querySelector(".list-article-page")) {
    loadAllArticles();
  }

  // 7. Cek apakah kita di Halaman Detail Artikel (artikel/detail-artikel.html)
  if (document.querySelector(".article-page")) {
    loadArticleDetail();
  }
});

// ==========================================================
// PRELOADER LOGIC
// ==========================================================
window.onload = function () {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  if (sessionStorage.getItem("hasVisited")) {
    preloader.style.transition = "none";
    preloader.classList.add("hidden");
  } else {
    setTimeout(() => {
      preloader.classList.add("hidden");
    }, 1500);
    sessionStorage.setItem("hasVisited", "true");
  }
};

// ==========================================================
// FUNGSI UMUM (Gabungan & Helpers)
// ==========================================================

function capitalizeFirstLetter(string) {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function getUniqueCollectionsByTipe(products) {
  const collections = {
    pria: new Set(),
    wanita: new Set(),
  };

  products.forEach((product) => {
    // LOGIKA BARU: Hanya proses produk yang memiliki gambar
    if (!product.images || product.images.length === 0) return;

    const tipe = product.tipe;
    const collection = product.collection;
    if (tipe && collection) {
      if (tipe === "pria") collections.pria.add(collection);
      if (tipe === "wanita") collections.wanita.add(collection);
    }
  });

  return collections;
}

async function initializeMenuCollections() {
  const womenMenuItem = document.querySelector(
    '.main-menu li[data-tipe="wanita"]'
  );
  const menMenuItem = document.querySelector('.main-menu li[data-tipe="pria"]');

  if (!womenMenuItem || !menMenuItem) return;

  try {
    const response = await fetch("/products.json");
    if (!response.ok) throw new Error("Gagal memuat data produk untuk menu.");
    const allProductsData = await response.json();

    const collections = getUniqueCollectionsByTipe(allProductsData);

    function createSubmenu(tipe, collectionsSet, menuItem) {
      const ul = document.createElement("ul");
      ul.className = "footer-submenu submenu-dynamic";

      ul.insertAdjacentHTML(
        "beforeend",
        `<li><a href="/transition/transition.html?tipe=${tipe}">All Collections</a></li>`
      );

      [...collectionsSet].sort().forEach((collection) => {
        const capitalizedCollection = capitalizeFirstLetter(collection);

        // LOGIKA CEK DUPLIKAT 'COLLECTION'
        const collectionSuffix = collection.toLowerCase().includes("collection")
          ? ""
          : " Collection";
        const displayText = capitalizedCollection + collectionSuffix;
        // End LOGIKA CEK DUPLIKAT

        // Gunakan encodeURIComponent untuk menangani spasi di URL
        ul.insertAdjacentHTML(
          "beforeend",
          `<li><a href="/i-catalog/i-catalog.html?tipe=${tipe}&collection=${encodeURIComponent(
            collection
          )}">${displayText}</a></li>`
        );
      });
      menuItem.appendChild(ul);

      const mainLink = menuItem.querySelector("a");
      mainLink.removeAttribute("href");

      const icon = mainLink.querySelector(".fa-chevron-right");
      if (icon) {
        icon.classList.remove("fa-chevron-right");
        icon.classList.add("fa-chevron-down");
      }

      mainLink.addEventListener("click", (e) => {
        e.preventDefault();
        ul.classList.toggle("open");
        mainLink.classList.toggle("active");
        menuItem.classList.toggle("open");
        if (icon) icon.classList.toggle("fa-rotate-180");
      });
    }

    createSubmenu("wanita", collections.wanita, womenMenuItem);
    createSubmenu("pria", collections.pria, menMenuItem);
  } catch (error) {
    console.error("Error membangun menu koleksi:", error);
  }
}

function initializeCommonFeatures() {
  // --- NAVBAR SCROLL ---
  const navbar = document.getElementById("navbar");
  const logoImage = navbar ? navbar.querySelector(".nav-logo img") : null;

  if (navbar) {
    const defaultLogo = logoImage ? logoImage.dataset.logoDefault : null;
    const scrolledLogo = logoImage ? logoImage.dataset.logoScrolled : null;
    let lastScrollY = window.scrollY;

    const updateNavbar = () => {
      const currentScrollY = window.scrollY;
      const isScrolled = currentScrollY > 50;

      if (
        document.querySelector(".catalog-section") ||
        document.querySelector(".product-main") ||
        document.querySelector(".transition-grid") ||
        document.querySelector(".list-article-page") ||
        document.querySelector(".article-page")
      ) {
        navbar.classList.add("scrolled");
        if (logoImage && scrolledLogo) {
          logoImage.src =
            scrolledLogo.startsWith("/") || scrolledLogo.startsWith("http")
              ? scrolledLogo
              : "/" + scrolledLogo;
        }
      } else {
        if (isScrolled) {
          navbar.classList.add("scrolled");
          if (logoImage && scrolledLogo) {
            logoImage.src =
              scrolledLogo.startsWith("/") || scrolledLogo.startsWith("http")
                ? scrolledLogo
                : "/" + scrolledLogo;
          }
        } else {
          navbar.classList.remove("scrolled");
          if (logoImage && defaultLogo) {
            logoImage.src =
              defaultLogo.startsWith("/") || defaultLogo.startsWith("http")
                ? defaultLogo
                : "/" + defaultLogo;
          }
        }
      }

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        navbar.classList.add("hidden");
      } else {
        navbar.classList.remove("hidden");
      }
      lastScrollY = currentScrollY;
    };

    updateNavbar();
    window.addEventListener("scroll", updateNavbar);
  }

  // --- MENU TOGGLE ---
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

  // --- FOOTER ACCORDION ---
  const footerToggles = document.querySelectorAll(".footer-toggle");
  footerToggles.forEach((toggle) => {
    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      const submenu = toggle.nextElementSibling;
      toggle.classList.toggle("active");
      if (submenu) submenu.classList.toggle("open");
    });
  });

  // --- SEARCH OVERLAY ---
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

  updateWishlistCounter();
  initializeMenuCollections();
}

// ==========================================================
// FUNGSI KHUSUS HALAMAN TRANSISI (transition/transition.html)
// ==========================================================

async function initializeTransitionPage() {
  const transitionGrid = document.getElementById("transition-grid");
  const transitionTitle = document.querySelector(".transition-title");

  try {
    const params = new URLSearchParams(window.location.search);
    const tipe = params.get("tipe");

    if (!tipe) {
      transitionGrid.innerHTML =
        "<p style='grid-column: 1 / -1; text-align: center; color: red;'>Error: Tipe produk tidak ditemukan di URL.</p>";
      return;
    }

    // --- MENGAMBIL DATA DARI products.json ---
    const response = await fetch("/products.json");
    if (!response.ok) throw new Error("Gagal memuat data produk.");
    const allProductsData = await response.json();

    const productsByTipe = allProductsData.filter((p) => p.tipe === tipe);

    // 1. Kumpulkan semua Collection dan Category unik beserta gambar pertama
    const uniqueCollections = {};
    const uniqueCategories = {};

    productsByTipe.forEach((product) => {
      // LOGIKA BARU: Hanya proses produk yang memiliki gambar
      if (!product.images || product.images.length === 0) return;

      if (product.collection && !uniqueCollections[product.collection]) {
        uniqueCollections[product.collection] = product.images[0];
      }
      if (product.category && !uniqueCategories[product.category]) {
        uniqueCategories[product.category] = product.images[0];
      }
    });

    const tilesToRender = [];

    // 2. Buat Collection Tiles
    Object.keys(uniqueCollections)
      .sort()
      .forEach((collectionName) => {
        const collectionValue = collectionName;
        const link = `/i-catalog/i-catalog.html?tipe=${tipe}&collection=${encodeURIComponent(
          collectionValue
        )}`;

        tilesToRender.push({
          name: collectionName,
          subtitle: "EXPLORE COLLECTION",
          image: uniqueCollections[collectionName],
          link: link,
          type: "collection",
        });
      });

    // 3. Buat Category Tiles
    Object.keys(uniqueCategories)
      .sort()
      .forEach((categoryName) => {
        const categoryValue = categoryName;
        const link = `/i-catalog/i-catalog.html?tipe=${tipe}&kategori=${encodeURIComponent(
          categoryValue
        )}`;

        tilesToRender.push({
          name: categoryName,
          subtitle: "SHOP CATEGORY",
          image: uniqueCategories[categoryName],
          link: link,
          type: "category",
        });
      });
    // --- END: MENGAMBIL DATA DARI products.json ---

    const typeLabel = tipe === "wanita" ? "WOMEN" : "MEN";
    transitionTitle.textContent = typeLabel;
    updateBreadcrumbs(tipe, "all", "transition");

    renderImageTiles(transitionGrid, tilesToRender);
  } catch (error) {
    console.error("Error memuat halaman transisi:", error);
    transitionGrid.innerHTML = `<p style='grid-column: 1 / -1; text-align: center; color: red;'>Gagal memuat data: ${error.message}</p>`;
  }
}

function renderImageTiles(container, tilesArray) {
  container.innerHTML = "";

  if (tilesArray.length === 0) {
    container.innerHTML =
      "<p style='grid-column: 1 / -1; text-align: center; color: #666;'>No collections or categories found.</p>";
    return;
  }

  tilesArray.forEach((item, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "transition-tile-wrapper";

    // Bersihkan path gambar
    let cleanImagePath = item.image.replace(/^\.\.\//, "");
    if (!cleanImagePath.startsWith("/")) {
      cleanImagePath = "/" + cleanImagePath;
    }

    const tileHTML = `
      <a href="${item.link}" class="transition-tile" data-index="${index}">
        <img src="${cleanImagePath}" alt="${item.name}" loading="lazy"/>
        <div class="transition-tile-content">
          <h2>${item.name}</h2>
          <p>${item.subtitle}</p>
        </div>
      </a>
    `;
    wrapper.innerHTML = tileHTML;
    container.appendChild(wrapper);
  });
}

// ==========================================================
// FUNGSI KHUSUS HALAMAN PRODUK (i-catalog/i-catalog.html)
// ==========================================================

async function initializeAppProductPages() {
  const catalogGrid = document.querySelector(".product-grid-catalog");
  if (!catalogGrid) return;

  try {
    const response = await fetch("/products.json");
    if (!response.ok) throw new Error("Gagal memuat data produk");
    const allProductsData = await response.json();

    populateFilters(allProductsData);
    renderProductCatalog(catalogGrid, allProductsData);
  } catch (error) {
    console.error("Error memuat data produk:", error);
    if (catalogGrid) {
      catalogGrid.innerHTML = "<p>Gagal memuat produk. Coba lagi nanti.</p>";
    }
  }
}

function parseCustomDate(dateString) {
  const datePart = dateString.split(" ")[0];
  const timePart = dateString.split(" ")[1].split("+")[0];
  const dateParts = datePart.split("-");
  const timeParts = timePart.split("-");
  return new Date(
    dateParts[2],
    dateParts[1] - 1,
    dateParts[0],
    timeParts[0],
    timeParts[1],
    timeParts[2]
  );
}

function populateFilters(products) {
  const tipeFilter = document.getElementById("filter-tipe");
  const categoryFilter = document.getElementById("filter-category");
  const collectionFilter = document.getElementById("filter-collection");

  const uniqueTipes = new Set();
  const uniqueCategories = new Set();
  const uniqueCollections = new Set();

  // Hanya mempopulasi filter dengan koleksi dari produk yang memiliki gambar
  const productsWithImages = products.filter(
    (p) => p.images && p.images.length > 0
  );

  productsWithImages.forEach((product) => {
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

function updateCatalogTitle(collectionValue) {
  const catalogTitle = document.querySelector(".catalog-title");
  if (catalogTitle) {
    if (collectionValue === "all") {
      catalogTitle.textContent = "Ready-to-Wear";
    } else {
      // Decode untuk menampilkan judul yang rapi (menghilangkan %20)
      const decodedCollection = decodeURIComponent(collectionValue);
      const capitalizedCollection = capitalizeFirstLetter(decodedCollection);

      // LOGIKA CEK DUPLIKAT 'COLLECTION'
      const collectionSuffix = decodedCollection
        .toLowerCase()
        .includes("collection")
        ? ""
        : " Collection";

      catalogTitle.textContent = `${capitalizedCollection}${collectionSuffix}`;
    }
  }
}

function updateBreadcrumbs(tipeValue, filterValue, currentPage = "catalog") {
  const breadcrumbs = document.querySelector(".breadcrumbs");
  if (!breadcrumbs) return;

  const tipeText =
    tipeValue === "wanita"
      ? "Women's Collection"
      : tipeValue === "pria"
      ? "Men's Collection"
      : null;

  let html = `<a href="/index.html">Home</a>`;

  if (tipeText) {
    const tipeLink = `/transition/transition.html?tipe=${tipeValue}`;

    if (currentPage === "transition") {
      html += ` / <span>${tipeText.replace("'s Collection", "")}</span>`;
    } else {
      html += ` / <a href="${tipeLink}">${tipeText}</a>`;
      if (filterValue !== "all") {
        const decodedFilter = decodeURIComponent(filterValue);

        // LOGIKA CEK DUPLIKAT 'COLLECTION'
        const filterSuffix = decodedFilter.toLowerCase().includes("collection")
          ? ""
          : " Collection";

        const filterText = `${capitalizeFirstLetter(
          decodedFilter
        )}${filterSuffix}`;
        html += ` / <span>${filterText}</span>`;
      }
    }
  } else {
    html += ` / <span>All Products</span>`;
  }

  breadcrumbs.innerHTML = html;
}

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

  const params = new URLSearchParams(window.location.search);

  const tipeFromURL = params.get("tipe");
  if (tipeFromURL && tipeFilter) {
    tipeFilter.value = tipeFromURL;
  }
  const categoryFromURL = params.get("kategori");
  if (categoryFromURL && categoryFilter) {
    // Decode dulu agar sesuai dengan value di <option>
    categoryFilter.value = decodeURIComponent(categoryFromURL);
  }

  const collectionFromURL = params.get("collection");
  if (collectionFromURL && collectionFilter) {
    // Decode dulu agar sesuai dengan value di <option>
    collectionFilter.value = decodeURIComponent(collectionFromURL);
  }

  function renderProducts() {
    const availabilityValue = availabilityFilter.value;
    const tipeValue = tipeFilter.value;
    const categoryValue = categoryFilter.value;
    const collectionValue = collectionFilter.value;
    const searchValue = searchInput.value.toLowerCase().trim();
    const sortValue = sortBy.value;

    const activeFilter =
      collectionValue !== "all" ? collectionValue : categoryValue;

    // LOGIKA BARU: Filter produk yang tidak memiliki gambar dari data awal
    let productsWithImages = allProductsData.filter(
      (product) => product.images && product.images.length > 0
    );

    updateCatalogTitle(collectionValue);
    updateBreadcrumbs(tipeValue, activeFilter, "catalog");

    let filteredProducts = productsWithImages.filter((product) => {
      // 1. Filter Sort
      if (sortValue === "coming-soon") {
        if (product.available === true) return false;
      } else {
        if (availabilityValue === "in-stock" && !product.available)
          return false;
      }

      // 2. Filter Search
      if (searchValue && !product.name.toLowerCase().includes(searchValue))
        return false;

      // 3. Filter Tipe
      if (tipeValue !== "all" && product.tipe !== tipeValue) return false;

      // 4. Filter Collection (Case Insensitive & Decoded)
      if (collectionValue !== "all") {
        const targetCollection =
          decodeURIComponent(collectionValue).toLowerCase();
        const productCollection = product.collection.toLowerCase();

        if (productCollection !== targetCollection) return false;
      }

      // 5. Filter Category (Case Insensitive & Decoded)
      if (categoryValue !== "all") {
        const targetCategory = decodeURIComponent(categoryValue).toLowerCase();
        const productCategory = product.category.toLowerCase();

        if (productCategory !== targetCategory) return false;
      }

      return true;
    });

    filteredProducts.sort((a, b) => {
      const dateA = parseCustomDate(a.date);
      const dateB = parseCustomDate(b.date);

      switch (sortValue) {
        case "date-asc":
          return dateA - dateB;
        case "coming-soon":
          return dateB - dateA;
        case "date-desc":
        default:
          return dateB - dateA;
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
        // PATH FIX: Image src with /
        const productHTML = `
          <a href="/i-catalog/detail-barang/detail-barang.html?id=${
            product.id
          }" class="product-item-catalog" data-id="${product.id}">
            <span class="wishlist-icon"><i class="far fa-heart"></i><i class="fas fa-heart"></i></span>
            <img src="/${product.images[0].replace(/^\.\.\//, "")}" alt="${
          product.name
        }" loading="lazy"/>
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
// FUNGSI UNTUK HOMEPAGE (index.html)
// ==========================================================

async function loadFeaturedProducts() {
  const featuredProductIDs = [
    "product-17",
    "product-1",
    "product-56",
    "product-14",
  ];

  const grid = document.getElementById("featured-products-grid");
  if (!grid) return;

  try {
    const response = await fetch("/products.json");
    const allProducts = await response.json();

    const featuredProducts = featuredProductIDs
      .map((id) => {
        return allProducts.find((product) => product.id === id);
      })
      // LOGIKA BARU: Filter produk yang tidak memiliki gambar
      .filter(
        (product) => product && product.images && product.images.length > 0
      );

    grid.innerHTML = "";

    featuredProducts.forEach((product) => {
      if (!product) return;
      // PATH FIX: Image src with /
      const productHTML = `
        <a href="/i-catalog/detail-barang/detail-barang.html?id=${
          product.id
        }" class="product-item">
          <span class="wishlist-icon">
            <i class="far fa-heart"></i>
          </span>
          <img src="/${product.images[0].replace(/^\.\.\//, "")}" alt="${
        product.name
      }" loading="lazy" />
          <p class="product-name">${product.name}</p>
        </a>
      `;

      grid.insertAdjacentHTML("beforeend", productHTML);
    });

    enableDragScroll(grid);

    const links = grid.querySelectorAll(".product-item");
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        if (grid.dataset.isDragging === "true") {
          e.preventDefault();
          e.stopPropagation();
        }
      });
      const img = link.querySelector("img");
      if (img) {
        img.addEventListener("dragstart", (e) => e.preventDefault());
      }
    });
  } catch (error) {
    console.error("Gagal memuat produk unggulan:", error);
    grid.innerHTML = "<p>Gagal memuat produk unggulan.</p>";
  }
}

// ==========================================================
// FUNGSI ARTIKEL & BERITA (Untuk Homepage & List Artikel)
// ==========================================================

async function loadFeaturedArticles() {
  const grid = document.querySelector(".news-grid");
  if (!grid) return;

  try {
    const response = await fetch("/articles.json");
    const articles = await response.json();

    const featured = articles.slice(0, 4);

    grid.innerHTML = "";

    featured.forEach((article) => {
      const html = `
        <div class="news-item">
          <div class="news-image-wrapper">
            <img src="/${article.image}" alt="${article.title}" loading="lazy">
          </div>
          <h3 class="news-title">${article.title}</h3>
          <p class="news-desc">${article.excerpt}</p>
          <a href="/artikel/detail-artikel.html?id=${article.id}" class="discover-link">Discover</a>
        </div>
      `;
      grid.insertAdjacentHTML("beforeend", html);
    });
  } catch (error) {
    console.error("Gagal memuat artikel homepage:", error);
    grid.innerHTML = "<p>Gagal memuat berita.</p>";
  }
}

async function loadAllArticles() {
  const grid = document.querySelector(".news-grid");
  if (!grid) return;

  try {
    const response = await fetch("/articles.json");
    const articles = await response.json();

    grid.innerHTML = "";

    articles.forEach((article) => {
      const html = `
        <div class="news-item">
          <div class="news-image-wrapper">
            <img src="/${article.image}" alt="${article.title}" loading="lazy">
          </div>
          <h3 class="news-title">${article.title}</h3>
          <p class="news-desc">${article.excerpt}</p>
          <a href="/artikel/detail-artikel.html?id=${article.id}" class="discover-link">Discover</a>
        </div>
      `;
      grid.insertAdjacentHTML("beforeend", html);
    });
  } catch (error) {
    console.error("Gagal memuat semua artikel:", error);
    grid.innerHTML = "<p>Gagal memuat berita.</p>";
  }
}

// ==========================================================
// FUNGSI UNTUK HALAMAN DETAIL ARTIKEL (artikel/detail-artikel.html)
// ==========================================================

async function loadArticleDetail() {
  const container = document.querySelector(".article-page .container");
  if (!container) return;

  try {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
      window.location.href = "/artikel/list-artikel.html";
      return;
    }

    const response = await fetch("/articles.json");
    const articles = await response.json();
    const article = articles.find((a) => a.id === id);

    if (!article) {
      container.innerHTML =
        "<p style='text-align:center; padding:50px;'>Artikel tidak ditemukan.</p>";
      return;
    }

    document.title = `${article.title} | Ferry Sunarto`;

    const titleEl = document.querySelector(".article-header h1");
    const introEl = document.querySelector(".article-intro");
    if (titleEl) titleEl.textContent = article.title;
    if (introEl) introEl.textContent = article.excerpt;

    const heroImg = document.querySelector(".hero-image");
    if (heroImg) {
      heroImg.src = "/" + article.image;
      heroImg.alt = article.title;
    }

    const contentDiv = document.querySelector(".article-content");
    if (contentDiv) {
      contentDiv.innerHTML = article.content;
    }
  } catch (error) {
    console.error("Gagal memuat detail artikel:", error);
  }
}

// ==========================================================
// FUNGSI UNTUK HALAMAN DETAIL PRODUK (i-catalog/detail-barang/detail-barang.html)
// ==========================================================

async function initializeProductDetail() {
  const productMain = document.querySelector(".product-main");
  if (!productMain) return;

  try {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    if (!productId) {
      throw new Error("ID Produk tidak ditemukan di URL.");
    }

    const response = await fetch("/products.json");
    if (!response.ok) throw new Error("Gagal memuat data produk.");
    const allProductsData = await response.json();

    const product = allProductsData.find((p) => p.id === productId);

    if (!product) {
      throw new Error(`Produk dengan ID "${productId}" tidak ditemukan.`);
    }

    // LOGIKA FILTER GAMBAR: Pastikan produk memiliki gambar untuk ditampilkan
    if (!product.images || product.images.length === 0) {
      throw new Error(
        `Produk "${product.name}" tidak memiliki gambar dan tidak dapat ditampilkan.`
      );
    }

    renderProductDetail(product);

    // --- LOGIKA TAB ---
    const tabLinks = document.querySelectorAll(".tab-link");
    const tabContents = document.querySelectorAll(".tab-content");

    tabLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const tabId = link.getAttribute("data-tab");
        tabLinks.forEach((item) => item.classList.remove("active"));
        tabContents.forEach((item) => item.classList.remove("active"));
        link.classList.add("active");
        document.getElementById(tabId).classList.add("active");
      });
    });

    // --- LOGIKA TOMBOL WHATSAPP ---
    const waButton = document.querySelector(".btn-whatsapp");
    if (waButton) {
      const waPhoneNumber = "6281234567890";
      const productName = product.name;
      const productCollection = capitalizeFirstLetter(product.collection);
      const productURL = window.location.href;

      const messageTemplate = `Halo, saya tertarik dengan produk Anda:

Koleksi: ${productCollection}
Produk: ${productName}
Link: ${productURL}

Bisakah saya mendapatkan informasi lebih lanjut? Terima kasih.`;

      const encodedMessage = encodeURIComponent(messageTemplate);
      const waURL = `https://wa.me/${waPhoneNumber}?text=${encodedMessage}`;

      waButton.addEventListener("click", () => {
        window.open(waURL, "_blank");
      });
    }

    // --- LOGIKA MODAL APPOINTMENT ---
    const apptButton = document.querySelector(".btn-appointment");
    const modalOverlay = document.getElementById("appointment-modal");
    const closeButton = document.getElementById("appointment-close-btn");
    const apptForm = document.getElementById("appointment-form");
    const typeRadios = document.querySelectorAll('input[name="type"]');
    const budgetSlider = document.getElementById("appt-budget-slider");
    const budgetDisplay = document.getElementById("budget-value-display");

    const newRanges = [
      "0 - 50 mio",
      "50 mio - 100 mio",
      "100 mio - 150 mio",
      "150 mio - 250 mio",
      "250 mio - 350 mio",
      "350 mio - 500 mio",
      "500 mio - 1 bio",
    ];

    const budgetData = {
      custom: newRanges,
      rent: newRanges,
      order: newRanges,
    };

    function updateSliderContext() {
      const selectedType = document.querySelector('input[name="type"]:checked');
      const typeValue = selectedType ? selectedType.value : "order";
      const currentRanges = budgetData[typeValue];
      budgetSlider.max = currentRanges.length - 1;
      budgetSlider.value = 0;
      budgetDisplay.textContent = currentRanges[0];
    }

    function onSliderChange() {
      const selectedType = document.querySelector('input[name="type"]:checked');
      const typeValue = selectedType ? selectedType.value : "order";
      const index = budgetSlider.value;
      const text = budgetData[typeValue][index];
      budgetDisplay.textContent = text;
    }

    typeRadios.forEach((radio) => {
      radio.addEventListener("change", updateSliderContext);
    });

    if (budgetSlider) {
      budgetSlider.addEventListener("input", onSliderChange);
    }

    if (apptButton && modalOverlay && closeButton && apptForm) {
      const openModal = (e) => {
        e.preventDefault();
        modalOverlay.classList.add("show");
        document.body.style.overflow = "hidden";
        updateSliderContext();
      };

      const closeModal = () => {
        modalOverlay.classList.remove("show");
        document.body.style.overflow = "auto";
      };

      apptButton.addEventListener("click", openModal);
      closeButton.addEventListener("click", closeModal);
      modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
          closeModal();
        }
      });

      apptForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("appt-name").value;
        const email = document.getElementById("appt-email").value;
        const selectedType = document.querySelector(
          'input[name="type"]:checked'
        ).value;
        const selectedVolumeHarga = document.getElementById(
          "budget-value-display"
        ).textContent;
        const selectedBaju = document.getElementById("appt-baju").value;

        alert(
          `Terima kasih, ${name}!\n\nPermintaan appointment Anda (${selectedType} untuk ${selectedBaju})\nVolume Budget: ${selectedVolumeHarga}\nTelah terkirim. Kami akan segera menghubungi Anda di ${email}.`
        );

        apptForm.reset();
        closeModal();
      });
    }

    // --- LOGIKA TOMBOL FAVORITE ---
    const favoriteButton = document.querySelector(".btn-favorite");
    if (favoriteButton && productId) {
      const updateButtonVisuals = () => {
        if (isItemInWishlist(productId)) {
          favoriteButton.textContent = "REMOVE FROM LOOKBAG";
          favoriteButton.classList.add("active");
        } else {
          favoriteButton.textContent = "SAVE TO LOOKBAG";
          favoriteButton.classList.remove("active");
        }
      };
      updateButtonVisuals();
      favoriteButton.addEventListener("click", () => {
        if (isItemInWishlist(productId)) {
          removeItemFromWishlist(productId);
        } else {
          addItemToWishlist(productId);
        }
        updateButtonVisuals();
        updateWishlistCounter();
      });
    }
  } catch (error) {
    console.error("Error memuat detail produk:", error);
    productMain.innerHTML = `<p style='text-align: center; width: 100%; padding: 5rem 0;'>Gagal memuat detail produk. ${error.message}</p>`;
  }
}

function renderProductDetail(product) {
  document.title = product.name;
  const titleElement = document.querySelector(".product-title h1");
  const subtitleElement = document.querySelector(".product-title p");

  // --- LOGIKA PERBAIKAN DUPLIKASI COLLECTION ---
  const collectionName = capitalizeFirstLetter(product.collection);

  const collectionSuffix = product.collection
    .toLowerCase()
    .includes("collection")
    ? ""
    : " Collection"; // Tambahkan hanya jika belum ada

  if (titleElement) {
    titleElement.textContent = `${collectionName}${collectionSuffix}`;
  }
  // --- END LOGIKA PERBAIKAN ---

  if (subtitleElement) {
    subtitleElement.textContent = product.name;
  }

  const descriptionElement = document.querySelector(".product-description p");
  if (descriptionElement) descriptionElement.textContent = product.description;

  const specsElement = document.querySelector(".product-sizes");
  if (specsElement) {
    specsElement.innerHTML = "";
    if (product.specifications && product.specifications.length > 0) {
      product.specifications.forEach((spec) => {
        const p = document.createElement("p");
        p.textContent = spec;
        specsElement.appendChild(p);
      });
    } else {
      specsElement.innerHTML = "<p>Spesifikasi tidak tersedia.</p>";
    }
  }

  const mainImageWrapper = document.querySelector(".main-image-wrapper");
  const thumbnailGallery = document.querySelector(".thumbnail-gallery");

  if (
    mainImageWrapper &&
    thumbnailGallery &&
    product.images &&
    product.images.length > 0
  ) {
    mainImageWrapper.innerHTML = "";
    thumbnailGallery.innerHTML = "";

    let currentImageIndex = 0;

    const mainImage = document.createElement("img");
    // PATH FIX: Image src with /
    mainImage.src =
      "/" + product.images[currentImageIndex].replace(/^\.\.\//, "");
    mainImage.alt = product.name;
    mainImage.style.cssText =
      "width: 100%; height: 100%; object-fit: cover; cursor: pointer;";

    mainImage.addEventListener("click", () => {
      setupModalGallery(product.images, currentImageIndex);
    });

    const arrowLeft = document.createElement("button");
    arrowLeft.className = "nav-arrow arrow-left";
    arrowLeft.innerHTML = "&lt;";

    const arrowRight = document.createElement("button");
    arrowRight.className = "nav-arrow arrow-right";
    arrowRight.innerHTML = "&gt;";

    mainImageWrapper.appendChild(mainImage);
    mainImageWrapper.appendChild(arrowLeft);
    mainImageWrapper.appendChild(arrowRight);

    const updateMainImage = (index) => {
      // PATH FIX: Image src with /
      mainImage.src = "/" + product.images[index].replace(/^\.\.\//, "");
    };

    arrowLeft.addEventListener("click", () => {
      currentImageIndex--;
      if (currentImageIndex < 0) {
        currentImageIndex = product.images.length - 1;
      }
      updateMainImage(currentImageIndex);
    });

    arrowRight.addEventListener("click", () => {
      currentImageIndex++;
      if (currentImageIndex >= product.images.length) {
        currentImageIndex = 0;
      }
      updateMainImage(currentImageIndex);
    });

    enableDragScroll(thumbnailGallery);

    product.images.forEach((imgSrc, index) => {
      const thumbWrapper = document.createElement("div");
      thumbWrapper.className = "thumbnail";

      const thumbImage = document.createElement("img");
      // PATH FIX: Image src with /
      thumbImage.src = "/" + imgSrc.replace(/^\.\.\//, "");
      thumbImage.alt = "Thumbnail";
      thumbImage.style.cssText =
        "width: 100%; height: 100%; object-fit: cover; cursor: pointer;";

      thumbImage.addEventListener("click", (e) => {
        if (thumbnailGallery.dataset.isDragging === "true") {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        currentImageIndex = index;
        updateMainImage(currentImageIndex);
      });

      thumbWrapper.appendChild(thumbImage);
      thumbnailGallery.appendChild(thumbWrapper);
    });

    if (product.images.length <= 1) {
      arrowLeft.style.display = "none";
      arrowRight.style.display = "none";
    }
  }
}

function setupModalGallery(imagesArray, initialIndex) {
  const modal = document.getElementById("imageModal");
  const modalImage = modal.querySelector(".modal-image");
  const closeButton = modal.querySelector(".close-button");
  const modalArrowLeft = modal.querySelector(".modal-arrow-left");
  const modalArrowRight = modal.querySelector(".modal-arrow-right");
  const modalContentWrapper = modal.querySelector(".modal-content-wrapper");

  if (
    !modal ||
    !modalImage ||
    !closeButton ||
    !modalArrowLeft ||
    !modalArrowRight ||
    !modalContentWrapper
  ) {
    console.error("Elemen modal tidak ditemukan!");
    return;
  }

  let currentModalImageIndex = initialIndex;

  let isZoomed = false;
  let isDragging = false;
  let startX, startY;
  let translateX = 0,
    translateY = 0;
  let lastTranslateX = 0,
    lastTranslateY = 0;
  const zoomScale = 2;

  function applyModalTransform() {
    const imgWidth = modalImage.offsetWidth;
    const imgHeight = modalImage.offsetHeight;
    const wrapperWidth = modalContentWrapper.offsetWidth;
    const wrapperHeight = modalContentWrapper.offsetHeight;

    const maxTranslateX = Math.max(
      0,
      (imgWidth * zoomScale - wrapperWidth) / 2
    );
    const maxTranslateY = Math.max(
      0,
      (imgHeight * zoomScale - wrapperHeight) / 2
    );

    if (isZoomed) {
      translateX = Math.max(
        -maxTranslateX,
        Math.min(maxTranslateX, translateX)
      );
      translateY = Math.max(
        -maxTranslateY,
        Math.min(maxTranslateY, translateY)
      );

      modalImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomScale})`;
      modalImage.style.objectFit = "contain";
      modalContentWrapper.classList.add("is-zoomed");
    } else {
      translateX = 0;
      translateY = 0;
      modalImage.style.transform = "translate(0, 0) scale(1)";
      modalImage.style.objectFit = "contain";
      modalContentWrapper.classList.remove("is-zoomed");
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
    applyModalTransform();
  }

  modalImage.addEventListener("click", (e) => {
    if (modalImage.classList.contains("grabbing")) return;

    isZoomed = !isZoomed;
    if (isZoomed) {
      modalImage.classList.add("zoomed");
      modalImage.style.cursor = "grab";
    } else {
      resetModalZoomAndPan();
    }
    applyModalTransform();
  });

  function dragStart(e) {
    if (!isZoomed) return;
    if (e.type === "touchstart") e.preventDefault();

    isDragging = true;
    modalImage.classList.add("grabbing");
    modalImage.style.cursor = "grabbing";

    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;

    startX = clientX;
    startY = clientY;

    lastTranslateX = translateX;
    lastTranslateY = translateY;

    window.addEventListener("mousemove", dragMove);
    window.addEventListener("mouseup", dragEnd);
    window.addEventListener("touchmove", dragMove, { passive: false });
    window.addEventListener("touchend", dragEnd);
  }

  function dragMove(e) {
    if (!isDragging) return;
    if (e.type === "touchmove") e.preventDefault();

    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;

    const dx = clientX - startX;
    const dy = clientY - startY;

    translateX = lastTranslateX + dx;
    translateY = lastTranslateY + dy;

    applyModalTransform();
  }

  function dragEnd(e) {
    window.removeEventListener("mousemove", dragMove);
    window.removeEventListener("mouseup", dragEnd);
    window.removeEventListener("touchmove", dragMove);
    window.removeEventListener("touchend", dragEnd);

    let clientX, clientY;

    if (e.type === "touchend") {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const moved = clientX !== startX || clientY !== startY;

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
  }

  modalImage.addEventListener("mousedown", dragStart);
  modalImage.addEventListener("touchstart", dragStart, { passive: false });

  const showModalImage = (index) => {
    currentModalImageIndex = index;
    // PATH FIX: Image src with /
    modalImage.src =
      "/" + imagesArray[currentModalImageIndex].replace(/^\.\.\//, "");
    resetModalZoomAndPan();

    if (imagesArray.length <= 1) {
      modalArrowLeft.style.display = "none";
      modalArrowRight.style.display = "none";
    } else {
      modalArrowLeft.style.display = "flex";
      modalArrowRight.style.display = "flex";
    }
  };

  const closeModal = () => {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
    resetModalZoomAndPan();
    document.removeEventListener("keydown", handleKeydown);
  };

  closeButton.onclick = closeModal;

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

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

  const handleKeydown = (e) => {
    if (e.key === "Escape") {
      closeModal();
    } else if (e.key === "ArrowLeft") {
      modalArrowLeft.onclick();
    } else if (e.key === "ArrowRight") {
      modalArrowRight.onclick();
    }
  };
  document.addEventListener("keydown", handleKeydown);

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
  showModalImage(currentModalImageIndex);
}

/**
 * Fungsi untuk mengaktifkan scroll dengan cara drag (klik & geser) mouse
 */
function enableDragScroll(slider) {
  let isDown = false;
  let startX;
  let scrollLeft;

  slider.addEventListener("mousedown", (e) => {
    isDown = true;
    slider.classList.add("active");
    slider.dataset.isDragging = "false";
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener("mouseleave", () => {
    isDown = false;
    slider.classList.remove("active");
  });

  slider.addEventListener("mouseup", () => {
    isDown = false;
    slider.classList.remove("active");
    setTimeout(() => {
      slider.dataset.isDragging = "false";
    }, 50);
  });

  slider.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2;
    if (Math.abs(walk) > 5) {
      slider.dataset.isDragging = "true";
    }
    slider.scrollLeft = scrollLeft - walk;
  });
}

// ==========================================================
// FUNGSI HELPER UNTUK WISHLIST (LOCALSTORAGE)
// ==========================================================

function getWishlist() {
  const list = localStorage.getItem("wishlist");
  return list ? JSON.parse(list) : [];
}

function saveWishlist(list) {
  localStorage.setItem("wishlist", JSON.stringify(list));
}

function addItemToWishlist(productId) {
  const list = getWishlist();
  if (!list.includes(productId)) {
    list.push(productId);
    saveWishlist(list);
  }
}

function removeItemFromWishlist(productId) {
  let list = getWishlist();
  list = list.filter((id) => id !== productId);
  saveWishlist(list);
}

function isItemInWishlist(productId) {
  const list = getWishlist();
  return list.includes(productId);
}

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

// ==========================================================
// INISIALISASI ANIMASI BUTIK
// ==========================================================
if (document.querySelector(".section-butik-animation")) {
  if (typeof jQuery !== "undefined") {
    (function ($) {
      $(document).ready(function () {
        const $app = $(".app");
        const totalSlides = 3;
        let animation = true;
        let curSlide = 1;
        let autoPlayInterval;

        let pagination = function (slide, target) {
          animation = true;
          let nextSlide;

          if (target === undefined) {
            nextSlide = slide < totalSlides ? slide + 1 : 1;
          } else {
            nextSlide = target;
          }

          $(".pages__item").removeClass("page__item-active");
          $(".pages__item--" + nextSlide).addClass("page__item-active");

          $app.removeClass("active active-3");
          if (nextSlide === 2) {
            $app.addClass("active");
          } else if (nextSlide === 3) {
            $app.addClass("active-3");
          }

          curSlide = nextSlide;

          setTimeout(function () {
            animation = false;
          }, 3000);
        };

        setTimeout(function () {
          $app.addClass("initial");
        }, 500);

        setTimeout(function () {
          animation = false;
        }, 3500);

        function startAutoPlay() {
          autoPlayInterval = setInterval(function () {
            if (!animation) {
              pagination(curSlide);
            }
          }, 6000);
        }

        startAutoPlay();

        $(document).on(
          "click",
          ".pages__item:not(.page__item-active)",
          function () {
            if (animation) return;

            clearInterval(autoPlayInterval);

            let target = +$(this).attr("data-target");
            pagination(curSlide, target);

            startAutoPlay();
          }
        );
      });
    })(jQuery);
  } else {
    console.warn("jQuery belum dimuat! Animasi Butik tidak akan berjalan.");
  }
}
