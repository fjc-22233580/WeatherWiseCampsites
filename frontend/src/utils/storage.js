const KEY = "supabase_session"; // where access_token & user info is

export function saveSession(sessionObj) {
  localStorage.setItem(KEY, JSON.stringify(sessionObj));
}

export function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(KEY);
}

export function getAccessToken() {
  return loadSession()?.access_token || null;
}

export function isAuthenticated() {
  return Boolean(getAccessToken());
}
