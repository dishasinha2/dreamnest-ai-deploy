import { useEffect, useState } from "react";

const KEY = "dreamnest_token";

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(KEY) || "");

  useEffect(() => {
    if (token) localStorage.setItem(KEY, token);
    else localStorage.removeItem(KEY);
  }, [token]);

  return { token, setToken };
}
