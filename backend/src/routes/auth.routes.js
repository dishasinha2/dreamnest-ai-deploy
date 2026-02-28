import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db.js";
import { auth } from "../middleware/auth.js";
export const authRoutes = express.Router();

authRoutes.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 8) return res.status(400).json({ error: "invalid input" });
  if (!process.env.JWT_SECRET) return res.status(500).json({ error: "JWT_SECRET not set" });

  const [ex] = await db.execute("SELECT id FROM users WHERE email=?", [email.toLowerCase()]);
  if (ex.length) return res.status(400).json({ error: "user exists" });

  const password_hash = await bcrypt.hash(password, 10);
  const [r] = await db.execute("INSERT INTO users(name,email,password_hash) VALUES (?,?,?)", [name, email.toLowerCase(), password_hash]);

  const token = jwt.sign({ userId: r.insertId, email: email.toLowerCase() }, process.env.JWT_SECRET, { expiresIn: "24h" });
  res.json({ token });
});

authRoutes.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!process.env.JWT_SECRET) return res.status(500).json({ error: "JWT_SECRET not set" });
  const [u] = await db.execute("SELECT * FROM users WHERE email=?", [email.toLowerCase()]);
  if (!u.length) return res.status(400).json({ error: "invalid credentials" });

  const ok = await bcrypt.compare(password, u[0].password_hash);
  if (!ok) return res.status(400).json({ error: "invalid credentials" });

  const token = jwt.sign({ userId: u[0].id, email: u[0].email }, process.env.JWT_SECRET, { expiresIn: "24h" });
  res.json({ token });
});

authRoutes.get("/me", auth, async (req, res) => {
  const [u] = await db.execute("SELECT id, name, email FROM users WHERE id=?", [req.user.userId]);
  if (!u.length) return res.status(404).json({ error: "user not found" });
  res.json(u[0]);
});
