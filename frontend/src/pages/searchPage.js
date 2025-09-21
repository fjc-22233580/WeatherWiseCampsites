import { WEATHER_TYPES } from "../constants/weather.js";
import { LocationPicker } from "../components/LocationPicker.js";
import { ResultCard } from "../components/ResultCard.js";
import { searchCampsites, searchLocations } from "../services/api.js";

export function SearchPage() {
  const state = {
    location: null, // { lat, lon, name }
    weather: "",
    radius: 3000,
    date: "",
    results: [],
  };

  const el = document.createElement("div");
  el.className = "page search";

  el.innerHTML = `
  <section class="search-panel card">
      <div class="grid">
        <div class="col location"></div>
        <label class="col"><span class="label">Weather</span><select class="input weather"></select></label>
        <label class="col"><span class="label">Radius</span>
          <select class="input radius"><option value="1000">1km</option><option value="3000" selected>3km</option><option value="10000">10km</option></select>
        </label>
        <label class="col"><span class="label">Date</span><input type="date" class="input date"/></label>
        <div class="col col-actions"><button class="btn primary search-btn" type="button">Search</button></div>
      </div>
    </section>
    <section class="results"><h2>Campsites:</h2><div class="list" aria-live="polite"></div></section>`;
/*
  el.innerHTML = `
    <div class="layout">
      <aside class="sidenav">
        <button class="nav-item active" data-nav="search">Search</button>
        <button class="nav-item" data-nav="preferences">Preferences</button>
        <button class="nav-item" data-nav="signout">Sign Out</button>
      </aside>

      <main class="content">
        <h1>Weather Wise Campsites</h1>

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
                <option value="25000">25km</option>
              </select>
            </label>

            <label class="col">
              <span class="label">Date</span>
              <input type="date" class="input date"/>
            </label>

            <div class="col col-actions">
              <button class="btn primary search-btn">Search</button>
            </div>
          </div>
        </section>

        <section class="results">
          <h2>Campsites:</h2>
          <div class="list" aria-live="polite"></div>
        </section>
      </main>
    </div>
  `;
*/
  // mount LocationPicker
  const locMount = el.querySelector(".location");
  const locationPicker = LocationPicker({
    onConfirm(loc) {
      state.location = {
        lat: loc.lat ?? loc.latitude,
        lon: loc.lon ?? loc.longitude,
        name: loc.name || loc.display_name || "",
      };
    },
  });
  locMount.appendChild(locationPicker);

  const list = el.querySelector(".list");
  const btn = el.querySelector(".search-btn");
/*
  // weather dropdown (optionally prefill from saved preference if logged in)
  const selWeather = el.querySelector(".weather");
  selWeather.innerHTML = WEATHER_TYPES.map(w => `<option value="${w.value}">${w.label}</option>`).join("");

  // if user has saved weather preference:
  try {
    const pref = window.authService?.getUserPreference?.("weather"); // implement in your auth/preferences
    if (pref) selWeather.value = pref;
    state.weather = selWeather.value;
  } catch {}

  selWeather.addEventListener("change", () => (state.weather = selWeather.value));
  el.querySelector(".radius").addEventListener("change", (e) => (state.radius = parseInt(e.target.value, 10)));
  el.querySelector(".date").addEventListener("change", (e) => (state.date = e.target.value));
*/

  // run search
  async function runSearch() {
    list.innerHTML = "";
    if (!state.location?.lat || !state.location?.lon) {
      list.innerHTML = `<div class="muted">Please choose a location first.</div>`;
      return;
    }
    // If user typed but didn't pick, auto-resolve first hit
    if ((!state.location?.lat || !state.location?.lon) && typed) {
        const locs = await searchLocations(typed, 5).catch(() => []);
        if (locs.length) {
          const loc = locs[0];
          state.location = {
            lat: loc.lat ?? loc.latitude,
            lon: loc.lon ?? loc.longitude,
            name: loc.name || loc.display_name || typed,
          };
        }
      }
      if (!state.location?.lat || !state.location?.lon) {
        list.innerHTML = `<div class="muted">Choose a location (pick from dropdown or press Enter) before searching.</div>`;
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

        state.results = Array.isArray(data) ? data : data?.results ?? data?.campsites ?? data?.data ?? [];
        if (!state.results.length) {
            list.innerHTML = `<div class="muted">No campsites found for your criteria.</div>`;
        } else {
            const frag = document.createDocumentFragment();
            state.results.forEach(c => frag.appendChild(ResultCard(c)));
            list.appendChild(frag);
        }
    } catch (e) {
        list.innerHTML = `<div class="error">Search failed: ${e.message}</div>`;
    } finally {
        btn.disabled = false; btn.textContent = "Search";
    }
  }

  btn.addEventListener("click", runSearch);

  el.querySelector(".location .loc-input")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); runSearch(); }
  });
/*
  // sidenav nav
  el.querySelector('[data-nav="preferences"]').addEventListener("click", () => {
    window.app?.navigate?.("preferences");
  });
  el.querySelector('[data-nav="signout"]').addEventListener("click", async () => {
    await window.authService?.signOut?.();
    window.app?.navigate?.("auth");
  });*/
  
  // wire radius/weather/date
  el.querySelector(".radius").addEventListener("change", (e) => state.radius = parseInt(e.target.value, 10));
  el.querySelector(".weather").addEventListener("change", (e) => state.weather = e.target.value);
  el.querySelector(".date").addEventListener("change", (e) => state.date = e.target.value);

  return el;
}
