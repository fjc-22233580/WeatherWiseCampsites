import { getAccessToken } from "../utils/storage.js";

const BASE_URL = "http://localhost:4000";
const API_BASE = "/api";

async function fetchJSON(path, { method="GET", headers={}, body } = {}){
  const token = getAccessToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let data = null; try{ data = text ? JSON.parse(text) : null; }catch{}
  if(!res.ok){
    const msg = data?.error?.message || data?.message || `HTTP ${res.status}`;
    const err = new Error(msg); err.status = res.status; err.data = data; throw err;
  }
  return data;
}

function authHeaders() {
  const token = window.authService?.getToken?.();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function jsonGet(url) {
  const res = await fetch(url, { headers: { "Content-Type":"application/json", ...authHeaders() }});
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
  return data;
}

export async function searchLocations(text, limit = 5) {
  const q = new URLSearchParams({ text, limit });
  const url = `${BASE_URL}${API_BASE}/locations/search?${q}`;
  const data = await jsonGet(url);

  return Array.isArray(data) ? data : (data?.items ?? []);
}

export async function searchCampsites({ lat, lon, radius, weather, date }) {
  const q = new URLSearchParams({
    lat, lon, radius: String(radius || 3000),
    ...(weather ? { weather } : {}),
    ...(date ? { date } : {}),
  });
  return jsonGet(`${BASE_URL}${API_BASE}/campsites/search?${q}`);
}

export async function getReviews(campsiteId) {
    return jsonGet(`${BASE_URL}${API_BASE}/reviews/${encodeURIComponent(campsiteId)}`);
  }

  export async function postReview(campsiteId, { rating, comment }) {
    return fetchJSON(`${API_BASE}/reviews`, {
      method: "PUT",
      body: {
        campsite_id: String(campsiteId),
        rating: Number(rating),
        comment: comment ?? ""
      }
    });
  }

  //favourites
  export function getFavourites() {
    return fetchJSON("/favourites");
  }
  export function toggleFavourite(campsiteId) {
    return fetchJSON(`/favourites/${encodeURIComponent(campsiteId)}`, { method: "POST" });
  }
  
 /* //preferences
  export function getPreferences() {
    return fetchJSON("/preferences");
  }
  export function savePreferences(prefs) {
    return fetchJSON("/preferences", { method: "PUT", body: prefs });
  }*/


  
export const getPreferences = () => fetchJSON("/preferences");
export const savePreferences = (payload) => fetchJSON("/preferences", { method:"PUT", body: payload });

