/**
 * Karty nemovitostí, filtrování a detail
 */

function propertyDetailUrl(property) {
  return `nemovitost.html?slug=${encodeURIComponent(property.slug)}`;
}

function normalizePropertyImages(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (value && typeof value === "object") {
    return Object.values(value)
      .map((item) => String(item).trim())
      .filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }
  return [];
}

function getPropertyImages(property) {
  const images = normalizePropertyImages(property.images);
  if (property.image && !images.includes(property.image)) {
    images.unshift(property.image);
  }
  return images.length ? images : [property.image].filter(Boolean);
}

const GALLERY_SIDE_SLOTS = 4;

const PROPERTY_STATUS_LABELS = {
  available: "V nabídce",
  reserved: "Rezervováno",
  sold: "Prodáno",
};

function propertyStatusBadgeHtml(status) {
  const key = PROPERTY_STATUS_LABELS[status] ? status : "available";
  return `<span class="card__badge card__badge--${key}">${PROPERTY_STATUS_LABELS[key]}</span>`;
}

function propertyGalleryThumbHtml(src, index, total, extraClass = "") {
  return `
    <button type="button" class="property-gallery__thumb${extraClass}" data-gallery-open="${index}" aria-label="Zobrazit fotografii ${index + 1} z ${total}">
      <img src="${src}" alt="" width="320" height="240" loading="lazy">
    </button>`;
}

function propertyGalleryHtml(images, title, status) {
  const badge = propertyStatusBadgeHtml(status);
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
  const priceDisplay = formatPrice(property.price);
  const params = resolvePropertyParams(property);
  const summary = propertyShortSummaryLine(property, params);

  return `
    <article class="card fade-in">
      <a href="${propertyDetailUrl(property)}" class="card__inner">
        <div class="card__image">
          <img src="${property.image}" alt="${property.title}" loading="lazy" width="400" height="300">
          ${propertyStatusBadgeHtml(property.status)}
        </div>
        <div class="card__body">
          <h3 class="card__title">${property.title}</h3>
          <p class="card__location">${ICONS.mapPin} ${property.location}</p>
          <div class="card__footer">
            <div>
              <p class="card__price">${priceDisplay}</p>
              ${summary ? `<p class="card__meta">${escapeHtml(summary)}</p>` : ""}
            </div>
          </div>
        </div>
      </a>
    </article>
  `;
}

function propertyEmptyHtml(message) {
  return `<p class="properties-empty text-body">${message}</p>`;
}

function renderPropertyGrid(container, properties, limit, emptyMessage = "") {
  if (!container) return;
  const list = limit ? properties.slice(0, limit) : properties;
  if (!list.length) {
    container.innerHTML = emptyMessage ? propertyEmptyHtml(emptyMessage) : "";
    return;
  }
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
    const filtered = PROPERTIES.filter((p) =>
      window.PropertiesApi
        ? PropertiesApi.filterByListingStatus(p, filter)
        : p.status === filter
    );
    if (filtered.length === 0) {
      grid.innerHTML = propertyEmptyHtml("V této kategorii zatím nejsou žádné nemovitosti.");
    } else {
      renderPropertyGrid(grid, filtered);
    }
  }

  applyFilter();
}

/* ── Detail nemovitosti (Sreality-ready) ── */

const OFFER_TYPE_LABELS = {
  prodej: "Prodej",
  pronajem: "Pronájem",
};

const PROPERTY_TYPE_LABELS = {
  byt: "Byt",
  dum: "Rodinný dům",
  pozemek: "Pozemek",
  komercni: "Komerční nemovitost",
  garaz: "Garáž",
};

const KEY_PARAM_DEFS = [
  { key: "condition", label: "Stav" },
  { key: "penb", label: "PENB" },
  { key: "ownership", label: "Vlastnictví" },
  { key: "buildingType", label: "Typ stavby" },
];

