import { getAccessToken } from "../utils/storage.js";

const BASE_URL = "http://localhost:4000";

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

// backend routes: GET /preferences, PUT /preferences
export const getPreferences = () => fetchJSON("/preferences");
export const savePreferences = (payload) => fetchJSON("/preferences", { method:"PUT", body: payload });
