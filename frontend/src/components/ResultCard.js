import { RatingStars } from "./RatingStars.js";
import { getReviews } from "../services/api.js";
import { weatherIconHTML } from "../constants/weatherIcons.js";
import { formatTempC } from "../utils/units.js";

export function ResultCard(c) {
  const el = document.createElement("article");
  el.className = "card campsite";

  const wx = c.weather || {}; 
  const wxIcon  = weatherIconHTML(wx);
  const wxLabel = wx.label || "—";
  const dayC    = formatTempC(wx.temp_max);
  const nightC  = formatTempC(wx.temp_min);

  el.innerHTML = `
    <div class="card-row">
      <div class="cell">
        <div class="muted">Campsite:</div>
        <div class="title">${c.name || "Unknown site"}</div>
        <div class="muted">Address:</div>
        <div>${c.address || "—"}</div>
        <div class="muted">Contact:</div>
        <div>${c.contact || "—"}</div>
      </div>
      <div class="cell fav">
        <div class="muted">Favourite:</div>
        <button class="icon-btn" title="Toggle favourite" aria-label="Toggle favourite">♡</button>
        <button class="btn small add-review">Add Review</button>
      </div>
      <div class="cell weather">
        <div class="muted">Weather:</div>
        <div class="wx-line">
            ${wxIcon}
            <span class="wx-label">${wxLabel}</span></div>
        <div class="wx-temp">Day: ${dayC}° · Night: ${nightC}°</div>
      </div>
      <div class="cell reviews">
        <div class="muted">Reviews:</div>
        <div class="stars-wrap"></div>
        <blockquote class="quote muted"></blockquote>
      </div>
    </div>
  `;

  // get latest reviews
  (async () => {
    try {
      const r = await getReviews(c.id);
      const avg = r?.average || 0;
      const count = r?.count || 0;
      const sample = r?.latest?.comment || "";

      const stars = RatingStars({ value: avg, count });
      el.querySelector(".stars-wrap").appendChild(stars);
      el.querySelector(".quote").textContent = sample || "";
    } catch {
      // ignore review fetch errors
    }
  })();

  // need to  Add Review click -> open modal or navigate
  el.querySelector(".add-review").addEventListener("click", () => {
    // navigate to /pages/review or open modal 
    alert("Open review modal/form here.");
  });

  return el;
}
