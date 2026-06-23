/**
 * Globální konfigurace webu - upravte kontaktní údaje zde
 */
const SITE = {
  name: "Michal Janoušek",
  office: "RE/MAX Age",
  officeUrl: "https://www.remaxage.cz/",
  title: "Michal Janoušek | Realitní makléř RE/MAX Age",
  description:
    "Osobní realitní makléř Michal Janoušek z RE/MAX Age. Prodej a pronájem nemovitostí ve Středočeském kraji, Praze a Ústeckém kraji. Nezávazný odhad zdarma.",
  url: "https://michaljanousek.cz",
  phone: "+420 739 352 312",
  phoneHref: "+420739352312",
  email: "michal.janousek@re-max.cz",
  address: {
    street: "Husova 557",
    city: "27401 Slaný",
    full: "Husova 557, 27401 Slaný",
  },
  mapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2556.18!2d14.0839025!3d50.2315125!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTDCsDEzJzUzLjQiTiAxNMKwMDUnMDIuMSJF!5e0!3m2!1scs!2scz!4v1716816000000!5m2!1scs!2scz",
  regions: ["Středočeský kraj", "Praha", "Ústecký kraj"],
  brokerPhoto: "images/fotka_michal_janousek.png",
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61576739347830",
    linkedin: "https://www.linkedin.com/in/michal-janou%C5%A1ek-904b09149/",
  },
  nav: [
    { href: "index.html", label: "Domů" },
    { href: "o-mne.html", label: "O mně" },
    { href: "sluzby.html", label: "Služby" },
    { href: "nemovitosti.html", label: "Nemovitosti" },
    { href: "reference.html", label: "Reference" },
    { href: "kontakt.html", label: "Kontakt" },
  ],
};

/**
 * SEO – meta tagy, strukturovaná data, regionální nastavení
 */
const SEO = {
  language: "cs",
  locale: "cs_CZ",
  defaultImage: "images/fotka_michal_janousek_velka.jpeg",
  address: {
    street: "Husova 557",
    locality: "Slaný",
    postalCode: "27401",
    country: "CZ",
  },
  geo: {
    region: "CZ-ST",
    placename: "Slaný",
    latitude: 50.2315125,
    longitude: 14.0839025,
  },
  breadcrumbs: {
    home: [{ name: "Domů", path: "/" }],
    "o-mne": [
      { name: "Domů", path: "/" },
      { name: "O mně", path: "o-mne.html" },
    ],
    sluzby: [
      { name: "Domů", path: "/" },
      { name: "Služby", path: "sluzby.html" },
    ],
    nemovitosti: [
      { name: "Domů", path: "/" },
      { name: "Nemovitosti", path: "nemovitosti.html" },
    ],
    reference: [
      { name: "Domů", path: "/" },
      { name: "Reference", path: "reference.html" },
    ],
    kontakt: [
      { name: "Domů", path: "/" },
      { name: "Kontakt", path: "kontakt.html" },
    ],
    "odhad-zdarma": [
      { name: "Domů", path: "/" },
      { name: "Odhad zdarma", path: "odhad-zdarma.html" },
    ],
    "ochrana-osobnich-udaju": [
      { name: "Domů", path: "/" },
      { name: "Ochrana osobních údajů", path: "ochrana-osobnich-udaju.html" },
    ],
    cookies: [
      { name: "Domů", path: "/" },
      { name: "Cookies", path: "cookies.html" },
    ],
  },
};

/**
 * EmailJS – odesílání formulářů
 * 1. Účet na https://www.emailjs.com/
 * 2. Přidejte e-mailovou službu (Gmail / Outlook / SMTP)
 * 3. Vytvořte 2 šablony (odhad + kontakt) – proměnné níže
 * 4. Zkopírujte Public Key, Service ID a Template ID sem
 *
 * Šablona ODHAZ (estimate):
 *   {{from_name}}, {{from_email}}, {{reply_to}}, {{phone}}
 *   {{property_type}}, {{estimate_type}}, {{city}}, {{street}}, {{area}}
 *   {{dispozice}}, {{ownership}}, {{building_construction}}, {{house_type}}, {{extra_info}}
 *   {{summary}} – celý přehled jako text
 *
 * Šablona KONTAKT (contact):
 *   {{from_name}}, {{from_email}}, {{reply_to}}, {{phone}}, {{message}}, {{summary}}
 *
 * V nastavení šablony nastavte Reply-To na {{reply_to}}, aby šlo odpovědět klientovi.
 */
const EMAILJS = {
  enabled: true,
  publicKey: "EP6s_IuoFgtKjMvxM",
  serviceId: "service_bltvsgm",
  toEmail: "michal.janousek@re-max.cz",
  templates: {
    estimate: "template_5zbvjcq",
    contact: "template_9qlbp1k",
  },
};

/**
 * Cookies a analytika
 * googleAnalyticsId – po doplnění ID (např. G-XXXXXXXX) se GA načte jen po souhlasu uživatele
 */
const COOKIES = {
  storageKey: "mj_cookie_consent",
  version: 1,
  analytics: {
    googleAnalyticsId: "G-R3NX605GN4",
  },
};
