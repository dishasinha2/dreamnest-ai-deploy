import express from "express";
import { db } from "../db.js";
import { adminAuth } from "../middleware/admin.js";

export const analyticsRoutes = express.Router();

analyticsRoutes.get("/admin", adminAuth, async (req, res) => {
  const [[users]] = await db.query("SELECT COUNT(*) AS c FROM users");
  const [[projects]] = await db.query("SELECT COUNT(*) AS c FROM projects");
  const [[vendors]] = await db.query("SELECT COUNT(*) AS c FROM vendors");
  const [[products]] = await db.query("SELECT COUNT(*) AS c FROM products WHERE is_active=1");

  const [topProducts] = await db.query(
    `SELECT p.id, p.name, p.product_url, COUNT(c.id) AS clicks
     FROM click_events c
     JOIN products p ON p.id=c.product_id
     GROUP BY p.id
     ORDER BY clicks DESC
     LIMIT 10`
  );

  const [clicksByDay] = await db.query(
    `SELECT DATE(clicked_at) AS day, COUNT(*) AS clicks
     FROM click_events
     WHERE clicked_at >= (NOW() - INTERVAL 14 DAY)
     GROUP BY day
     ORDER BY day ASC`
  );

  res.json({
    totals: {
      users: users.c,
      projects: projects.c,
      vendors: vendors.c,
      products: products.c
    },
    topProducts,
    clicksByDay
  });
});
