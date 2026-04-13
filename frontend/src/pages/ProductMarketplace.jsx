import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProductsAPI } from "../api/endpoints";
import { useAuth } from "../hooks/useAuth";
import SiteFooter from "../components/SiteFooter";

const WISHLIST_KEY = "dreamnest_wishlist_items";
const PAGE_SIZE_DEFAULT = 9;
const AR_MODEL_KEY = "dreamnest_ar_models";
const USER_PREF_KEY = (userId) => `dreamnest_user_pref_${userId || "anon"}`;
const PROJECT_PREF_KEY = (userId, projectId) =>
  `dreamnest_project_pref_${userId || "anon"}_${projectId || "unknown"}`;

function sanitizeMarketItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      ...item,
      title: String(item.title || "Untitled product").trim(),
      source: String(item.source || "store").trim(),
      currency: String(item.currency || "INR").trim(),
      product_url: normalizeUrl(item.product_url),
      image_url: String(item.image_url || "").trim(),
      recommended_for: String(item.recommended_for || "").trim()
    }))
    .filter((item) => item.product_url && item.product_url !== "#");
}

function normalizeUrl(url) {
  if (!url) return "#";
  const t = String(url).trim();
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  return `https://${t}`;
}

function fallbackImage(title, source) {
  const seed = encodeURIComponent(`${source || "store"}-${title || "product"}`);
  return `https://picsum.photos/seed/${seed}/900/560`;
}

function persistMarketState(id, market, items, prefs) {
  if (!id || !market) return;
  localStorage.setItem(
    `dreamnest_market_${id}`,
    JSON.stringify({
      ...market,
      items,
      prefs
    })
  );
}

function getWishlistMap() {
  try {
    const obj = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "{}");
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

function setWishlistMap(map) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(map));
}

