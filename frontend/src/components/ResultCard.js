import { RatingStars } from "./RatingStars.js";
import { getReviews,postReview } from "../services/api.js";
import { ReviewModal } from "./ReviewModal.js";
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
      <!-- left / favourite / weather cells ... -->
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
      const siteId = c.id || c.place_id;
      if (!siteId) return;

      const r = await getReviews(siteId);
      const avg = r?.average || 0;
      const count = r?.count || 0;
      const sample = r?.latest?.comment || "";

      const starsWrap = el.querySelector(".stars-wrap");
      starsWrap.innerHTML = "";
      starsWrap.appendChild(RatingStars({ value: avg, count }));

       // latest quote (array or single object depending on backend)
       const latest = Array.isArray(r?.latest) ? r.latest[0] : r?.latest;
       const quoteEl = el.querySelector(".quote");
       if (latest?.comment) {
        quoteEl.textContent = `“${latest.comment}”`;
        quoteEl.classList.remove("muted");
       } else {
        quoteEl.textContent = count ? "" : "No reviews yet";
       }
    } catch (e) {
      // quiet fail – don’t break the card if reviews endpoint is down
      const quoteEl = el.querySelector(".quote");
      quoteEl.textContent = "Reviews unavailable";
    }
  })();

  const starsWrap = el.querySelector(".stars-wrap");
  const quoteEl   = el.querySelector(".quote");
  const siteId    = c.id || c.place_id;

  async function refreshReviews() {
    if (!siteId) return;
    const r = await getReviews(siteId).catch(() => null);
    const avg   = Number(r?.avg ?? 0);
    const count = Number(r?.count ?? 0);

    starsWrap.innerHTML = "";
    starsWrap.appendChild(RatingStars({ value: avg, count }));

    const latest = Array.isArray(r?.latest) ? r.latest[0] : r?.latest;
    if (latest?.comment) {
      quoteEl.textContent = `“${latest.comment}”`;
      quoteEl.classList.remove("muted");
    } else {
      quoteEl.textContent = "No reviews yet";
      quoteEl.classList.add("muted");
    }
  }

  refreshReviews();

  el.querySelector(".add-review").addEventListener("click", () => {
    if (!siteId) { alert("Missing campsite id."); return; }
    const modal = ReviewModal({
      campsite: c,
      onSubmit: async ({ rating, comment }) => {
        await postReview(siteId, { rating, comment }); // <-- now defined
        await refreshReviews();
      },
    });
    document.body.appendChild(modal);
  });

  return el;
}
