import express from "express";
import { db } from "../db.js";
import { googleShoppingSearch } from "../services/shopping.service.js";
import { adminAuth } from "../middleware/admin.js";
export const productRoutes = express.Router();

productRoutes.get("/", async (req, res) => {
  const { room_type, style, max_price } = req.query;
  const mp = max_price ? Number(max_price) : null;

  const [rows] = await db.execute(
    `SELECT * FROM products
     WHERE is_active=1
       AND (? IS NULL OR room_type=?)
       AND (? IS NULL OR style=?)
       AND (? IS NULL OR price_inr <= ?)
     ORDER BY ABS(COALESCE(price_inr,0) - COALESCE(?,0)) ASC
     LIMIT 60`,
    [room_type || null, room_type || null, style || null, style || null, mp, mp, mp]
  );

  res.json(rows);
});

productRoutes.get("/live", async (req, res) => {
  try {
    const { q, room_type, style, budget_inr, location, store_priority, exact_only } = req.query;
    const query = q || `${style || ""} ${room_type || ""} furniture`.trim() || "interior furniture";

    const data = await googleShoppingSearch({
      query,
      location,
      max_price: budget_inr,
      store_priority,
      exact_only
    });

    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message || "live search failed", results: [] });
  }
});

productRoutes.post("/admin/ingest", adminAuth, async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "items array required" });
  }

  let inserted = 0;
  for (const it of items) {
    if (!it.product_url || !it.name) continue;
    const [ex] = await db.execute(
      "SELECT id FROM products WHERE product_url=? LIMIT 1",
      [it.product_url]
    );
    if (ex.length) continue;

    await db.execute(
      `INSERT INTO products (name, brand, category, room_type, style, price_inr, product_url, image_url, description, tags, source, is_active)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,1)`,
      [
        it.name,
        it.brand || null,
        it.category || "furniture",
        it.room_type || "living_room",
        it.style || "modern",
        it.price_inr || null,
        it.product_url,
        it.image_url || null,
        it.description || null,
        JSON.stringify(it.tags || []),
        it.source || "live"
      ]
    );
    inserted += 1;
  }

  res.json({ inserted });
});

productRoutes.delete("/admin/:id", adminAuth, async (req, res) => {
  const productId = Number(req.params.id);
  await db.execute("DELETE FROM products WHERE id=?", [productId]);
  res.json({ ok: true });
});
