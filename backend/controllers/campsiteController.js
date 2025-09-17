// controllers/campsiteController.js
const supabase = require("../services/supabaseClient");
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

/**
 * GET /api/campsites/search
 * Query:
 *  - location (string) OR lat & lon (numbers)
 *  - radius (meters, default 30000)
 *  - limit (default 12)
 *  - weather (sunny|rain|snow|cloudy|fog|storm) [optional]
 *  - date (YYYY-MM-DD, today…+16) [optional]
 *  - user_id (optional; if omitted, uses req.user?.id when authenticated)
 *
 * Response: campsites enriched with weather, isFavourite, and reviews summary.
 */
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

    // user id for enrichments (prefer authenticated user; fall back to ?user_id)
    const userId = req.user?.id || (req.query.user_id ? String(req.query.user_id).trim() : null);

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

    // 1) Campsites near center (must include place_id)
    const sites = await getNearbyCampsites(center.lat, center.lon, radius, limit);
    if (!Array.isArray(sites) || !sites.length) {
      return res.json({
        center: { lat: center.lat, lon: center.lon, label: center.formatted || location || "point" },
        radius,
        limit,
        date: normalizedDate || new Date().toISOString().slice(0, 10),
        totalResults: 0,
        message: "No campsites found for the chosen location and radius.",
        campsites: []
      });
    }

    // 2) Enrich each with weather summary for requested date (or today)
    const enrichedWeather = await Promise.all(
      sites.map(async (s) => {
        try {
          const daily = await getDailySummary(s.lat, s.lon, normalizedDate);
          if (!daily) {
            return { ...s, weatherCode: null, weatherType: null, tempMaxC: null, tempMinC: null, _weatherOK: !weather };
          }
          const weatherType = codeToText(daily.weatherCode);
          const matches = matchesWeatherFilter(daily.weatherCode, weather);
          return {
            ...s,
            weatherCode: daily.weatherCode,
            weatherType,
            tempMaxC: daily.tMax,
            tempMinC: daily.tMin,
            _weatherOK: matches || !weather
          };
        } catch {
          // if weather call fails, keep the site, unless a filter was requested (then it can't match)
          return { ...s, weatherCode: null, weatherType: null, tempMaxC: null, tempMinC: null, _weatherOK: !weather };
        }
      })
    );

    // Apply weather filter if present
    let result = weather ? enrichedWeather.filter((e) => e._weatherOK) : enrichedWeather;

    if (!result.length) {
      return res.json({
        center: { lat: center.lat, lon: center.lon, label: center.formatted || location || "point" },
        radius,
        limit,
        date: normalizedDate || new Date().toISOString().slice(0, 10),
        totalResults: 0,
        message: "No campsites matched the weather filter.",
        campsites: []
      });
    }

    // Collect place_ids for DB joins
    const placeIds = result.map((r) => r.place_id);

    // 3) isFavourite enrichment (optional, only if we have a user)
    let faveSet = new Set();
    if (userId) {
      const { data: favs, error: favErr } = await supabase
        .from("favourites")
        .select("campsite_id")
        .eq("user_id", userId)
        .in("campsite_id", placeIds);

      if (!favErr && Array.isArray(favs)) {
        faveSet = new Set(favs.map((f) => String(f.campsite_id)));
      }
    }

    // 4) Reviews summary enrichment (avg + count)
    const { data: reviewRows, error: revErr } = await supabase
      .from("reviews")
      .select("campsite_id, rating")
      .in("campsite_id", placeIds);

    const sumById = new Map();
    const countById = new Map();

    if (!revErr && Array.isArray(reviewRows)) {
      for (const r of reviewRows) {
        const id = String(r.campsite_id);
        sumById.set(id, (sumById.get(id) || 0) + (Number(r.rating) || 0));
        countById.set(id, (countById.get(id) || 0) + 1);
      }
    }

    // Final shape
    const items = result.map((s) => {
      const id = s.place_id;
      const count = countById.get(id) || 0;
      const total = sumById.get(id) || 0;
      const avg = count ? Number((total / count).toFixed(2)) : 0;

      return {
        place_id: id,
        name: s.name,
        address: s.address || null,
        lat: s.lat,
        lon: s.lon,
        weather: s.weatherCode == null ? null : {
          code: s.weatherCode,
          label: s.weatherType,
          temp_max: s.tempMaxC,
          temp_min: s.tempMinC
        },
        isFavourite: userId ? faveSet.has(id) : false,
        reviews: { avg, count }
      };
    });

    return res.json({
      center: { lat: center.lat, lon: center.lon, label: center.formatted || location || "point" },
      radius,
      limit,
      date: normalizedDate || new Date().toISOString().slice(0, 10),
      totalResults: items.length,
      campsites: items
    });
  } catch (err) {
    const status = err?.response?.status || 500;
    const upstream = err?.response?.data || err.message || String(err);
    console.error("searchCampsites error:", status, upstream);
    return res.status(status).json({ error: "campsites failed", upstream });
  }
}

module.exports = { searchCampsites };