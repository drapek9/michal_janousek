/**
 * Formuláře - odhad zdarma a kontakt
 */

const ESTIMATE_SECTION_TITLES = [
  "Typ nemovitosti",
  "Kde se nemovitost nachází",
  "Detaily nemovitosti",
];

const ESTIMATE_PROPERTY_TYPES = [
  { value: "byt", label: "Byt", image: "images/byt_dotaznik.png" },
  { value: "dum", label: "Dům", image: "images/dum_dotaznik.png" },
  { value: "pozemek", label: "Pozemek", image: "images/pozemek_dotaznik.png" },
];

const ESTIMATE_DISPOSITIONS = [
  "1+kk",
  "1+1",
  "2+kk",
  "2+1",
  "3+kk",
  "3+1",
  "4+kk",
  "4+1",
  "5+kk",
  "5+1",
  "6+kk a větší",
];

const ESTIMATE_OWNERSHIP_TYPES = [
  { value: "druzstevni", label: "Družstevní" },
  { value: "osobni", label: "Osobní" },
];

const ESTIMATE_BUILDING_CONSTRUCTION = [
  { value: "cihlovy", label: "Cihlový dům" },
  { value: "panelovy", label: "Panelový dům" },
  { value: "jine", label: "Jiné" },
];

const ESTIMATE_HOUSE_TYPES = [
  { value: "samostatny_rodinny", label: "Samostatný rodinný dům" },
  { value: "radovy_blok", label: "Řadový dům / v bloku" },
  { value: "cinzovni", label: "Činžovní dům" },
  { value: "rekreacni", label: "Dům k rekreaci" },
  { value: "komercni", label: "Komerční objekt (kanceláře, obchody)" },
];

const ESTIMATE_EXTRA_INFO = [
  { value: "balkon_lodzie", label: "Balkón/lodžie" },
  { value: "terasa", label: "Terasa" },
  { value: "sklep", label: "Sklep" },
  { value: "vytah", label: "Výtah" },
  { value: "parkovaci_stani", label: "Parkovací stání" },
  { value: "garaz", label: "Garáž" },
];

const ESTIMATE_ODHAD_TYPES = [
  { value: "majitel_odhad_zdarma", label: "Jsem majitelem – odhad ZDARMA" },
  { value: "dedicske_riceni", label: "Pro dědické řízení" },
  { value: "vyporadani_sjm_rozvod", label: "Pro vypořádání SJM při rozvodu" },
  { value: "vyporadani_spoluvlastnici", label: "Pro vypořádání mezi spoluvlastníky" },
  { value: "kupuji_nemovitost", label: "Kupuji nemovitost" },
];

