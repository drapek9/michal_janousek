/**
 * SEO – meta tagy, Open Graph, Twitter Cards a JSON-LD
 * Nastavení: js/config.js → SEO
 */

function seoAbsoluteUrl(path = "/") {
  const base = String(SITE.url || "").replace(/\/$/, "");
  if (!path || path === "/") return `${base}/`;
  if (/^https?:\/\//i.test(path)) return path;
  return `${base}/${String(path).replace(/^\//, "")}`;
}

function seoAbsoluteImage(path) {
  return seoAbsoluteUrl(path || SEO.defaultImage);
}

function seoGetPageId() {
  const file = window.location.pathname.split("/").pop() || "index.html";
  if (file === "" || file === "index.html") return "home";
  return file.replace(/\.html$/, "");
}

function seoGetCanonicalPath() {
  const page = seoGetPageId();
  if (page === "home") return "/";
  if (page === "nemovitost") {
    const slug = new URLSearchParams(window.location.search).get("slug");
    return slug ? `nemovitost.html?slug=${encodeURIComponent(slug)}` : "nemovitosti.html";
  }
  return `${page}.html`;
}

function seoSetMetaTag(name, content, isProperty = false) {
  if (content == null || content === "") return;
  const attr = isProperty ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", String(content));
}

function seoSetLinkTag(rel, href, extra = {}) {
  if (!href) return;
  let selector = `link[rel="${rel}"]`;
  if (extra.hreflang) selector += `[hreflang="${extra.hreflang}"]`;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
  if (extra.hreflang) el.setAttribute("hreflang", extra.hreflang);
}

function seoInjectJsonLd(data, id = "jsonld-main") {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const script = document.createElement("script");
  script.id = id;
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

function seoTruncate(text, maxLength = 160) {
  const plain = String(text || "").replace(/\s+/g, " ").trim();
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength - 1).trim()}…`;
}

function seoReadDescription() {
  return document.querySelector('meta[name="description"]')?.content?.trim() || SITE.description;
}

function seoApplySocialMeta({ title, description, url, image, type = "website", imageAlt }) {
  const imageUrl = seoAbsoluteImage(image);
  seoSetMetaTag("og:locale", SEO.locale, true);
  seoSetMetaTag("og:site_name", SITE.name, true);
  seoSetMetaTag("og:title", title, true);
  seoSetMetaTag("og:description", description, true);
  seoSetMetaTag("og:url", url, true);
  seoSetMetaTag("og:image", imageUrl, true);
  seoSetMetaTag("og:image:alt", imageAlt || `${SITE.name} – ${SITE.office}`, true);
  seoSetMetaTag("og:type", type, true);
  seoSetMetaTag("twitter:card", "summary_large_image");
  seoSetMetaTag("twitter:title", title);
  seoSetMetaTag("twitter:description", description);
  seoSetMetaTag("twitter:image", imageUrl);
}

function seoBuildOrganizationJsonLd() {
  const addr = SEO.address;
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    description: SITE.description,
    image: seoAbsoluteImage(SITE.brokerPhoto),
    url: SITE.url,
    telephone: SITE.phoneHref,
    email: SITE.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: addr.street,
      addressLocality: addr.locality,
      postalCode: addr.postalCode,
      addressCountry: addr.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SEO.geo.latitude,
      longitude: SEO.geo.longitude,
    },
    areaServed: SITE.regions.map((name) => ({
      "@type": "AdministrativeArea",
      name,
    })),
    sameAs: Object.values(SITE.social || {}).filter(Boolean),
  };
}

function seoBuildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: SEO.language,
    publisher: { "@id": `${SITE.url}/#organization` },
  };
}

function seoBuildBreadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: seoAbsoluteUrl(item.path),
    })),
  };
}