function getAllSpecParamDefs(propertyType) {
  const defs = [];

  if (propertyType !== "pozemek" && propertyType !== "garaz") {
    defs.push({ key: "disposition", label: "Dispozice" });
  }

  defs.push({
    key: "usableArea",
    label: propertyType === "pozemek" ? "Plocha" : "Užitná plocha",
    format: (v) => `${v} m²`,
  });

  if (propertyType === "byt") {
    defs.push({ key: "floor", label: "Patro", format: (v) => `${v}. patro` });
  }
  if (propertyType === "dum") {
    defs.push({ key: "landArea", label: "Plocha pozemku", format: (v) => `${v} m²` });
  }

  if (propertyType !== "pozemek") {
    defs.push(...KEY_PARAM_DEFS);
  } else {
    defs.push({ key: "ownership", label: "Vlastnictví" });
  }

  return defs;
}

const HIGHLIGHT_DEFS = [
  { key: "balcony", label: "Balkon" },
  { key: "loggia", label: "Lodžie" },
  { key: "terrace", label: "Terasa" },
  { key: "cellar", label: "Sklep" },
  { key: "garage", label: "Garáž" },
  { key: "elevator", label: "Výtah" },
  { key: "barrierFree", label: "Bezbariérový" },
];

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function resolveLocationDetail(property) {
  const detail = property.locationDetail || {};
  return {
    lat: detail.lat ?? property.map_lat ?? null,
    lng: detail.lng ?? property.map_lng ?? null,
  };
}

function resolvePropertyParams(property) {
  const raw = {
    ...(property.params || {}),
    disposition: property.params?.disposition ?? property.rooms,
    usableArea: property.params?.usableArea ?? property.area,
    penb: property.params?.penb ?? property.energyClass,
    floor: property.floor ?? property.params?.floor,
    landArea: property.landArea ?? property.params?.landArea,
    condition: property.params?.condition ?? property.condition,
  };

  const cleaned = {};
  Object.entries(raw).forEach(([key, value]) => {
    if (value == null || value === "") return;
    if (typeof value === "boolean" && value === false) return;
    cleaned[key] = value;
  });
  return cleaned;
}

function formatParamValue(value, formatter) {
  const formatted = formatter ? formatter(value) : value;
  if (formatted == null || formatted === "") return null;
  return formatted;
}

