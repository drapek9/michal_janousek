/**
 * Karty nemovitostí, filtrování a detail
 */

function propertyDetailUrl(property) {
  return `nemovitost.html?slug=${encodeURIComponent(property.slug)}`;
}

function getPropertyImages(property) {
  const images = property.images?.length ? [...property.images] : [];
  if (property.image && !images.includes(property.image)) {
    images.unshift(property.image);
  }
  return images.length ? images : [property.image].filter(Boolean);
}

const GALLERY_SIDE_SLOTS = 4;

function propertyGalleryThumbHtml(src, index, total, extraClass = "") {
  return `
    <button type="button" class="property-gallery__thumb${extraClass}" data-gallery-open="${index}" aria-label="Zobrazit fotografii ${index + 1} z ${total}">
      <img src="${src}" alt="" width="320" height="240" loading="lazy">
    </button>`;
}

function propertyGalleryHtml(images, title, isSold) {
  const badge = `<span class="card__badge card__badge--${isSold ? "sold" : "available"}">${isSold ? "Prodáno" : "V nabídce"}</span>`;
  const mainAlt = `${title} – fotografie 1`;
  const total = images.length;

  let sideGrid = "";
  if (total > 1) {
    const showMoreCell = total > GALLERY_SIDE_SLOTS;
    const thumbCount = showMoreCell ? GALLERY_SIDE_SLOTS - 1 : Math.min(GALLERY_SIDE_SLOTS, total - 1);
    let cells = "";

    for (let i = 0; i < thumbCount; i++) {
      cells += propertyGalleryThumbHtml(images[i + 1], i + 1, total);
    }

    if (showMoreCell) {
      const hiddenCount = total - 4;
      const openIndex = GALLERY_SIDE_SLOTS;
      cells += `
        <button type="button" class="property-gallery__thumb property-gallery__thumb--more" data-gallery-open="${openIndex}" aria-label="Zobrazit dalších ${hiddenCount} fotografií">
          <img src="${images[openIndex]}" alt="" width="320" height="240" loading="lazy">
          <span class="property-gallery__more-label">+${hiddenCount} dalších</span>
        </button>`;
    }

    sideGrid = `<div class="property-gallery__side"><div class="property-gallery__grid">${cells}</div></div>`;
  }

  return `
    <div class="property-gallery" data-property-gallery>
      <button type="button" class="property-gallery__main" data-gallery-open="0" aria-label="Zvětšit hlavní fotografii">
        <img src="${images[0]}" alt="${mainAlt}" width="1200" height="750">
        ${badge}
        <span class="property-gallery__hint">Zvětšit fotografii</span>
      </button>
      ${sideGrid}
    </div>
    <div class="lightbox" id="property-lightbox" hidden aria-hidden="true" role="dialog" aria-modal="true" aria-label="Galerie fotografií">
      <div class="lightbox__backdrop" data-lightbox-close tabindex="-1"></div>
      <button type="button" class="lightbox__close" data-lightbox-close aria-label="Zavřít galerii">${ICONS.close}</button>
      <button type="button" class="lightbox__nav lightbox__nav--prev" data-lightbox-prev aria-label="Předchozí fotografie">${ICONS.chevronLeft}</button>
      <button type="button" class="lightbox__nav lightbox__nav--next" data-lightbox-next aria-label="Další fotografie">${ICONS.chevronRight}</button>
      <figure class="lightbox__figure">
        <img class="lightbox__img" src="" alt="">
        <figcaption class="lightbox__counter"></figcaption>
      </figure>
    </div>
  `;
}