function estimateFormHtml(options = {}) {
  const { hero = false, id = "estimate-form" } = options;
  const typeCards = ESTIMATE_PROPERTY_TYPES.map(
    (t) => `
    <label class="form-type-card">
      <input type="radio" name="type" value="${t.value}" class="form-type-card__input">
      <span class="form-type-card__check" aria-hidden="true">${ICONS.check}</span>
      <span class="form-type-card__icon">
        <img src="${t.image}" alt="" width="300" height="300" loading="lazy" decoding="async">
      </span>
      <span class="form-type-card__label">${t.label}</span>
    </label>`
  ).join("");
  const dispositionOptions = ESTIMATE_DISPOSITIONS.map(
    (d) => `<option value="${d}">${d}</option>`
  ).join("");
  const ownershipRadios = ESTIMATE_OWNERSHIP_TYPES.map(
    (o) => `
    <label class="form-radio">
      <input type="radio" name="ownership" value="${o.value}">
      <span>${o.label}</span>
    </label>`
  ).join("");
  const houseTypeRadios = ESTIMATE_HOUSE_TYPES.map(
    (o) => `
    <label class="form-radio">
      <input type="radio" name="house_type" value="${o.value}">
      <span>${o.label}</span>
    </label>`
  ).join("");
  const odhadTypeRadios = ESTIMATE_ODHAD_TYPES.map(
    (o) => `
    <label class="form-radio">
      <input type="radio" name="estimate_type" value="${o.value}">
      <span>${o.label}</span>
    </label>`
  ).join("");
  const buildingConstructionRadios = ESTIMATE_BUILDING_CONSTRUCTION.map(
    (o) => `
    <label class="form-radio">
      <input type="radio" name="building_construction" value="${o.value}">
      <span>${o.label}</span>
    </label>`
  ).join("");
  const extraInfoCheckboxes = ESTIMATE_EXTRA_INFO.map(
    (o) => `
    <label class="form-checkbox">
      <input type="checkbox" name="extra_info" value="${o.value}">
      <span>${o.label}</span>
    </label>`
  ).join("");

  return `
    <form class="form-card" id="${id}" data-form="estimate">
      ${hero ? `<div class="form-card__title">Nezávazný odhad zdarma</div><p class="form-card__subtitle">Vyplňte formulář – ozvu se vám</p>` : ""}

      <fieldset class="form-fieldset">
        <legend class="form-fieldset__legend">${ESTIMATE_SECTION_TITLES[0]}</legend>
        <div class="form-type-cards" role="radiogroup" aria-label="Typ nemovitosti">
          ${typeCards}
        </div>
      </fieldset>

      <div class="form-estimate-body" data-estimate-body>
        <div class="form-estimate-body__inner">
      <fieldset class="form-fieldset">
        <legend class="form-fieldset__legend">Typ odhadu</legend>
        <div class="form-radio-group" role="radiogroup" aria-label="Typ odhadu">${odhadTypeRadios}</div>
      </fieldset>

      <fieldset class="form-fieldset">
        <legend class="form-fieldset__legend">${ESTIMATE_SECTION_TITLES[1]}</legend>
        <div class="form-grid form-grid--2">
          <div class="form-group">
            <label for="${id}-city">Město *</label>
            <input class="form-input" id="${id}-city" name="city" type="text" placeholder="např. Praha">
          </div>
          <div class="form-group">
            <label for="${id}-street">Ulice *</label>
            <input class="form-input" id="${id}-street" name="street" type="text" placeholder="např. Vinohradská 12">
          </div>
        </div>
      </fieldset>

      <fieldset class="form-fieldset">
        <legend class="form-fieldset__legend">${ESTIMATE_SECTION_TITLES[2]}</legend>
        <div class="form-grid form-grid--2">
          <div class="form-group" data-estimate-field="dispozice">
            <label for="${id}-dispozice">Dispozice *</label>
            <select class="form-input" id="${id}-dispozice" name="dispozice">
              <option value="">Vyberte dispozici</option>${dispositionOptions}
            </select>
          </div>
          <div class="form-group">
            <label for="${id}-area">Plocha (m²) *</label>
            <input class="form-input" id="${id}-area" name="area" type="number" min="1" placeholder="např. 75">
          </div>
          <div class="form-group form-group--full" data-estimate-field="typ-domu">
            <span class="form-label">Typ domu *</span>
            <div class="form-radio-group" role="radiogroup" aria-label="Typ domu">${houseTypeRadios}</div>
          </div>
          <div class="form-group form-group--full" data-estimate-field="vlastnictvi">
            <span class="form-label">Druh vlastnictví *</span>
            <div class="form-radio-group" role="radiogroup" aria-label="Druh vlastnictví">${ownershipRadios}</div>
          </div>
          <div class="form-group form-group--full" data-estimate-field="konstrukce">
            <span class="form-label">Konstrukce domu *</span>
            <div class="form-radio-group" role="radiogroup" aria-label="Konstrukce domu">${buildingConstructionRadios}</div>
          </div>
          <div class="form-group form-group--full" data-estimate-field="dalsi-informace">
            <span class="form-label">Další informace</span>
            <div class="form-checkbox-group" role="group" aria-label="Další informace">${extraInfoCheckboxes}</div>
          </div>
          <div class="form-group form-group--full">
            <label for="${id}-name">Jméno a příjmení *</label>
            <input class="form-input" id="${id}-name" name="name" type="text" placeholder="Jan Novák" autocomplete="name">
          </div>
          <div class="form-group">
            <label for="${id}-email">E-mail *</label>
            <input class="form-input" id="${id}-email" name="email" type="email" placeholder="vas@email.cz" autocomplete="email">
          </div>
          <div class="form-group">
            <label for="${id}-phone">Telefon *</label>
            <input class="form-input" id="${id}-phone" name="phone" type="tel" placeholder="+420 123 456 789" autocomplete="tel">
          </div>
        </div>
        <p class="form-hint" data-estimate-hint="pozemek" hidden>Pro pozemek vyplňte pouze plochu v m².</p>
      </fieldset>
        </div>
      </div>

      <div class="form-estimate-actions">
        <p class="form-error" role="alert" hidden></p>
        <button type="submit" class="btn btn--primary btn--lg">${ICONS.send} Odeslat žádost o odhad</button>
        <p class="form-note">Odesláním souhlasíte se zpracováním údajů pro účely kontaktu. Údaje nejsou předávány třetím stranám.</p>
      </div>
    </form>
  `;
}

function getEstimateType(form) {
  return form.querySelector('[name="type"]:checked');
}

function isEstimatePozemek(form) {
  const type = getEstimateType(form);
  return type && type.value === "pozemek";
}

