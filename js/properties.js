/**
 * Karty nemovitostí, filtrování a detail
 */

function propertyCardHtml(property) {
  const isSold = property.status === "sold";
  const priceDisplay = isSold && property.priceLabel
    ? property.priceLabel
    : formatPrice(property.price);

  return `
    <article class="card fade-in">
      <a href="nemovitost.html?slug=${property.slug}">
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
            <span class="card__link">Detail ${ICONS.arrowRight}</span>
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
  let filter = params.get("filter") || "all";

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
    const filtered =
      filter === "all"
        ? PROPERTIES
        : PROPERTIES.filter((p) => p.status === filter);
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
  const thumbs = property.images.slice(1, 3);

  root.innerHTML = `
    <section class="page-hero" style="padding-bottom:1rem">
      <div class="container">
        <a href="nemovitosti.html" class="link-arrow" style="margin-top:0">← Zpět na nemovitosti</a>
      </div>
    </section>
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="property-gallery">
          <div class="property-gallery__main">
            <img src="${property.images[0]}" alt="${property.title}">
            <span class="card__badge card__badge--${isSold ? "sold" : "available"}" style="position:absolute;top:1rem;left:1rem">${isSold ? "Prodáno" : "V nabídce"}</span>
          </div>
        </div>
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
            ${!isSold ? `<div data-estimate-form style="margin-top:1.5rem" id="detail-estimate-form"></div>` : ""}
          </aside>
        </div>
      </div>
    </section>
  `;

  if (!isSold) {
    const formEl = document.getElementById("detail-estimate-form");
    if (formEl) {
      formEl.innerHTML = estimateFormHtml({ id: "detail-estimate" });
      initForms();
    }
  }
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