function initPropertyGallery(images, title) {
  const lightbox = document.getElementById("property-lightbox");
  if (!lightbox || !images.length) return;

  const imgEl = lightbox.querySelector(".lightbox__img");
  const counterEl = lightbox.querySelector(".lightbox__counter");
  const prevBtn = lightbox.querySelector("[data-lightbox-prev]");
  const nextBtn = lightbox.querySelector("[data-lightbox-next]");
  let currentIndex = 0;
  let lastFocus = null;

  function showSlide(index) {
    currentIndex = (index + images.length) % images.length;
    imgEl.src = images[currentIndex];
    imgEl.alt = `${title} – fotografie ${currentIndex + 1}`;
    if (counterEl) counterEl.textContent = `${currentIndex + 1} / ${images.length}`;
    if (prevBtn) prevBtn.hidden = images.length <= 1;
    if (nextBtn) nextBtn.hidden = images.length <= 1;
  }

  function openLightbox(index) {
    lastFocus = document.activeElement;
    showSlide(index);
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    lightbox.querySelector(".lightbox__close")?.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  document.querySelectorAll("[data-gallery-open]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      openLightbox(Number(trigger.dataset.galleryOpen) || 0);
    });
  });

  lightbox.querySelectorAll("[data-lightbox-close]").forEach((el) => {
    el.addEventListener("click", closeLightbox);
  });

  prevBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    showSlide(currentIndex - 1);
  });

  nextBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    showSlide(currentIndex + 1);
  });

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showSlide(currentIndex - 1);
    if (e.key === "ArrowRight") showSlide(currentIndex + 1);
  });
}

function propertyCardHtml(property) {
  const isSold = property.status === "sold";
  const priceDisplay = isSold && property.priceLabel
    ? property.priceLabel
    : formatPrice(property.price);

  return `
    <article class="card fade-in">
      <a href="${propertyDetailUrl(property)}" class="card__inner">
        <div class="card__image">
          <img src="${property.image}" alt="${property.title}" loading="lazy" width="400" height="300">
          <span class="card__badge card__badge--${isSold ? "sold" : "available"}">${isSold ? "Prodáno" : "V nabídce"}</span>
        </div>
        <div class="card__body">
          <h3 class="card__title">${property.title}</h3>
          <p class="card__location">${ICONS.mapPin} ${property.location}, ${property.city}</p>
          <div class="card__footer">
            <div>
              <p class="card__price">${priceDisplay}</p>
              <p class="card__meta">${isSold ? formatPrice(property.price) : `${property.area} m²${property.rooms ? " · " + property.rooms : ""}`}</p>
            </div>
          </div>
        </div>
      </a>
    </article>
  `;
}

function renderPropertyGrid(container, properties, limit) {
  if (!container) return;
  const list = limit ? properties.slice(0, limit) : properties;
  container.innerHTML = list.map(propertyCardHtml).join("");
  if (typeof observeFadeIn === "function") observeFadeIn(container);
}

function initPropertyListing() {
  const grid = document.getElementById("properties-grid");
  if (!grid) return;

  const params = new URLSearchParams(window.location.search);
  const paramFilter = params.get("filter");
  let filter =
    paramFilter === "sold" || paramFilter === "available" ? paramFilter : "available";

  const tabs = document.querySelectorAll(".filter-tab");
  tabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.filter === filter);
    tab.addEventListener("click", () => {
      filter = tab.dataset.filter;
      tabs.forEach((t) => t.classList.toggle("is-active", t === tab));
      applyFilter();
    });
  });

  function applyFilter() {
    const filtered = PROPERTIES.filter((p) => p.status === filter);
    if (filtered.length === 0) {
      grid.innerHTML = '<p class="text-center text-body">V této kategorii zatím nejsou žídné nemovitosti.</p>';
    } else {
      renderPropertyGrid(grid, filtered);
    }
  }

  applyFilter();
}