function isEstimateDum(form) {
  const type = getEstimateType(form);
  return type && type.value === "dum";
}

function updateEstimateDetailFields(form) {
  if (!getEstimateType(form)) return;

  const isPozemek = isEstimatePozemek(form);
  const isDum = isEstimateDum(form);
  const dispoziceField = form.querySelector('[data-estimate-field="dispozice"]');
  const typDomuField = form.querySelector('[data-estimate-field="typ-domu"]');
  const vlastnictviField = form.querySelector('[data-estimate-field="vlastnictvi"]');
  const konstrukceField = form.querySelector('[data-estimate-field="konstrukce"]');
  const dalsiInformaceField = form.querySelector('[data-estimate-field="dalsi-informace"]');
  const hint = form.querySelector('[data-estimate-hint="pozemek"]');

  if (dispoziceField) dispoziceField.hidden = isPozemek;
  if (typDomuField) typDomuField.hidden = !isDum;
  if (vlastnictviField) vlastnictviField.hidden = isPozemek;
  if (konstrukceField) konstrukceField.hidden = isPozemek;
  if (dalsiInformaceField) dalsiInformaceField.hidden = isPozemek;
  if (hint) hint.hidden = !isPozemek;
}

function clearEstimateFormError(form) {
  const errorEl = form.querySelector(".form-error");
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.hidden = true;
  }
}

function updateEstimateFormVisibility(form) {
  const body = form.querySelector("[data-estimate-body]");
  const type = getEstimateType(form);
  if (!body) return;

  const isOpen = Boolean(type);
  body.classList.toggle("is-open", isOpen);
  body.setAttribute("aria-hidden", isOpen ? "false" : "true");
  if (isOpen) body.removeAttribute("inert");
  else body.setAttribute("inert", "");

  if (isOpen) {
    clearEstimateFormError(form);
    updateEstimateDetailFields(form);
  }
}

function validateEstimateForm(form) {
  const errorEl = form.querySelector(".form-error");

  function fail(message) {
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    }
    return false;
  }

  if (errorEl) errorEl.hidden = true;

  const type = getEstimateType(form);
  if (!type) return fail("Vyberte typ nemovitosti.");

  const estimateType = form.querySelector('[name="estimate_type"]:checked');
  if (!estimateType) return fail("Vyberte typ odhadu.");

  const city = form.querySelector('[name="city"]');
  const street = form.querySelector('[name="street"]');
  if (!city?.value.trim()) return fail("Vyplňte město.");
  if (!street?.value.trim()) return fail("Vyplňte ulici.");

  const area = form.querySelector('[name="area"]');
  if (!area?.value || Number(area.value) < 1) return fail("Vyplňte plochu v m².");

  if (!isEstimatePozemek(form)) {
    const dispozice = form.querySelector('[name="dispozice"]');
    const ownership = form.querySelector('[name="ownership"]:checked');
    const buildingConstruction = form.querySelector('[name="building_construction"]:checked');
    if (!dispozice?.value) return fail("Vyberte dispozici.");
    if (!ownership) return fail("Vyberte druh vlastnictví.");
    if (!buildingConstruction) return fail("Vyberte konstrukci domu.");
  }

  if (isEstimateDum(form)) {
    const houseType = form.querySelector('[name="house_type"]:checked');
    if (!houseType) return fail("Vyberte typ domu.");
  }

  const name = form.querySelector('[name="name"]');
  const email = form.querySelector('[name="email"]');
  const phone = form.querySelector('[name="phone"]');
  if (!name?.value.trim()) return fail("Vyplňte jméno a příjmení.");
  if (!email?.value.trim()) return fail("Vyplňte e-mail.");
  if (!phone?.value.trim()) return fail("Vyplňte telefon.");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.value.trim())) return fail("Zadejte platný e-mail.");

  return true;
}

function initEstimateForm(form) {
  if (form.dataset.estimateInitialized === "true") return;
  form.dataset.estimateInitialized = "true";

  updateEstimateFormVisibility(form);

  form.querySelectorAll('[name="type"]').forEach((input) => {
    input.addEventListener("change", () => updateEstimateFormVisibility(form));
  });
}

