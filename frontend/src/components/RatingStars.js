export function RatingStars({ value = 0, count = 0 }) {
    const el = document.createElement("div");
    el.className = "rating";
  
    const rounded = Math.round(Number(value) * 2);
    const stars = Array.from({ length: 5 }, (_, i) => {
      const pos = i + 1;
      if (pos <= Math.floor(rounded)) return "★";
      return "☆";
    }).join("");
  
    el.innerHTML = `
      <span class="stars" aria-label="Rating ${value} out of 5">${stars}</span>
      <span class="count">${count ? `(${count})` : ""}</span>
    `;
    return el;
  }
  