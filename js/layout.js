/**
 * Vykreslení hlavičky, patičky a plovoucího CTA
 */

function getCurrentPage() {
  let path = window.location.pathname.split("/").pop() || "index.html";
  if (path === "nemovitost.html") return "nemovitosti.html";
  return path;
}

function isNavActive(linkHref, current) {
  if (linkHref === "index.html") {
    return current === "index.html" || current === "";
  }
  return linkHref === current;
}

function navLinkHtml(link, current) {
  const active = isNavActive(link.href, current);
  return `<a href="${link.href}"${active ? ' class="is-active" aria-current="page"' : ""}>${link.label}</a>`;
}

function renderHeader() {
  const current = getCurrentPage();
  const navLinks = SITE.nav.map((link) => navLinkHtml(link, current)).join("");

  return `
    <header class="site-header" id="site-header">
      <div class="container site-header__inner">
        <a href="index.html" class="logo">
          <span class="logo__name">${SITE.name}</span>
        </a>
        <nav class="nav-desktop" aria-label="Hlavní navigace">${navLinks}</nav>
        <div class="header-actions">
          <a href="tel:${SITE.phoneHref}" class="header-phone">${ICONS.phone}<span>${SITE.phone}</span></a>
          <a href="odhad-zdarma.html" class="btn btn--primary btn--sm">Odhad zdarma</a>
        </div>
        <button type="button" class="menu-toggle" id="menu-toggle" aria-label="Menu" aria-expanded="false">
          <span id="menu-icon">${ICONS.menu}</span>
        </button>
      </div>
      <nav class="nav-mobile" id="nav-mobile" aria-label="Mobilní navigace">
        ${SITE.nav.map((l) => navLinkHtml(l, current)).join("")}
        <div class="nav-mobile__footer">
          <a href="tel:${SITE.phoneHref}" class="header-phone" style="padding:0 1rem 1rem">${ICONS.phone} ${SITE.phone}</a>
          <a href="odhad-zdarma.html" class="btn btn--primary btn--lg btn--block">Nezávazný odhad zdarma</a>
        </div>
      </nav>
    </header>
    <div class="floating-cta" id="floating-cta">
      <a href="odhad-zdarma.html" class="floating-cta__btn">${ICONS.calculator}<span>Odhad zdarma</span></a>
      <button type="button" class="floating-cta__close" id="floating-cta-close" aria-label="Skrýt">${ICONS.close}</button>
    </div>
  `;
}

function renderFooter() {
  const navLinks = SITE.nav
    .map((l) => `<li><a href="${l.href}">${l.label}</a></li>`)
    .join("");

  return `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <span class="logo__name">${SITE.name}</span>
            <span class="logo__tag">${SITE.office}</span>
            <p>Osobní realitní makléř. Pomohu vám prodat nebo pronajmout nemovitost za maximum — s lidským přístupem a kompletním servisem.</p>
            <a href="odhad-zdarma.html" class="btn btn--primary" style="margin-top:1.5rem">Odhad nemovitosti zdarma</a>
          </div>
          <div class="footer-links">
            <h4 class="footer-heading">Navigace</h4>
            <ul>${navLinks}<li><a href="odhad-zdarma.html" class="highlight">Odhad zdarma</a></li></ul>
          </div>
          <div class="footer-contact">
            <h4 class="footer-heading">Kontakt</h4>
            <a href="tel:${SITE.phoneHref}">${SITE.phone}</a>
            <a href="mailto:${SITE.email}">${SITE.email}</a>
            <p style="margin-top:0.5rem;color:rgba(255,255,255,0.7);font-size:0.9375rem">${SITE.regions.join(" · ")}</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© ${new Date().getFullYear()} ${SITE.name} · ${SITE.office}</p>
          <p>Nezávislý realitní makléř v síti RE/MAX</p>
        </div>
      </div>
    </footer>
  `;
}

function initLayout() {
  const headerEl = document.getElementById("header-placeholder");
  const footerEl = document.getElementById("footer-placeholder");
  if (headerEl) headerEl.outerHTML = renderHeader();
  if (footerEl) footerEl.outerHTML = renderFooter();

  const header = document.getElementById("site-header");
  const toggle = document.getElementById("menu-toggle");
  const mobileNav = document.getElementById("nav-mobile");
  const menuIcon = document.getElementById("menu-icon");
  const floatingCta = document.getElementById("floating-cta");
  const floatingClose = document.getElementById("floating-cta-close");

  // Scroll header
  window.addEventListener("scroll", () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 20);
    if (floatingCta && !floatingCta.dataset.dismissed) {
      floatingCta.classList.toggle("is-visible", window.scrollY > 600);
    }
  });

  // Mobile menu
  if (toggle && mobileNav) {
    toggle.addEventListener("click", () => {
      const open = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open);
      document.body.classList.toggle("menu-open", open);
      if (menuIcon) menuIcon.innerHTML = open ? ICONS.close : ICONS.menu;
    });
    mobileNav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        mobileNav.classList.remove("is-open");
        document.body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
        if (menuIcon) menuIcon.innerHTML = ICONS.menu;
      });
    });
  }

  if (floatingClose && floatingCta) {
    floatingClose.addEventListener("click", () => {
      floatingCta.dataset.dismissed = "true";
      floatingCta.classList.remove("is-visible");
    });
  }

  initSocialLinks();
}

function initSocialLinks() {
  const el = document.getElementById("social-links");
  if (!el || !SITE.social) return;

  const items = [
    { key: "facebook", label: "Facebook", icon: "facebook" },
    { key: "linkedin", label: "LinkedIn", icon: "linkedin" },
  ];

  el.innerHTML = items
    .filter((item) => SITE.social[item.key])
    .map(
      (item) =>
        `<a href="${SITE.social[item.key]}" class="social-links__item social-links__item--${item.key}" target="_blank" rel="noopener noreferrer" aria-label="${item.label}">${ICONS[item.icon]}</a>`
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", initLayout);