function contactFormHtml() {
  return `
    <form id="contact-form" data-form="contact">
      <div class="form-grid form-grid--2">
        <div class="form-group">
          <label for="contact-name">Jméno *</label>
          <input class="form-input" id="contact-name" name="name" required>
        </div>
        <div class="form-group">
          <label for="contact-phone">Telefon</label>
          <input class="form-input" id="contact-phone" name="phone" type="tel" placeholder="+420 123 456 789">
        </div>
      </div>
      <div class="form-group" style="margin-top:1rem">
        <label for="contact-email">E-mail *</label>
        <input class="form-input" id="contact-email" name="email" type="email" required>
      </div>
      <div class="form-group" style="margin-top:1rem">
        <label for="contact-message">Zpráva *</label>
        <textarea class="form-input" id="contact-message" name="message" rows="5" required></textarea>
      </div>
      <p class="form-error" role="alert" hidden></p>
      <button type="submit" class="btn btn--primary btn--lg" style="margin-top:1.5rem">Odeslat zprávu</button>
    </form>
  `;
}

function showFormError(form, message) {
  const errorEl = form.querySelector(".form-error");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.hidden = false;
  }
}

function clearFormError(form) {
  const errorEl = form.querySelector(".form-error");
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.hidden = true;
  }
}

function setSubmitButtonState(btn, isLoading, loadingText, defaultHtml) {
  if (!btn) return;
  if (isLoading) {
    btn.disabled = true;
    btn.textContent = loadingText;
    return;
  }
  btn.disabled = false;
  if (defaultHtml) btn.innerHTML = defaultHtml;
}

function validateContactForm(form) {
  clearFormError(form);

  const name = form.querySelector('[name="name"]');
  const email = form.querySelector('[name="email"]');
  const message = form.querySelector('[name="message"]');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name?.value.trim()) {
    showFormError(form, "Vyplňte jméno.");
    return false;
  }
  if (!email?.value.trim()) {
    showFormError(form, "Vyplňte e-mail.");
    return false;
  }
  if (!emailPattern.test(email.value.trim())) {
    showFormError(form, "Zadejte platný e-mail.");
    return false;
  }
  if (!message?.value.trim()) {
    showFormError(form, "Vyplňte zprávu.");
    return false;
  }

  return true;
}

function showFormSuccess(container, type) {
  const isEstimate = type === "estimate";
  container.innerHTML = `
    <div class="form-card form-success">
      <div class="form-success__icon">${ICONS.check}</div>
      <h3 class="heading-section" style="font-size:1.5rem">${isEstimate ? "Děkuji za váš zájem" : "Zpráva odeslána"}</h3>
      <p class="text-body" style="margin-top:1rem">
        ${
          isEstimate
            ? `Vaši žádost jsem obdržel. Odhad připravím a co nejdříve se vám ozvu s výsledkem.`
            : "Děkuji! Ozvu se vám co nejdříve."
        }
      </p>
      ${
        isEstimate
          ? `<p class="form-note">Mezitím mě můžete kontaktovat na <a href="tel:${SITE.phoneHref}" style="color:var(--color-red)">${SITE.phone}</a>.</p>`
          : ""
      }
    </div>
  `;
}

function initForms() {
  document.querySelectorAll("[data-form='estimate']").forEach((form) => {
    initEstimateForm(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    const submitBtnHtml = submitBtn?.innerHTML || "";

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validateEstimateForm(form)) return;

      clearFormError(form);
      setSubmitButtonState(submitBtn, true, "Odesílám...");

      try {
        await sendEstimateEmail(form);
        showFormSuccess(form.parentElement, "estimate");
      } catch (err) {
        console.error("[EmailJS] Chyba odeslání odhadu:", err);
        setSubmitButtonState(submitBtn, false, "", submitBtnHtml);
        showFormError(
          form,
          "Odeslání se nepodařilo. Zkuste to prosím znovu, nebo mě kontaktujte telefonicky."
        );
      }
    });
  });

  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const submitBtnHtml = submitBtn?.innerHTML || "";

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validateContactForm(contactForm)) return;

      setSubmitButtonState(submitBtn, true, "Odesílám...");

      try {
        await sendContactEmail(contactForm);
        showFormSuccess(contactForm.parentElement, "contact");
      } catch (err) {
        console.error("[EmailJS] Chyba odeslání kontaktu:", err);
        setSubmitButtonState(submitBtn, false, "", submitBtnHtml);
        showFormError(
          contactForm,
          "Odeslání se nepodařilo. Zkuste to prosím znovu, nebo mě kontaktujte telefonicky."
        );
      }
    });
  }
}

/** Vloží formuláře do placeholderů na stránce */
function mountForms() {
  document.querySelectorAll("[data-estimate-form]").forEach((el) => {
    const hero = el.dataset.estimateForm === "hero";
    const id = el.id || "estimate-form-" + Math.random().toString(36).slice(2, 7);
    el.innerHTML = estimateFormHtml({ hero, id });
  });
  const contactEl = document.getElementById("contact-form-placeholder");
  if (contactEl) contactEl.innerHTML = contactFormHtml();
  initForms();
}

document.addEventListener("DOMContentLoaded", mountForms);
