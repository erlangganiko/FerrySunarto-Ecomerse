// ==========================================================
// INISIALISASI UTAMA (BARU)
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  // Hanya panggil fungsi yang kita perlukan
  initializeCommonFeatures();
});

// ==========================================================
// PRELOADER LOGIC (Dari file lama)
// ==========================================================
window.onload = function () {
  const preloader = document.getElementById("preloader");
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add("hidden");
    }, 1500); // Waktu loading 1.5 detik
  }
};

// ==========================================================
// FUNGSI UMUM (Diambil dari file lama, tapi DIBERSIHKAN)
// ==========================================================

/**
 * Menjalankan skrip umum seperti navbar dan menu.
 * (Logika Search dan Footer dari file lama sudah dihapus)
 */
function initializeCommonFeatures() {
  // --- LOGIKA NAVBAR SCROLL (Dari file lama) ---
  const navbar = document.getElementById("navbar");
  if (navbar) {
    let lastScrollY = window.scrollY;
    window.addEventListener("scroll", () => {
      const currentScrollY = window.scrollY;

      // Efek 1: Beri background putih setelah scroll 50px
      if (currentScrollY > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }

      // Efek 2: Sembunyikan navbar saat scroll ke bawah
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        navbar.classList.add("hidden");
      } else {
        navbar.classList.remove("hidden");
      }

      lastScrollY = currentScrollY;
    });
  }

  // --- LOGIKA MENU TOGGLE (Dari file lama) ---
  const menuToggle = document.querySelector(".menu-toggle");
  const menuCloseBtn = document.querySelector(".menu-close-btn");
  const menuOverlay = document.getElementById("menu-overlay");

  if (menuToggle && menuCloseBtn && menuOverlay) {
    const toggleMenu = () => {
      menuOverlay.classList.toggle("open");
      // Mencegah body scroll saat menu terbuka
      document.body.style.overflow = menuOverlay.classList.contains("open")
        ? "hidden"
        : "auto";
    };

    menuToggle.addEventListener("click", toggleMenu);
    menuCloseBtn.addEventListener("click", toggleMenu);
  }
}
