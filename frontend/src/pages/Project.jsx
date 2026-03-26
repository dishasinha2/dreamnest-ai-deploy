import { startTransition, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AIAPI, ClicksAPI, ProductsAPI, ProjectAPI, RequirementsAPI, VendorsAPI } from "../api/endpoints";
import { useAuth } from "../hooks/useAuth";
import AmbientCanvas from "../components/AmbientCanvas";
import SiteFooter from "../components/SiteFooter";

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function asArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean).map((x) => String(x).trim()).filter(Boolean);
  return String(v).split(",").map((x) => x.trim()).filter(Boolean);
}

function uniqLimit(arr, limit = 24) {
  return Array.from(new Set(arr.map((x) => String(x).trim()).filter(Boolean))).slice(0, limit);
}

function detectProductCategory(product) {
  const text = `${product?.title || ""} ${product?.recommended_for || ""}`.toLowerCase();
  if (/(lamp|light|lighting|pendant|ceiling)/.test(text)) return "lighting";
  if (/(curtain|cushion|bedsheet|duvet|blanket|soft|fabric)/.test(text)) return "soft";
  if (/(rug|carpet|decor|art|mirror|plant|clock|wall)/.test(text)) return "decor";
  return "furniture";
}

function buildBudgetBalancedList(items, maxItems = 220) {
  const buckets = {
    furniture: [],
    lighting: [],
    decor: [],
    soft: []
  };
  for (const item of items) {
    buckets[detectProductCategory(item)].push(item);
  }

  const targets = {
    furniture: Math.round(maxItems * 0.45),
    lighting: Math.round(maxItems * 0.12),
    decor: Math.round(maxItems * 0.18),
    soft: Math.round(maxItems * 0.1)
  };

  const out = [];
  for (const key of ["furniture", "lighting", "decor", "soft"]) {
    out.push(...buckets[key].slice(0, targets[key]));
  }

  if (out.length < maxItems) {
    const seen = new Set(out.map((x) => x.product_url));
    for (const item of items) {
      if (out.length >= maxItems) break;
      if (seen.has(item.product_url)) continue;
      out.push(item);
      seen.add(item.product_url);
    }
  }

  return out.slice(0, maxItems);
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
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [catalogModal, setCatalogModal] = useState(null);
  const [chat, setChat] = useState({ message: "", reply: "", links: [] });
  const [vision, setVision] = useState({ file: null, result: "" });
  const [pinterestLinks, setPinterestLinks] = useState([]);
  const [pinterestLoading, setPinterestLoading] = useState(false);
  const [reqForm, setReqForm] = useState({ notes: "", must_haves: "", colors: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [marketPrefs, setMarketPrefs] = useState({
    store_priority: "ikea,flipkart,myntra,amazon,pepperfry,urbanladder,meesho,ebay",
    exact_only: false
  });
  const [checkMap, setCheckMap] = useState({});
  const [timelineMap, setTimelineMap] = useState({});
  const [themeMode, setThemeMode] = useState(() => document.documentElement.dataset.theme || localStorage.getItem("dreamnest_theme") || "dark");

  function toggleTheme() {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    localStorage.setItem("dreamnest_theme", next);
    setThemeMode(next);
  }

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
    try {
      const saved = JSON.parse(localStorage.getItem(`dreamnest_timeline_${id}`) || "{}");
      setTimelineMap(saved && typeof saved === "object" ? saved : {});
    } catch {
      setTimelineMap({});
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
      const local = await VendorsAPI.list({
        city,
        include_external: "1",
        max_external: "120",
        min_rating: "3",
        service: "interior"
      });
      startTransition(() => {
        setVendors(local);
      });
      if (!local.length) setVendorNotice(`No vendors found for ${city} right now.`);
    } catch {
      startTransition(() => {
        setVendors([]);
      });
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
      const queries = uniqLimit([...aiQueries, ...generated], 10);
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
      while (diversified.length < 220 && byStore.size) {
        for (const key of orderedStoreKeys) {
          if (!byStore.has(key)) continue;
          const arr = byStore.get(key);
          if (!arr.length) {
            byStore.delete(key);
            continue;
          }
          diversified.push(arr.shift());
          if (diversified.length >= 220) break;
          if (!arr.length) byStore.delete(key);
        }
      }

      const personalized = buildBudgetBalancedList(diversified, 220);

      startTransition(() => {
        setLiveProducts(personalized);
      });
      if (personalized.length) {
        localStorage.setItem(
          `dreamnest_market_${id}`,
          JSON.stringify({
            projectId: id,
            title: project.title,
            roomType: project.room_type,
            location: project.location_city,
            budget: project.budget_inr,
            items: personalized.slice(0, 220),
            context: {
              room_type: project.room_type,
              style_tags: project.style_tags,
              must_haves: latestReq.must_haves || [],
              colors: latestReq.colors || [],
              notes: latestReq.notes || ""
            },
            prefs: marketPrefs
          })
        );
        setNotice("Opening DreamNest marketplace with budget-balanced personalized recommendations...");
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
      const res = await AIAPI.chat(
        {
          message: chat.message,
          project_id: Number(id),
          room_type: project.room_type,
          style_tags: project.style_tags,
          must_haves: latestReq.must_haves || [],
          colors: latestReq.colors || [],
          notes: latestReq.notes || ""
        },
        token
      );
      setChat({
        message: "",
        reply: res.reply || "",
        links: Array.isArray(res.links) ? res.links : []
      });
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
      fd.append("style", asArray(project.style_tags).join(", "));
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

  function toPhoneUrl(raw) {
    const digits = String(raw || "").replace(/[^\d+]/g, "");
    return digits ? `tel:${digits}` : "";
  }

  function toWhatsappUrl(raw) {
    const digits = String(raw || "").replace(/[^\d]/g, "");
    return digits ? `https://wa.me/${digits}` : "";
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

  function openVendorModal(vendor) {
    setSelectedVendor(vendor);
  }

  function closeVendorModal() {
    setSelectedVendor(null);
  }

  function openCatalogModal(type) {
    setCatalogModal(type);
  }

  function closeCatalogModal() {
    setCatalogModal(null);
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

  function setChecklistAll(value) {
    const next = {};
    checklist.forEach((item, idx) => {
      next[`check_${idx}_${item}`] = value;
    });
    setCheckMap(next);
    localStorage.setItem(`dreamnest_deliverables_${id}`, JSON.stringify(next));
  }

  function updateTimelineItem(taskId, patch) {
    const next = {
      ...timelineMap,
      [taskId]: {
        ...(timelineMap[taskId] || {}),
        ...patch
      }
    };
    setTimelineMap(next);
    localStorage.setItem(`dreamnest_timeline_${id}`, JSON.stringify(next));
  }

  function buildDeliverablesPayload() {
    const checkedItems = checklist
      .map((item, idx) => ({ item, done: Boolean(checkMap[`check_${idx}_${item}`]) }))
      .filter((x) => x.done)
      .map((x) => x.item);

    const timelineRows = timeline.map((t) => ({
      phase: t.phase,
      task: t.task,
      owner: timelineMap[t.id]?.owner || vendorBySkill(t.skill),
      status: timelineMap[t.id]?.status || "todo"
    }));

    return {
      project: {
        id: Number(id),
        title: project?.title || "",
        room_type: project?.room_type || "",
        location_city: project?.location_city || "",
        budget_inr: project?.budget_inr || null
      },
      summary: {
        checklist_done: checkedItems.length,
        checklist_total: checklist.length,
        timeline_done: timelineRows.filter((t) => t.status === "done").length,
        timeline_total: timelineRows.length
      },
      zoning,
      material_board: materialBoard,
      completed_checklist_items: checkedItems,
      timeline: timelineRows
    };
  }

  function exportDeliverablesJson() {
    try {
      const payload = buildDeliverablesPayload();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dreamnest-deliverables-project-${id}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setNotice("Deliverables exported as JSON.");
    } catch {
      setError("Unable to export deliverables right now.");
    }
  }

  async function copyDeliverablesSummary() {
    try {
      const payload = buildDeliverablesPayload();
      const text = [
        `Project: ${payload.project.title}`,
        `Room: ${payload.project.room_type}`,
        `City: ${payload.project.location_city}`,
        `Budget INR: ${payload.project.budget_inr || "-"}`,
        `Checklist: ${payload.summary.checklist_done}/${payload.summary.checklist_total}`,
        `Timeline: ${payload.summary.timeline_done}/${payload.summary.timeline_total}`,
        "",
        "Completed checklist:",
        ...(payload.completed_checklist_items.length ? payload.completed_checklist_items.map((x) => `- ${x}`) : ["- None yet"]),
        "",
        "Timeline tasks:",
        ...payload.timeline.map((t) => `- ${t.phase}: ${t.task} | ${t.status} | Owner: ${t.owner}`)
      ].join("\n");
      await navigator.clipboard.writeText(text);
      setNotice("Deliverables summary copied.");
    } catch {
      setError("Clipboard not available in this browser.");
    }
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
    { id: "w1_layout", phase: "Week 1", task: "Measurements + layout freeze", skill: "interior planner" },
    { id: "w2_prep", phase: "Week 2", task: "Civil/electrical prep", skill: "electrician" },
    { id: "w3_paint", phase: "Week 3", task: "Paint + ceiling + lighting install", skill: "painter" },
    { id: "w4_furniture", phase: "Week 4", task: "Furniture placement + styling", skill: "carpenter" },
    { id: "w5_handover", phase: "Week 5", task: "Final walkthrough + snag list", skill: "supervisor" }
  ];
  const vendorNames = vendors.map((v) => v.name || "").filter(Boolean);
  const assignableVendors = [...shortlistedVendors, ...vendors]
    .filter((v, i, arr) => v?.name && arr.findIndex((x) => x?.id === v.id) === i)
    .map((v) => v.name);
  const vendorBySkill = (skill) => {
    const hit = vendorNames.find((n) => n.toLowerCase().includes(skill));
    return hit || "Assign vendor";
  };
  const doneChecklist = checklist.filter((item, idx) => Boolean(checkMap[`check_${idx}_${item}`])).length;
  const checklistPct = checklist.length ? Math.round((doneChecklist / checklist.length) * 100) : 0;
  const timelineDone = timeline.filter((t) => (timelineMap[t.id]?.status || "todo") === "done").length;
  const timelinePct = timeline.length ? Math.round((timelineDone / timeline.length) * 100) : 0;
  const productPreview = liveProducts.slice(0, 3);
  const vendorPreview = vendors.slice(0, 3);

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
    <div className="container studio-page workspace-shell">
      <div className="nav studio-nav workspace-nav">
        <div className="nav-brand">
          <span style={{ color: "var(--accent)" }}>Dream</span>Nest AI
        </div>
        <div className="nav-actions">
          <button
            className="btn btn-outline nav-icon-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${themeMode === "light" ? "dark" : "light"} theme`}
            title={`Switch to ${themeMode === "light" ? "dark" : "light"} theme`}
          >
            {themeMode === "light" ? (
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3v2.5M12 18.5V21M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M3 12h2.5M18.5 12H21M4.93 19.07 6.7 17.3M17.3 6.7l1.77-1.77M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20 15.2A7.8 7.8 0 0 1 8.8 4 8.4 8.4 0 1 0 20 15.2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <a className="btn btn-outline" href="/dashboard">Dashboard</a>
          <a className="btn btn-outline" href="/feedback">Feedback</a>
        </div>
      </div>

      <div className="card studio-header-band ambient-panel workspace-hero-band">
        <AmbientCanvas variant="gold" />
        <div>
          <div className="studio-kicker">Project Design Board</div>
          <h2>{project.title}</h2>
          <p className="muted">
            {project.room_type} in {project.location_city} | {project.area_sqft} sqft | Budget INR {project.budget_inr}
          </p>
        </div>
        <div className="studio-mini-metrics">
          <div className="studio-mini-metric">
            <span>Room Type</span>
            <strong>{asArray(project.room_type).slice(0, 1)[0] || "N/A"}</strong>
          </div>
          <div className="studio-mini-metric">
            <span>Styles</span>
            <strong>{asArray(project.style_tags).slice(0, 2).join(", ") || "N/A"}</strong>
          </div>
          <div className="studio-mini-metric">
            <span>Live Sources</span>
            <strong>eCom + Vendors</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 22, alignItems: "start" }}>
        <div className="glass-stack sourcing-preview-card workspace-panel ambient-panel">
          <AmbientCanvas variant="green" />
          <div className="section-head-row">
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Recommended products</h3>
              <div className="muted">Keep the page compact here. Open the full sourcing board only when you need it.</div>
            </div>
            <button className="btn btn-outline" type="button" onClick={() => openCatalogModal("products")}>
              View all
            </button>
          </div>
          <div className="sourcing-preview-list">
            {productPreview.map((p, idx) => (
              <div key={`${p.product_url}-${idx}`} className="sourcing-preview-item">
                {p.image_url && (
                  <img
                    src={p.image_url}
                    alt={p.title}
                    loading="lazy"
                    decoding="async"
                    className="sourcing-preview-thumb"
                  />
                )}
                <div className="sourcing-preview-copy">
                  <strong>{p.title}</strong>
                  <span>{p.currency} {p.price || "-"}</span>
                  <span>{storeNameFromUrl(p.product_url)} - {p.recommended_for || "Project fit"}</span>
                </div>
                <a className="btn btn-outline" href={normalizeUrl(p.product_url)} target="_blank" rel="noreferrer">
                  Open
                </a>
              </div>
            ))}
            {!productPreview.length && !liveLoading && (
              <div className="retrieval-item static">
                <strong>No product recommendations yet</strong>
                <span>Run AI planning or use live product links. Full results will open in the sourcing board.</span>
              </div>
            )}
            {liveLoading && (
              <div className="retrieval-item static">
                <strong>Loading sourcing board</strong>
                <span>Fetching live marketplace links for this project.</span>
              </div>
            )}
          </div>
        </div>

        <div className="glass-stack sourcing-preview-card workspace-panel ambient-panel">
          <AmbientCanvas variant="green" />
          <div className="section-head-row">
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Local vendors</h3>
              <div className="muted">Show the strongest matches here, then browse the full vendor board in a popup.</div>
            </div>
            <button className="btn btn-outline" type="button" onClick={() => openCatalogModal("vendors")}>
              View all
            </button>
          </div>
          <div className="sourcing-preview-list">
            {vendorPreview.map((v) => (
              <div key={v.id} className="sourcing-preview-item">
                <div className="sourcing-preview-copy">
                  <strong>{v.name}</strong>
                  <span>{v.city} - {v.years_exp || 0} yrs - Rating {v.avg_rating || "-"}</span>
                  <span>{v.external ? "Live vendor" : "DreamNest vendor"}</span>
                </div>
                <button className="btn btn-outline" type="button" onClick={() => openVendorModal(v)}>
                  View
                </button>
              </div>
            ))}
            {!vendorPreview.length && (
              <div className="retrieval-item static">
                <strong>No vendors loaded yet</strong>
                <span>{vendorNotice || `No vendor preview available for ${project.location_city} right now.`}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 22 }}>
        <div className="glass-stack workspace-panel">
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>{project.title}</div>
          <div className="muted">
            {project.room_type} - {project.location_city} - {project.area_sqft} sqft - Budget INR {project.budget_inr}
          </div>
          {progress && (
            <div style={{ marginTop: 12 }}>
              <div className="muted">Progress: {progress.percent}%</div>
              <div className="stats-grid compact-stats" style={{ marginTop: 10 }}>
                {progress.steps.map((s) => (
                  <div key={s.key} className="stat-card">
                    <div className="muted">{s.label}</div>
                    <div className="stat-number">{s.done ? "Done" : "Pending"}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>        <div className="glass-stack workspace-panel">
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

        <div className="glass-stack workspace-panel ambient-panel">
          <AmbientCanvas variant="green" />
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
                placeholder="Store priority: ikea,flipkart,myntra,amazon,pepperfry,urbanladder,meesho,ebay"
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <h3 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Designer Deliverables</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="btn btn-outline" onClick={copyDeliverablesSummary}>Copy summary</button>
            <button type="button" className="btn btn-outline" onClick={exportDeliverablesJson}>Export JSON</button>
          </div>
        </div>
        <div className="deliverables-summary">
          <div className="deliverables-kpi">
            <div className="muted">Checklist completion</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 26 }}>{doneChecklist}/{checklist.length} ({checklistPct}%)</div>
          </div>
          <div className="deliverables-kpi">
            <div className="muted">Execution timeline</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 26 }}>{timelineDone}/{timeline.length} ({timelinePct}%)</div>
          </div>
        </div>
        <div className="grid grid-2" style={{ marginTop: 12 }}>
          <div className="card" style={{ boxShadow: "none" }}>
            <div style={{ fontFamily: "var(--font-display)", marginBottom: 8 }}>Floor zoning</div>
            <div className="grid zoning-grid">
              {zoning.map((z) => (
                <div key={z.zone} className="deliverable-item">
                  <div style={{ fontFamily: "var(--font-display)", textTransform: "capitalize", fontSize: 22 }}>{z.zone}</div>
                  <div className="muted">{z.guidance}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ boxShadow: "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
              <div style={{ fontFamily: "var(--font-display)" }}>Furniture placement checklist</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" className="btn btn-outline" onClick={() => setChecklistAll(true)}>Mark all done</button>
                <button type="button" className="btn btn-outline" onClick={() => setChecklistAll(false)}>Reset</button>
              </div>
            </div>
            <div className="progress-bar" style={{ marginBottom: 10 }}>
              <span style={{ width: `${checklistPct}%` }} />
            </div>
            <div className="grid">
              {checklist.map((item, idx) => {
                const k = `check_${idx}_${item}`;
                return (
                  <label key={k} className="muted deliverable-check-row">
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
            <div className="grid material-grid">
              {materialBoard.map((m) => (
                <div key={`${m.label}-${m.note}`} className="deliverable-item">
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>{m.label}</div>
                  <div className="muted">{m.note}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ boxShadow: "none" }}>
            <div style={{ fontFamily: "var(--font-display)", marginBottom: 8 }}>Execution timeline (vendor tasks)</div>
            <div className="progress-bar" style={{ marginBottom: 10 }}>
              <span style={{ width: `${timelinePct}%` }} />
            </div>
            <div className="grid">
              {timeline.map((t) => (
                <div key={t.id} className="deliverable-item">
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 21 }}>{t.phase} - {t.task}</div>
                  <div className="deliverable-controls">
                    <label className="muted">
                      Owner
                      <select
                        className="select"
                        value={timelineMap[t.id]?.owner || vendorBySkill(t.skill)}
                        onChange={(e) => updateTimelineItem(t.id, { owner: e.target.value })}
                      >
                        {[vendorBySkill(t.skill), ...assignableVendors].filter((v, i, arr) => v && arr.indexOf(v) === i).map((v) => (
                          <option key={`${t.id}-${v}`} value={v}>{v}</option>
                        ))}
                      </select>
                    </label>
                    <label className="muted">
                      Status
                      <select
                        className="select"
                        value={timelineMap[t.id]?.status || "todo"}
                        onChange={(e) => updateTimelineItem(t.id, { status: e.target.value })}
                      >
                        <option value="todo">To do</option>
                        <option value="in_progress">In progress</option>
                        <option value="done">Done</option>
                      </select>
                    </label>
                  </div>
                  <div className="muted">
                    Current: {(timelineMap[t.id]?.status || "todo").replace("_", " ")} | Owner: {timelineMap[t.id]?.owner || vendorBySkill(t.skill)}
                  </div>
                </div>
              ))}
            </div>
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
              <button className="btn btn-outline" type="button" onClick={() => openVendorModal(v)}>
                View more
              </button>
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
                  loading="lazy"
                  decoding="async"
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

      {selectedVendor && (
        <div className="preview-modal-overlay" onClick={closeVendorModal}>
          <div className="preview-modal vendor-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-head">
              <span>{selectedVendor.name}</span>
              <button className="btn btn-outline" type="button" onClick={closeVendorModal}>Close</button>
            </div>
            <div className="grid grid-2">
              <div className="card" style={{ boxShadow: "none" }}>
                <div style={{ fontFamily: "var(--font-display)", marginBottom: 8 }}>Overview</div>
                <div className="muted">City: {selectedVendor.city || "Not available"}</div>
                <div className="muted">Experience: {selectedVendor.years_exp || 0} yrs</div>
                <div className="muted">Rating: {selectedVendor.avg_rating || "-"} ({selectedVendor.review_count || 0} reviews)</div>
                <div className="muted" style={{ marginTop: 8 }}>
                  Services: {Array.isArray(selectedVendor.service_types) ? selectedVendor.service_types.join(", ") : selectedVendor.service_types || "Interior design"}
                </div>
                {selectedVendor.about && (
                  <div className="muted" style={{ marginTop: 8 }}>{selectedVendor.about}</div>
                )}
                {selectedVendor.external && <div className="badge" style={{ marginTop: 10 }}>Live vendor</div>}
              </div>
              <div className="card" style={{ boxShadow: "none" }}>
                <div style={{ fontFamily: "var(--font-display)", marginBottom: 8 }}>Actions</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(selectedVendor.phone || selectedVendor.whatsapp) && (
                    <a className="btn btn-outline" href={toPhoneUrl(selectedVendor.phone || selectedVendor.whatsapp)}>
                      Call
                    </a>
                  )}
                  {(selectedVendor.whatsapp || selectedVendor.phone) && (
                    <a className="btn btn-outline" href={toWhatsappUrl(selectedVendor.whatsapp || selectedVendor.phone)} target="_blank" rel="noreferrer">
                      WhatsApp
                    </a>
                  )}
                  {(selectedVendor.maps_url || selectedVendor.city || selectedVendor.name) && (
                    <a
                      className="btn btn-outline"
                      href={normalizeUrl(selectedVendor.maps_url || `https://www.google.com/maps/search/${encodeURIComponent(`${selectedVendor.name} ${selectedVendor.city || ""}`)}`)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open on maps
                    </a>
                  )}
                  {selectedVendor.website && (
                    <a className="btn btn-outline" href={normalizeUrl(selectedVendor.website)} target="_blank" rel="noreferrer">
                      Visit site
                    </a>
                  )}
                  {!selectedVendor.external && selectedVendor.id && (
                    <>
                      <button className="btn btn-outline" type="button" onClick={() => viewVendor(selectedVendor.id)}>
                        Mark viewed
                      </button>
                      <button className="btn" type="button" onClick={() => shortlistVendor(selectedVendor.id)}>
                        Shortlist vendor
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {catalogModal === "products" && (
        <div className="preview-modal-overlay" onClick={closeCatalogModal}>
          <div className="preview-modal catalog-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-head">
              <span>Recommended products</span>
              <button className="btn btn-outline" type="button" onClick={closeCatalogModal}>Close</button>
            </div>
            <div className="catalog-grid">
              {liveProducts.map((p, idx) => (
                <div key={`${p.product_url}-${idx}`} className="card" style={{ boxShadow: "none" }}>
                  {p.image_url && <img src={p.image_url} alt={p.title} loading="lazy" decoding="async" style={{ width: "100%", borderRadius: 12, aspectRatio: "4 / 3", objectFit: "cover" }} />}
                  <div style={{ fontFamily: "var(--font-display)", marginTop: 8 }}>{p.title}</div>
                  {p.recommended_for && <div className="muted">For: {p.recommended_for}</div>}
                  <div className="muted">{p.currency} {p.price || "-"}</div>
                  <div className="muted">Store: {storeNameFromUrl(p.product_url)}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    <button className="btn btn-outline" type="button" onClick={() => trackClick(p)}>Buy now</button>
                    <a className="btn btn-outline" href={normalizeUrl(p.product_url)} target="_blank" rel="noreferrer">Open link</a>
                  </div>
                </div>
              ))}
              {!liveProducts.length && !liveLoading && (
                <div className="retrieval-item static">
                  <strong>No recommendations yet</strong>
                  <span>Run AI planning or fetch live product links first.</span>
                </div>
              )}
              {liveLoading && (
                <div className="retrieval-item static">
                  <strong>Loading products</strong>
                  <span>Fetching live marketplace links.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {catalogModal === "vendors" && (
        <div className="preview-modal-overlay" onClick={closeCatalogModal}>
          <div className="preview-modal catalog-modal vendor-board-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-head">
              <span>Local vendors</span>
              <button className="btn btn-outline" type="button" onClick={closeCatalogModal}>Close</button>
            </div>
            <div className="catalog-grid">
              {vendors.map((v) => (
                <div key={v.id} className="card" style={{ boxShadow: "none" }}>
                  <div style={{ fontFamily: "var(--font-display)" }}>{v.name}</div>
                  <div className="muted">{v.city} - {v.years_exp || 0} yrs</div>
                  <div className="muted">Rating {v.avg_rating || "-"} ({v.review_count || 0})</div>
                  {v.external && <div className="badge">Live vendor</div>}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                    <button className="btn btn-outline" type="button" onClick={() => openVendorModal(v)}>
                      View more
                    </button>
                    {v.external ? (
                      <>
                        {(v.phone || v.whatsapp) && (
                          <a className="btn btn-outline" href={toPhoneUrl(v.phone || v.whatsapp)}>
                            Call
                          </a>
                        )}
                        {(v.whatsapp || v.phone) && (
                          <a className="btn btn-outline" href={toWhatsappUrl(v.whatsapp || v.phone)} target="_blank" rel="noreferrer">
                            WhatsApp
                          </a>
                        )}
                        <a
                          className="btn btn-outline"
                          href={normalizeUrl(v.maps_url || `https://www.google.com/maps/search/${encodeURIComponent(`${v.name} ${v.city || ""}`)}`)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open on maps
                        </a>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-outline" type="button" onClick={() => viewVendor(v.id)}>Mark viewed</button>
                        <button className="btn" type="button" onClick={() => shortlistVendor(v.id)}>Shortlist vendor</button>
                      </>
                    )}
                    {v.website && (
                      <a className="btn btn-outline" href={normalizeUrl(v.website)} target="_blank" rel="noreferrer">
                        Visit site
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {!vendors.length && (
                <div className="retrieval-item static">
                  <strong>No vendors available yet</strong>
                  <span>{vendorNotice || "No local vendor data available right now."}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
          {chat.reply && (
            <div className="card" style={{ marginTop: 12, boxShadow: "none" }}>
              <div>{chat.reply}</div>
              {Array.isArray(chat.links) && chat.links.length > 0 && (
                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {chat.links.map((p) => (
                    <a key={p.url} className="badge" href={p.url} target="_blank" rel="noreferrer">
                      {p.keyword}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
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
      <SiteFooter />
    </div>
  );
}

