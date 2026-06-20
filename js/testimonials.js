/**
 * Reference klientů
 */

function testimonialCardHtml(t) {
  return `
    <blockquote class="testimonial fade-in">
      <p class="testimonial__text">&ldquo;${t.text}&rdquo;</p>
      <footer class="testimonial__author">
        <div>
          <cite class="testimonial__name">${t.name}</cite>
          <p class="testimonial__meta">${t.location}</p>
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
  let items = TESTIMONIALS;

  function render() {
    grid.innerHTML = items.slice(0, visible)
      .map(testimonialCardHtml)
      .join("");
    if (typeof observeFadeIn === "function") observeFadeIn(grid);
    if (showMoreBtn) {
      showMoreBtn.style.display =
        visible >= items.length ? "none" : "inline-flex";
    }
  }

  render();

  if (showMoreBtn) {
    showMoreBtn.addEventListener("click", () => {
      visible = items.length;
      render();
    });
  }

  return {
    setItems(nextItems) {
      items = nextItems;
      visible = limit;
      render();
    },
  };
}

async function initTestimonialsFromApi() {
  const controller = initTestimonials();
  if (!controller || !window.PropertiesApi) return;

  try {
    const reviews = await PropertiesApi.loadReviews();
    if (reviews.length) controller.setItems(reviews);
  } catch (err) {
    console.error("Nepodařilo se načíst recenze:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.PropertiesApi) {
    initTestimonialsFromApi();
    return;
  }
  initTestimonials();
});
