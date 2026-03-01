import express from "express";
import { db } from "../db.js";
import { auth } from "../middleware/auth.js";
import { adminAuth } from "../middleware/admin.js";
import { insertProjectEvent } from "../utils/projectEvents.js";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), "uploads")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const safe = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safe);
  }
});
const upload = multer({ storage, limits: { fileSize: 6 * 1024 * 1024 } });
export const vendorRoutes = express.Router();

function safeJsonArray(value) {
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

vendorRoutes.post("/admin/upload", adminAuth, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "image required" });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

vendorRoutes.get("/applications", adminAuth, async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM vendor_applications ORDER BY created_at DESC LIMIT 200"
  );
  res.json(rows.map(r => ({
    ...r,
    service_types: safeJsonArray(r.service_types),
    portfolio_links: safeJsonArray(r.portfolio_links)
  })));
});

vendorRoutes.post("/applications/:id/approve", adminAuth, async (req, res) => {
  const appId = Number(req.params.id);
  const [rows] = await db.execute(
    "SELECT * FROM vendor_applications WHERE id=?",
    [appId]
  );
  if (!rows.length) return res.status(404).json({ error: "application not found" });
  const app = rows[0];

  const [r] = await db.execute(
    `INSERT INTO vendors (name, city, service_types, phone, whatsapp, website, about, years_exp)
     VALUES (?,?,?,?,?,?,?,?)`,
    [
      app.name,
      app.city,
      app.service_types,
      app.phone,
      app.whatsapp,
      app.website,
      app.about,
      app.years_exp
    ]
  );

  const links = safeJsonArray(app.portfolio_links);
  for (const link of links) {
    await db.execute(
      "INSERT INTO vendor_portfolio (vendor_id, title, image_url) VALUES (?,?,?)",
      [r.insertId, "Portfolio", link]
    );
  }

  await db.execute(
    "UPDATE vendor_applications SET status='approved' WHERE id=?",
    [appId]
  );

  res.json({ vendorId: r.insertId, status: "approved" });
});

vendorRoutes.post("/applications/:id/reject", adminAuth, async (req, res) => {
  const appId = Number(req.params.id);
  await db.execute(
    "UPDATE vendor_applications SET status='rejected' WHERE id=?",
    [appId]
  );
  res.json({ status: "rejected" });
});

vendorRoutes.post("/admin", adminAuth, async (req, res) => {
  const { name, city, service_types, phone, whatsapp, website, about, years_exp, portfolio } = req.body;
  if (!name || !city || !service_types) return res.status(400).json({ error: "missing fields" });

  const [r] = await db.execute(
    `INSERT INTO vendors (name, city, service_types, phone, whatsapp, website, about, years_exp)
     VALUES (?,?,?,?,?,?,?,?)`,
    [
      name,
      city,
      JSON.stringify(service_types),
      phone || null,
      whatsapp || null,
      website || null,
      about || null,
      Number(years_exp || 0)
    ]
  );

  for (const p of portfolio || []) {
    await db.execute(
      "INSERT INTO vendor_portfolio (vendor_id, title, image_url, description) VALUES (?,?,?,?)",
      [r.insertId, p.title || "Portfolio", p.image_url, p.description || null]
    );
  }

  res.json({ vendorId: r.insertId });
});

vendorRoutes.delete("/admin/:id", adminAuth, async (req, res) => {
  const vendorId = Number(req.params.id);
  await db.execute("DELETE FROM vendors WHERE id=?", [vendorId]);
  res.json({ ok: true });
});

vendorRoutes.post("/apply", async (req, res) => {
  const { name, city, service_types, phone, whatsapp, website, about, years_exp, portfolio_links } = req.body;
  if (!name || !city || !service_types) return res.status(400).json({ error: "missing fields" });

  const [r] = await db.execute(
    `INSERT INTO vendor_applications
     (name, city, service_types, phone, whatsapp, website, about, years_exp, portfolio_links)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [
      name,
      city,
      JSON.stringify(service_types),
      phone || null,
      whatsapp || null,
      website || null,
      about || null,
      Number(years_exp || 0),
      JSON.stringify(portfolio_links || [])
    ]
  );

  res.json({ applicationId: r.insertId, status: "pending" });
});

// Multipart apply with portfolio images
vendorRoutes.post("/apply/form", upload.array("images", 6), async (req, res) => {
  const { name, city, service_types, phone, whatsapp, website, about, years_exp } = req.body;
  if (!name || !city || !service_types) return res.status(400).json({ error: "missing fields" });

  const files = req.files || [];
  const fileUrls = files.map(f => `/uploads/${f.filename}`);

  const [r] = await db.execute(
    `INSERT INTO vendor_applications
     (name, city, service_types, phone, whatsapp, website, about, years_exp, portfolio_links)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [
      name,
      city,
      JSON.stringify(String(service_types).split(",").map(s => s.trim()).filter(Boolean)),
      phone || null,
      whatsapp || null,
      website || null,
      about || null,
      Number(years_exp || 0),
      JSON.stringify(fileUrls)
    ]
  );

  res.json({ applicationId: r.insertId, status: "pending", uploaded: fileUrls });
});

