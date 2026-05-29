/**
 * Formuláře - odhad zdarma a kontakt
 */

const ESTIMATE_SECTION_TITLES = [
  "Typ nemovitosti",
  "Kde se nemovitost nachází",
  "Vlastnictví nemovitosti",
  "Detaily nemovitosti",
  "Kontakt na vás",
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

const ESTIMATE_OWNER_STATUS = [
  { value: "ano", label: "Ano" },
  { value: "zastupuji", label: "Ne, zastupuji vlastníka" },
  { value: "spoluvlastnik", label: "Spoluvlastník" },
];

const ESTIMATE_OWNERSHIP_TYPES = [
  { value: "druzstevni", label: "Družstevní" },
  { value: "osobni", label: "Osobní" },
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
  const ownershipOptions = ESTIMATE_OWNERSHIP_TYPES.map(
    (o) => `<option value="${o.value}">${o.label}</option>`
  ).join("");
  const ownerStatusRadios = ESTIMATE_OWNER_STATUS.map(
    (o) => `
    <label class="form-radio">
      <input type="radio" name="owner_status" value="${o.value}">
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
        <span class="form-label">Jste vlastníkem nemovitosti? *</span>
        <div class="form-radio-group">${ownerStatusRadios}</div>
      </fieldset>

      <fieldset class="form-fieldset">
        <legend class="form-fieldset__legend">${ESTIMATE_SECTION_TITLES[3]}</legend>
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
          <div class="form-group form-group--full" data-estimate-field="vlastnictvi">
            <label for="${id}-ownership">Druh vlastnictví *</label>
            <select class="form-input" id="${id}-ownership" name="ownership">
              <option value="">Vyberte typ vlastnictví</option>${ownershipOptions}
            </select>
          </div>
        </div>
        <p class="form-hint" data-estimate-hint="pozemek" hidden>Pro pozemek vyplňte pouze plochu v m².</p>
      </fieldset>

      <fieldset class="form-fieldset">
        <legend class="form-fieldset__legend">${ESTIMATE_SECTION_TITLES[4]}</legend>
        <div class="form-grid form-grid--2">
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

function updateEstimateDetailFields(form) {
  if (!getEstimateType(form)) return;

  const isPozemek = isEstimatePozemek(form);
  const dispoziceField = form.querySelector('[data-estimate-field="dispozice"]');
  const vlastnictviField = form.querySelector('[data-estimate-field="vlastnictvi"]');
  const hint = form.querySelector('[data-estimate-hint="pozemek"]');

  if (dispoziceField) dispoziceField.hidden = isPozemek;
  if (vlastnictviField) vlastnictviField.hidden = isPozemek;
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

  const city = form.querySelector('[name="city"]');
  const street = form.querySelector('[name="street"]');
  if (!city?.value.trim()) return fail("Vyplňte město.");
  if (!street?.value.trim()) return fail("Vyplňte ulici.");

  const owner = form.querySelector('[name="owner_status"]:checked');
  if (!owner) return fail("Vyberte, zda jste vlastníkem nemovitosti.");

  const area = form.querySelector('[name="area"]');
  if (!area?.value || Number(area.value) < 1) return fail("Vyplňte plochu v m².");

  if (!isEstimatePozemek(form)) {
    const dispozice = form.querySelector('[name="dispozice"]');
    const ownership = form.querySelector('[name="ownership"]');
    if (!dispozice?.value) return fail("Vyberte dispozici.");
    if (!ownership?.value) return fail("Vyberte druh vlastnictví.");
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
      <button type="submit" class="btn btn--primary btn--lg" style="margin-top:1.5rem">Odeslat zprávu</button>
    </form>
  `;
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
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validateEstimateForm(form)) return;

      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Odesílám...";
      }
      // Připraveno pro API: const data = Object.fromEntries(new FormData(form));
      await new Promise((r) => setTimeout(r, 800));
      showFormSuccess(form.parentElement, "estimate");
    });
  });

  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Odesílám...";
      }
      await new Promise((r) => setTimeout(r, 800));
      showFormSuccess(contactForm.parentElement, "contact");
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
