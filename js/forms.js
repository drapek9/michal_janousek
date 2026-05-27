/**
 * Formuláře - odhad zdarma (vícekrokový) a kontakt
 */

const ESTIMATE_TOTAL_STEPS = 5;

const ESTIMATE_STEP_TITLES = [
  "Typ nemovitosti",
  "Kde se nemovitost nachází",
  "Vlastnictví nemovitosti",
  "Detaily nemovitosti",
  "Kontakt na vás",
];

const ESTIMATE_PROPERTY_TYPES = [
  { value: "byt", label: "Byt" },
  { value: "dum", label: "Dům" },
  { value: "pozemek", label: "Pozemek" },
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
  const typeOptions = ESTIMATE_PROPERTY_TYPES.map(
    (t) => `<option value="${t.value}">${t.label}</option>`
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
    <form class="form-card form-wizard" id="${id}" data-form="estimate" data-wizard-step="1">
      ${hero ? `<div class="form-card__title">Nezávazný odhad zdarma</div><p class="form-card__subtitle">Vyplňte formulář krok po kroku - ozvu se vám</p>` : ""}

      <div class="form-wizard__header">
        <p class="form-wizard__counter">
          Krok <strong class="form-wizard__current">1</strong> z <strong>${ESTIMATE_TOTAL_STEPS}</strong>
        </p>
        <div class="form-wizard__bar" role="progressbar" aria-valuemin="1" aria-valuemax="${ESTIMATE_TOTAL_STEPS}" aria-valuenow="1">
          <div class="form-wizard__fill" style="width: ${100 / ESTIMATE_TOTAL_STEPS}%"></div>
        </div>
        <h3 class="form-wizard__step-title">${ESTIMATE_STEP_TITLES[0]}</h3>
      </div>

      <div class="form-wizard__panels">
        <!-- Krok 1 -->
        <div class="form-wizard__panel is-active" data-wizard-panel="1">
          <div class="form-group">
            <label for="${id}-type">Typ nemovitosti *</label>
            <select class="form-input" id="${id}-type" name="type">
              <option value="">Vyberte typ</option>${typeOptions}
            </select>
          </div>
        </div>

        <!-- Krok 2 -->
        <div class="form-wizard__panel" data-wizard-panel="2" hidden>
          <p class="form-wizard__panel-desc">Kde se nemovitost nachází?</p>
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
        </div>

        <!-- Krok 3 -->
        <div class="form-wizard__panel" data-wizard-panel="3" hidden>
          <span class="form-label">Jste vlastníkem nemovitosti? *</span>
          <div class="form-radio-group">${ownerStatusRadios}</div>
        </div>

        <!-- Krok 4 -->
        <div class="form-wizard__panel" data-wizard-panel="4" hidden>
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
          <p class="form-wizard__hint" data-estimate-hint="pozemek" hidden>Pro pozemek vyplňte pouze plochu v m².</p>
        </div>

        <!-- Krok 5 -->
        <div class="form-wizard__panel" data-wizard-panel="5" hidden>
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
        </div>
      </div>

      <p class="form-wizard__error" role="alert" hidden></p>

      <div class="form-wizard__nav">
        <button type="button" class="btn btn--outline" data-wizard-prev hidden>Zpět</button>
        <button type="button" class="btn btn--primary" data-wizard-next>Další</button>
        <button type="submit" class="btn btn--primary btn--lg" data-wizard-submit hidden>${ICONS.send} Odeslat žádost o odhad</button>
      </div>

      <p class="form-note">Odesláním souhlasíte se zpracováním údajů pro účely kontaktu. Údaje nejsou předávány třetím stranám.</p>
    </form>
  `;
}

function isEstimatePozemek(form) {
  const type = form.querySelector('[name="type"]');
  return type && type.value === "pozemek";
}

function updateEstimateStep4Fields(form) {
  const isPozemek = isEstimatePozemek(form);
  const dispoziceField = form.querySelector('[data-estimate-field="dispozice"]');
  const vlastnictviField = form.querySelector('[data-estimate-field="vlastnictvi"]');
  const hint = form.querySelector('[data-estimate-hint="pozemek"]');

  if (dispoziceField) dispoziceField.hidden = isPozemek;
  if (vlastnictviField) vlastnictviField.hidden = isPozemek;
  if (hint) hint.hidden = !isPozemek;
}

function validateEstimateStep(form, step) {
  const errorEl = form.querySelector(".form-wizard__error");

  function fail(message) {
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    }
    return false;
  }

  if (errorEl) errorEl.hidden = true;

  if (step === 1) {
    const type = form.querySelector('[name="type"]');
    if (!type || !type.value) return fail("Vyberte typ nemovitosti.");
  }

  if (step === 2) {
    const city = form.querySelector('[name="city"]');
    const street = form.querySelector('[name="street"]');
    if (!city?.value.trim()) return fail("Vyplňte město.");
    if (!street?.value.trim()) return fail("Vyplňte ulici.");
  }

  if (step === 3) {
    const owner = form.querySelector('[name="owner_status"]:checked');
    if (!owner) return fail("Vyberte, zda jste vlastníkem nemovitosti.");
  }

  if (step === 4) {
    const area = form.querySelector('[name="area"]');
    if (!area?.value || Number(area.value) < 1) return fail("Vyplňte plochu v m².");

    if (!isEstimatePozemek(form)) {
      const dispozice = form.querySelector('[name="dispozice"]');
      const ownership = form.querySelector('[name="ownership"]');
      if (!dispozice?.value) return fail("Vyberte dispozici.");
      if (!ownership?.value) return fail("Vyberte druh vlastnictví.");
    }
  }

  if (step === 5) {
    const name = form.querySelector('[name="name"]');
    const email = form.querySelector('[name="email"]');
    const phone = form.querySelector('[name="phone"]');
    if (!name?.value.trim()) return fail("Vyplňte jméno a příjmení.");
    if (!email?.value.trim()) return fail("Vyplňte e-mail.");
    if (!phone?.value.trim()) return fail("Vyplňte telefon.");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.value.trim())) return fail("Zadejte platný e-mail.");
  }

  return true;
}

function setEstimateWizardStep(form, step) {
  const panels = form.querySelectorAll("[data-wizard-panel]");
  const currentEl = form.querySelector(".form-wizard__current");
  const titleEl = form.querySelector(".form-wizard__step-title");
  const fillEl = form.querySelector(".form-wizard__fill");
  const barEl = form.querySelector(".form-wizard__bar");
  const prevBtn = form.querySelector("[data-wizard-prev]");
  const nextBtn = form.querySelector("[data-wizard-next]");
  const submitBtn = form.querySelector("[data-wizard-submit]");
  const errorEl = form.querySelector(".form-wizard__error");

  form.dataset.wizardStep = String(step);
  if (errorEl) errorEl.hidden = true;

  panels.forEach((panel) => {
    const panelStep = Number(panel.dataset.wizardPanel);
    const active = panelStep === step;
    panel.classList.toggle("is-active", active);
    panel.hidden = !active;
  });

  if (currentEl) currentEl.textContent = String(step);
  if (titleEl) titleEl.textContent = ESTIMATE_STEP_TITLES[step - 1];
  if (fillEl) fillEl.style.width = `${(step / ESTIMATE_TOTAL_STEPS) * 100}%`;
  if (barEl) barEl.setAttribute("aria-valuenow", String(step));

  const isFirst = step === 1;
  const isLast = step === ESTIMATE_TOTAL_STEPS;

  function toggleWizardBtn(btn, show) {
    if (!btn) return;
    btn.hidden = !show;
    btn.classList.toggle("form-wizard__btn--hidden", !show);
  }

  toggleWizardBtn(prevBtn, !isFirst);
  toggleWizardBtn(nextBtn, !isLast);
  toggleWizardBtn(submitBtn, isLast);

  if (step === 4) updateEstimateStep4Fields(form);
}

function initEstimateWizard(form) {
  if (!form.classList.contains("form-wizard")) return;
  if (form.dataset.wizardInitialized === "true") return;
  form.dataset.wizardInitialized = "true";

  let step = 1;
  setEstimateWizardStep(form, step);

  const prevBtn = form.querySelector("[data-wizard-prev]");
  const nextBtn = form.querySelector("[data-wizard-next]");

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (!validateEstimateStep(form, step)) return;
      if (step < ESTIMATE_TOTAL_STEPS) {
        step += 1;
        setEstimateWizardStep(form, step);
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (step > 1) {
        step -= 1;
        setEstimateWizardStep(form, step);
      }
    });
  }

  const typeSelect = form.querySelector('[name="type"]');
  if (typeSelect) {
    typeSelect.addEventListener("change", () => updateEstimateStep4Fields(form));
  }
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
    initEstimateWizard(form);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const step = Number(form.dataset.wizardStep || ESTIMATE_TOTAL_STEPS);
      if (!validateEstimateStep(form, step)) return;

      const btn = form.querySelector("[data-wizard-submit]");
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
