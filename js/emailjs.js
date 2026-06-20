/**
 * Odesílání formulářů přes EmailJS
 * Nastavení: js/config.js → EMAILJS
 *
 * V EmailJS vytvořte 2 e-mailové šablony a použijte proměnné uvedené v config.js.
 */

const EMAIL_LABELS = {
  propertyType: { byt: "Byt", dum: "Dům", pozemek: "Pozemek" },
  estimateType: {
    majitel_odhad_zdarma: "Jsem majitelem – odhad ZDARMA",
    dedicske_riceni: "Pro dědické řízení",
    vyporadani_sjm_rozvod: "Pro vypořádání SJM při rozvodu",
    vyporadani_spoluvlastnici: "Pro vypořádání mezi spoluvlastníky",
    kupuji_nemovitost: "Kupuji nemovitost",
  },
  ownership: { druzstevni: "Družstevní", osobni: "Osobní" },
  buildingConstruction: {
    cihlovy: "Cihlový dům",
    panelovy: "Panelový dům",
    jine: "Jiné",
  },
  houseType: {
    samostatny_rodinny: "Samostatný rodinný dům",
    radovy_blok: "Řadový dům / v bloku",
    cinzovni: "Činžovní dům",
    rekreacni: "Dům k rekreaci",
    komercni: "Komerční objekt (kanceláře, obchody)",
  },
  extraInfo: {
    balkon_lodzie: "Balkón/lodžie",
    terasa: "Terasa",
    sklep: "Sklep",
    vytah: "Výtah",
    parkovaci_stani: "Parkovací stání",
    garaz: "Garáž",
  },
};

function emailJsPlaceholder(value) {
  return !value || String(value).startsWith("YOUR_");
}

function isEmailJsConfigured() {
  const cfg = typeof EMAILJS !== "undefined" ? EMAILJS : null;
  if (!cfg?.enabled) return false;
  if (emailJsPlaceholder(cfg.publicKey) || emailJsPlaceholder(cfg.serviceId)) return false;
  if (emailJsPlaceholder(cfg.templates?.estimate) || emailJsPlaceholder(cfg.templates?.contact)) {
    return false;
  }
  return typeof emailjs !== "undefined";
}

function initEmailJs() {
  if (!isEmailJsConfigured()) return false;
  emailjs.init({ publicKey: EMAILJS.publicKey });
  return true;
}

function label(map, value, fallback = "—") {
  if (!value) return fallback;
  return map[value] || value;
}

function getCheckedValue(form, name) {
  return form.querySelector(`[name="${name}"]:checked`)?.value || "";
}

function getCheckedLabels(form, name, map) {
  return [...form.querySelectorAll(`[name="${name}"]:checked`)]
    .map((el) => label(map, el.value, el.value))
    .join(", ");
}

function buildEstimateEmailParams(form) {
  const propertyType = getCheckedValue(form, "type");
  const estimateType = getCheckedValue(form, "estimate_type");
  const ownership = getCheckedValue(form, "ownership");
  const buildingConstruction = getCheckedValue(form, "building_construction");
  const houseType = getCheckedValue(form, "house_type");
  const extraInfo = getCheckedLabels(form, "extra_info", EMAIL_LABELS.extraInfo);

  const name = form.querySelector('[name="name"]')?.value.trim() || "";
  const email = form.querySelector('[name="email"]')?.value.trim() || "";
  const phone = form.querySelector('[name="phone"]')?.value.trim() || "";
  const city = form.querySelector('[name="city"]')?.value.trim() || "";
  const street = form.querySelector('[name="street"]')?.value.trim() || "";
  const area = form.querySelector('[name="area"]')?.value || "";
  const dispozice = form.querySelector('[name="dispozice"]')?.value || "";

  const propertyTypeLabel = label(EMAIL_LABELS.propertyType, propertyType);
  const estimateTypeLabel = label(EMAIL_LABELS.estimateType, estimateType);
  const ownershipLabel = label(EMAIL_LABELS.ownership, ownership);
  const buildingLabel = label(EMAIL_LABELS.buildingConstruction, buildingConstruction);
  const houseTypeLabel = label(EMAIL_LABELS.houseType, houseType);

  const lines = [
    `Typ nemovitosti: ${propertyTypeLabel}`,
    `Typ odhadu: ${estimateTypeLabel}`,
    `Adresa: ${street}, ${city}`,
    `Plocha: ${area} m²`,
  ];

  if (propertyType !== "pozemek") {
    lines.push(`Dispozice: ${dispozice || "—"}`);
    lines.push(`Druh vlastnictví: ${ownershipLabel}`);
    lines.push(`Konstrukce domu: ${buildingLabel}`);
  }
  if (propertyType === "dum") {
    lines.push(`Typ domu: ${houseTypeLabel}`);
  }
  if (extraInfo) {
    lines.push(`Další informace: ${extraInfo}`);
  }
  lines.push("", `Jméno: ${name}`, `E-mail: ${email}`, `Telefon: ${phone}`);

  const summary = lines.join("\n");

  return {
    form_type: "Odhad zdarma",
    to_email: EMAILJS.toEmail || SITE.email,
    from_name: name,
    from_email: email,
    reply_to: email,
    phone,
    property_type: propertyTypeLabel,
    estimate_type: estimateTypeLabel,
    city,
    street,
    area: `${area} m²`,
    dispozice: dispozice || "—",
    ownership: ownershipLabel,
    building_construction: buildingLabel,
    house_type: houseTypeLabel,
    extra_info: extraInfo || "—",
    summary,
  };
}

function buildContactEmailParams(form) {
  const name = form.querySelector('[name="name"]')?.value.trim() || "";
  const email = form.querySelector('[name="email"]')?.value.trim() || "";
  const phone = form.querySelector('[name="phone"]')?.value.trim() || "";
  const message = form.querySelector('[name="message"]')?.value.trim() || "";

  const summary = [
    `Jméno: ${name}`,
    `E-mail: ${email}`,
    phone ? `Telefon: ${phone}` : null,
    "",
    "Zpráva:",
    message,
  ]
    .filter((line) => line !== null)
    .join("\n");

  return {
    form_type: "Kontaktní formulář",
    to_email: EMAILJS.toEmail || SITE.email,
    from_name: name,
    from_email: email,
    reply_to: email,
    phone: phone || "—",
    message,
    summary,
  };
}

async function sendEmailJsTemplate(templateKey, params) {
  if (!initEmailJs()) {
    console.warn("[EmailJS] Není nakonfigurováno – simulace odeslání.", params);
    await new Promise((resolve) => setTimeout(resolve, 800));
    return;
  }

  const templateId = EMAILJS.templates[templateKey];
  await emailjs.send(EMAILJS.serviceId, templateId, params);
}

async function sendEstimateEmail(form) {
  return sendEmailJsTemplate("estimate", buildEstimateEmailParams(form));
}

async function sendContactEmail(form) {
  return sendEmailJsTemplate("contact", buildContactEmailParams(form));
}
