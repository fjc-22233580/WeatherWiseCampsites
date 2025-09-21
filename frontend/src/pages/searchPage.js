import { WEATHER_TYPES } from "../constants/weather.js";
import { LocationPicker } from "../components/LocationPicker.js";
import { ResultCard } from "../components/ResultCard.js";
import {
  searchCampsites,
  searchLocations,
  getPreferences,
  getFavourites,
  patchPreferences,
} from "../services/api.js";
import { campId } from "../utils/ids.js";

export function SearchPage() {
  const state = {
    location: null,              // { lat, lon, name }
    weather: "",
    radius: 3000,
    date: "",
    results: [],
    faves: new Set(),            // server-synced favourite IDs
    showOnlyFaves: false,
  };

  const el = document.createElement("div");
  el.className = "page search";

  el.innerHTML = `
    <section class="search-panel card">
      <div class="grid">
        <div class="col location"></div>
        <label class="col">
          <span class="label">Weather</span>
          <select class="input weather"></select>
        </label>
        <label class="col">
          <span class="label">Radius</span>
          <select class="input radius">
            <option value="1000">1km</option>
            <option value="3000" selected>3km</option>
            <option value="10000">10km</option>
          </select>
        </label>
        <label class="col">
          <span class="label">Date</span>
          <input type="date" class="input date"/>
        </label>
        <div class="col col-actions">
          <button class="btn primary search-btn" type="button">Search</button>
        </div>
      </div>
    </section>
    <section class="results">
      <h2>Campsites:</h2>
      <div class="list" aria-live="polite"></div>
    </section>
  `;

  const locMount   = el.querySelector(".location");
  const list       = el.querySelector(".list");
  const btn        = el.querySelector(".search-btn");
  const selWeather = el.querySelector(".weather");
  const selRadius  = el.querySelector(".radius");
  const inputDate  = el.querySelector(".date");

  // Toggle row (must be created before querying for its checkbox)
  const toggleRow = document.createElement("div");
  toggleRow.className = "row";
  toggleRow.style.marginTop = "10px";
  toggleRow.innerHTML = `
    <label style="display:flex; align-items:center; gap:6px;">
      <input type="checkbox" class="only-faves"/>
      <span>Show only favourites</span>
    </label>
  `;
  el.querySelector(".search-panel .grid").after(toggleRow);
  const chkOnlyFav = toggleRow.querySelector(".only-faves");

  // Location picker
  const locationPicker = LocationPicker({
    onConfirm(loc) {
      state.location = {
        lat:  Number(loc.lat ?? loc.latitude),
        lon:  Number(loc.lon ?? loc.longitude),
        name: (loc.name || loc.display_name || "").trim(),
      };
    },
  });
  locMount.appendChild(locationPicker);

  // Weather dropdown
  selWeather.innerHTML = WEATHER_TYPES
    .map((w) => `<option value="${w.value}">${w.label}</option>`)
    .join("");

  // Load prefs & favourites on mount
  (async () => {
    try {
      const [prefs, favIds] = await Promise.all([
        getPreferences().catch(() => null),
        getFavourites().catch(() => []),
      ]);

      state.faves = new Set(favIds || []);

      if (prefs?.weather && selWeather.querySelector(`option[value="${prefs.weather}"]`)) {
        selWeather.value = prefs.weather;
      }
      state.weather = selWeather.value;

      const localOnly = localStorage.getItem("wwc:onlyFaves");
      if (localOnly !== null) {
        state.showOnlyFaves = localOnly === "1";
      } else if (prefs?.default_only_favourites != null) {
        state.showOnlyFaves = !!prefs.default_only_favourites;
      }
      chkOnlyFav.checked = state.showOnlyFaves;
    } catch {
      // ignore
    }
  })();

  // Wire inputs
  selWeather.addEventListener("change", () => { state.weather = selWeather.value; });
  selRadius.addEventListener("change", (e) => { state.radius = parseInt(e.target.value, 10) || 3000; });
  inputDate.addEventListener("change",  (e) => { state.date = e.target.value; });

  chkOnlyFav.addEventListener("change", () => {
    state.showOnlyFaves = chkOnlyFav.checked;
    localStorage.setItem("wwc:onlyFaves", state.showOnlyFaves ? "1" : "0");
    // Persist as a preference (fire and forget)
    patchPreferences({ default_only_favourites: state.showOnlyFaves }).catch(() => {});
    renderResults();
  });

  function renderResults() {
    list.innerHTML = "";

    const items = state.showOnlyFaves
      ? state.results.filter((c) => state.faves.has(campId(c)))
      : state.results;

    if (!items.length) {
      list.innerHTML = `<div class="muted">${
        state.showOnlyFaves
          ? "No favourite campsites in these results."
          : "No campsites found for your criteria."
      }</div>`;
      return;
    }

    const frag = document.createDocumentFragment();
    items.forEach((c) => {
      const id = campId(c);
      const card = ResultCard(c, {
        isFavourite: state.faves.has(id),
        onFavouriteChange: (changedId, serverFaved) => {
          if (serverFaved) state.faves.add(changedId);
          else state.faves.delete(changedId);
          if (state.showOnlyFaves) renderResults();
        },
      });
      frag.appendChild(card);
    });
    list.appendChild(frag);
  }

  async function runSearch() {
    list.innerHTML = "";
    if (!state.location?.lat || !state.location?.lon) {
      list.innerHTML = `<div class="muted">Please choose a location first.</div>`;
      return;
    }

    btn.disabled = true; btn.textContent = "Searching…";
    try {
      const data = await searchCampsites({
        lat: state.location.lat,
        lon: state.location.lon,
        radius: state.radius,
        weather: state.weather || undefined,
        date: state.date || undefined,
      });

      state.results = Array.isArray(data) ? data : (data?.results ?? data?.campsites ?? data?.data ?? []);
      renderResults();
    } catch (e) {
      list.innerHTML = `<div class="error">Search failed: ${e.message}</div>`;
    } finally {
      btn.disabled = false; btn.textContent = "Search";
    }
  }

  btn.addEventListener("click", runSearch);

  // Let users press Enter in the location field to trigger search 
  el.querySelector(".location .loc-input")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); runSearch(); }
  });

  return el;
}
