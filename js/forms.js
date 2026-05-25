/**
 * Formuláře — odhad zdarma a kontakt
 */

const PROPERTY_TYPES = [
  { value: "byt", label: "Byt" },
  { value: "dum", label: "Rodinný dům" },
  { value: "pozemek", label: "Pozemek" },
  { value: "komercni", label: "Komerční nemovitost" },
  { value: "jine", label: "Jiné" },
];

const PROPERTY_CONDITIONS = [
  { value: "novy", label: "Novostavba / po rekonstrukci" },
  { value: "dobry", label: "Dobrý stav" },
  { value: "udrzba", label: "Vyžaduje údržbu" },
  { value: "rekonstrukce", label: "K rekonstrukci" },
];

function estimateFormHtml(options = {}) {
  const { hero = false, id = "estimate-form" } = options;
  const typeOptions = PROPERTY_TYPES.map(
    (t) => `<option value="${t.value}">${t.label}</option>`
  ).join("");
  const condOptions = PROPERTY_CONDITIONS.map(
    (c) => `<option value="${c.value}">${c.label}</option>`
  ).join("");

  return `
    <form class="form-card" id="${id}" data-form="estimate">
      ${hero ? `<div class="form-card__title">Nezávazný odhad zdarma</div><p class="form-card__subtitle">Vyplňte formulář — ozvu se vám</p>` : ""}
      <div class="form-grid form-grid--2">
        <div class="form-group">
          <label for="${id}-type">Typ nemovitosti *</label>
          <select class="form-input" id="${id}-type" name="type" required>
            <option value="">Vyberte typ</option>${typeOptions}
          </select>
        </div>
        <div class="form-group">
          <label for="${id}-location">Lokalita *</label>
          <input class="form-input" id="${id}-location" name="location" type="text" required placeholder="např. Praha – Vinohrady">
        </div>
        <div class="form-group">
          <label for="${id}-size">Velikost (m²)</label>
          <input class="form-input" id="${id}-size" name="size" type="number" min="1" placeholder="např. 75">
        </div>
        <div class="form-group">
          <label for="${id}-condition">Stav nemovitosti</label>
          <select class="form-input" id="${id}-condition" name="condition">
            <option value="">Vyberte stav</option>${condOptions}
          </select>
        </div>
        <div class="form-group">
          <label for="${id}-phone">Telefon *</label>
          <input class="form-input" id="${id}-phone" name="phone" type="tel" required placeholder="+420 739 352 312">
        </div>
        <div class="form-group">
          <label for="${id}-email">E-mail *</label>
          <input class="form-input" id="${id}-email" name="email" type="email" required placeholder="vas@email.cz">
        </div>
      </div>
      <div class="form-group" style="margin-top:1rem">
        <label for="${id}-note">Poznámka</label>
        <textarea class="form-input" id="${id}-note" name="note" rows="3" placeholder="Cokoli, co bych měl vědět..."></textarea>
      </div>
      <button type="submit" class="btn btn--primary btn--lg" style="margin-top:1.5rem">${ICONS.send} Odeslat žádost o odhad</button>
      <p class="form-note">Odesláním souhlasíte se zpracováním údajů pro účely kontaktu. Údaje nejsou předávány třetím stranám.</p>
    </form>
  `;
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
          <input class="form-input" id="contact-phone" name="phone" type="tel">
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
            ? `Vaši žádost jsem obdržel. Ozvu se vám a domluvíme termín osobní prohlídky nemovitosti.`
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
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
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
