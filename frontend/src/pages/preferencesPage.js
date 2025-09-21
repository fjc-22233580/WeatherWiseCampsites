import { getPreferences, savePreferences } from "../services/api.js";

function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export function PreferencesPage() {
  const container = el(`
    <section class="panel">
      <div class="panel__header"><h2>Preferences</h2></div>
      <div class="panel__content">
        <form class="card" id="prefsForm">
          <label class="field">
            <span class="label">Home location</span>
            <input type="text" name="home_location" placeholder="e.g., London" />
          </label>

          <label class="field">
            <span class="label">Units</span>
            <select name="units">
              <option value="metric">Metric (°C, km/h)</option>
              <option value="imperial">Imperial (°F, mph)</option>
            </select>
          </label>

          <label class="field">
            <span class="label">Default: show only favourites</span>
            <input type="checkbox" name="default_only_favourites" />
          </label>

          <label class="field">
            <span class="label">Preferred weather (optional)</span>
            <input type="text" name="weather" placeholder="e.g., sunny, cloudy" />
          </label>

          <p class="error" hidden></p>
          <div class="panel__footer">
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </section>
  `);

  const form   = container.querySelector("#prefsForm");
  const errorP = form.querySelector(".error");

  function setError(msg) {
    errorP.textContent = msg || "";
    errorP.hidden = !msg;
  }

  // Load current prefs
  (async () => {
    try {
      const prefs = await getPreferences();
      if (prefs) {
        if (prefs.home_location != null) form.home_location.value = String(prefs.home_location);
        if (prefs.units) form.units.value = prefs.units;
        if (typeof prefs.default_only_favourites === "boolean") {
          form.default_only_favourites.checked = prefs.default_only_favourites;
        }
        if (prefs.weather) form.weather.value = String(prefs.weather);
      }
    } catch (err) {
      setError(err.message || "Failed to load preferences.");
    }
  })();

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); setError("");
    const payload = {
      home_location: form.home_location.value.trim(),
      units: form.units.value,
      default_only_favourites: !!form.default_only_favourites.checked,
      weather: form.weather.value.trim() || undefined,
    };
    try {
      await savePreferences(payload);
    } catch (err) {
      setError(err.message || "Failed to save preferences.");
    }
  });

  return container;
}
