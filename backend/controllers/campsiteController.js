// controllers/campsiteController.js
const { geocodeText, getNearbyCampsites } = require("../services/geoapifyService");
const { getDailySummary, matchesWeatherFilter, codeToText } = require("../services/openMeteoService");

// Validate ?date=YYYY-MM-DD and clamp to today…+16 days
function parseAndValidateDate(dateStr) {
  if (!dateStr) return null; // null => use today
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) throw new Error("Invalid date format. Use YYYY-MM-DD.");

  const requested = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(requested.getTime())) throw new Error("Invalid date value.");

  const now = new Date();
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const max = new Date(todayUTC);
  max.setUTCDate(max.getUTCDate() + 16);

  if (requested < todayUTC) throw new Error("Date cannot be in the past.");
  if (requested > max) throw new Error("Date cannot be more than 16 days in the future.");
  return requested.toISOString().slice(0, 10);
}

// GET /api/campsites/search
// Accepts:
//  - location (string) OR lat & lon (numbers)
//  - radius (meters, default 30000)
//  - limit (default 12)
//  - weather (sunny|rain|snow|cloudy|fog|storm) [optional]
//  - date (YYYY-MM-DD, today…+16) [optional]
async function searchCampsites(req, res) {
  try {
    const { location, weather } = req.query;
    const radius = Number(req.query.radius) || 30000;
    const limit = Number(req.query.limit) || 12;

    let normalizedDate = null;
    try {
      normalizedDate = parseAndValidateDate(req.query.date);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    // Determine search center: either lat/lon or geocode the location text
    let center;
    if (req.query.lat && req.query.lon) {
      const lat = Number(req.query.lat);
      const lon = Number(req.query.lon);
      if (Number.isNaN(lat) || Number.isNaN(lon)) {
        return res.status(400).json({ error: "lat and lon must be numbers" });
      }
      center = { lat, lon, formatted: "point" };
    } else {
      if (!location) return res.status(400).json({ error: "location is required when lat/lon not provided" });
      center = await geocodeText(location);
      if (!center) return res.status(404).json({ error: "Location not found" });
    }

    // Campsites near center
    const sites = await getNearbyCampsites(center.lat, center.lon, radius, limit);

    // Enrich with weather summary for requested date (or today)
    const enriched = await Promise.all(
      sites.map(async (s) => {
        const daily = await getDailySummary(s.lat, s.lon, normalizedDate);
        const weatherType = codeToText(daily.weatherCode);
        const matches = matchesWeatherFilter(daily.weatherCode, weather);

        return {
          ...s,
          weatherCode: daily.weatherCode,
          weatherType,
          tempMaxC: daily.tMax,
          tempMinC: daily.tMin,
          matchesWeather: matches
        };
      })
    );

    const result = weather ? enriched.filter((e) => e.matchesWeather) : enriched;

    return res.json({
      center: { lat: center.lat, lon: center.lon, label: center.formatted || location || "point" },
      radius,
      limit,
      date: normalizedDate || new Date().toISOString().slice(0, 10),
      totalResults: result.length,
      message: result.length ? undefined : "No campsites found for the chosen location and radius.",
      campsites: result
    });
  } catch (err) {
     const status = err?.response?.status || 500;
    const upstream = err?.response?.data || err.message || String(err);
    console.error("searchCampsites error:", status, upstream);
    return res.status(status).json({ error: "campsites failed", upstream });
  }
}

module.exports = { searchCampsites };
