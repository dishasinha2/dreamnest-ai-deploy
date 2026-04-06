const rawBase = String(import.meta.env.VITE_API_BASE || "http://localhost:5000").trim();

export const API_BASE = rawBase.replace(/\/+$/, "");

export function apiUrl(path = "") {
  const normalizedPath = String(path || "").startsWith("/") ? String(path || "") : `/${String(path || "")}`;
  return `${API_BASE}${normalizedPath}`;
}

export function assetUrl(path = "") {
  const normalized = String(path || "").trim();
  if (!normalized) return "";
  if (/^https?:\/\//i.test(normalized)) return normalized;
  return apiUrl(normalized);
}

function parseApiError(text, status) {
  const message = String(text || "").trim();
  if (!message) return `Request failed (${status})`;

  const cannotPostMatch = message.match(/Cannot\s+(GET|POST|PUT|PATCH|DELETE)\s+([^<\s]+)/i);
  if (cannotPostMatch) {
    return `API route ${cannotPostMatch[1].toUpperCase()} ${cannotPostMatch[2]} was not found at ${API_BASE}. Check VITE_API_BASE and backend deployment settings.`;
  }

  if (/<\/?[a-z][\s\S]*>/i.test(message)) {
    return `Request failed (${status}). The server returned an HTML error page instead of the API response. Check VITE_API_BASE and backend deployment settings.`;
  }

  return message;
}

export async function api(path, { method="GET", token, body, isForm, headers: extraHeaders, timeoutMs = 25000 } = {}) {
  const headers = { ...(extraHeaders || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isForm) headers["Content-Type"] = "application/json";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  try {
    res = await fetch(apiUrl(path), {
      method,
      headers,
      signal: controller.signal,
      body: isForm ? body : body ? JSON.stringify(body) : undefined
    });
  } catch (err) {
    if (err?.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw new Error(`Cannot reach API at ${API_BASE}. Start backend or fix VITE_API_BASE.`);
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const t = await res.text();
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("dreamnest_token");
      throw new Error("Session expired. Please log in again.");
    }
    throw new Error(parseApiError(t, res.status));
  }
  return res.json();
}

export async function warmApi() {
  try {
    await fetch(apiUrl("/api/health"), { cache: "no-store" });
  } catch {
    // Ignore warm-up failures. Real requests will surface actionable errors.
  }
}
