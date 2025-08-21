const axios = require("axios");
const { WMO_TEXT, BUCKETS } = require("../utils/openMeteoCodes");

// Fetch a one-day summary (today or a specific YYYY-MM-DD) for a lat/lon
async function getDailySummary(lat, lon, date /* YYYY-MM-DD or null */) {
  const base = "https://api.open-meteo.com/v1/forecast";
  const params = {
    latitude: lat,
    longitude: lon,
    daily: "weather_code,temperature_2m_max,temperature_2m_min"
  };
  if (date) {
    params.start_date = date;
    params.end_date   = date;
  } else {
    params.forecast_days = 1;
  }

  const { data } = await axios.get(base, { params });
  const d = data?.daily || {};
  return {
    weatherCode: Array.isArray(d.weather_code) ? d.weather_code[0] : undefined,
    tMax:        Array.isArray(d.temperature_2m_max) ? d.temperature_2m_max[0] : undefined,
    tMin:        Array.isArray(d.temperature_2m_min) ? d.temperature_2m_min[0] : undefined
  };
}

// Map WMO code → friendly text
function codeToText(code) {
  return WMO_TEXT[code] || "Unknown";
}

// Check if a WMO code matches a bucket (sunny/rain/etc.)
function matchesWeatherFilter(code, filter) {
  if (!filter) return true;
  const key = String(filter).toLowerCase();
  const set = BUCKETS[key];
  if (!set) return true; // unknown filter → don’t exclude
  return set.has(code);
}

module.exports = { getDailySummary, codeToText, matchesWeatherFilter };
