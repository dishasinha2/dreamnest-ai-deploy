import express from "express";
import { db } from "../db.js";
import { auth } from "../middleware/auth.js";
import { insertProjectEvent, countProjectEvents } from "../utils/projectEvents.js";
import { tableExists } from "../utils/dbTables.js";
export const projectRoutes = express.Router();

let locationColumnCache = null;
async function getLocationColumns() {
  if (locationColumnCache) return locationColumnCache;
  const [rows] = await db.query(
    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='projects' AND COLUMN_NAME IN ('location_city','location')"
  );
  const cols = rows.map(r => r.COLUMN_NAME);
  locationColumnCache = {
    hasLocationCity: cols.includes("location_city"),
    hasLocation: cols.includes("location")
  };
  return locationColumnCache;
}

projectRoutes.get("/", auth, async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM projects WHERE user_id=? ORDER BY created_at DESC",
    [req.user.userId]
  );
  res.json(rows.map(r => ({
    ...r,
    style_tags: safeJsonArray(r.style_tags)
  })));
});

projectRoutes.get("/:id", auth, async (req, res) => {
  const projectId = Number(req.params.id);
  const [rows] = await db.execute(
    "SELECT * FROM projects WHERE id=? AND user_id=?",
    [projectId, req.user.userId]
  );
  if (!rows.length) return res.status(404).json({ error: "project not found" });
  const p = rows[0];
  res.json({ ...p, style_tags: safeJsonArray(p.style_tags) });
});

projectRoutes.delete("/:id", auth, async (req, res) => {
  const projectId = Number(req.params.id);
  if (!Number.isFinite(projectId)) return res.status(400).json({ error: "invalid project id" });

  const [r] = await db.execute(
    "DELETE FROM projects WHERE id=? AND user_id=?",
    [projectId, req.user.userId]
  );
  if (!r.affectedRows) return res.status(404).json({ error: "project not found" });

  res.json({ ok: true });
});

function safeJsonArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  if (!trimmed.startsWith("[")) {
    return trimmed.split(",").map(s => s.trim()).filter(Boolean);
  }
  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return trimmed.split(",").map(s => s.trim()).filter(Boolean);
  }
}

projectRoutes.post("/", auth, async (req, res) => {
  const { title, room_type, budget_inr, style_tags, location_city, area_sqft } = req.body;
  if (!title || !room_type || !budget_inr || !style_tags || !location_city || !area_sqft) {
    return res.status(400).json({ error: "missing fields" });
  }
  const cols = await getLocationColumns();
  let sql = "INSERT INTO projects (user_id,title,room_type,budget_inr,style_tags,area_sqft";
  const params = [req.user.userId, title, room_type, Number(budget_inr), JSON.stringify(style_tags), Number(area_sqft)];
  if (cols.hasLocationCity) {
    sql = "INSERT INTO projects (user_id,title,room_type,budget_inr,style_tags,location_city,area_sqft";
    params.splice(5, 0, location_city);
  }
  if (cols.hasLocation) {
    if (cols.hasLocationCity) {
      sql = "INSERT INTO projects (user_id,title,room_type,budget_inr,style_tags,location_city,location,area_sqft";
      params.splice(6, 0, location_city);
    } else {
      sql = "INSERT INTO projects (user_id,title,room_type,budget_inr,style_tags,location,area_sqft";
      params.splice(5, 0, location_city);
    }
  }
  sql += ") VALUES (" + params.map(() => "?").join(",") + ")";
  const [r] = await db.execute(sql, params);
  await insertProjectEvent(r.insertId, "created", {});
  res.json({ projectId: r.insertId });
});

projectRoutes.post("/:id/shortlist", auth, async (req, res) => {
  const projectId = Number(req.params.id);
  const { product_id } = req.body;
  await db.execute(
    "INSERT IGNORE INTO shortlist(project_id, product_id) VALUES (?,?)",
    [projectId, Number(product_id)]
  );
  await insertProjectEvent(projectId, "shortlist_added", { product_id });
  res.json({ ok: true });
});

