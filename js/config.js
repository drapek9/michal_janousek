/**
 * Globální konfigurace webu - upravte kontaktní údaje zde
 */
const SITE = {
  name: "Michal Janoušek",
  office: "Realitní makléř",
  officeUrl: "",
  title: "Michal Janoušek | Realitní makléř",
  description:
    "Osobní realitní makléř Michal Janoušek. Prodej a pronájem nemovitostí ve Středočeském kraji, Praze a Ústeckém kraji. Nezávazný odhad zdarma.",
  url: "https://michaljanousek.cz",
  phone: "+420 739 352 312",
  phoneHref: "+420739352312",
  email: "michal.janousek@outlook.com",
  address: {
    street: "Husova 660",
    city: "439 23 Lenešice",
    full: "Husova 660, 439 23 Lenešice",
  },
  mapsEmbedUrl:
    "https://maps.google.com/maps?q=Husova+660,+439+23+Lene%C5%A1ice&hl=cs&z=17&output=embed",
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
    street: "Husova 660",
    locality: "Lenešice",
    postalCode: "439 23",
    country: "CZ",
  },
  geo: {
    region: "CZ-US",
    placename: "Lenešice",
    latitude: 50.3767628,
    longitude: 13.7739604,
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
  toEmail: "michal.janousek@outlook.com",
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
