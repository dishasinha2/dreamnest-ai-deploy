import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../api/endpoints";
import { useAuth } from "../hooks/useAuth";

export default function Auth() {
  const nav = useNavigate();
  const { token, setToken } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) nav("/dashboard");
  }, [token, nav]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const res =
        mode === "register"
          ? await AuthAPI.register(form)
          : await AuthAPI.login({ email: form.email, password: form.password });
      if (!res?.token) {
        setError("Login failed: token missing.");
        return;
      }
      setToken(res.token);
      localStorage.setItem("dreamnest_token", res.token);
      nav("/dashboard", { replace: true });
    } catch (err) {
      setError(String(err.message || err));
    }
  }

  return (
    <div className="container">
      <div className="auth-wrap">
        <div className="glass-stack">
          <h2 style={{ fontFamily: "var(--font-display)" }}>
            {mode === "register" ? "Create your account" : "Welcome back"}
          </h2>
          <p className="muted">
            {mode === "register"
              ? "Start a project and get AI-guided room planning."
              : "Log in to continue your project."}
          </p>
          <form onSubmit={submit} className="grid">
            {mode === "register" && (
              <input
                className="input"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            )}
            <input
              className="input"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="input"
              placeholder="Password (min 8)"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {error && <div className="muted">{error}</div>}
            <button className="btn btn-accent2" type="submit">
              {mode === "register" ? "Create account" : "Log in"}
            </button>
          </form>
          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              className="btn btn-outline"
              onClick={() => setMode(mode === "register" ? "login" : "register")}
            >
              {mode === "register" ? "I already have an account" : "Create new account"}
            </button>
            <a className="btn btn-outline" href="/vendors">Go to Vendor Marketplace</a>
          </div>
        </div>
      </div>
    </div>
  );
}