projectRoutes.post("/:id/vendors/shortlist", auth, async (req, res) => {
  const projectId = Number(req.params.id);
  const vendorId = Number(req.body.vendor_id);
  if (!Number.isFinite(vendorId) || vendorId <= 0) {
    return res.status(400).json({ error: "vendor_id required" });
  }

  const [[project]] = await db.query(
    "SELECT id FROM projects WHERE id=? AND user_id=?",
    [projectId, req.user.userId]
  );
  if (!project) return res.status(403).json({ error: "not allowed" });

  const [[vendor]] = await db.query("SELECT id FROM vendors WHERE id=?", [vendorId]);
  if (!vendor) return res.status(404).json({ error: "vendor not found" });

  if (!(await tableExists("project_vendor_shortlist"))) {
    return res.status(503).json({ error: "project_vendor_shortlist table missing" });
  }

  await db.execute(
    "INSERT IGNORE INTO project_vendor_shortlist(project_id, vendor_id) VALUES (?,?)",
    [projectId, vendorId]
  );
  await insertProjectEvent(projectId, "vendor_shortlisted", { vendor_id: vendorId });
  res.json({ ok: true });
});

projectRoutes.get("/:id/vendors/shortlist", auth, async (req, res) => {
  const projectId = Number(req.params.id);

  const [[project]] = await db.query(
    "SELECT id FROM projects WHERE id=? AND user_id=?",
    [projectId, req.user.userId]
  );
  if (!project) return res.status(403).json({ error: "not allowed" });

  if (!(await tableExists("project_vendor_shortlist"))) return res.json([]);

  const [rows] = await db.query(
    `SELECT v.*,
      (SELECT ROUND(AVG(r.rating),1) FROM vendor_reviews r WHERE r.vendor_id=v.id) AS avg_rating,
      (SELECT COUNT(*) FROM vendor_reviews r WHERE r.vendor_id=v.id) AS review_count
     FROM project_vendor_shortlist pvs
     JOIN vendors v ON v.id = pvs.vendor_id
     WHERE pvs.project_id=?
     ORDER BY pvs.created_at DESC`,
    [projectId]
  );

  res.json(rows.map((v) => ({
    ...v,
    service_types: safeJsonArray(v.service_types)
  })));
});

projectRoutes.get("/:id/progress", auth, async (req, res) => {
  const projectId = Number(req.params.id);
  const [p] = await db.execute(
    "SELECT * FROM projects WHERE id=? AND user_id=?",
    [projectId, req.user.userId]
  );
  if (!p.length) return res.status(404).json({ error: "project not found" });

  let reqCount = { c: 0 };
  if (await tableExists("requirements")) {
    const [[row]] = await db.query(
      "SELECT COUNT(*) AS c FROM requirements WHERE project_id=?",
      [projectId]
    );
    reqCount = row || { c: 0 };
  }

  let shortCount = { c: 0 };
  if (await tableExists("shortlist")) {
    const [[row]] = await db.query(
      "SELECT COUNT(*) AS c FROM shortlist WHERE project_id=?",
      [projectId]
    );
    shortCount = row || { c: 0 };
  }
  const vendorViewsCount = await countProjectEvents(projectId, "vendor_viewed");
  const vendorShortCount = await countProjectEvents(projectId, "vendor_shortlisted");

  const steps = [
    { key: "project_created", label: "Project created", done: true },
    { key: "requirements", label: "Requirements added", done: reqCount.c > 0 },
    { key: "shortlist", label: "Products shortlisted", done: shortCount.c > 0 },
    { key: "vendors", label: "Vendor explored", done: vendorViewsCount > 0 || vendorShortCount > 0 }
  ];
  const done = steps.filter(s => s.done).length;
  const percent = Math.round((done / steps.length) * 100);

  res.json({ percent, steps });
});
