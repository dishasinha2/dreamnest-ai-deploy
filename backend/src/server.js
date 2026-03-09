import express from "express";
import cors from "cors";
import "dotenv/config";

import { authRoutes } from "./routes/auth.routes.js";
import { projectRoutes } from "./routes/projects.routes.js";
import { productRoutes } from "./routes/products.routes.js";
import { vendorRoutes } from "./routes/vendors.routes.js";
import { clickRoutes } from "./routes/clicks.routes.js";
import { aiRoutes } from "./routes/ai.routes.js";
import { requirementsRoutes } from "./routes/requirements.routes.js";
import { analyticsRoutes } from "./routes/analytics.routes.js";
import { feedbackRoutes } from "./routes/feedback.routes.js";
import { searchRoutes } from "./routes/search.routes.js";
import { ensureCoreTables } from "./bootstrap/ensureTables.js";
import path from "path";
import fs from "fs";

const app = express();
const corsOrigin = process.env.CORS_ORIGIN || "*";
app.use(
  cors({
    origin:
      corsOrigin === "*"
        ? "*"
        : corsOrigin.split(",").map((x) => x.trim()).filter(Boolean)
  })
);
app.use(express.json({ limit: "2mb" }));

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

app.get("/", (_, res) => res.send("DreamNest AI API running"));
app.get("/api/health", async (_, res) => {
  let dbOk = true;
  let dbError = "";
  try {
    const { db } = await import("./db.js");
    await db.query("SELECT 1");
  } catch {
    dbOk = false;
    dbError = "DB connection failed";
  }
  res.json({ ok: true, db: dbOk, dbError });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/products", productRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/clicks", clickRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/requirements", requirementsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/search", searchRoutes);

// basic error handler so API returns JSON instead of crashing
app.use((err, req, res, next) => {
  console.error("API error:", err?.message || err);
  res.status(500).json({ error: err?.message || "server error" });
});

const basePort = Number(process.env.PORT || 5000);

function listenWithFallback(port, attemptsLeft = 5) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log("API on", port);
      resolve(server);
    });

    server.on("error", (err) => {
      if (err?.code === "EADDRINUSE" && attemptsLeft > 0) {
        const nextPort = port + 1;
        console.warn(`Port ${port} busy. Trying ${nextPort}...`);
        resolve(listenWithFallback(nextPort, attemptsLeft - 1));
        return;
      }
      reject(err);
    });
  });
}

async function start() {
  await ensureCoreTables();
  await listenWithFallback(basePort, 10);
}

start().catch((err) => {
  console.error("Startup failed:", err?.message || err);
  process.exit(1);
});
