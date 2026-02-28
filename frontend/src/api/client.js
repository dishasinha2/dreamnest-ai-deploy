const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export async function api(path, { method="GET", token, body, isForm, headers: extraHeaders } = {}) {
  const headers = { ...(extraHeaders || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isForm) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: isForm ? body : body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new Error(`Cannot reach API at ${BASE}. Start backend or fix VITE_API_BASE.`);
  }

  if (!res.ok) {
    const t = await res.text();
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("dreamnest_token");
      throw new Error("Session expired. Please log in again.");
    }
    throw new Error(t || `Request failed (${res.status})`);
  }
  return res.json();
}
