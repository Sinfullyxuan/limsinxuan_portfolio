// js/modal.js
document.addEventListener("DOMContentLoaded", () => {
  // ===== Grab modal elements =====
  const modal = document.getElementById("projectModal");
  if (!modal) return; // safe if this script is included on pages without the modal

  const modalImg = document.getElementById("modalImg");
  const modalKicker = document.getElementById("modalKicker");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");

  // Optional: if you want to focus the close button for accessibility
  const closeBtn = modal.querySelector(".project-modal__close");

  // ===== Helpers =====
  function openModal({ img, kicker, title, desc }) {
    if (modalImg) {
      modalImg.src = img || "";
      modalImg.alt = title || "Project image";
    }
    if (modalKicker) modalKicker.textContent = kicker || "";
    if (modalTitle) modalTitle.textContent = title || "";
    if (modalDesc) modalDesc.textContent = desc || "";

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    // lock background scroll
    document.body.style.overflow = "hidden";

    // focus close button (nice UX)
    closeBtn?.focus();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");

    // unlock background scroll
    document.body.style.overflow = "";

    // optional: clear image to prevent flashing if you reopen quickly
    if (modalImg) modalImg.src = "";
  }

  function getImgFromTrigger(triggerEl) {
    // Prefer data-full, fallback to the nested img src
    return (
      triggerEl.dataset.full ||
      triggerEl.querySelector("img")?.getAttribute("src") ||
      ""
    );
  }

  // ===== Open / Close (event delegation) =====
  document.addEventListener("click", (e) => {
    // 1) Close if click overlay or close button (anything with data-close)
    const closeTarget = e.target.closest("[data-close]");
    if (closeTarget) {
      e.preventDefault();
      closeModal();
      return;
    }

    // 2) Open if click a trigger (your carousel image button)
    const trigger = e.target.closest(".js-project");
    if (!trigger) return;

    e.preventDefault();

    openModal({
      img: getImgFromTrigger(trigger),
      kicker: trigger.dataset.kicker || "",
      title: trigger.dataset.title || "",
      desc: trigger.dataset.desc || "",
    });
  });

  // Close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  // Close if user clicks outside the panel (extra safety)
  // (Overlay already handles this, but this helps if overlay isn't full)
  modal.addEventListener("click", (e) => {
    const panel = e.target.closest(".project-modal__panel");
    if (!panel && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
});
