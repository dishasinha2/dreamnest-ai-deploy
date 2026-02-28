import express from "express";
import { db } from "../db.js";

export const feedbackRoutes = express.Router();

feedbackRoutes.post("/", async (req, res) => {
  const { name, email, message, rating, user_id } = req.body;
  if (!message) return res.status(400).json({ error: "message required" });

  await db.execute(
    "INSERT INTO feedbacks (user_id, name, email, rating, message) VALUES (?,?,?,?,?)",
    [
      user_id || null,
      name || null,
      email || null,
      rating || null,
      message
    ]
  );

  res.json({ ok: true });
});
