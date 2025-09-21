import { RatingStars } from "./RatingStars.js";
import { getReviews, postReview, setFavourite } from "../services/api.js";
import { ReviewModal } from "./ReviewModal.js";
import { weatherIconHTML } from "../constants/weatherIcons.js";
import { formatTempC } from "../utils/units.js";
import { campId } from "../utils/ids.js";

export function ResultCard(c, { isFavourite = false, onFavouriteChange = () => {} } = {}) {
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
        <button class="icon-btn fav-btn" title="Toggle favourite" aria-label="Toggle favourite">${isFavourite ? "♥" : "♡"}</button>
        <button class="btn small add-review">Add Review</button>
      </div>

      <div class="cell weather">
        <div class="muted">Weather:</div>
        <div class="wx-line">
          ${wxIcon}
          <span class="wx-label">${wxLabel}</span>
        </div>
        <div class="wx-temp">Day: ${dayC}° · Night: ${nightC}°</div>
      </div>

      <div class="cell reviews">
        <div class="muted">Reviews:</div>
        <div class="stars-wrap"></div>
        <blockquote class="quote muted"></blockquote>
      </div>
    </div>
  `;

  const starsWrap = el.querySelector(".stars-wrap");
  const quoteEl   = el.querySelector(".quote");
  const favBtn    = el.querySelector(".fav-btn");
  const siteId    = campId(c);

  function renderFave(faved) {
    favBtn.textContent = faved ? "♥" : "♡";
  }
  renderFave(isFavourite);

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

  // Toggle favourite, notify parent
  favBtn?.addEventListener("click", async () => {
    if (!siteId) { alert("Missing campsite id."); return; }
    try {
      const serverFaved = await setFavourite(siteId); // toggles if body omitted
      renderFave(serverFaved);
      onFavouriteChange(siteId, serverFaved);
    } catch (e) {
      alert(e.message || "Failed to update favourite");
    }
  });

  // Add review
  el.querySelector(".add-review").addEventListener("click", () => {
    if (!siteId) { alert("Missing campsite id."); return; }
    const modal = ReviewModal({
      campsite: c,
      onSubmit: async ({ rating, comment }) => {
        await postReview(siteId, { rating, comment });
        await refreshReviews();
      },
    });
    document.body.appendChild(modal);
  });

  return el;
}
