const axios = require("axios");
const GEOAPIFY_BASE = "https://api.geoapify.com";
const API_KEY = process.env.GEOAPIFY_KEY;

// Return multiple geocode candidates for disambiguation
async function geocodeSearch(text, limit = 5) {
  const url = `${GEOAPIFY_BASE}/v1/geocode/search`;
  const params = { text, limit, apiKey: API_KEY, filter: "countrycode:gb" };
  try {
    console.log("[geocodeSearch] url:", url, "params:", { ...params, apiKey: "****" });
    const { data } = await axios.get(url, { params });
    const feats = data?.features || [];
    return feats.map(f => {
      const p = f.properties || {};
      return {
        id: p.place_id || `${p.lat},${p.lon}`,
        label: p.result_type || p.city || p.county || p.country || "Location",
        formatted: p.formatted,
        lat: p.lat,
        lon: p.lon
      };
    });
  } catch (e) {
    console.error("[geocodeSearch] error:", e?.response?.status, e?.response?.data || e.message);
    throw e; // let controller turn it into a response
  }
}

// Convenience: first result only
async function geocodeText(text) {
  const list = await geocodeSearch(text, 1);
  return list[0] || null;
}

// Campsites near a point (no distance property)
async function getNearbyCampsites(centerLat, centerLon, radius = 30000, limit = 12) {
  const url = `${GEOAPIFY_BASE}/v2/places`;
  const params = {
    categories: "camping",
    filter: `circle:${centerLon},${centerLat},${radius}`, // lon,lat !
    limit,
    apiKey: API_KEY
  };
  try {
    console.log("[getNearbyCampsites] url:", url, "params:", { ...params, apiKey: "****" });
    const { data } = await axios.get(url, { params });
    const features = data?.features || [];
    return features.map((f) => {
      const p = f.properties || {};
      const name = p.name || p.address_line1 || "Campsite";
      const address = [p.address_line1, p.address_line2].filter(Boolean).join(", ");
      return { name, lat: p.lat, lon: p.lon, address };
    });
  } catch (e) {
    console.error("[getNearbyCampsites] error:", e?.response?.status, e?.response?.data || e.message);
    throw e;
  }
}

module.exports = { geocodeSearch, geocodeText, getNearbyCampsites };
