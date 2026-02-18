document.addEventListener("DOMContentLoaded", () => {
  setupProjectGallery({
    sectionId: "projects",
    galleryId: "projectsGallery",
  });

  setupProjectGallery({
    sectionId: "projects-2",
    galleryId: "projectsGallery-2",
  });
});

function setupProjectGallery({ sectionId, galleryId }) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const gallery = section.querySelector(`#${galleryId}`);
  const leftBtn = section.querySelector(".scroll-btn.left");
  const rightBtn = section.querySelector(".scroll-btn.right");

  if (!gallery || !leftBtn || !rightBtn) return;

  const scrollAmount = 320;
  const eps = 2;

  function updateButtons() {
    const max = Math.max(0, gallery.scrollWidth - gallery.clientWidth);
    const x = gallery.scrollLeft;

    leftBtn.classList.toggle("is-disabled", x <= eps);
    rightBtn.classList.toggle("is-disabled", x >= max - eps);
  }

  leftBtn.addEventListener("click", () => {
    gallery.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  });

  rightBtn.addEventListener("click", () => {
    gallery.scrollBy({ left: scrollAmount, behavior: "smooth" });
  });

  gallery.addEventListener("scroll", updateButtons, { passive: true });
  window.addEventListener("resize", updateButtons);

  // Reset starting position (Chrome snap offset fix)
  const reset = () => {
    gallery.scrollLeft = 0;
    updateButtons();
  };

  updateButtons();
  requestAnimationFrame(reset);
  window.addEventListener("load", reset);
  setTimeout(reset, 50);
}








