import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const WISHLIST_KEY = "dreamnest_wishlist_items";

function normalizeUrl(url) {
  if (!url) return "#";
  const t = String(url).trim();
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  return `https://${t}`;
}

export default function Wishlist() {
  const nav = useNavigate();
  const [items, setItems] = useState(() => {
    try {
      const obj = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "{}");
      return Object.values(obj || {});
    } catch {
      return [];
    }
  });

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => String(b.wishedAt || "").localeCompare(String(a.wishedAt || "")));
  }, [items]);

  function removeItem(url) {
    const key = normalizeUrl(url);
    try {
      const raw = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "{}");
      delete raw[key];
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(raw));
      setItems(Object.values(raw));
    } catch {
      localStorage.removeItem(WISHLIST_KEY);
      setItems([]);
    }
  }

  return (
    <div className="container market-page">
      <div className="nav">
        <div className="nav-brand">
          <span style={{ color: "var(--accent)" }}>Dream</span>Nest Wishlist
          <div className="nav-sub">{sorted.length} saved products</div>
        </div>
        <div className="nav-actions">
          <button className="btn btn-outline" onClick={() => nav(-1)}>Back</button>
        </div>
      </div>

      {!sorted.length ? (
        <div className="glass-stack">
          <h3 style={{ fontFamily: "var(--font-display)" }}>No wishlist items</h3>
          <div className="muted">Open marketplace and add products to wishlist.</div>
        </div>
      ) : (
        <div className="market-grid">
          {sorted.map((p, idx) => (
            <article key={`${normalizeUrl(p.product_url)}-${idx}`} className="market-card">
              {p.image_url ? (
                <img className="market-image" src={p.image_url} alt={p.title} loading="lazy" decoding="async" />
              ) : (
                <div className="market-image market-image-empty">No image</div>
              )}
              <div className="market-body">
                <h3>{p.title}</h3>
                <div className="market-meta">
                  <span>{p.currency || "INR"} {p.price || "-"}</span>
                  <span>{String(p.source || "").toUpperCase()}</span>
                </div>
                <div className="market-actions">
                  <a className="btn" href={normalizeUrl(p.product_url)} target="_blank" rel="noreferrer">Buy now</a>
                  <button className="btn btn-outline" onClick={() => removeItem(p.product_url)}>Remove</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
