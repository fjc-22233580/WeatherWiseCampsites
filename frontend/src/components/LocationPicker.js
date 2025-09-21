import { debounce } from "../utils/debounce.js";
import { searchLocations } from "../services/api.js";

export function LocationPicker({ onConfirm }) {
  const el = document.createElement("div");
  el.className = "location-picker";

  el.innerHTML = `
    <label class="label">Location</label>
    <div class="input-with-icon">
      <input type="text" class="input" placeholder="Enter a location" aria-label="Location search"/>
      <button class="icon-btn" title="Search" aria-label="Search">🔍</button>
    </div>
    <div class="dropdown hidden" role="listbox" aria-label="Matching locations"></div>
  `;

  const input = el.querySelector("input");
  const button = el.querySelector("button");
  const dropdown = el.querySelector(".dropdown");

  async function runSearch() {
    const text = input.value.trim();
    dropdown.innerHTML = "";
    dropdown.classList.add("hidden");
    if (!text) return;

    const results = await searchLocations(text, 5).catch(() => []);
    if (!results.length) return;

    // if exactly 1, auto-confirm
    if (results.length === 1) {
      const [loc] = results;
      onConfirm(loc);
      input.value = loc.name || `${loc.town || ""} ${loc.postcode || ""}`.trim();
      return;
    }

    dropdown.classList.remove("hidden");
    dropdown.innerHTML = results.map((r, i) => `
      <button class="dropdown-item" role="option" data-i="${i}">
        ${r.name || r.display_name || `${r.town ?? ""} ${r.postcode ?? ""}`.trim()}
      </button>
    `).join("");

    dropdown.querySelectorAll(".dropdown-item").forEach((btn, i) => {
      btn.addEventListener("click", () => {
        const loc = results[i];
        input.value = loc.name || loc.display_name || "";
        dropdown.classList.add("hidden");
        onConfirm(loc);
      });
    });
  }

  input.addEventListener("input", debounce(runSearch, 350));
  button.addEventListener("click", runSearch);

  return el;
}