function getArModelMap() {
  try {
    const obj = JSON.parse(localStorage.getItem(AR_MODEL_KEY) || "{}");
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

function setArModelMap(map) {
  localStorage.setItem(AR_MODEL_KEY, JSON.stringify(map));
}

function decodeJwtPayload(token) {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getUserIdFromToken(token) {
  const payload = decodeJwtPayload(token);
  return payload?.userId || payload?.id || payload?.sub || "";
}

function normalizePref(obj) {
  return obj && typeof obj === "object"
    ? {
        stores: obj.stores && typeof obj.stores === "object" ? obj.stores : {},
        categories: obj.categories && typeof obj.categories === "object" ? obj.categories : {},
        keywords: obj.keywords && typeof obj.keywords === "object" ? obj.keywords : {}
      }
    : { stores: {}, categories: {}, keywords: {} };
}

function readPref(key) {
  try {
    return normalizePref(JSON.parse(localStorage.getItem(key) || "{}"));
  } catch {
    return { stores: {}, categories: {}, keywords: {} };
  }
}

function writePref(key, pref) {
  localStorage.setItem(key, JSON.stringify(pref));
}

function mergePref(user, project, weights) {
  const merged = { stores: {}, categories: {}, keywords: {} };
  const apply = (source, weight) => {
    Object.entries(source?.stores || {}).forEach(([k, v]) => {
      merged.stores[k] = (merged.stores[k] || 0) + Number(v) * weight;
    });
    Object.entries(source?.categories || {}).forEach(([k, v]) => {
      merged.categories[k] = (merged.categories[k] || 0) + Number(v) * weight;
    });
    Object.entries(source?.keywords || {}).forEach(([k, v]) => {
      merged.keywords[k] = (merged.keywords[k] || 0) + Number(v) * weight;
    });
  };
  apply(user, weights.user);
  apply(project, weights.project);
  return merged;
}

function getPrefWeights(strength) {
  if (strength === "strong") return { user: 0.3, project: 0.7 };
  if (strength === "light") return { user: 0.55, project: 0.45 };
  return { user: 0.4, project: 0.6 };
}

function buildPrefState(userId, projectId, strength) {
  const userPref = readPref(USER_PREF_KEY(userId));
  const projectPref = readPref(PROJECT_PREF_KEY(userId, projectId));
  const weights = getPrefWeights(strength);
  return {
    user: userPref,
    project: projectPref,
    merged: mergePref(userPref, projectPref, weights)
  };
}

function detectCategory(product) {
  const text = `${product?.title || ""} ${product?.recommended_for || ""}`.toLowerCase();
  if (/(lamp|light|lighting|pendant|ceiling)/.test(text)) return "lighting";
  if (/(curtain|cushion|bedsheet|duvet|blanket|soft|fabric)/.test(text)) return "soft";
  if (/(rug|carpet|decor|art|mirror|plant|clock|wall)/.test(text)) return "decor";
  if (/(bed|mattress|wardrobe|dresser|bedside)/.test(text)) return "bedroom";
  return "furniture";
}

function tokenizeText(value) {
  return String(value || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter(Boolean);
}

function getPersonalizationWeight(level) {
  if (level === "strong") return 2.0;
  if (level === "light") return 0.8;
  return 1.2;
}

function buildMarketContext(market) {
  const ctx = market?.context || {};
  const rooms = Array.isArray(ctx.room_type) ? ctx.room_type : String(ctx.room_type || "").split(",");
  const styles = Array.isArray(ctx.style_tags) ? ctx.style_tags : String(ctx.style_tags || "").split(",");
  const mustHaves = Array.isArray(ctx.must_haves) ? ctx.must_haves : String(ctx.must_haves || "").split(",");
  const colors = Array.isArray(ctx.colors) ? ctx.colors : String(ctx.colors || "").split(",");
  const notes = tokenizeText(ctx.notes || "");

  return {
    rooms: rooms.map((r) => String(r).trim().toLowerCase()).filter(Boolean),
    styles: styles.map((s) => String(s).trim().toLowerCase()).filter(Boolean),
    mustHaves: mustHaves.map((m) => String(m).trim().toLowerCase()).filter(Boolean),
    colors: colors.map((c) => String(c).trim().toLowerCase()).filter(Boolean),
    notes
  };
}

function scoreMarketplaceItem(item, context) {
  const text = `${item?.title || ""} ${item?.recommended_for || ""} ${item?.source || ""}`.toLowerCase();
  let score = 0;

  for (const room of context.rooms) {
    const compact = room.replace(/\s+/g, "");
    if (text.includes(room)) score += 9;
    if (compact && text.includes(compact)) score += 4;
  }
  for (const style of context.styles) {
    if (style && text.includes(style)) score += 6;
  }
  for (const need of context.mustHaves) {
    const words = tokenizeText(need);
    if (words.length && words.every((word) => text.includes(word))) score += 10;
    else score += words.reduce((acc, word) => acc + (text.includes(word) ? 2 : 0), 0);
  }
  for (const color of context.colors) {
    if (color && text.includes(color)) score += 4;
  }
  score += context.notes.reduce((acc, word) => acc + (text.includes(word) ? 1 : 0), 0);

  if (context.rooms.some((room) => room.includes("living")) && /(office|study|desk|workstation|wardrobe|bedroom|bed\b)/.test(text)) score -= 7;
  if (context.rooms.some((room) => room.includes("bed")) && /(tv unit|dining|office chair|study table|workstation)/.test(text)) score -= 7;
  if (context.rooms.some((room) => room.includes("study") || room.includes("office")) && /(sofa|rug flatwoven|bedside|duvet|bedsheet)/.test(text)) score -= 5;
  if (/(chair|sofa|table|lamp|rug|storage|mirror|plant|shelf|unit)/.test(text)) score += 2;
  if (item?.image_url) score += 2;
  if (item?.rating) score += Number(item.rating) / 2;

  return score;
}

function productKeywords(product) {
  const words = `${product?.title || ""} ${product?.recommended_for || ""}`
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter(Boolean);
  const stop = new Set(["for", "room", "with", "and", "the", "from", "set", "inch"]);
  return Array.from(new Set(words.filter((w) => w.length > 3 && !stop.has(w)).slice(0, 8)));
}

export default function ProductMarketplace() {
  const nav = useNavigate();
  const { id } = useParams();
  const { token } = useAuth();
  const userId = useMemo(() => getUserIdFromToken(token), [token]);
  const marketRaw = localStorage.getItem(`dreamnest_market_${id}`);
  let market = null;
  try {
    market = marketRaw ? JSON.parse(marketRaw) : null;
  } catch {
    market = null;
  }
  const [products, setProducts] = useState(() => sanitizeMarketItems(market?.items));

  const [query, setQuery] = useState("");
  const [store, setStore] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);
  const [page, setPage] = useState(1);
  const [storePriority, setStorePriority] = useState(
    market?.prefs?.store_priority || "ikea,flipkart,myntra,amazon,pepperfry,urbanladder,meesho,ebay"
  );
  const [exactOnly, setExactOnly] = useState(Boolean(market?.prefs?.exact_only));
  const [wishlistMap, setWishlistState] = useState(getWishlistMap);
  const [prefState, setPrefState] = useState(() =>
    buildPrefState(userId, id, market?.prefs?.personalization_strength)
  );
  const mergedPref = prefState.merged;
  const [compare, setCompare] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [autoTried, setAutoTried] = useState(false);
  const [arModels, setArModels] = useState(getArModelMap);
  const [preview, setPreview] = useState({
    open: false,
    product: null,
    room: "",
    x: 50,
    y: 62,
    scale: 34,
    rotate: 0,
    mode: "compose",
    arModelUrl: "",
    arPosterUrl: ""
  });

  useEffect(() => {
    if (document.querySelector("script[data-model-viewer='1']")) return;
    const s = document.createElement("script");
    s.type = "module";
    s.src = "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
    s.setAttribute("data-model-viewer", "1");
    document.head.appendChild(s);

    return () => {
      if (document.head.contains(s)) document.head.removeChild(s);
    };
  }, []);

  useEffect(() => {
    if (!market) return;
    persistMarketState(id, market, products, {
      store_priority: storePriority,
      exact_only: exactOnly,
      personalization_strength: market?.prefs?.personalization_strength || "strong"
    });
  }, [exactOnly, id, market, products, storePriority]);

  useEffect(() => {
    setPrefState(buildPrefState(userId, id, market?.prefs?.personalization_strength));
  }, [id, market?.prefs?.personalization_strength, userId]);

  const stores = useMemo(() => {
    const vals = Array.from(new Set(products.map((p) => String(p.source || "unknown").toLowerCase())));
    return vals.sort();
  }, [products]);
  const storeCounts = useMemo(() => {
    const acc = {};
    for (const p of products) {
      const key = String(p.source || "unknown").toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, [products]);

  function looksExactProduct(url) {
    const u = String(url || "").toLowerCase();
    if (!u) return false;
    if (u.includes("/search") || u.includes("/cat/") || u.includes("?q=") || u.includes("/products-products")) return false;
    return u.includes("/p/") || u.includes("/product/") || u.includes("/products/") || u.includes("/dp/") || u.includes("/item/") || u.includes("pid=");
  }

  const filtered = useMemo(() => {
    const priority = storePriority
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const context = buildMarketContext(market);
    const personalizationWeight = getPersonalizationWeight(market?.prefs?.personalization_strength);
    const arr = products.filter((p) => {
      const okStore = store === "all" || String(p.source || "").toLowerCase() === store;
      const hay = `${p.title || ""} ${p.recommended_for || ""} ${p.source || ""}`.toLowerCase();
      const okQuery = !query.trim() || hay.includes(query.trim().toLowerCase());
      const okExact = !exactOnly || looksExactProduct(p.product_url);
      if (!okStore || !okQuery || !okExact) return false;
      if (market?.prefs?.personalization_strength === "strong") {
        const contextScore = scoreMarketplaceItem(p, context);
        if (contextScore < -2) return false;
      }
      return true;
    });

    const sorted = [...arr];
    if (sortBy === "relevance") {
      sorted.sort((a, b) => {
        const score = (item) => {
          const storeKey = String(item.source || "").toLowerCase();
          const catKey = detectCategory(item);
          const kws = productKeywords(item);
          const storeScore = Number(mergedPref.stores?.[storeKey] || 0) * 5;
          const catScore = Number(mergedPref.categories?.[catKey] || 0) * 3;
          const kwScore = kws.reduce((acc, k) => acc + Number(mergedPref.keywords?.[k] || 0), 0);
          const contextScore = scoreMarketplaceItem(item, context);
          return storeScore + catScore + kwScore + contextScore * personalizationWeight;
        };
        const ds = score(b) - score(a);
        if (ds !== 0) return ds;

        const sa = String(a.source || "").toLowerCase();
        const sb = String(b.source || "").toLowerCase();
        const ia = priority.indexOf(sa);
        const ib = priority.indexOf(sb);
        if (ia === -1 && ib === -1) return 0;
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      });
    }
    if (sortBy === "price_asc") sorted.sort((a, b) => Number(a.price || Number.MAX_SAFE_INTEGER) - Number(b.price || Number.MAX_SAFE_INTEGER));
    if (sortBy === "price_desc") sorted.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    if (sortBy === "store_asc") sorted.sort((a, b) => String(a.source || "").localeCompare(String(b.source || "")));
    if (sortBy === "name_asc") sorted.sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));
    return sorted;
  }, [products, store, query, sortBy, storePriority, exactOnly, userPref]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  async function loadMoreProducts() {
    if (!market || isLoadingMore) return;
    setIsLoadingMore(true);
    setLoadError("");
    try {
      const roomHint = String(market.roomType || market?.context?.room_type || "living_room")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)[0]
        .replaceAll("_", " ");
      const styleHints = (Array.isArray(market?.context?.style_tags) ? market.context.style_tags : String(market?.context?.style_tags || "").split(","))
        .map((x) => String(x).trim())
        .filter(Boolean)
        .slice(0, 4);
      const mustHaves = (Array.isArray(market?.context?.must_haves) ? market.context.must_haves : String(market?.context?.must_haves || "").split(","))
        .map((x) => String(x).trim())
        .filter(Boolean)
        .slice(0, 8);
      const colorHints = (Array.isArray(market?.context?.colors) ? market.context.colors : String(market?.context?.colors || "").split(","))
        .map((x) => String(x).trim())
        .filter(Boolean)
        .slice(0, 5);

      const baseQueries = [
        `modern ${roomHint} furniture`,
        `${roomHint} lighting`,
        `${roomHint} decor`,
        `${roomHint} storage furniture`,
        `${roomHint} accent chair`
      ];
      styleHints.forEach((s) => {
        baseQueries.push(`${s} ${roomHint} furniture`);
        baseQueries.push(`${s} ${roomHint} decor`);
      });
      mustHaves.forEach((m) => baseQueries.push(`${roomHint} ${m}`));
      colorHints.forEach((c) => baseQueries.push(`${c} ${roomHint} decor`));
      const existingHints = Array.from(
        new Set((products || []).map((p) => p.recommended_for).filter(Boolean))
      );
      const queries = Array.from(new Set([...existingHints, ...baseQueries])).slice(0, 14);

      const responses = await Promise.all(
        queries.map((q) =>
          ProductsAPI.live({
            q,
            location: market.location,
            budget_inr: market.budget,
            store_priority: storePriority,
            exact_only: exactOnly ? "1" : "0"
          })
        )
      );

      const fetched = responses.flatMap((resp, idx) =>
        (resp.results || []).map((item) => ({ ...item, recommended_for: queries[idx] }))
      );
      const mergedMap = new Map();
      for (const item of [...products, ...fetched]) {
        const url = normalizeUrl(item.product_url);
        if (!url || url === "#") continue;
        if (!mergedMap.has(url)) mergedMap.set(url, { ...item, product_url: url });
      }
      const merged = sanitizeMarketItems(Array.from(mergedMap.values()).slice(0, 220));
      setProducts(merged);
      persistMarketState(id, market, merged, {
        store_priority: storePriority,
        exact_only: exactOnly
      });
    } catch (e) {
      setLoadError(String(e?.message || e));
    } finally {
      setIsLoadingMore(false);
    }
  }

  useEffect(() => {
    if (autoTried || !market) return;
    if ((products || []).length < 9) {
      setAutoTried(true);
      loadMoreProducts();
      return;
    }
    setAutoTried(true);
  }, [autoTried, market, products.length]);

  function toggleWishlist(item) {
    const key = normalizeUrl(item.product_url);
    const next = { ...wishlistMap };
    const wasInWishlist = Boolean(next[key]);
    if (next[key]) delete next[key];
    else {
      next[key] = {
        ...item,
        product_url: key,
        wishedAt: new Date().toISOString()
      };
    }
    setWishlistState(next);
    setWishlistMap(next);
    learnFromAction(item, wasInWishlist ? 0.5 : 2);
  }

  function toggleCompare(item) {
    const key = normalizeUrl(item.product_url);
    const exists = compare.some((x) => normalizeUrl(x.product_url) === key);
    if (exists) {
      setCompare(compare.filter((x) => normalizeUrl(x.product_url) !== key));
      return;
    }
    if (compare.length >= 3) return;
    setCompare([...compare, item]);
    learnFromAction(item, 1.2);
  }

  function learnFromAction(item, weight = 1) {
    const updatePref = (base, bump) => {
      const storeKey = String(item?.source || "").toLowerCase();
      const catKey = detectCategory(item);
      const kws = productKeywords(item);
      const next = {
        stores: { ...(base.stores || {}) },
        categories: { ...(base.categories || {}) },
        keywords: { ...(base.keywords || {}) }
      };
      next.stores[storeKey] = Number(next.stores[storeKey] || 0) + bump;
      next.categories[catKey] = Number(next.categories[catKey] || 0) + bump;
      kws.forEach((k) => {
        next.keywords[k] = Number(next.keywords[k] || 0) + Math.max(0.4, bump / 2);
      });
      return next;
    };

    const nextUser = updatePref(prefState.user, weight * 0.6);
    const nextProject = updatePref(prefState.project, weight * 1.1);
    const weights = getPrefWeights(market?.prefs?.personalization_strength);
    const merged = mergePref(nextUser, nextProject, weights);
    setPrefState({ user: nextUser, project: nextProject, merged });
    writePref(USER_PREF_KEY(userId), nextUser);
    writePref(PROJECT_PREF_KEY(userId, id), nextProject);
  }

  function openPreview(item) {
    const key = normalizeUrl(item.product_url);
    const saved = arModels[key] || {};
    setPreview((p) => ({
      ...p,
      open: true,
      product: item,
      mode: "compose",
      arModelUrl: saved.model || "",
      arPosterUrl: saved.poster || item.image_url || fallbackImage(item.title, item.source)
    }));
  }

  function saveArModelForCurrent() {
    if (!preview.product || !preview.arModelUrl) return;
    const key = normalizeUrl(preview.product.product_url);
    const next = {
      ...arModels,
      [key]: {
        model: preview.arModelUrl.trim(),
        poster: preview.arPosterUrl.trim()
      }
    };
    setArModels(next);
    setArModelMap(next);
  }

  if (!market) {
    return (
      <div className="container app-editorial-shell">
        <div className="glass-stack">
          <h2 style={{ fontFamily: "var(--font-display)" }}>Marketplace not ready</h2>
          <div className="muted">Generate recommendations from your project first.</div>
          <button className="btn" onClick={() => nav(`/project/${id}`)}>Back to project</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container market-page app-editorial-shell marketplace-editorial-page workspace-shell">
      <div className="nav app-editorial-nav">
        <div className="nav-brand">
          <span style={{ color: "var(--accent)" }}>Dream</span>Nest Marketplace
          <div className="nav-sub">{market.title} | {market.location}</div>
        </div>
        <div className="nav-actions">
          <button className="btn btn-outline" onClick={() => nav("/wishlist")}>Open Wishlist</button>
          <button className="btn btn-outline" onClick={() => nav(`/project/${id}`)}>Back to project</button>
        </div>
      </div>

      <div className="glass-stack market-head app-editorial-hero marketplace-hero-band">
        <div>
          <div className="studio-kicker">Sourcing Board</div>
          <h2 style={{ fontFamily: "var(--font-display)", margin: "8px 0 10px" }}>Budget-balanced product discovery</h2>
          <div className="muted">Compare stores, shortlist products, and preview items in-room without leaving the project workflow.</div>
        </div>
        <div className="market-topline">
          <div className="market-kpis">
            <strong>{filtered.length} products</strong>
            <span>Budget INR {market.budget}</span>
          </div>
          <div className="market-store-chips">
            {stores.map((s) => (
              <span key={s} className="market-chip">
                {s.toUpperCase()} | {storeCounts[s]}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="glass-stack market-filters-panel">
        <div className="market-pref-row">
          <input
            className="input"
            value={storePriority}
            onChange={(e) => {
              setPage(1);
              setStorePriority(e.target.value);
            }}
            placeholder="Store priority: ikea,flipkart,myntra,amazon,pepperfry,urbanladder,meesho,ebay"
          />
          <label className="muted market-exact-toggle">
            <input
              type="checkbox"
              checked={exactOnly}
              onChange={(e) => {
                setPage(1);
                setExactOnly(e.target.checked);
              }}
            />
            Exact verified links only
          </label>
        </div>
        <div className="market-controls market-controls-extended">
          <input
            className="input"
            placeholder="Search by item, style, store..."
            value={query}
            onChange={(e) => {
              setPage(1);
              setQuery(e.target.value);
            }}
          />
          <select className="select" value={store} onChange={(e) => { setPage(1); setStore(e.target.value); }}>
            <option value="all">All stores</option>
            {stores.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select className="select" value={sortBy} onChange={(e) => { setPage(1); setSortBy(e.target.value); }}>
            <option value="relevance">Sort: Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="store_asc">Store: A-Z</option>
            <option value="name_asc">Name: A-Z</option>
          </select>
          <select className="select" value={pageSize} onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)); }}>
            <option value={6}>6 / page</option>
            <option value={9}>9 / page</option>
            <option value={12}>12 / page</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn btn-outline" onClick={loadMoreProducts} disabled={isLoadingMore}>
            {isLoadingMore ? "Loading more..." : "Load more products"}
          </button>
          {loadError ? <span className="muted">{loadError}</span> : null}
        </div>
        <div className="muted">Page {safePage} of {totalPages}</div>
        {store !== "all" && (
          <div className="muted">
            Store filter active: <strong>{store}</strong>{" "}
            <button className="btn btn-outline" style={{ marginLeft: 8, padding: "6px 10px" }} onClick={() => setStore("all")}>
              Show all stores
            </button>
          </div>
        )}
      </div>

      <div className="market-grid app-editorial-main marketplace-results-grid">
        {paged.length === 0 ? (
          <article className="market-card market-card-empty">
            <div className="market-body">
              <h3>No products match these filters</h3>
              <div className="muted">
                Try clearing the store filter, changing the search, or load more products for this project.
              </div>
              <div className="market-actions">
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setQuery("");
                    setStore("all");
                    setSortBy("relevance");
                    setPage(1);
                  }}
                >
                  Reset filters
                </button>
                <button className="btn" onClick={loadMoreProducts} disabled={isLoadingMore}>
                  {isLoadingMore ? "Loading more..." : "Load more"}
                </button>
              </div>
            </div>
          </article>
        ) : paged.map((p, idx) => {
          const url = normalizeUrl(p.product_url);
          const wished = Boolean(wishlistMap[url]);
          const comparing = compare.some((x) => normalizeUrl(x.product_url) === url);
          return (
            <article key={`${url}-${idx}`} className="market-card">
              {p.image_url ? (
                <img
                  className="market-image"
                  src={p.image_url}
                  alt={p.title}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = fallbackImage(p.title, p.source);
                  }}
                />
              ) : (
                <img className="market-image" src={fallbackImage(p.title, p.source)} alt={p.title} loading="lazy" decoding="async" />
              )}
              <div className="market-body">
                <h3>{p.title}</h3>
                {p.recommended_for ? <div className="muted">For: {p.recommended_for}</div> : null}
                <div className="market-meta">
                  <span className="market-price">{p.currency || "INR"} {p.price || "-"}</span>
                  <span className="market-source">{String(p.source || "").toUpperCase()}</span>
                </div>
                <div className="market-actions">
                  <button
                    className="btn"
                    onClick={() => {
                      learnFromAction(p, 1.6);
                      window.open(url, "_blank", "noopener,noreferrer");
                    }}
                  >
                    Buy Now
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => {
                      learnFromAction(p, 1);
                      window.open(url, "_blank", "noopener,noreferrer");
                    }}
                  >
                    View Product
                  </button>
                  <button
                    className={`btn btn-outline ${wished ? "is-wish" : ""}`}
                    onClick={() => toggleWishlist(p)}
                  >
                    {wished ? "Wishlisted" : "Wishlist"}
                  </button>
                  <button
                    className={`btn btn-outline ${comparing ? "is-compare" : ""}`}
                    onClick={() => toggleCompare(p)}
                  >
                    {comparing ? "Added" : "Compare"}
                  </button>
                  <button className="btn btn-outline" onClick={() => openPreview(p)}>
                    View in room (3D)
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="market-pagination">
        <button className="btn btn-outline" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Prev
        </button>
        <span className="muted">Page {safePage} / {totalPages}</span>
        <button className="btn btn-outline" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
          Next
        </button>
      </div>

      {compare.length > 0 && (
        <div className="market-compare">
          <div className="market-compare-head">
            <strong>Compare ({compare.length}/3)</strong>
            <button className="btn btn-outline" onClick={() => setCompare([])}>Clear</button>
          </div>
          <div className="market-compare-grid">
            {compare.map((item) => (
              <div key={normalizeUrl(item.product_url)} className="market-compare-card">
                <div style={{ fontFamily: "var(--font-display)" }}>{item.title}</div>
                <div className="muted">{item.currency || "INR"} {item.price || "-"}</div>
                <div className="muted">{String(item.source || "").toUpperCase()}</div>
                <a className="btn btn-outline" href={normalizeUrl(item.product_url)} target="_blank" rel="noreferrer">
                  Open
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {preview.open && (
        <div className="preview-modal-overlay" onClick={() => setPreview((p) => ({ ...p, open: false }))}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-head">
              <strong>AI Room Preview</strong>
              <button className="btn btn-outline" onClick={() => setPreview((p) => ({ ...p, open: false }))}>Close</button>
            </div>
            <div className="preview-mode-row">
              <button
                className={`btn btn-outline ${preview.mode === "compose" ? "is-compare" : ""}`}
                onClick={() => setPreview((p) => ({ ...p, mode: "compose" }))}
              >
                Room compose
              </button>
              <button
                className={`btn btn-outline ${preview.mode === "ar" ? "is-compare" : ""}`}
                onClick={() => setPreview((p) => ({ ...p, mode: "ar" }))}
              >
                Real AR (phone)
              </button>
            </div>
            <div className="preview-body">
              <div className="preview-controls">
                <div className="muted">{preview.product?.title}</div>
                {preview.mode === "compose" ? (
                  <>
                    <input
                      className="input"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const reader = new FileReader();
                        reader.onload = () => setPreview((p) => ({ ...p, room: String(reader.result || "") }));
                        reader.readAsDataURL(f);
                      }}
                    />
                    <label className="muted">Horizontal</label>
                    <input type="range" min={5} max={95} value={preview.x} onChange={(e) => setPreview((p) => ({ ...p, x: Number(e.target.value) }))} />
                    <label className="muted">Vertical</label>
                    <input type="range" min={15} max={90} value={preview.y} onChange={(e) => setPreview((p) => ({ ...p, y: Number(e.target.value) }))} />
                    <label className="muted">Size</label>
                    <input type="range" min={10} max={70} value={preview.scale} onChange={(e) => setPreview((p) => ({ ...p, scale: Number(e.target.value) }))} />
                    <label className="muted">3D Rotate</label>
                    <input type="range" min={-35} max={35} value={preview.rotate} onChange={(e) => setPreview((p) => ({ ...p, rotate: Number(e.target.value) }))} />
                  </>
                ) : (
                  <>
                    <div className="muted">For real AR, add product 3D model URL (.glb or .usdz).</div>
                    <input
                      className="input"
                      placeholder="https://.../model.glb"
                      value={preview.arModelUrl}
                      onChange={(e) => setPreview((p) => ({ ...p, arModelUrl: e.target.value }))}
                    />
                    <input
                      className="input"
                      placeholder="Poster image URL (optional)"
                      value={preview.arPosterUrl}
                      onChange={(e) => setPreview((p) => ({ ...p, arPosterUrl: e.target.value }))}
                    />
                    <button className="btn btn-outline" onClick={saveArModelForCurrent}>Save model for this product</button>
                  </>
                )}
              </div>
              <div className="preview-stage">
                {preview.mode === "compose" ? (
                  preview.room ? (
                    <img className="preview-room" src={preview.room} alt="room preview" decoding="async" />
                  ) : (
                    <div className="preview-room-empty">Upload room image to preview product</div>
                  )
                ) : (
                  <>
                    {preview.arModelUrl ? (
                      <model-viewer
                        src={preview.arModelUrl}
                        ar
                        ar-modes="scene-viewer webxr quick-look"
                        camera-controls
                        touch-action="pan-y"
                        poster={preview.arPosterUrl || undefined}
                        style={{ width: "100%", height: "100%", background: "transparent" }}
                      />
                    ) : (
                      <div className="preview-room-empty">Add GLB/USDZ model URL to launch real AR on phone.</div>
                    )}
                  </>
                )}
                {preview.mode === "compose" && preview.product && (
                  <img
                    className="preview-product"
                    src={preview.product.image_url || fallbackImage(preview.product.title, preview.product.source)}
                    alt={preview.product.title}
                    decoding="async"
                    style={{
                      left: `${preview.x}%`,
                      top: `${preview.y}%`,
                      width: `${preview.scale}%`,
                      transform: `translate(-50%, -50%) perspective(800px) rotateY(${preview.rotate}deg)`,
                      opacity: 0.92
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <SiteFooter />
    </div>
  );
}