function initPropertyDetail() {
  const root = document.getElementById("property-detail");
  if (!root) return;

  const slug = new URLSearchParams(window.location.search).get("slug");
  const property = getPropertyBySlug(slug);

  if (!property) {
    root.innerHTML = `
      <div class="container section text-center">
        <h1 class="heading-section">Nemovitost nenalezena</h1>
        <p class="text-body mt-lg"><a href="nemovitosti.html" class="link-arrow">${ICONS.arrowRight} Zpět na nemovitosti</a></p>
      </div>
    `;
    document.title = "Nemovitost nenalezena | " + SITE.name;
    return;
  }

  document.title = `${property.title} | ${SITE.name}`;
  const isSold = property.status === "sold";
  const images = getPropertyImages(property);

  root.innerHTML = `
    <section class="page-hero" style="padding-bottom:1rem">
      <div class="container">
        <a href="nemovitosti.html" class="link-arrow" style="margin-top:0">← Zpět na nemovitosti</a>
      </div>
    </section>
    <section class="section" style="padding-top:0">
      <div class="container">
        ${propertyGalleryHtml(images, property.title, isSold)}
        <div class="property-detail__grid">
          <div>
            <h1 class="heading-section">${property.title}</h1>
            <p class="card__location" style="margin-top:0.5rem;font-size:1rem">${ICONS.mapPin} ${property.location}, ${property.city}</p>
            <p class="card__price" style="margin-top:1.5rem;font-size:2rem">${isSold && property.priceLabel ? property.priceLabel : formatPrice(property.price)}</p>
            ${!isSold ? `<p class="card__meta">${property.area} m²${property.rooms ? " · " + property.rooms : ""}</p>` : `<p class="card__meta">${formatPrice(property.price)}</p>`}

            <h2 class="heading-section" style="font-size:1.25rem;margin-top:2.5rem">Popis</h2>
            <p class="text-body" style="margin-top:1rem">${property.description}</p>

            <h2 class="heading-section" style="font-size:1.25rem;margin-top:2rem">Parametry</h2>
            <dl class="params-grid" style="margin-top:1rem">
              <div class="param-box"><dt>Plocha</dt><dd>${property.area} m²</dd></div>
              ${property.rooms ? `<div class="param-box"><dt>Dispozice</dt><dd>${property.rooms}</dd></div>` : ""}
              ${property.yearBuilt ? `<div class="param-box"><dt>Rok výstavby</dt><dd>${property.yearBuilt}</dd></div>` : ""}
              ${property.floor ? `<div class="param-box"><dt>Patro</dt><dd>${property.floor}</dd></div>` : ""}
              ${property.energyClass ? `<div class="param-box"><dt>Energetická třída</dt><dd>${property.energyClass}</dd></div>` : ""}
            </dl>

            ${property.features?.length ? `
              <h2 class="heading-section" style="font-size:1.25rem;margin-top:2rem">Vybavení</h2>
              <ul class="check-list" style="margin-top:1rem">
                ${property.features.map((f) => `<li><span class="check-list__icon">${ICONS.check}</span>${f}</li>`).join("")}
              </ul>
            ` : ""}
          </div>
          <aside>
            <div class="broker-card">
              <div class="broker-card__photo"><img src="${SITE.brokerPhoto}" alt="${SITE.name}"></div>
              <h3 style="font-family:var(--font-display);font-size:1.125rem">${SITE.name}</h3>
              <p style="font-size:0.875rem;opacity:0.6;margin-top:0.25rem">${SITE.office}</p>
              <p style="margin-top:1rem;font-size:0.9375rem"><a href="tel:${SITE.phoneHref}" style="color:inherit">${SITE.phone}</a></p>
              <p style="font-size:0.9375rem"><a href="mailto:${SITE.email}" style="color:inherit">${SITE.email}</a></p>
              ${!isSold ? `<a href="kontakt.html" class="btn btn--primary btn--block" style="margin-top:1.25rem">Mám zájem</a>` : ""}
            </div>
          </aside>
        </div>
      </div>
    </section>
  `;

  initPropertyGallery(images, property.title);
}

function initHomeProperties() {
  const availableEl = document.getElementById("home-available");
  const soldEl = document.getElementById("home-sold");
  if (availableEl) {
    renderPropertyGrid(
      availableEl,
      PROPERTIES.filter((p) => p.status === "available"),
      3
    );
  }
  if (soldEl) {
    renderPropertyGrid(
      soldEl,
      PROPERTIES.filter((p) => p.status === "sold"),
      3
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initHomeProperties();
  initPropertyListing();
  initPropertyDetail();
});
