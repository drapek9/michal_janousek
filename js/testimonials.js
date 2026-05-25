/**
 * Reference klientů
 */

function testimonialCardHtml(t) {
  const avatar = t.image
    ? `<img class="testimonial__avatar" src="${t.image}" alt="" loading="lazy">`
    : `<div class="testimonial__avatar">${t.name.charAt(0)}</div>`;

  return `
    <blockquote class="testimonial fade-in">
      ${starsHtml(t.rating)}
      <p class="testimonial__text">&ldquo;${t.text}&rdquo;</p>
      <footer class="testimonial__author">
        ${avatar}
        <div>
          <cite class="testimonial__name">${t.name}</cite>
          <p class="testimonial__meta">${t.location}${t.propertyType ? " · " + t.propertyType : ""}</p>
        </div>
      </footer>
    </blockquote>
  `;
}

function initTestimonials() {
  const grid = document.getElementById("testimonials-grid");
  if (!grid) return;

  const limit = parseInt(grid.dataset.limit || "6", 10);
  const showMoreBtn = document.getElementById("testimonials-more");
  let visible = limit;

  function render() {
    grid.innerHTML = TESTIMONIALS.slice(0, visible)
      .map(testimonialCardHtml)
      .join("");
    if (typeof observeFadeIn === "function") observeFadeIn(grid);
    if (showMoreBtn) {
      showMoreBtn.style.display =
        visible >= TESTIMONIALS.length ? "none" : "inline-flex";
    }
  }

  render();

  if (showMoreBtn) {
    showMoreBtn.addEventListener("click", () => {
      visible = TESTIMONIALS.length;
      render();
    });
  }
}

document.addEventListener("DOMContentLoaded", initTestimonials);