function seoBuildFaqJsonLd(items) {
  if (!items?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

function seoBuildPropertyJsonLd(property, images) {
  const url = seoAbsoluteUrl(`nemovitost.html?slug=${encodeURIComponent(property.slug)}`);
  const imageList = (images?.length ? images : [property.image]).filter(Boolean).map(seoAbsoluteImage);
  const data = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: seoTruncate(property.description, 5000),
    url,
    image: imageList.length === 1 ? imageList[0] : imageList,
  };

  if (property.location) {
    data.contentLocation = {
      "@type": "Place",
      name: property.location,
      address: property.location,
    };
  }

  if (property.price != null) {
    data.offers = {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "CZK",
      availability:
        property.status === "sold"
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
      url,
    };
  }

  return data;
}

function seoApplyBaseMeta() {
  const canonical = seoAbsoluteUrl(seoGetCanonicalPath());
  const title = document.title;
  const description = seoReadDescription();
  const image = SEO.defaultImage;

  seoSetLinkTag("canonical", canonical);
  seoSetLinkTag("alternate", canonical, { hreflang: SEO.language });
  seoSetLinkTag("alternate", canonical, { hreflang: "x-default" });
  seoSetMetaTag("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
  seoSetMetaTag("author", SITE.name);
  seoSetMetaTag("theme-color", "#0A2540");
  seoSetMetaTag("format-detection", "telephone=yes");
  seoSetMetaTag("geo.region", SEO.geo.region);
  seoSetMetaTag("geo.placename", SEO.geo.placename);
  seoSetMetaTag("geo.position", `${SEO.geo.latitude};${SEO.geo.longitude}`);
  seoSetMetaTag("ICBM", `${SEO.geo.latitude}, ${SEO.geo.longitude}`);

  seoApplySocialMeta({
    title,
    description,
    url: canonical,
    image,
  });
}

function initPageSeo() {
  if (seoGetPageId() === "nemovitost") return;

  seoApplyBaseMeta();
  seoInjectJsonLd(seoBuildOrganizationJsonLd(), "jsonld-organization");
  seoInjectJsonLd(seoBuildWebSiteJsonLd(), "jsonld-website");

  const page = seoGetPageId();
  const breadcrumbs = SEO.breadcrumbs?.[page];
  if (breadcrumbs?.length) {
    seoInjectJsonLd(seoBuildBreadcrumbJsonLd(breadcrumbs), "jsonld-breadcrumb");
  }

  if (page === "odhad-zdarma" && typeof FAQ !== "undefined") {
    const faqLd = seoBuildFaqJsonLd(FAQ);
    if (faqLd) seoInjectJsonLd(faqLd, "jsonld-faq");
  }
}

function applyPropertySeo(property, images) {
  const title = `${property.title} | ${SITE.name}`;
  const description = seoTruncate(property.description || `${property.title} – ${property.location || "nemovitost"}`);
  const image = images?.[0] || property.image;
  const url = seoAbsoluteUrl(`nemovitost.html?slug=${encodeURIComponent(property.slug)}`);

  document.title = title;
  seoSetMetaTag("description", description);
  seoSetLinkTag("canonical", url);
  seoSetLinkTag("alternate", url, { hreflang: SEO.language });
  seoSetLinkTag("alternate", url, { hreflang: "x-default" });

  seoApplySocialMeta({
    title: property.title,
    description,
    url,
    image,
    type: "product",
    imageAlt: property.title,
  });

  seoInjectJsonLd(seoBuildOrganizationJsonLd(), "jsonld-organization");
  seoInjectJsonLd(
    seoBuildBreadcrumbJsonLd([
      { name: "Domů", path: "/" },
      { name: "Nemovitosti", path: "nemovitosti.html" },
      { name: property.title, path: `nemovitost.html?slug=${encodeURIComponent(property.slug)}` },
    ]),
    "jsonld-breadcrumb"
  );
  seoInjectJsonLd(seoBuildPropertyJsonLd(property, images), "jsonld-property");
}

window.SEO = {
  absoluteUrl: seoAbsoluteUrl,
  absoluteImage: seoAbsoluteImage,
  setMetaTag: seoSetMetaTag,
  setLinkTag: seoSetLinkTag,
  injectJsonLd: seoInjectJsonLd,
  truncate: seoTruncate,
  applyPropertySeo,
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPageSeo);
} else {
  initPageSeo();
}
