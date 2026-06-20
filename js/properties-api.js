/**
 * Načítání nemovitostí a recenzí z PHP API (Wedos MySQL).
 */
(function () {
  "use strict";

  function buildApiUrl(path) {
    const qIndex = path.indexOf("?");
    const route = qIndex >= 0 ? path.slice(0, qIndex) : path;
    const params = new URLSearchParams(qIndex >= 0 ? path.slice(qIndex + 1) : "");
    params.set("route", route);
    // Vynutit čerstvá data – necacheovat odpovědi API v prohlížeči
    params.set("_", Date.now().toString(36));
    return `/api/index.php?${params.toString()}`;
  }

  let properties = [];
  let testimonials = [];

  function normalizeImageList(images) {
    if (Array.isArray(images)) {
      return images.map((item) => String(item).trim()).filter(Boolean);
    }
    if (images && typeof images === "object") {
      return Object.values(images)
        .map((item) => String(item).trim())
        .filter(Boolean);
    }
    if (typeof images === "string") {
      const trimmed = images.trim();
      if (!trimmed) return [];
      if (trimmed.startsWith("[")) {
        try {
          return normalizeImageList(JSON.parse(trimmed));
        } catch {
          /* fall through */
        }
      }
      if (trimmed.includes("\n")) {
        return trimmed
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (trimmed.includes(",")) {
        return trimmed
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [trimmed];
    }
    return [];
  }

  function mapProperty(raw) {
    return {
      id: String(raw.id),
      slug: raw.slug,
      title: raw.title,
      location: raw.location,
      price: raw.price,
      status: raw.status,
      offerType: raw.offer_type,
      propertyType: raw.property_type,
      area: raw.area,
      floor: raw.floor,
      landArea: raw.land_area,
      rooms: raw.rooms,
      condition: raw.condition,
      image: raw.image,
      images: normalizeImageList(raw.images),
      description: raw.description || "",
      locationDetail: raw.location_detail || null,
      params: raw.params || null,
    };
  }

  function mapReview(raw) {
    const author = String(raw.author || "").trim();
    const parts = author.split(",").map((s) => s.trim());
    return {
      id: String(raw.id),
      name: parts[0] || author,
      location: parts.slice(1).join(", ") || "",
      text: raw.text,
      rating: 5,
    };
  }

  async function fetchJson(path) {
    const response = await fetch(buildApiUrl(path), {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    return data;
  }

  async function loadCatalog() {
    const items = await fetchJson("properties");
    properties = (items || []).map(mapProperty);
    return properties;
  }

  async function loadPropertyBySlug(slug) {
    const raw = await fetchJson(`properties?slug=${encodeURIComponent(slug)}`);
    const property = mapProperty(raw);
    const index = properties.findIndex((item) => item.slug === slug);
    if (index >= 0) {
      properties[index] = property;
    } else {
      properties.push(property);
    }
    return property;
  }

  async function loadReviews() {
    const items = await fetchJson("reviews");
    testimonials = (items || []).map(mapReview);
    return testimonials;
  }

  function getPropertyBySlug(slug) {
    return properties.find((p) => p.slug === slug) || null;
  }

  function filterByListingStatus(property, filter) {
    if (filter === "sold") return property.status === "sold";
    return property.status === "available" || property.status === "reserved";
  }

  window.PropertiesApi = {
    loadCatalog,
    loadPropertyBySlug,
    loadReviews,
    getPropertyBySlug,
    filterByListingStatus,
    getProperties: () => properties,
    getTestimonials: () => testimonials,
  };

  Object.defineProperty(window, "PROPERTIES", {
    configurable: true,
    get() {
      return properties;
    },
  });

  Object.defineProperty(window, "TESTIMONIALS", {
    configurable: true,
    get() {
      return testimonials;
    },
  });

  window.getPropertyBySlug = getPropertyBySlug;
})();
