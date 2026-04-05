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
let dbReady = false;
let dbError = "Database initialization pending";
let dbInitPromise = null;

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (corsOrigin === "*") return true;

  const allowedOrigins = corsOrigin
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (allowedOrigins.includes(origin)) return true;

  try {
    const { hostname } = new URL(origin);
    if (hostname === "localhost" || hostname === "127.0.0.1") return true;
    if (hostname.endsWith(".vercel.app")) return true;
  } catch {
    return false;
  }

  return false;
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin ${origin || "unknown"}`));
    }
  })
);
app.use(express.json({ limit: "2mb" }));

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

app.get("/", (_, res) => res.send("DreamNest AI API running"));
app.get("/api/health", async (_, res) => {
  let dbOk = dbReady;
  let dbErrorMessage = dbReady ? "" : dbError;
  try {
    const { db } = await import("./db.js");
    await db.query("SELECT 1");
    dbOk = true;
    if (dbReady) dbErrorMessage = "";
  } catch {
    dbOk = false;
    dbErrorMessage = dbError || "DB connection failed";
  }
  res.status(dbOk ? 200 : 503).json({ ok: true, db: dbOk, dbError: dbErrorMessage });
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

async function initializeDatabase() {
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = (async () => {
    let attempt = 0;

    while (!dbReady) {
      attempt += 1;
      try {
        await ensureCoreTables();
        dbReady = true;
        dbError = "";
        console.log("Database ready");
      } catch (err) {
        dbReady = false;
        dbError = err?.message || "Database initialization failed";
        const delayMs = Math.min(30000, attempt * 5000);
        console.error(`Database init attempt ${attempt} failed: ${dbError}`);
        console.log(`Retrying database init in ${Math.round(delayMs / 1000)}s`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  })().finally(() => {
    if (!dbReady) dbInitPromise = null;
  });

  return dbInitPromise;
}

async function start() {
  await listenWithFallback(basePort, 10);
  void initializeDatabase();
}

start().catch((err) => {
  console.error("Startup failed:", err?.message || err);
  process.exit(1);
});
