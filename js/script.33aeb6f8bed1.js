(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var nav = document.getElementById("navegacion-principal");
  var toggle = document.querySelector(".nav-toggle");
  var navLinks = nav ? nav.querySelectorAll("a") : [];
  var filters = document.querySelectorAll(".filter-btn");
  var items = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));
  var lightbox = document.getElementById("lightbox");
  var lightboxImage = document.getElementById("lightbox-image");
  var lightboxCaption = document.getElementById("lightbox-caption");
  var prevBtn = document.querySelector(".lightbox-prev");
  var nextBtn = document.querySelector(".lightbox-next");
  var closeControls = document.querySelectorAll("[data-lightbox-close]");

  var currentIndex = 0;
  var activePhotos = [];
  var activeAlbumTitle = "";
  var lastFocus = null;
  var touchStartX = 0;
  var touchStartY = 0;

  function visibleItems() {
    return items.filter(function (item) {
      return !item.hidden;
    });
  }

  function setBodyLock(locked) {
    document.body.classList.toggle("is-locked", locked);
  }

  function setMenu(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    setBodyLock(open || isLightboxOpen());
  }

  function isLightboxOpen() {
    return lightbox && !lightbox.hidden;
  }

  function closeMenu() {
    setMenu(false);
  }

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  function applyFilter(category) {
    items.forEach(function (item) {
      var match = category === "todas" || item.getAttribute("data-category") === category;
      item.hidden = !match;
    });
  }

  function openLightbox(index) {
    if (!activePhotos.length || !lightbox) return;
    currentIndex = (index + activePhotos.length) % activePhotos.length;
    var photo = activePhotos[currentIndex];
    var opening = lightbox.hidden;
    if (opening) lastFocus = document.activeElement;
    lightboxImage.src = photo.src;
    lightboxImage.alt = photo.alt;
    lightboxCaption.textContent = activeAlbumTitle + " — " + (currentIndex + 1) + " / " + activePhotos.length;
    prevBtn.hidden = nextBtn.hidden = activePhotos.length < 2;
    lightbox.hidden = false;
    closeMenu();
    setBodyLock(true);
    if (opening) document.querySelector(".lightbox-close").focus();
  }

  function closeLightbox() {
    if (!isLightboxOpen()) return;
    lightbox.hidden = true;
    lightboxImage.removeAttribute("src");
    setBodyLock(nav && nav.classList.contains("is-open"));
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  }

  function stepLightbox(delta) {
    openLightbox(currentIndex + delta);
  }

  function indexFromItem(item) {
    return visibleItems().indexOf(item);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") !== "true";
      if (open) closeLightbox();
      setMenu(open);
    });
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  filters.forEach(function (button) {
    button.addEventListener("click", function () {
      var category = button.getAttribute("data-filter");
      filters.forEach(function (other) {
        var active = other === button;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-pressed", active ? "true" : "false");
      });
      applyFilter(category);
      closeLightbox();
    });
  });

  items.forEach(function (item) {
    item.addEventListener("click", function () {
      activePhotos = JSON.parse(item.getAttribute("data-album"));
      activeAlbumTitle = item.getAttribute("data-title");
      openLightbox(0);
    });
  });

  closeControls.forEach(function (control) {
    control.addEventListener("click", closeLightbox);
  });

  if (prevBtn) prevBtn.addEventListener("click", function () { stepLightbox(-1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { stepLightbox(1); });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      if (isLightboxOpen()) {
        closeLightbox();
        return;
      }
      if (toggle && toggle.getAttribute("aria-expanded") === "true") {
        closeMenu();
        toggle.focus();
      }
      return;
    }

    if (!isLightboxOpen()) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      stepLightbox(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      stepLightbox(1);
    } else if (event.key === "Tab") {
      var focusable = Array.prototype.filter.call(lightbox.querySelectorAll("button"), function (button) { return !button.hidden; });
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  if (lightbox) {
    lightbox.addEventListener("touchstart", function (event) {
      if (!event.changedTouches.length) return;
      touchStartX = event.changedTouches[0].clientX;
      touchStartY = event.changedTouches[0].clientY;
    }, { passive: true });

    lightbox.addEventListener("touchend", function (event) {
      if (!event.changedTouches.length) return;
      var dx = event.changedTouches[0].clientX - touchStartX;
      var dy = event.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
      stepLightbox(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  window.addEventListener("resize", function () {
    if (window.innerWidth > 800) closeMenu();
  });
})();
document.querySelectorAll('[data-plan]').forEach(function (link) {
  link.addEventListener('click', function () {
    document.getElementById('plan').value = link.dataset.plan;
  });
});
document.getElementById('inquiry-form').addEventListener('submit', function (event) {
  event.preventDefault();
  var name = document.getElementById('nombre').value.trim();
  if (!name) { document.getElementById('nombre').setCustomValidity('Escribe tu nombre.'); document.getElementById('nombre').reportValidity(); return; }
  document.getElementById('inquiry-message').textContent = 'Hola, Manuel. Soy ' + name + '. Me gustaría consultar una propuesta para un proyecto de ' + document.getElementById('servicio').value.toLowerCase() + '.' + (document.getElementById('plan').value ? ' Me interesa: ' + document.getElementById('plan').value + '.' : '');
  document.getElementById('inquiry-result').hidden = false;
});
document.getElementById('nombre').addEventListener('input', function () { this.setCustomValidity(''); });
document.getElementById('copy-inquiry').addEventListener('click', async function () {
  try { await navigator.clipboard.writeText(document.getElementById('inquiry-message').textContent); this.textContent = 'Consulta copiada ✓'; }
  catch (error) { this.textContent = 'Selecciona y copia el mensaje de arriba'; }
});
