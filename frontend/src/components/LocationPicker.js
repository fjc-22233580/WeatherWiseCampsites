import { debounce } from "../utils/debounce.js";
import { searchLocations } from "../services/api.js";

export function LocationPicker({ onConfirm }) {
  const el = document.createElement("div");
  el.className = "location-picker";
  el.innerHTML = `
    <label class="label">Location</label>
    <div class="input-with-icon">
      <input type="text" class="input loc-input" placeholder="Enter a location" aria-label="Location search"/>
      <button class="icon-btn loc-search" type="button" title="Search" aria-label="Search">🔍</button>
    </div>
    <div class="dropdown hidden" role="listbox" aria-label="Matching locations"></div>
  `;

  const input = el.querySelector(".loc-input");
  const btn   = el.querySelector(".loc-search");
  const dd    = el.querySelector(".dropdown");

  function hideDD() { dd.classList.add("hidden"); dd.innerHTML = ""; }

  async function doLookup(query) {
    if (!query) { hideDD(); return []; }
    try {
      const results = await searchLocations(query, 5);
      return Array.isArray(results) ? results : [];
    } catch (e) {
      console.warn("Location lookup failed:", e);
      hideDD();
      return [];
    }
  }

  function renderDD(results) {
    if (!results.length) { hideDD(); return; }
    dd.classList.remove("hidden");
    dd.innerHTML = results.map((r, i) => `
      <button class="dropdown-item" role="option" data-i="${i}">
        ${r.name || r.display_name || [r.town, r.postcode].filter(Boolean).join(" ") || "Unknown"}
      </button>
    `).join("");

    dd.querySelectorAll(".dropdown-item").forEach((b, i) => {
      b.addEventListener("click", () => {
        const loc = results[i];
        input.value = loc.name || loc.display_name || input.value;
        hideDD();
        onConfirm?.({
          lat:  loc.lat ?? loc.latitude,
          lon:  loc.lon ?? loc.longitude,
          name: loc.name || loc.display_name || input.value
        });
      });
    });
  }

  const runTypedSearch = debounce(async () => {
    const q = input.value.trim();
    const results = await doLookup(q);
    renderDD(results);
  }, 300);

  input.addEventListener("input", runTypedSearch);

  // Enter = pick first result
  input.addEventListener("keydown", async (ev) => {
    if (ev.key !== "Enter") return;
    ev.preventDefault();
    const q = input.value.trim();
    const results = await doLookup(q);
    if (results.length) {
      const loc = results[0];
      input.value = loc.name || loc.display_name || input.value;
      hideDD();
      onConfirm?.({
        lat: loc.lat ?? loc.latitude,
        lon: loc.lon ?? loc.longitude,
        name: loc.name || loc.display_name || input.value
      });
    }
  });

  // Magnifier click triggers lookup (auto-pick if exactly one)
  btn.addEventListener("click", async () => {
    const q = input.value.trim();
    const results = await doLookup(q);
    renderDD(results);
    if (results.length === 1) {
      const loc = results[0];
      input.value = loc.name || loc.display_name || input.value;
      hideDD();
      onConfirm?.({
        lat: loc.lat ?? loc.latitude,
        lon: loc.lon ?? loc.longitude,
        name: loc.name || loc.display_name || input.value
      });
    }
  });

  // Click outside closes dropdown
  document.addEventListener("click", (e) => {
    if (!el.contains(e.target)) hideDD();
  });

  return el;
}
