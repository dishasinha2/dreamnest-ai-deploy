import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../api/endpoints";
import { useAuth } from "../hooks/useAuth";

export default function Auth() {
  const nav = useNavigate();
  const { token, setToken } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordChecks = [
    { label: "10+ characters", valid: form.password.length >= 10 },
    { label: "Uppercase letter", valid: /[A-Z]/.test(form.password) },
    { label: "Lowercase letter", valid: /[a-z]/.test(form.password) },
    { label: "Number", valid: /\d/.test(form.password) },
    { label: "Special character", valid: /[^A-Za-z0-9]/.test(form.password) }
  ];

  function validateForm() {
    const email = form.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
    if (!form.password) return "Enter your password.";
    if (mode === "register") {
      if (form.name.trim().length < 2) return "Enter your full name.";
      if (passwordChecks.some((check) => !check.valid)) {
        return "Password must be stronger before you create an account.";
      }
      if (form.password !== form.confirmPassword) return "Passwords do not match.";
    }
    return "";
  }

  useEffect(() => {
    if (token) nav("/dashboard");
  }, [token, nav]);

  async function submit(e) {
    e.preventDefault();
    const validationError = validateForm();
    setError(validationError);
    if (validationError) return;
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password
      };
      const res =
        mode === "register"
          ? await AuthAPI.register(payload)
          : await AuthAPI.login({ email: payload.email, password: payload.password });
      if (!res?.token) {
        setError("Login failed: token missing.");
        return;
      }
      setToken(res.token);
      localStorage.setItem("dreamnest_token", res.token);
      nav("/dashboard", { replace: true });
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
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
              <>
                <input
                  className="input"
                  placeholder="Full name"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </>
            )}
            <input
              className="input"
              placeholder="Email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="input"
              placeholder={mode === "register" ? "Strong password" : "Password"}
              type="password"
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {mode === "register" && (
              <>
                <input
                  className="input"
                  placeholder="Confirm password"
                  type="password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                />
                <div className="glass-panel" style={{ padding: 14 }}>
                  <div className="panel-title" style={{ fontSize: 18 }}>Password strength</div>
                  <div className="grid" style={{ gap: 8, marginTop: 8 }}>
                    {passwordChecks.map((check) => (
                      <div key={check.label} className="muted" style={{ color: check.valid ? "var(--accent3)" : "var(--muted)" }}>
                        {check.valid ? "Pass" : "Need"} - {check.label}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            {error && <div className="muted">{error}</div>}
            <button className="btn btn-accent2" type="submit" disabled={loading}>
              {loading ? "Please wait..." : mode === "register" ? "Create account" : "Log in"}
            </button>
          </form>
          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              className="btn btn-outline"
              onClick={() => {
                setMode(mode === "register" ? "login" : "register");
                setError("");
                setForm({ name: "", email: form.email, password: "", confirmPassword: "" });
              }}
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