vendorRoutes.get("/", async (req, res) => {
  const { city } = req.query;

  const [vendors] = await db.execute(
    `SELECT v.*,
      (SELECT ROUND(AVG(r.rating),1) FROM vendor_reviews r WHERE r.vendor_id=v.id) AS avg_rating,
      (SELECT COUNT(*) FROM vendor_reviews r WHERE r.vendor_id=v.id) AS review_count
     FROM vendors v
     WHERE (? IS NULL OR LOWER(TRIM(v.city))=LOWER(TRIM(?)))
     ORDER BY avg_rating DESC, v.years_exp DESC
     LIMIT 40`,
    [city || null, city || null]
  );

  // attach portfolio thumbnails
  const ids = vendors.map(v => v.id);
  if (ids.length === 0) return res.json([]);

  const [portfolio] = await db.query(
    `SELECT vendor_id, image_url, title FROM vendor_portfolio
     WHERE vendor_id IN (${ids.map(() => "?").join(",")})
     ORDER BY created_at DESC`,
    ids
  );

  const grouped = new Map();
  portfolio.forEach(p => {
    if (!grouped.has(p.vendor_id)) grouped.set(p.vendor_id, []);
    if (grouped.get(p.vendor_id).length < 6) grouped.get(p.vendor_id).push(p);
  });

  res.json(vendors.map(v => ({
    ...v,
    service_types: safeJsonArray(v.service_types),
    portfolio: grouped.get(v.id) || []
  })));
});

vendorRoutes.get("/:id", async (req, res) => {
  const vendorId = Number(req.params.id);
  const [rows] = await db.execute(
    "SELECT * FROM vendors WHERE id=?",
    [vendorId]
  );
  if (!rows.length) return res.status(404).json({ error: "vendor not found" });

  const [portfolio] = await db.execute(
    "SELECT id, image_url, title, description FROM vendor_portfolio WHERE vendor_id=? ORDER BY created_at DESC",
    [vendorId]
  );
  const [reviews] = await db.execute(
    "SELECT id, reviewer_name, rating, comment, created_at FROM vendor_reviews WHERE vendor_id=? ORDER BY created_at DESC",
    [vendorId]
  );
  const [[avg]] = await db.query(
    "SELECT ROUND(AVG(rating),1) AS avg_rating, COUNT(*) AS review_count FROM vendor_reviews WHERE vendor_id=?",
    [vendorId]
  );

  const v = rows[0];
  res.json({
    ...v,
    service_types: safeJsonArray(v.service_types),
    portfolio,
    reviews,
    avg_rating: avg?.avg_rating || null,
    review_count: avg?.review_count || 0
  });
});

vendorRoutes.post("/:id/reviews", auth, async (req, res) => {
  const vendorId = Number(req.params.id);
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: "rating 1..5 required" });

  await db.execute(
    "INSERT INTO vendor_reviews (vendor_id, reviewer_name, rating, comment) VALUES (?,?,?,?)",
    [vendorId, req.user.email, Number(rating), comment || null]
  );
  res.json({ ok: true });
});

vendorRoutes.post("/:id/view", auth, async (req, res) => {
  const vendorId = Number(req.params.id);
  const { project_id } = req.body;
  if (!project_id) return res.status(400).json({ error: "project_id required" });

  const [[p]] = await db.query(
    "SELECT id FROM projects WHERE id=? AND user_id=?",
    [Number(project_id), req.user.userId]
  );
  if (!p) return res.status(403).json({ error: "not allowed" });

  await insertProjectEvent(project_id, "vendor_viewed", { vendorId });
  res.json({ ok: true });
});