function formatDescriptionHtml(text) {
  if (!text) return "";
  return text
    .split(/\n\n+/)
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function truncateText(text, maxLength = 155) {
  const plain = String(text || "").replace(/\s+/g, " ").trim();
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength - 1).trim()}…`;
}

function setMetaTag(name, content, isProperty = false) {
  if (!content) return;
  const attr = isProperty ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function updatePropertySeo(property, images) {
  if (window.SEO?.applyPropertySeo) {
    window.SEO.applyPropertySeo(property, images);
    return;
  }

  const title = `${property.title} | ${SITE.name}`;
  const description = truncateText(property.description);
  const image = images[0] || property.image;
  const url = `${SITE.url}/nemovitost.html?slug=${encodeURIComponent(property.slug)}`;

  document.title = title;
  setMetaTag("description", description);
  setMetaTag("og:title", property.title, true);
  setMetaTag("og:description", description, true);
  setMetaTag("og:image", image, true);
  setMetaTag("og:type", "website", true);
  setMetaTag("og:url", url, true);
}

function propertyShortSummaryLine(property, params) {
  const parts = [
    property.offerType && (OFFER_TYPE_LABELS[property.offerType] || property.offerType),
    property.propertyType && (PROPERTY_TYPE_LABELS[property.propertyType] || property.propertyType),
  ];

  if (params.disposition) parts.push(params.disposition);
  if (params.usableArea) parts.push(`${params.usableArea} m²`);

  return parts.filter(Boolean).join(" · ");
}

function propertySummaryLine(property, params) {
  return propertyShortSummaryLine(property, params);
}

function propertyDetailHeaderHtml(property, params, location, isSold) {
  const priceDisplay = formatPrice(property.price);
  const locationLine = property.location || "";
  const summary = propertySummaryLine(property, params);

  return `
    <header class="property-detail__header fade-in">
      <h1 class="property-detail__title">${escapeHtml(property.title)}</h1>
      <p class="property-detail__price${isSold ? " property-detail__price--sold" : ""}">${priceDisplay}</p>
      ${
        locationLine
          ? `<p class="property-detail__location">${ICONS.mapPin}<span>${escapeHtml(locationLine)}</span></p>`
          : ""
      }
      ${summary ? `<p class="property-detail__summary">${escapeHtml(summary)}</p>` : ""}
    </header>`;
}

function buildPropertySpecsHtml(property, params, { compact = false } = {}) {
  const specItems = getAllSpecParamDefs(property.propertyType)
    .map((def) => {
      const raw = params[def.key];
      if (raw == null || raw === "") return null;
      const value = formatParamValue(raw, def.format);
      if (value == null) return null;
      return { label: def.label, value };
    })
    .filter(Boolean);

  const highlights =
    property.propertyType === "pozemek" || property.propertyType === "garaz"
      ? []
      : HIGHLIGHT_DEFS.map((def) => {
          const raw = params[def.key];
          if (raw !== true && raw !== "Ano") return null;
          return def.label;
        }).filter(Boolean);

  if (!specItems.length && !highlights.length) return "";

  const specsClass = compact ? "property-specs property-specs--card" : "property-specs";
  const wrapperTag = compact ? "div" : "section";
  const wrapperClass = compact ? "card__specs" : "property-detail__section fade-in";
  const aria = compact ? "" : ' aria-label="Parametry nemovitosti"';

  return `
    <${wrapperTag} class="${wrapperClass}"${aria}>
      ${
        specItems.length
          ? `<dl class="${specsClass}">${specItems
              .map(
                (item) => `
            <div class="property-specs__row">
              <dt>${item.label}</dt>
              <dd>${escapeHtml(String(item.value))}</dd>
            </div>`
              )
              .join("")}
          </dl>`
          : ""
      }
      ${
        highlights.length
          ? `<div class="property-specs__highlights">${highlights
              .map((label) => `<span class="property-specs__pill">${escapeHtml(label)}</span>`)
              .join("")}</div>`
          : ""
      }
    </${wrapperTag}>`;
}

function propertySpecsHtml(property, params) {
  return buildPropertySpecsHtml(property, params);
}

function propertyDescriptionHtml(description) {
  const html = formatDescriptionHtml(description);
  if (!html) return "";

  return `
    <section class="property-detail__section fade-in" aria-labelledby="property-description-heading">
      <h2 id="property-description-heading" class="property-detail__section-title">Popis</h2>
      <div class="property-detail__description">${html}</div>
    </section>`;
}

function propertyLocationHtml(location, property) {
  const hasMap = location.lat != null && location.lng != null;
  const locationLine = property.location || "";

  if (!hasMap && !locationLine) return "";

  return `
    <section class="property-detail__section fade-in" aria-labelledby="property-location-heading">
      <h2 id="property-location-heading" class="property-detail__section-title">Lokalita</h2>
      ${
        hasMap
          ? `<div class="property-map" id="property-map" data-lat="${location.lat}" data-lng="${location.lng}"></div>`
          : ""
      }
      ${
        locationLine
          ? `<p class="property-location__address">${ICONS.mapPin}<span>${escapeHtml(locationLine)}</span></p>`
          : ""
      }
    </section>`;
}

function propertyBrokerHtml(isSold) {
  return `
    <aside class="property-detail__broker fade-in">
      <div class="broker-card broker-card--detail">
        <div class="broker-card__photo">
          <img src="${SITE.brokerPhoto}" alt="${SITE.name}" width="96" height="96">
        </div>
        <p class="broker-card__label">Váš makléř</p>
        <h2 class="broker-card__name">${SITE.name}</h2>
        <p class="broker-card__office">${SITE.office}</p>
        <ul class="broker-card__contacts">
          <li><a href="tel:${SITE.phoneHref}">${ICONS.phone}<span>${SITE.phone}</span></a></li>
          <li><a href="mailto:${SITE.email}">${ICONS.mail}<span>${SITE.email}</span></a></li>
        </ul>
        <div class="broker-card__actions">
          <a href="tel:${SITE.phoneHref}" class="btn btn--primary btn--block btn--sm">${ICONS.phone} Zavolat</a>
          <a href="mailto:${SITE.email}?subject=${encodeURIComponent("Zájem o nemovitost")}" class="btn btn--outline-light btn--block btn--sm">${ICONS.mail} Napsat e-mail</a>
        </div>
        ${!isSold ? `<a href="kontakt.html" class="broker-card__link">Nebo napište přes formulář</a>` : ""}
      </div>
    </aside>`;
}

function initPropertyMap() {
  const container = document.getElementById("property-map");
  if (!container || typeof L === "undefined") return;

  const lat = Number(container.dataset.lat);
  const lng = Number(container.dataset.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return;

  const map = L.map(container, {
    scrollWheelZoom: false,
    zoomControl: true,
  }).setView([lat, lng], 16);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  L.marker([lat, lng]).addTo(map);

  setTimeout(() => map.invalidateSize(), 100);
}

async function initPropertyDetail() {
  const root = document.getElementById("property-detail");
  if (!root) return;

  const slug = new URLSearchParams(window.location.search).get("slug");
  if (!slug) {
    root.innerHTML = `
      <div class="container section text-center">
        <h1 class="heading-section">Nemovitost nenalezena</h1>
        <p class="text-body mt-lg"><a href="nemovitosti.html" class="link-arrow">${ICONS.arrowRight} Zpět na nemovitosti</a></p>
      </div>
    `;
    document.title = "Nemovitost nenalezena | " + SITE.name;
    return;
  }

  root.innerHTML = '<div class="container section"><p class="text-body text-center">Načítám detail nemovitosti…</p></div>';

  if (window.PropertiesApi) {
    try {
      if (typeof PropertiesApi.loadPropertyBySlug === "function") {
        await PropertiesApi.loadPropertyBySlug(slug);
      } else {
        await PropertiesApi.loadCatalog();
      }
    } catch (err) {
      console.error(err);
    }
  }

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

  const isSold = property.status === "sold";
  const images = getPropertyImages(property);
  const params = resolvePropertyParams(property);
  const location = resolveLocationDetail(property);

  updatePropertySeo(property, images);

  root.innerHTML = `
    <article class="property-detail">
      <div class="container property-detail__top">
        <a href="nemovitosti.html" class="property-detail__back link-arrow">← Zpět na nemovitosti</a>
      </div>
      <div class="container property-detail__gallery-wrap">
        ${propertyGalleryHtml(images, property.title, property.status)}
      </div>
      <div class="container property-detail__body">
        <div class="property-detail__intro">
          ${propertyDetailHeaderHtml(property, params, location, isSold)}
        </div>
        ${propertyBrokerHtml(isSold)}
        <div class="property-detail__sections">
          ${propertySpecsHtml(property, params)}
          ${propertyDescriptionHtml(property.description)}
          ${propertyLocationHtml(location, property)}
        </div>
      </div>
    </article>
  `;

  initPropertyGallery(images, property.title);
  initPropertyMap();
  if (typeof observeFadeIn === "function") observeFadeIn(root);
}

function initHomeProperties() {
  const availableEl = document.getElementById("home-available");
  const soldEl = document.getElementById("home-sold");
  if (availableEl) {
    renderPropertyGrid(
      availableEl,
      PROPERTIES.filter((p) =>
        window.PropertiesApi
          ? PropertiesApi.filterByListingStatus(p, "available")
          : p.status === "available"
      ),
      3,
      "V aktuální nabídce zatím nejsou žádné nemovitosti."
    );
  }
  if (soldEl) {
    renderPropertyGrid(
      soldEl,
      PROPERTIES.filter((p) => p.status === "sold"),
      3,
      "Zatím nejsou žádné prodané reference."
    );
  }
}

async function initPropertiesFromApi() {
  const needsData =
    document.getElementById("home-available") ||
    document.getElementById("home-sold") ||
    document.getElementById("properties-grid") ||
    document.getElementById("property-detail");

  if (!needsData || !window.PropertiesApi) return;

  try {
    await PropertiesApi.loadCatalog();
  } catch (err) {
    console.error("Nepodařilo se načíst nemovitosti:", err);
    const grid = document.getElementById("properties-grid");
    if (grid) {
      grid.innerHTML = propertyEmptyHtml("Nabídku se nepodařilo načíst. Zkuste stránku obnovit.");
    }
    return;
  }

  initHomeProperties();
  initPropertyListing();
  await initPropertyDetail();
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.PropertiesApi) {
    initPropertiesFromApi();
    return;
  }
  initHomeProperties();
  initPropertyListing();
  initPropertyDetail();
});

// Zpět z historie prohlížeče – znovu načíst stránku (jinak zůstane starý obsah)
window.addEventListener("pageshow", (event) => {
  if (event.persisted) location.reload();
});
