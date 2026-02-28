import express from "express";
import multer from "multer";
import { db } from "../db.js";
import { auth } from "../middleware/auth.js";
import { openaiResponse } from "../services/openai.service.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 4 * 1024 * 1024 } });
export const aiRoutes = express.Router();

function safeArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    const t = value.trim();
    if (!t) return [];
    if (t.startsWith("[")) {
      try {
        const parsed = JSON.parse(t);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return t.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
    return t.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function fallbackPlan({ room_type, budget_inr, style_tags }) {
  const budget = Number(budget_inr || 0);
  const split = [
    ["Furniture", 45, "Core pieces and storage"],
    ["Lighting", 12, "Ambient + task lighting"],
    ["Decor", 18, "Art, rugs, plants, accents"],
    ["Soft Furnishings", 10, "Curtains, cushions, fabrics"],
    ["Contingency", 15, "Installation and unexpected costs"]
  ].map(([category, pct, note]) => ({
    category,
    amount_inr: Math.round((budget * pct) / 100),
    note
  }));

  const style = safeArray(style_tags)[0] || "modern";
  const room = String(room_type || "living room").replaceAll("_", " ");

  return {
    budget_split: split,
    shopping_queries: [
      `${style} ${room} furniture`,
      `${style} ${room} lighting`,
      `${style} ${room} decor`
    ],
    vendor_needs: ["carpenter", "electrician", "painter"]
  };
}

function fallbackPinterest({ room_type, style_tags, must_haves, colors }) {
  const room = String(room_type || "living room").replaceAll("_", " ");
  const styles = safeArray(style_tags).slice(0, 3);
  const must = safeArray(must_haves).slice(0, 5);
  const cols = safeArray(colors).slice(0, 4);
  const base = [
    `${room} interior design`,
    `${room} furniture layout`,
    `${room} decor ideas`,
    `${room} mood board`,
    `${room} lighting ideas`
  ];
  const styleKeys = styles.map((s) => `${s} ${room} decor`);
  const mustKeys = must.map((m) => `${room} ${m} design`);
  const colorKeys = cols.map((c) => `${c} ${room} interior`);
  const keywords = Array.from(new Set([...styleKeys, ...mustKeys, ...colorKeys, ...base])).slice(0, 12);
  return keywords.map((k) => ({
    keyword: k,
    url: `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(k)}`
  }));
}

aiRoutes.post("/chat", auth, async (req, res) => {
  const { message, project_id } = req.body;
  if (!message) return res.status(400).json({ error: "message required" });

  let project = null;
  let shortlistCount = 0;

  if (project_id) {
    const [p] = await db.execute(
      "SELECT * FROM projects WHERE id=? AND user_id=?",
      [project_id, req.user.userId]
    );
    project = p?.[0] || null;

    const [s] = await db.execute(
      "SELECT COUNT(*) AS c FROM shortlist WHERE project_id=?",
      [project_id]
    );
    shortlistCount = s?.[0]?.c || 0;
  }

  const progress = project
    ? {
        project_title: project.title,
        room_type: project.room_type,
        budget_inr: project.budget_inr,
        style_tags: safeArray(project.style_tags),
        city: project.location_city,
        shortlistCount
      }
    : null;

  const data = await openaiResponse({
    input: [
      { role: "system", content: "You are Nestie, the DreamNest AI assistant. Reply in short friendly Hinglish. Give next actionable step. If asked about progress, use the provided progress JSON. If user asks for inspiration, include 8 Pinterest search keywords." },
      { role: "user", content: `Progress JSON: ${JSON.stringify(progress)}\nUser: ${message}` }
    ]
  });

  res.json({ reply: data.output_text || "" });
});

aiRoutes.post("/plan", auth, async (req, res) => {
  const { room_type, budget_inr, style_tags, must_haves, colors, area_sqft, location_city } = req.body;
  if (!room_type || !budget_inr) return res.status(400).json({ error: "room_type and budget_inr required" });

  const data = await openaiResponse({
    input: [
      {
        role: "system",
        content:
          "Return JSON only. Keys: budget_split (array of {category, amount_inr, note}), shopping_queries (array of strings), vendor_needs (array of strings)."
      },
      {
        role: "user",
        content: JSON.stringify({
          room_type,
          budget_inr,
          style_tags: style_tags || [],
          must_haves: must_haves || [],
          colors: colors || [],
          area_sqft: area_sqft || null,
          location_city: location_city || ""
        })
      }
    ]
  });

  let parsed = null;
  try {
    parsed = JSON.parse(data.output_text);
  } catch {
    parsed = fallbackPlan({ room_type, budget_inr, style_tags });
  }

  if (!Array.isArray(parsed?.budget_split) || !Array.isArray(parsed?.shopping_queries) || !Array.isArray(parsed?.vendor_needs)) {
    parsed = fallbackPlan({ room_type, budget_inr, style_tags });
  }

  res.json(parsed);
});

aiRoutes.post("/vision", auth, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "image required" });

  const base64 = req.file.buffer.toString("base64");
  const budget = req.body.budget_inr || "";
  const style = req.body.style || "";

  const data = await openaiResponse({
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: `Analyze this room/wall. Style preference: ${style}. Budget INR: ${budget}. Output in sections: (1) quick style diagnosis (2) layout/focal-point suggestion (3) 8 decor items (4) 10 Pinterest search keywords.` },
          { type: "input_image", image_url: `data:image/jpeg;base64,${base64}` }
        ]
      }
    ]
  });

  res.json({ ideas: data.output_text || "" });
});

aiRoutes.post("/pinterest", auth, async (req, res) => {
  const { room_type, style_tags, must_haves, colors, notes } = req.body || {};

  const fallback = fallbackPinterest({ room_type, style_tags, must_haves, colors });
  const data = await openaiResponse({
    input: [
      {
        role: "system",
        content:
          "Return JSON only with key `keywords` as array of 10-14 short Pinterest search phrases for room decor and furniture."
      },
      {
        role: "user",
        content: JSON.stringify({
          room_type,
          style_tags: safeArray(style_tags),
          must_haves: safeArray(must_haves),
          colors: safeArray(colors),
          notes: notes || ""
        })
      }
    ]
  });

  try {
    const parsed = JSON.parse(data.output_text || "{}");
    const kws = Array.isArray(parsed.keywords) ? parsed.keywords : [];
    const links = Array.from(new Set(kws.map((x) => String(x).trim()).filter(Boolean))).slice(0, 14).map((k) => ({
      keyword: k,
      url: `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(k)}`
    }));
    return res.json({ links: links.length ? links : fallback });
  } catch {
    return res.json({ links: fallback });
  }
});
