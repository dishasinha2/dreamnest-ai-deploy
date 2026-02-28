import express from "express";
import { db } from "../db.js";
import { auth } from "../middleware/auth.js";
export const clickRoutes = express.Router();

clickRoutes.post("/", auth, async (req, res) => {
  const { product_id, ref } = req.body;
  const pid = Number(product_id);
  if (!Number.isFinite(pid) || pid <= 0) return res.status(400).json({ error: "product_id required" });

  await db.execute(
    "INSERT INTO click_events (user_id, product_id, ref) VALUES (?,?,?)",
    [req.user.userId, pid, ref || "recommendations"]
  );
  res.json({ ok: true });
});
