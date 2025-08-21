const { geocodeSearch } = require("../services/geoapifyService");


async function searchLocations(req, res) {
  try {
    const text = (req.query.text || "").trim();
    const limit = Math.min(Number(req.query.limit) || 5, 10);
    if (!text) return res.status(400).json({ error: "text is required" });

    const items = await geocodeSearch(text, limit);
    if (!items.length) return res.status(404).json({ error: "No matching locations" });

    res.json({ total: items.length, items });
  } catch (e) {
  const status = e?.response?.status || 500;
  const data = e?.response?.data || { message: e.message };
  return res.status(status).json({ error: "geocode failed", upstream: data });
}

}

module.exports = { searchLocations }; // <-- MUST be named export
