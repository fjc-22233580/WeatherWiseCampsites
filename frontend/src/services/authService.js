import { SUPABASE_URL, jsonFetch } from "../config/supabase.js";
import { saveSession, clearSession, getAccessToken } from "../utils/storage.js";

/**
 * Sign up
 * Endpoint: POST /auth/v1/signup
 * Body: { email, password }
 */
export async function signUp(email, password) {
  const url = `${SUPABASE_URL}/auth/v1/signup`;
  const data = await jsonFetch(url, {
    method: "POST",
    body: { email, password },
  });
  if (data?.session?.access_token) {
    saveSession({
      access_token: data.session.access_token,
      user: data.user ?? null,
    });
  }
  return data;
}

/**
 * Log in (password grant)
 * Endpoint: POST /auth/v1/token?grant_type=password
 * Body: { email, password }
 * Headers: apikey
 */
export async function signIn(email, password) {
  const url = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
  const data = await jsonFetch(url, {
    method: "POST",
    body: { email, password },
  });

  // Expected: { access_token, token_type, expires_in, refresh_token, user, ... }
  if (data?.access_token) {
    saveSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
      user: data.user ?? null,
    });
  }
  return data;
}

/**
 * Log out
 * Endpoint: POST /auth/v1/logout
 * Headers: apikey + Authorization: Bearer <access_token>
 */
export async function signOut() {
  const token = getAccessToken();
  if (!token) {
    clearSession();
    return { msg: "No session" };
  }

  const url = `${SUPABASE_URL}/auth/v1/logout`;
  await jsonFetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  clearSession();
  return { msg: "Signed out" };
}
