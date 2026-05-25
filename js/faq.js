/**
 * FAQ accordion
 */

function initFAQ() {
  const container = document.getElementById("faq-list");
  if (!container) return;

  container.innerHTML = FAQ.map(
    (item, i) => `
    <div class="faq-item${i === 0 ? " is-open" : ""}">
      <button type="button" class="faq-item__question" aria-expanded="${i === 0}">
        ${item.q}
        <span class="faq-item__icon">${ICONS.chevronDown}</span>
      </button>
      <div class="faq-item__answer">
        <div class="faq-item__answer-inner">${item.a}</div>
      </div>
    </div>
  `
  ).join("");

  container.querySelectorAll(".faq-item__question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const isOpen = item.classList.contains("is-open");
      container.querySelectorAll(".faq-item").forEach((el) => {
        el.classList.remove("is-open");
        el.querySelector(".faq-item__question").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", initFAQ);
