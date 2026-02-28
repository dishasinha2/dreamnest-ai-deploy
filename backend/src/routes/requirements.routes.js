import express from "express";
import { db } from "../db.js";
import { auth } from "../middleware/auth.js";
import { insertProjectEvent } from "../utils/projectEvents.js";
import { tableExists } from "../utils/dbTables.js";

export const requirementsRoutes = express.Router();

function parseArraySafe(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  const t = value.trim();
  if (!t) return [];
  if (!t.startsWith("[")) return t.split(",").map((s) => s.trim()).filter(Boolean);
  try {
    const parsed = JSON.parse(t);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return t.split(",").map((s) => s.trim()).filter(Boolean);
  }
}

requirementsRoutes.post("/", auth, async (req, res) => {
  const { project_id, notes, must_haves, colors } = req.body;
  if (!project_id) return res.status(400).json({ error: "project_id required" });
  if (!(await tableExists("requirements"))) {
    return res.status(503).json({ error: "requirements table missing" });
  }

  const [[p]] = await db.query(
    "SELECT id FROM projects WHERE id=? AND user_id=?",
    [Number(project_id), req.user.userId]
  );
  if (!p) return res.status(403).json({ error: "not allowed" });

  const [r] = await db.execute(
    "INSERT INTO requirements (project_id, notes, must_haves, colors) VALUES (?,?,?,?)",
    [
      Number(project_id),
      notes || null,
      JSON.stringify(must_haves || []),
      JSON.stringify(colors || [])
    ]
  );

  await insertProjectEvent(project_id, "requirements_added", {});

  res.json({ requirementId: r.insertId });
});

requirementsRoutes.get("/project/:id", auth, async (req, res) => {
  const projectId = Number(req.params.id);
  if (!(await tableExists("requirements"))) {
    return res.json([]);
  }
  const [[p]] = await db.query(
    "SELECT id FROM projects WHERE id=? AND user_id=?",
    [projectId, req.user.userId]
  );
  if (!p) return res.status(403).json({ error: "not allowed" });

  const [rows] = await db.execute(
    "SELECT * FROM requirements WHERE project_id=? ORDER BY created_at DESC",
    [projectId]
  );
  res.json(rows.map(r => ({
    ...r,
    must_haves: parseArraySafe(r.must_haves),
    colors: parseArraySafe(r.colors)
  })));
});
