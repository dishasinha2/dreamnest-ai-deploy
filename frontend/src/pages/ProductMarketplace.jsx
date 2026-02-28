import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProductsAPI } from "../api/endpoints";

const WISHLIST_KEY = "dreamnest_wishlist_items";
const PAGE_SIZE_DEFAULT = 9;
const AR_MODEL_KEY = "dreamnest_ar_models";

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

export default function ProductMarketplace() {
  const nav = useNavigate();
  const { id } = useParams();
  const marketRaw = localStorage.getItem(`dreamnest_market_${id}`);
  const market = marketRaw ? JSON.parse(marketRaw) : null;
  const [products, setProducts] = useState(market?.items || []);

  const [query, setQuery] = useState("");
  const [store, setStore] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);
  const [page, setPage] = useState(1);
  const [storePriority, setStorePriority] = useState(
    market?.prefs?.store_priority || "ikea,flipkart,myntra,amazon,pepperfry,ebay"
  );
  const [exactOnly, setExactOnly] = useState(Boolean(market?.prefs?.exact_only));
  const [wishlistMap, setWishlistState] = useState(getWishlistMap);
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
  }, []);

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
    const arr = products.filter((p) => {
      const okStore = store === "all" || String(p.source || "").toLowerCase() === store;
      const hay = `${p.title || ""} ${p.recommended_for || ""} ${p.source || ""}`.toLowerCase();
      const okQuery = !query.trim() || hay.includes(query.trim().toLowerCase());
      const okExact = !exactOnly || looksExactProduct(p.product_url);
      return okStore && okQuery && okExact;
    });

    const sorted = [...arr];
    if (sortBy === "relevance") {
      sorted.sort((a, b) => {
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
  }, [products, store, query, sortBy, storePriority, exactOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  async function loadMoreProducts() {
    if (!market || isLoadingMore) return;
    setIsLoadingMore(true);
    setLoadError("");
    try {
      const roomHint = String(market.roomType || "living_room").replaceAll("_", " ");
      const baseQueries = [
        `modern ${roomHint} furniture`,
        `${roomHint} lighting`,
        `${roomHint} decor`,
        `${roomHint} storage furniture`,
        `${roomHint} accent chair`
      ];
      const existingHints = Array.from(
        new Set((products || []).map((p) => p.recommended_for).filter(Boolean))
      );
      const queries = Array.from(new Set([...existingHints, ...baseQueries])).slice(0, 6);

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
      const merged = Array.from(mergedMap.values()).slice(0, 120);
      setProducts(merged);
      localStorage.setItem(
        `dreamnest_market_${id}`,
        JSON.stringify({
          ...market,
          items: merged,
          prefs: {
            store_priority: storePriority,
            exact_only: exactOnly
          }
        })
      );
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
      <div className="container">
        <div className="glass-stack">
          <h2 style={{ fontFamily: "var(--font-display)" }}>Marketplace not ready</h2>
          <div className="muted">Generate recommendations from your project first.</div>
          <button className="btn" onClick={() => nav(`/project/${id}`)}>Back to project</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container market-page">
      <div className="nav">
        <div className="nav-brand">
          <span style={{ color: "var(--accent)" }}>Dream</span>Nest Marketplace
          <div className="nav-sub">{market.title} - {market.location}</div>
        </div>
        <div className="nav-actions">
          <button className="btn btn-outline" onClick={() => nav("/wishlist")}>Wishlist</button>
          <button className="btn btn-outline" onClick={() => nav(`/project/${id}`)}>Back to project</button>
        </div>
      </div>

      <div className="glass-stack market-head">
        <div className="market-topline">
          <div className="market-kpis">
            <strong>{filtered.length} products</strong>
            <span>Budget INR {market.budget}</span>
          </div>
          <div className="market-store-chips">
            {stores.map((s) => (
              <span key={s} className="market-chip">
                {s.toUpperCase()} · {storeCounts[s]}
              </span>
            ))}
          </div>
        </div>
        <div className="market-pref-row">
          <input
            className="input"
            value={storePriority}
            onChange={(e) => {
              setPage(1);
              setStorePriority(e.target.value);
            }}
            placeholder="Store priority: ikea,flipkart,myntra,amazon,pepperfry,ebay"
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

      <div className="market-grid">
        {paged.map((p, idx) => {
          const url = normalizeUrl(p.product_url);
          const wished = Boolean(wishlistMap[url]);
          const comparing = compare.some((x) => normalizeUrl(x.product_url) === url);
          return (
            <article key={`${url}-${idx}`} className="market-card">
              {p.image_url ? (
                <img className="market-image" src={p.image_url} alt={p.title} />
              ) : (
                <img className="market-image" src={fallbackImage(p.title, p.source)} alt={p.title} />
              )}
              <div className="market-body">
                <h3>{p.title}</h3>
                {p.recommended_for ? <div className="muted">For: {p.recommended_for}</div> : null}
                <div className="market-meta">
                  <span className="market-price">{p.currency || "INR"} {p.price || "-"}</span>
                  <span className="market-source">{String(p.source || "").toUpperCase()}</span>
                </div>
                <div className="market-actions">
                  <button className="btn" onClick={() => window.open(url, "_blank", "noopener,noreferrer")}>Buy now</button>
                  <a className="btn btn-outline" href={url} target="_blank" rel="noreferrer">Open product</a>
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
                    <img className="preview-room" src={preview.room} alt="room preview" />
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
    </div>
  );
}
