document.addEventListener("DOMContentLoaded", () => {
  const carousels = document.querySelectorAll(".carousel");

  carousels.forEach((carousel) => {
    // --- Read images list ---
    let images = [];
    try {
      images = JSON.parse(carousel.dataset.images || "[]");
    } catch (e) {
      console.warn("Invalid data-images JSON:", carousel);
      return;
    }
    if (!images.length) return;

    const prevBtn = carousel.querySelector(".carousel-btn.prev");
    const nextBtn = carousel.querySelector(".carousel-btn.next");
    const countEl = carousel.querySelector(".carousel-count");
    const titleEl = carousel.querySelector(".carousel-title");

    // --- Build track/slides from data-images ---
    const existingImg = carousel.querySelector(".carousel-image");

    const track = document.createElement("div");
    track.className = "carousel-track";

    images.forEach((item) => {
      const slide = document.createElement("div");
      slide.className = "carousel-slide";

      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.alt || "";
      img.loading = "lazy";

      slide.appendChild(img);
      track.appendChild(slide);
    });

    // Replace the single <img> with the sliding track
    if (existingImg) existingImg.remove();
    carousel.prepend(track);

    let index = 0;

    const updateUI = () => {
      // Slide
      track.style.transform = `translateX(-${index * 100}%)`;

      // Caption + count
      const item = images[index];

      if (titleEl && item.caption) titleEl.textContent = item.caption;
      if (countEl) countEl.textContent = `${index + 1} / ${images.length}`;
    };

    const go = (dir) => {
      index = (index + dir + images.length) % images.length;
      updateUI();
      activateBriefly();
    };

    // --- Hover/tap helper for mobile (show controls briefly) ---
    let activeTimer = null;
    const activateBriefly = () => {
      carousel.classList.add("is-active");
      clearTimeout(activeTimer);
      activeTimer = setTimeout(() => carousel.classList.remove("is-active"), 1200);
    };

    // --- Click controls ---
    prevBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      go(-1);
    });

    nextBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      go(1);
    });

    // --- Tap anywhere reveals UI briefly ---
    carousel.addEventListener("pointerdown", () => {
      activateBriefly();
    });

    // --- Swipe support ---
    let startX = 0;
    let startY = 0;
    let tracking = false;

    const swipeThreshold = 40;
    const verticalTolerance = 60;

    carousel.addEventListener("pointerdown", (e) => {
      tracking = true;
      startX = e.clientX;
      startY = e.clientY;
    });

    carousel.addEventListener("pointerup", (e) => {
      if (!tracking) return;
      tracking = false;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      // ignore if mostly vertical
      if (Math.abs(dy) > verticalTolerance && Math.abs(dy) > Math.abs(dx)) return;

      if (dx > swipeThreshold) go(-1);
      else if (dx < -swipeThreshold) go(1);
    });

    carousel.addEventListener("pointercancel", () => {
      tracking = false;
    });

    // Initial
    updateUI();
  });
});

// =========================
// TOUCH TILE — TAP TO TOGGLE
// =========================
document.querySelectorAll('.touch-tile').forEach(tile => {
  tile.addEventListener('click', e => {
    // Don't toggle when clicking carousel arrows or links
    if (e.target.closest('button, a')) return;

    tile.classList.toggle('is-active'); // 👈 this now controls overlay + caption
  });
});

// Tap outside to close (recommended)
document.addEventListener('click', e => {
  document.querySelectorAll('.touch-tile.is-active').forEach(tile => {
    if (!tile.contains(e.target)) {
      tile.classList.remove('is-active');
    }
  });
});


