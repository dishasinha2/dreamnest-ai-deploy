import express from "express";
import { db } from "../db.js";
import { auth } from "../middleware/auth.js";

export const searchRoutes = express.Router();

function safeJsonArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  if (!trimmed.startsWith("[")) {
    return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  }
  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  }
}

searchRoutes.get("/", auth, async (req, res) => {
  const q = String(req.query.q || "").trim();
  const limitRaw = Number(req.query.limit);
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(limitRaw, 24)) : 8;
  const scope = String(req.query.scope || "all").trim().toLowerCase();
  const projectId = Number(req.query.project_id);

  if (!q) {
    return res.status(400).json({ error: "q query parameter required" });
  }
  if (!["all", "projects", "products", "vendors"].includes(scope)) {
    return res.status(400).json({ error: "scope must be one of all, projects, products, vendors" });
  }

  const like = `%${q}%`;
  const prefix = `${q}%`;
  const exact = q;
  let projectContext = null;

  if (Number.isFinite(projectId) && projectId > 0) {
    const [[project]] = await db.query(
      "SELECT id, title, room_type, location_city, style_tags FROM projects WHERE id=? AND user_id=?",
      [projectId, req.user.userId]
    );
    if (project) {
      projectContext = {
        id: project.id,
        title: project.title,
        room_type: project.room_type,
        location_city: project.location_city,
        style_tags: safeJsonArray(project.style_tags)
      };
    }
  }

  const shouldFetchProjects = scope === "all" || scope === "projects";
  const shouldFetchProducts = scope === "all" || scope === "products";
  const shouldFetchVendors = scope === "all" || scope === "vendors";

  const [projects, products, vendors] = await Promise.all([
    shouldFetchProjects
      ? db.execute(
      `SELECT id, title, room_type, location_city, budget_inr, style_tags, created_at
       FROM projects
       WHERE user_id=?
         AND (
           title LIKE ?
           OR room_type LIKE ?
           OR location_city LIKE ?
         )
       ORDER BY
         (title = ?) DESC,
         (title LIKE ?) DESC,
         created_at DESC
       LIMIT ?`,
      [req.user.userId, like, like, like, exact, prefix, limit]
    )
      : Promise.resolve([[]]),
    shouldFetchProducts
      ? db.execute(
      `SELECT id, name, category, room_type, style, price_inr, product_url, image_url, source
       FROM products
       WHERE is_active=1
         AND (
           name LIKE ?
           OR category LIKE ?
           OR room_type LIKE ?
           OR style LIKE ?
           OR tags LIKE ?
         )
       ORDER BY
         (name = ?) DESC,
         (name LIKE ?) DESC,
         created_at DESC
       LIMIT ?`,
      [like, like, like, like, like, exact, prefix, limit]
    )
      : Promise.resolve([[]]),
    shouldFetchVendors
      ? db.execute(
      `SELECT v.id, v.name, v.city, v.service_types, v.website, v.years_exp,
          (SELECT ROUND(AVG(r.rating),1) FROM vendor_reviews r WHERE r.vendor_id=v.id) AS avg_rating,
          (SELECT COUNT(*) FROM vendor_reviews r WHERE r.vendor_id=v.id) AS review_count
       FROM vendors v
       WHERE
         v.name LIKE ?
         OR v.city LIKE ?
         OR v.service_types LIKE ?
         OR v.about LIKE ?
       ORDER BY
         (v.name = ?) DESC,
         (v.name LIKE ?) DESC,
         avg_rating DESC,
         v.created_at DESC
       LIMIT ?`,
      [like, like, like, like, exact, prefix, limit]
    )
      : Promise.resolve([[]])
  ]);

  return res.json({
    query: q,
    scope,
    context: projectContext,
    counts: {
      projects: projects[0].length,
      products: products[0].length,
      vendors: vendors[0].length
    },
    projects: projects[0].map((row) => ({
      ...row,
      style_tags: safeJsonArray(row.style_tags)
    })),
    products: products[0],
    vendors: vendors[0].map((row) => ({
      ...row,
      service_types: safeJsonArray(row.service_types)
    }))
  });
});
