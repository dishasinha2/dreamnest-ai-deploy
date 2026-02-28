import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AIAPI, ClicksAPI, ProductsAPI, ProjectAPI, RequirementsAPI, VendorsAPI } from "../api/endpoints";
import { useAuth } from "../hooks/useAuth";

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function asArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean).map((x) => String(x).trim()).filter(Boolean);
  return String(v).split(",").map((x) => x.trim()).filter(Boolean);
}

function uniqLimit(arr, limit = 24) {
  return Array.from(new Set(arr.map((x) => String(x).trim()).filter(Boolean))).slice(0, limit);
}

export default function Project() {
  const { id } = useParams();
  const nav = useNavigate();
  const { token } = useAuth();
  const [project, setProject] = useState(null);
  const [progress, setProgress] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [plan, setPlan] = useState(null);
  const [liveProducts, setLiveProducts] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [dbProducts, setDbProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [shortlistedVendors, setShortlistedVendors] = useState([]);
  const [vendorNotice, setVendorNotice] = useState("");
  const [chat, setChat] = useState({ message: "", reply: "" });
  const [vision, setVision] = useState({ file: null, result: "" });
  const [pinterestLinks, setPinterestLinks] = useState([]);
  const [pinterestLoading, setPinterestLoading] = useState(false);
  const [reqForm, setReqForm] = useState({ notes: "", must_haves: "", colors: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [marketPrefs, setMarketPrefs] = useState({
    store_priority: "ikea,flipkart,myntra,amazon,pepperfry,ebay",
    exact_only: false
  });
  const [checkMap, setCheckMap] = useState({});

  useEffect(() => {
    if (!token) return;
    ProjectAPI.get(id, token).then(setProject).catch((e) => setError(String(e.message || e)));
    ProjectAPI.progress(id, token).then(setProgress).catch(() => {});
    RequirementsAPI.list(id, token).then(setRequirements).catch(() => {});
    ProjectAPI.shortlistedVendors(id, token).then(setShortlistedVendors).catch(() => {});
  }, [id, token]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`dreamnest_deliverables_${id}`) || "{}");
      setCheckMap(saved && typeof saved === "object" ? saved : {});
    } catch {
      setCheckMap({});
    }
  }, [id]);

  useEffect(() => {
    if (!project) return;
    const primaryRoom = String(project.room_type || "living_room").split(",").map((s) => s.trim()).filter(Boolean)[0] || "living_room";
    const primaryStyle = Array.isArray(project.style_tags)
      ? project.style_tags[0]
      : String(project.style_tags || "modern").split(",").map((s) => s.trim()).filter(Boolean)[0] || "modern";
    loadVendors(project.location_city);
    ProductsAPI.list({
      room_type: primaryRoom,
      style: primaryStyle || null,
      max_price: project.budget_inr
    }, token).then(setDbProducts).catch(() => {});
  }, [project]);

  async function loadVendors(city) {
    setVendorNotice("");
    try {
      const local = await VendorsAPI.list({ city });
      setVendors(local);
      if (!local.length) setVendorNotice(`No vendors found for ${city}. Add vendors in this city from vendor form/admin.`);
    } catch {
      setVendors([]);
      setVendorNotice("Unable to load vendors right now.");
    }
  }

  async function addRequirements(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    try {
      await RequirementsAPI.add(
        {
          project_id: Number(id),
          notes: reqForm.notes,
          must_haves: reqForm.must_haves.split(",").map((s) => s.trim()).filter(Boolean),
          colors: reqForm.colors.split(",").map((s) => s.trim()).filter(Boolean)
        },
        token
      );
      const list = await RequirementsAPI.list(id, token);
      setRequirements(list);
      setReqForm({ notes: "", must_haves: "", colors: "" });
      const prog = await ProjectAPI.progress(id, token);
      setProgress(prog);
      setNotice("Requirements saved. Generating recommendations in background...");
      loadLiveProducts();
      loadPinterestIdeas(list[0] || {});
    } catch (err) {
      setError(String(err.message || err));
    }
  }

  async function loadPinterestIdeas(reqObj) {
    setPinterestLoading(true);
    try {
      const links = await AIAPI.pinterest(
        {
          room_type: project.room_type,
          style_tags: project.style_tags,
          must_haves: reqObj?.must_haves || [],
          colors: reqObj?.colors || [],
          notes: reqObj?.notes || ""
        },
        token
      );
      setPinterestLinks(links?.links || []);
    } catch {
      setPinterestLinks([]);
    } finally {
      setPinterestLoading(false);
    }
  }

  async function runPlan() {
    setError("");
    setNotice("");
    try {
      const primaryRoom = String(project.room_type || "living_room").split(",").map((s) => s.trim()).filter(Boolean)[0] || "living_room";
      const latest = requirements[0] || {};
      const p = await AIAPI.plan(
        {
          room_type: primaryRoom,
          budget_inr: project.budget_inr,
          style_tags: project.style_tags,
          must_haves: latest.must_haves || [],
          colors: latest.colors || [],
          area_sqft: project.area_sqft,
          location_city: project.location_city
        },
        token
      );
      setPlan(p);
      if (p.shopping_queries?.length) await loadLiveProducts(p.shopping_queries);
      setNotice("AI plan generated.");
    } catch (err) {
      setError(String(err.message || err));
    }
  }

  async function loadLiveProducts(queryHints) {
    if (!project) return;
    setError("");
    setNotice("");
    setLiveLoading(true);
    try {
      const rooms = asArray(project.room_type || "living_room").map((r) => r.replaceAll("_", " "));
      const styles = asArray(project.style_tags || "modern").map((s) => s.replaceAll("_", " "));
      const latestReq = requirements[0] || {};
      const mustHaves = asArray(latestReq.must_haves);
      const colors = asArray(latestReq.colors);

      let aiQueries = [];
      if (Array.isArray(queryHints) && queryHints.length) {
        aiQueries = queryHints;
      } else if (typeof queryHints === "string" && queryHints.trim()) {
        aiQueries = [queryHints.trim()];
      } else {
        try {
          const aiPlan = await AIAPI.plan(
            {
              room_type: rooms[0] || "living room",
              budget_inr: project.budget_inr,
              style_tags: styles,
              must_haves: mustHaves,
              colors,
              area_sqft: project.area_sqft,
              location_city: project.location_city
            },
            token
          );
          aiQueries = Array.isArray(aiPlan?.shopping_queries) ? aiPlan.shopping_queries : [];
        } catch {
          aiQueries = [];
        }
      }

      const generated = [];
      for (const room of rooms.slice(0, 3)) {
        for (const style of styles.slice(0, 3)) {
          generated.push(`${style} ${room} furniture`);
          generated.push(`${style} ${room} lighting`);
          generated.push(`${style} ${room} decor`);
          for (const m of mustHaves.slice(0, 8)) {
            generated.push(`${style} ${room} ${m}`);
          }
          for (const c of colors.slice(0, 5)) {
            generated.push(`${c} ${style} ${room} decor`);
          }
        }
      }
      const queries = uniqLimit([...aiQueries, ...generated], 8);
      setNotice(`AI generated ${queries.length} smart shopping queries from requirements...`);

      const responses = await Promise.all(
        queries.map((q) =>
          ProductsAPI.live({
            q,
            location: project.location_city,
            budget_inr: project.budget_inr,
            store_priority: marketPrefs.store_priority,
            exact_only: marketPrefs.exact_only ? "1" : "0"
          })
        )
      );

      const all = responses.flatMap((resp, idx) =>
        (resp.results || []).map((item) => ({ ...item, recommended_for: queries[idx] }))
      );
      const dedupMap = new Map();
      for (const item of all) {
        if (!item?.product_url) continue;
        if (!dedupMap.has(item.product_url)) dedupMap.set(item.product_url, item);
      }
      const unique = Array.from(dedupMap.values());
      const byStore = new Map();
      const priority = marketPrefs.store_priority
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      for (const item of unique) {
        const key = String(item.source || "unknown").toLowerCase();
        if (!byStore.has(key)) byStore.set(key, []);
        byStore.get(key).push(item);
      }
      const orderedStoreKeys = Array.from(byStore.keys()).sort((a, b) => {
        const ai = priority.indexOf(a);
        const bi = priority.indexOf(b);
        if (ai === -1 && bi === -1) return a.localeCompare(b);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });
      const diversified = [];
      while (diversified.length < 120 && byStore.size) {
        for (const key of orderedStoreKeys) {
          if (!byStore.has(key)) continue;
          const arr = byStore.get(key);
          if (!arr.length) {
            byStore.delete(key);
            continue;
          }
          diversified.push(arr.shift());
          if (diversified.length >= 120) break;
          if (!arr.length) byStore.delete(key);
        }
      }

      setLiveProducts(diversified);
      if (diversified.length) {
        localStorage.setItem(
          `dreamnest_market_${id}`,
          JSON.stringify({
            projectId: id,
            title: project.title,
            roomType: project.room_type,
            location: project.location_city,
            budget: project.budget_inr,
            items: diversified.slice(0, 120),
            prefs: marketPrefs
          })
        );
        setNotice("Opening DreamNest marketplace...");
        nav(`/project/${id}/marketplace`);
      } else {
        setNotice("No verified product page found for this query. Try a different keyword or enable SerpAPI.");
      }
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setLiveLoading(false);
    }
  }

  async function sendChat(e) {
    e.preventDefault();
    if (!chat.message) return;
    setError("");
    try {
      const res = await AIAPI.chat({ message: chat.message, project_id: Number(id) }, token);
      setChat({ message: "", reply: res.reply || "" });
    } catch (err) {
      setError(String(err.message || err));
    }
  }

  async function runVision(e) {
    e.preventDefault();
    if (!vision.file) return;
    setError("");
    try {
      const fd = new FormData();
      fd.append("image", vision.file);
      fd.append("budget_inr", project.budget_inr);
      fd.append("style", project.style_tags.join(", "));
      const res = await AIAPI.vision(fd, token);
      setVision({ ...vision, result: res.ideas || "" });
    } catch (err) {
      setError(String(err.message || err));
    }
  }

  async function trackClick(product) {
    const url = normalizeUrl(product.product_url);
    window.open(url, "_blank", "noopener,noreferrer");
    if (product.id) {
      ClicksAPI.create({ product_id: product.id, ref: "live" }, token).catch(() => {});
    }
  }

  async function shortlist(productId) {
    try {
      await ProjectAPI.shortlist(id, productId, token);
      const prog = await ProjectAPI.progress(id, token);
      setProgress(prog);
      setNotice("Product shortlisted.");
    } catch {}
  }

  async function openDbProduct(p) {
    const url = normalizeUrl(p.product_url);
    window.open(url, "_blank", "noopener,noreferrer");
    ClicksAPI.create({ product_id: p.id, ref: "curated" }, token).catch(() => {});
  }

  function normalizeUrl(url) {
    if (!url) return "#";
    const t = String(url).trim();
    if (t.startsWith("http://") || t.startsWith("https://")) return t;
    return `https://${t}`;
  }

  function storeNameFromUrl(url) {
    try {
      const host = new URL(url).hostname.replace("www.", "");
      const parts = host.split(".");
      return parts.length >= 2 ? parts[parts.length - 2] : host;
    } catch {
      return "store";
    }
  }

  async function viewVendor(vendorId) {
    try {
      await VendorsAPI.view(vendorId, { project_id: Number(id) }, token);
      const prog = await ProjectAPI.progress(id, token);
      setProgress(prog);
      setNotice("Vendor marked as explored.");
    } catch {}
  }

  async function shortlistVendor(vendorId) {
    try {
      await ProjectAPI.shortlistVendor(id, vendorId, token);
      const [prog, list] = await Promise.all([
        ProjectAPI.progress(id, token),
        ProjectAPI.shortlistedVendors(id, token)
      ]);
      setProgress(prog);
      setShortlistedVendors(list);
      setNotice("Vendor shortlisted.");
    } catch (err) {
      setError(String(err.message || err));
    }
  }

  function toggleChecklist(key) {
    const next = { ...checkMap, [key]: !checkMap[key] };
    setCheckMap(next);
    localStorage.setItem(`dreamnest_deliverables_${id}`, JSON.stringify(next));
  }

  const latestReq = requirements[0] || {};
  const stylePreview = asArray(project?.style_tags || "modern, warm").slice(0, 3);
  const colorPreview = asArray(latestReq?.colors || "").slice(0, 4);
  const conceptBoards = stylePreview.map((style, idx) => ({
    title: `${style} Studio Concept`,
    brief:
      idx === 0
        ? "Balanced furniture layout with clean circulation and focal wall."
        : idx === 1
          ? "Texture layering with rugs, lighting and soft furnishing accents."
          : "Space-max planning with storage-first layout and warm decor."
  }));
  const roomsForPlan = asArray(project?.room_type || "living_room")
    .slice(0, 5)
    .map((r) => r.replaceAll("_", " "));
  const zoning = roomsForPlan.map((r, idx) => ({
    zone: `${r} zone`,
    guidance:
      idx % 2 === 0
        ? "Focal wall + circulation path + layered lighting"
        : "Storage edge + conversation cluster + soft furnishing anchor"
  }));
  const checklist = [
    "Finalize layout with furniture clearances",
    "Lock electrical and lighting points",
    "Approve wall paint and finish samples",
    "Confirm furniture dimensions before purchase",
    "Schedule vendor work sequence",
    ...asArray(latestReq?.must_haves || "").slice(0, 8).map((m) => `Include must-have: ${m}`)
  ];
  const materialBoard = [
    ...colorPreview.map((c) => ({ label: c, note: "Color direction" })),
    ...stylePreview.map((s) => ({ label: s, note: "Style direction" })),
    { label: "Wood / engineered wood", note: "Primary furniture material" },
    { label: "Metal accents", note: "Lighting + hardware" },
    { label: "Soft textiles", note: "Curtains / cushions / rugs" }
  ];
  const timeline = [
    { phase: "Week 1", task: "Measurements + layout freeze", skill: "interior planner" },
    { phase: "Week 2", task: "Civil/electrical prep", skill: "electrician" },
    { phase: "Week 3", task: "Paint + ceiling + lighting install", skill: "painter" },
    { phase: "Week 4", task: "Furniture placement + styling", skill: "carpenter" },
    { phase: "Week 5", task: "Final walkthrough + snag list", skill: "supervisor" }
  ];
  const vendorNames = vendors.map((v) => v.name || "").filter(Boolean);
  const vendorBySkill = (skill) => {
    const hit = vendorNames.find((n) => n.toLowerCase().includes(skill));
    return hit || "Assign vendor";
  };

  if (!token) {
    return (
      <div className="container">
        <div className="card">
          <h2 style={{ fontFamily: "var(--font-display)" }}>Login required</h2>
          <a className="btn" href="/auth">Go to login</a>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container">
        <div className="card">Loading project...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="nav">
        <div className="nav-brand">
          <span style={{ color: "var(--accent)" }}>Dream</span>Nest AI
        </div>
        <div className="nav-actions">
          <a className="btn btn-outline" href="/dashboard">Dashboard</a>
          <a className="btn btn-outline" href="/vendors">Vendors</a>
          <a className="btn btn-outline" href="/feedback">Feedback</a>
        </div>
      </div>

      <div className="glass-stack">
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>{project.title}</div>
        <div className="muted">
          {project.room_type} - {project.location_city} - {project.area_sqft} sqft - Budget INR {project.budget_inr}
        </div>
        {progress && (
          <div style={{ marginTop: 12 }}>
            <div className="muted">Progress: {progress.percent}%</div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
              {progress.steps.map((s) => (
                <div key={s.key} className="badge" style={{ background: s.done ? "var(--accent)" : "transparent", color: s.done ? "#0B0F14" : "var(--ink)" }}>
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-2" style={{ marginTop: 22 }}>
        <div className="glass-stack">
          <h3 style={{ fontFamily: "var(--font-display)" }}>Requirements</h3>
          <form onSubmit={addRequirements} className="grid">
            <textarea className="textarea" placeholder="Notes" value={reqForm.notes} onChange={(e) => setReqForm({ ...reqForm, notes: e.target.value })} />
            <input className="input" placeholder="Must haves (comma separated)" value={reqForm.must_haves} onChange={(e) => setReqForm({ ...reqForm, must_haves: e.target.value })} />
            <input className="input" placeholder="Colors/materials (comma separated)" value={reqForm.colors} onChange={(e) => setReqForm({ ...reqForm, colors: e.target.value })} />
            <button className="btn" type="submit">Save requirements</button>
          </form>
          <div className="grid" style={{ marginTop: 14 }}>
            {requirements.map((r) => (
              <div key={r.id} className="card" style={{ boxShadow: "none" }}>
                <div className="muted">{r.notes}</div>
                <div className="muted">Must haves: {(r.must_haves || []).join(", ")}</div>
                <div className="muted">Colors: {(r.colors || []).join(", ")}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-stack">
          <h3 style={{ fontFamily: "var(--font-display)" }}>AI planning</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn" onClick={runPlan}>Generate budget split + queries</button>
            <button className="btn btn-outline" onClick={() => loadLiveProducts()}>
              {liveLoading ? "Loading links..." : "Find live product links"}
            </button>
          </div>
          <div className="card" style={{ marginTop: 12, boxShadow: "none" }}>
            <div style={{ fontFamily: "var(--font-display)", marginBottom: 8 }}>Marketplace preferences</div>
            <div className="grid">
              <input
                className="input"
                value={marketPrefs.store_priority}
                onChange={(e) => setMarketPrefs((p) => ({ ...p, store_priority: e.target.value }))}
                placeholder="Store priority: ikea,flipkart,myntra,amazon,pepperfry,ebay"
              />
              <label className="muted" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={marketPrefs.exact_only}
                  onChange={(e) => setMarketPrefs((p) => ({ ...p, exact_only: e.target.checked }))}
                />
                Only exact verified product links
              </label>
            </div>
          </div>
          {plan?.budget_split?.length ? (
            <div className="grid" style={{ marginTop: 14 }}>
              {plan.budget_split.map((b, idx) => (
                <div key={idx} className="card" style={{ boxShadow: "none" }}>
                  <div style={{ fontFamily: "var(--font-display)" }}>{b.category}</div>
                  <div className="muted">INR {b.amount_inr}</div>
                  <div className="muted">{b.note}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="muted" style={{ marginTop: 10 }}>No plan yet.</div>
          )}
          {plan?.shopping_queries?.length ? (
            <div style={{ marginTop: 12 }}>
              <div className="muted">Shopping queries</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {plan.shopping_queries.map((q) => (
                  <span key={q} className="badge">{q}</span>
                ))}
              </div>
            </div>
          ) : null}
          <div style={{ marginTop: 14 }}>
            <button className="btn btn-outline" onClick={() => loadPinterestIdeas(requirements[0] || {})} disabled={pinterestLoading}>
              {pinterestLoading ? "Loading Pinterest ideas..." : "Get Pinterest design ideas"}
            </button>
            {pinterestLinks.length > 0 && (
              <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {pinterestLinks.map((p) => (
                  <a key={p.url} className="badge" href={p.url} target="_blank" rel="noreferrer">
                    {p.keyword}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-stack" style={{ marginTop: 22 }}>
        <h3 style={{ fontFamily: "var(--font-display)" }}>Interior designer concepts</h3>
        <div className="muted">AI moodboards + layout direction from your room, style and requirement inputs.</div>
        <div className="grid grid-3" style={{ marginTop: 12 }}>
          {conceptBoards.map((c) => (
            <div key={c.title} className="card" style={{ boxShadow: "none" }}>
              <div style={{ fontFamily: "var(--font-display)" }}>{c.title}</div>
              <div className="muted" style={{ marginTop: 6 }}>{c.brief}</div>
              {colorPreview.length > 0 && (
                <div className="muted" style={{ marginTop: 8 }}>Palette: {colorPreview.join(", ")}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="glass-stack" style={{ marginTop: 22 }}>
        <h3 style={{ fontFamily: "var(--font-display)" }}>Designer Deliverables</h3>
        <div className="grid grid-2" style={{ marginTop: 12 }}>
          <div className="card" style={{ boxShadow: "none" }}>
            <div style={{ fontFamily: "var(--font-display)", marginBottom: 8 }}>Floor zoning</div>
            <div className="grid">
              {zoning.map((z) => (
                <div key={z.zone} className="badge" style={{ borderRadius: 12 }}>
                  <div style={{ fontFamily: "var(--font-display)", textTransform: "capitalize" }}>{z.zone}</div>
                  <div className="muted">{z.guidance}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ boxShadow: "none" }}>
            <div style={{ fontFamily: "var(--font-display)", marginBottom: 8 }}>Furniture placement checklist</div>
            <div className="grid">
              {checklist.map((item, idx) => {
                const k = `check_${idx}_${item}`;
                return (
                  <label key={k} className="muted" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="checkbox" checked={Boolean(checkMap[k])} onChange={() => toggleChecklist(k)} />
                    {item}
                  </label>
                );
              })}
            </div>
          </div>
        </div>
        <div className="grid grid-2" style={{ marginTop: 12 }}>
          <div className="card" style={{ boxShadow: "none" }}>
            <div style={{ fontFamily: "var(--font-display)", marginBottom: 8 }}>Material board</div>
            <div className="grid">
              {materialBoard.map((m) => (
                <div key={`${m.label}-${m.note}`} className="badge" style={{ borderRadius: 12 }}>
                  <div style={{ fontFamily: "var(--font-display)" }}>{m.label}</div>
                  <div className="muted">{m.note}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ boxShadow: "none" }}>
            <div style={{ fontFamily: "var(--font-display)", marginBottom: 8 }}>Execution timeline (vendor tasks)</div>
            <div className="grid">
              {timeline.map((t) => (
                <div key={t.phase} className="badge" style={{ borderRadius: 12 }}>
                  <div style={{ fontFamily: "var(--font-display)" }}>{t.phase} - {t.task}</div>
                  <div className="muted">Owner: {vendorBySkill(t.skill)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 22 }}>
        <div className="glass-stack">
          <h3 style={{ fontFamily: "var(--font-display)" }}>Recommended products</h3>
          <div className="grid">
            {liveProducts.map((p, idx) => (
              <div key={`${p.product_url}-${idx}`} className="card" style={{ boxShadow: "none" }}>
                {p.image_url && <img src={p.image_url} alt={p.title} style={{ width: "100%", borderRadius: 12 }} />}
                <div style={{ fontFamily: "var(--font-display)", marginTop: 8 }}>{p.title}</div>
                {p.recommended_for && <div className="muted">For: {p.recommended_for}</div>}
                <div className="muted">{p.currency} {p.price || "-"}</div>
                <div className="muted">Store: {storeNameFromUrl(p.product_url)}</div>
                <div className="muted" style={{ wordBreak: "break-all" }}>Product link: {normalizeUrl(p.product_url)}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="btn btn-outline" onClick={() => trackClick(p)}>Buy now</button>
                  <a className="btn btn-outline" href={normalizeUrl(p.product_url)} target="_blank" rel="noreferrer">Open link</a>
                </div>
              </div>
            ))}
            {!liveProducts.length && !liveLoading && (
              <div className="muted">No recommendations yet. Click "Find live product links" or run AI planning.</div>
            )}
            {liveLoading && <div className="muted">Fetching exact product recommendations...</div>}
          </div>
        </div>

        <div className="glass-stack">
          <h3 style={{ fontFamily: "var(--font-display)" }}>Local vendors</h3>
          <div className="grid">
            {vendors.map((v) => (
              <div key={v.id} className="card" style={{ boxShadow: "none" }}>
                <div style={{ fontFamily: "var(--font-display)" }}>{v.name}</div>
                <div className="muted">{v.city} - {v.years_exp} yrs</div>
                <div className="muted">Rating {v.avg_rating || "-"} ({v.review_count || 0})</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="btn btn-outline" onClick={() => viewVendor(v.id)}>Mark viewed</button>
                  <button className="btn" onClick={() => shortlistVendor(v.id)}>Shortlist vendor</button>
                </div>
                {v.website && (
                  <a className="btn btn-outline" href={normalizeUrl(v.website)} target="_blank" rel="noreferrer">
                    Visit site
                  </a>
                )}
              </div>
            ))}
            {!vendors.length && <div className="muted">No vendors available yet.</div>}
            {vendorNotice && <div className="muted">{vendorNotice}</div>}
          </div>
        </div>
      </div>

      <div className="glass-stack" style={{ marginTop: 22 }}>
        <h3 style={{ fontFamily: "var(--font-display)" }}>Shortlisted vendors</h3>
        <div className="grid">
          {shortlistedVendors.map((v) => (
            <div key={v.id} className="card" style={{ boxShadow: "none" }}>
              <div style={{ fontFamily: "var(--font-display)" }}>{v.name}</div>
              <div className="muted">{v.city} - {v.years_exp} yrs</div>
              <div className="muted">Rating {v.avg_rating || "-"} ({v.review_count || 0})</div>
              {v.website && (
                <a className="btn btn-outline" href={normalizeUrl(v.website)} target="_blank" rel="noreferrer">
                  Visit site
                </a>
              )}
            </div>
          ))}
          {!shortlistedVendors.length && <div className="muted">No shortlisted vendors yet.</div>}
        </div>
      </div>

      <div className="glass-stack" style={{ marginTop: 22 }}>
        <h3 style={{ fontFamily: "var(--font-display)" }}>Curated products (DB)</h3>
        <div className="grid grid-3">
          {dbProducts.map((p) => (
            <div key={p.id} className="card" style={{ boxShadow: "none" }}>
              {p.image_url && (
                <img
                  src={p.image_url.startsWith("http") ? p.image_url : `${BASE}${p.image_url}`}
                  alt={p.name}
                  style={{ width: "100%", borderRadius: 12 }}
                />
              )}
              <div style={{ fontFamily: "var(--font-display)", marginTop: 8 }}>{p.name}</div>
              <div className="muted">INR {p.price_inr || "-"}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-outline" onClick={() => openDbProduct(p)}>View</button>
                <button className="btn" onClick={() => shortlist(p.id)}>Shortlist</button>
              </div>
            </div>
          ))}
          {!dbProducts.length && <div className="muted">No products in DB yet. Use Admin to ingest.</div>}
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 22 }}>
        <div className="glass-stack">
          <h3 style={{ fontFamily: "var(--font-display)" }}>Chatbot</h3>
          <form onSubmit={sendChat} className="grid">
            <input
              className="input"
              placeholder="Ask anything, like progress kitna hua?"
              value={chat.message}
              onChange={(e) => setChat({ ...chat, message: e.target.value })}
            />
            <button className="btn btn-accent2" type="submit">Ask</button>
          </form>
          {chat.reply && <div className="card" style={{ marginTop: 12, boxShadow: "none" }}>{chat.reply}</div>}
        </div>

        <div className="glass-stack">
          <h3 style={{ fontFamily: "var(--font-display)" }}>Vision decor ideas</h3>
          <form onSubmit={runVision} className="grid">
            <input
              className="input"
              type="file"
              accept="image/*"
              onChange={(e) => setVision({ ...vision, file: e.target.files?.[0] || null })}
            />
            <button className="btn btn-accent3" type="submit">Analyze image</button>
          </form>
          {vision.result && (
            <pre className="card" style={{ marginTop: 12, whiteSpace: "pre-wrap", boxShadow: "none" }}>
              {vision.result}
            </pre>
          )}
        </div>
      </div>

      {notice && <div className="muted" style={{ marginTop: 12 }}>{notice}</div>}
      {error && <div className="muted" style={{ marginTop: 18 }}>{error}</div>}
    </div>
  );
}
