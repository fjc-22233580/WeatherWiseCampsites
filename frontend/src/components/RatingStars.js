export function RatingStars({ value = 0, count = 0 }) {
    const el = document.createElement("div");
    el.className = "rating-stars";
    const rounded = Math.round(value * 2);
    const stars = Array.from({ length: 5 }, (_, i) => {
      const full = i + 1 <= Math.floor(rounded);
      const half = !full && i + 0.5 === rounded;
      return `<span class="star" aria-hidden="true">${full ? "★" : half ? "⯨" : "☆"}</span>`;
    }).join("");
    el.innerHTML = `<div class="stars" aria-label="Rating ${value} out of 5">${stars}</div>
                    <div class="count" aria-label="Ratings count">${count ? `(${count})` : ""}</div>`;
    return el;
  }
  