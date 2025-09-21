import { getAccessToken } from "../utils/storage.js";

const BASE_URL = "http://localhost:4000";
const API_BASE = "/api";

function authHeaders() {
  const token = getAccessToken() || window.authService?.getToken?.();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJSON(path, { method = "GET", headers = {}, body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch {}

  if (!res.ok) {
    const msg = data?.error?.message || data?.message || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function jsonGet(url) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json", ...authHeaders() } });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
  return data;
}

// Search APIs 
export async function searchLocations(text, limit = 5) {
  const q = new URLSearchParams({ text, limit });
  const url = `${BASE_URL}${API_BASE}/locations/search?${q}`;
  const data = await jsonGet(url);
  return Array.isArray(data) ? data : (data?.items ?? []);
}

export async function searchCampsites({ lat, lon, radius, weather, date }) {
  const q = new URLSearchParams({
    lat, lon,
    radius: String(radius || 3000),
    ...(weather ? { weather } : {}),
    ...(date ? { date } : {}),
  });
  return jsonGet(`${BASE_URL}${API_BASE}/campsites/search?${q}`);
}

// Reviews 
export function getReviews(campsiteId) {
  return jsonGet(`${BASE_URL}${API_BASE}/reviews/${encodeURIComponent(campsiteId)}`);
}

export function postReview(campsiteId, { rating, comment }) {
  return fetchJSON(`${API_BASE}/reviews`, {
    method: "PUT",
    body: {
      campsite_id: String(campsiteId),
      rating: Number(rating),
      comment: comment ?? "",
    },
  });
}

// Favourites 
export function getFavourites() {
  // Expecting an array of campsite IDs
  return fetchJSON(`${API_BASE}/favourites`);
}

export async function setFavourite(campsiteId, desired) {
  const body = typeof desired === "boolean" ? { isFavourite: desired } : undefined;
  const res = await fetchJSON(`${API_BASE}/favourites/${encodeURIComponent(campsiteId)}`, {
    method: "PUT",
    body,
  });
  return !!res.isFavourite;
}

// Preferences 
export function getPreferences() {
  // GET /api/preferences — returns a JSON object of user prefs
  return fetchJSON(`${API_BASE}/preferences`, { method: "GET" });
}

export async function savePreferences(prefs) {
  // PUT /api/preferences — upserts user prefs
  return fetchJSON(`${API_BASE}/preferences`, { method: "PUT", body: prefs });
}

// Merge & save a partial set of preferences 
export async function patchPreferences(partial) {
  const current = await getPreferences().catch(() => ({}));
  const next = { ...(current || {}), ...partial };
  return savePreferences(next);
}
