import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db.js";
import { auth } from "../middleware/auth.js";
export const authRoutes = express.Router();
const DUMMY_PASSWORD_HASH = "$2a$12$CjrxpQ4rY8rCvx8sJ2YIwuF2dP6i.yXU1bDJ7tY79DbDeihdj5Z8i"; // hash for timing-safe compare
const ACCOUNT_LOCK_THRESHOLD = 5;
const ACCOUNT_LOCK_MS = 30 * 60 * 1000;

const loginAttempts = new Map();
const registerAttempts = new Map();

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function isStrongPassword(password) {
  const value = String(password || "");
  return value.length >= 10
    && /[a-z]/.test(value)
    && /[A-Z]/.test(value)
    && /\d/.test(value)
    && /[^A-Za-z0-9]/.test(value);
}

function buildAttemptKey(req, email) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  const ip = forwarded || req.ip || "unknown";
  return `${ip}:${email || "anonymous"}`;
}

function sweepAttempts(store, now) {
  for (const [key, value] of store.entries()) {
    if (value.resetAt <= now) store.delete(key);
  }
}

function checkRateLimit(store, key, limit, windowMs) {
  const now = Date.now();
  sweepAttempts(store, now);
  const current = store.get(key);
  if (current && current.count >= limit && current.resetAt > now) {
    return Math.ceil((current.resetAt - now) / 1000);
  }
  if (!current || current.resetAt <= now) {
    store.set(key, { count: 0, resetAt: now + windowMs });
  }
  return 0;
}

function recordFailure(store, key, windowMs) {
  const now = Date.now();
  const current = store.get(key);
  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  current.count += 1;
}

function clearFailures(store, key) {
  store.delete(key);
}

authRoutes.post("/register", async (req, res) => {
  const name = normalizeName(req.body?.name);
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");
  const attemptKey = buildAttemptKey(req, email);
  const retryAfter = checkRateLimit(registerAttempts, attemptKey, 4, 15 * 60 * 1000);
  if (retryAfter) return res.status(429).json({ error: `Too many registration attempts. Try again in ${retryAfter}s.` });

  if (!name || name.length < 2 || name.length > 80) {
    recordFailure(registerAttempts, attemptKey, 15 * 60 * 1000);
    return res.status(400).json({ error: "Enter a valid name." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    recordFailure(registerAttempts, attemptKey, 15 * 60 * 1000);
    return res.status(400).json({ error: "Enter a valid email address." });
  }
  if (!isStrongPassword(password)) {
    recordFailure(registerAttempts, attemptKey, 15 * 60 * 1000);
    return res.status(400).json({ error: "Password must be at least 10 characters and include upper, lower, number, and special character." });
  }
  if (!process.env.JWT_SECRET) return res.status(500).json({ error: "JWT_SECRET not set" });

  const [ex] = await db.execute("SELECT id FROM users WHERE email=?", [email]);
  if (ex.length) {
    recordFailure(registerAttempts, attemptKey, 15 * 60 * 1000);
    return res.status(400).json({ error: "An account with this email already exists." });
  }

  const password_hash = await bcrypt.hash(password, 12);
  let r;
  try {
    [r] = await db.execute("INSERT INTO users(name,email,password_hash) VALUES (?,?,?)", [name, email, password_hash]);
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") {
      recordFailure(registerAttempts, attemptKey, 15 * 60 * 1000);
      return res.status(400).json({ error: "An account with this email already exists." });
    }
    throw err;
  }

  clearFailures(registerAttempts, attemptKey);
  const token = jwt.sign({ userId: r.insertId, email }, process.env.JWT_SECRET, { expiresIn: "12h" });
  res.json({ token });
});

authRoutes.post("/login", async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");
  const attemptKey = buildAttemptKey(req, email);
  const retryAfter = checkRateLimit(loginAttempts, attemptKey, 6, 15 * 60 * 1000);
  if (retryAfter) return res.status(429).json({ error: `Too many login attempts. Try again in ${retryAfter}s.` });
  if (!process.env.JWT_SECRET) return res.status(500).json({ error: "JWT_SECRET not set" });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) {
    recordFailure(loginAttempts, attemptKey, 15 * 60 * 1000);
    return res.status(400).json({ error: "Invalid credentials." });
  }
  const [u] = await db.execute("SELECT * FROM users WHERE email=?", [email]);
  if (!u.length) {
    await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
    recordFailure(loginAttempts, attemptKey, 15 * 60 * 1000);
    return res.status(400).json({ error: "Invalid credentials." });
  }

  if (!u[0].is_active) {
    recordFailure(loginAttempts, attemptKey, 15 * 60 * 1000);
    return res.status(403).json({ error: "Account access is disabled." });
  }

  if (u[0].locked_until && new Date(u[0].locked_until).getTime() > Date.now()) {
    const secs = Math.ceil((new Date(u[0].locked_until).getTime() - Date.now()) / 1000);
    return res.status(423).json({ error: `Account is temporarily locked. Try again in ${secs}s.` });
  }

  const ok = await bcrypt.compare(password, u[0].password_hash);
  if (!ok) {
    recordFailure(loginAttempts, attemptKey, 15 * 60 * 1000);
    const nextFailures = Number(u[0].failed_login_count || 0) + 1;
    const shouldLock = nextFailures >= ACCOUNT_LOCK_THRESHOLD;
    await db.execute(
      "UPDATE users SET failed_login_count=?, locked_until=? WHERE id=?",
      [
        shouldLock ? 0 : nextFailures,
        shouldLock ? new Date(Date.now() + ACCOUNT_LOCK_MS) : null,
        u[0].id
      ]
    );
    return res.status(400).json({ error: "Invalid credentials." });
  }

  await db.execute("UPDATE users SET failed_login_count=0, locked_until=NULL WHERE id=?", [u[0].id]);
  clearFailures(loginAttempts, attemptKey);
  const token = jwt.sign({ userId: u[0].id, email: u[0].email }, process.env.JWT_SECRET, { expiresIn: "12h" });
  res.json({ token });
});

authRoutes.get("/me", auth, async (req, res) => {
  const [u] = await db.execute("SELECT id, name, email FROM users WHERE id=?", [req.user.userId]);
  if (!u.length) return res.status(404).json({ error: "user not found" });
  res.json(u[0]);
});
