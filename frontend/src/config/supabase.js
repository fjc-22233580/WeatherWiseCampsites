export const SUPABASE_URL="https://wirdnjahkmgsrgmoqaow.supabase.co";
export const SUPABASE_ANON_KEY="sb_publishable_bkOWymrpfXnFP3g44rsuhQ_vPRSRpeE";

// Simple JSON fetch helper with consistent error shape
export async function jsonFetch(url, { method = "GET", headers = {}, body } = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,     
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* ignore parse errors */ }

  if (!res.ok) {
    const message =
      data?.error?.message ||
      data?.msg ||
      `HTTP ${res.status} ${res.statusText}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
