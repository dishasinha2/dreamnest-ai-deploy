import { useState } from "react";
import { AdminAPI, ProductsAPI } from "../api/endpoints";

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function Admin() {
  const [secret, setSecret] = useState("");
  const [apps, setApps] = useState([]);
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [liveQuery, setLiveQuery] = useState("modern living room sofa");
  const [liveItems, setLiveItems] = useState([]);
  const [deleteVendorId, setDeleteVendorId] = useState("");
  const [deleteProductId, setDeleteProductId] = useState("");
  const [vendor, setVendor] = useState({
    name: "",
    city: "",
    service_types: "interior,carpentry",
    phone: "",
    whatsapp: "",
    website: "",
    about: "",
    years_exp: 3,
    portfolio: "",
    files: []
  });

  async function loadApps() {
    setError("");
    try {
      const res = await AdminAPI.listApplications(secret);
      setApps(res);
    } catch (e) {
      setError(String(e.message || e));
    }
  }

  async function approve(id) {
    setError("");
    try {
      await AdminAPI.approveApplication(id, secret);
      await loadApps();
    } catch (e) {
      setError(String(e.message || e));
    }
  }

  async function reject(id) {
    setError("");
    try {
      await AdminAPI.rejectApplication(id, secret);
      await loadApps();
    } catch (e) {
      setError(String(e.message || e));
    }
  }

  async function createVendor(e) {
    e.preventDefault();
    setError("");
    try {
      let uploaded = [];
      if (vendor.files.length) {
        for (const f of vendor.files) {
          const fd = new FormData();
          fd.append("image", f);
          const res = await AdminAPI.uploadVendorImage(fd, secret);
          uploaded.push(res.url);
        }
      }
      await AdminAPI.createVendor(
        {
          ...vendor,
          service_types: vendor.service_types.split(",").map(s => s.trim()).filter(Boolean),
          portfolio: [
            ...vendor.portfolio
            .split(",")
            .map(s => s.trim())
            .filter(Boolean)
            .map((url) => ({ image_url: url, title: "Portfolio" })),
            ...uploaded.map((u) => ({ image_url: u, title: "Portfolio" }))
          ]
        },
        secret
      );
      setVendor({ ...vendor, name: "", phone: "", whatsapp: "", website: "", about: "", portfolio: "", files: [] });
    } catch (e) {
      setError(String(e.message || e));
    }
  }

  async function loadAnalytics() {
    setError("");
    try {
      const res = await AdminAPI.analytics(secret);
      setAnalytics(res);
    } catch (e) {
      setError(String(e.message || e));
    }
  }

  async function loadLive() {
    setError("");
    try {
      const res = await ProductsAPI.live({ q: liveQuery });
      setLiveItems(res.results || []);
    } catch (e) {
      setError(String(e.message || e));
    }
  }

  async function ingestLive() {
    setError("");
    try {
      const items = liveItems.map((p) => ({
        name: p.title,
        brand: p.source,
        category: "furniture",
        room_type: "living_room",
        style: "modern",
        price_inr: p.price || null,
        product_url: p.product_url,
        image_url: p.image_url,
        description: null,
        tags: [],
        source: "live"
      }));
      const res = await AdminAPI.ingestProducts(items, secret);
      setError(`Ingested ${res.inserted} products`);
    } catch (e) {
      setError(String(e.message || e));
    }
  }

  async function removeVendor() {
    setError("");
    try {
      await AdminAPI.deleteVendor(deleteVendorId, secret);
      setDeleteVendorId("");
    } catch (e) {
      setError(String(e.message || e));
    }
  }

  async function removeProduct() {
    setError("");
    try {
      await AdminAPI.deleteProduct(deleteProductId, secret);
      setDeleteProductId("");
    } catch (e) {
      setError(String(e.message || e));
    }
  }

  return (
    <div className="container">
      <div className="nav">
        <div className="nav-brand">
          <span style={{ color: "var(--accent)" }}>Dream</span>Nest Admin
        </div>
        <div className="nav-actions">
          <a className="btn btn-outline" href="/dashboard">Dashboard</a>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontFamily: "var(--font-display)" }}>Admin secret</h3>
        <div className="grid" style={{ gridTemplateColumns: "1fr auto", alignItems: "center" }}>
          <input
            className="input"
            placeholder="Enter ADMIN_SECRET"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-outline" onClick={loadApps}>Load applications</button>
            <button className="btn btn-outline" onClick={loadAnalytics}>Load analytics</button>
          </div>
        </div>
        {error && <div className="muted" style={{ marginTop: 8 }}>{error}</div>}
      </div>

      {analytics && (
        <div className="card" style={{ marginTop: 18 }}>
          <h3 style={{ fontFamily: "var(--font-display)" }}>Analytics</h3>
          <div className="grid grid-3">
            <div className="card" style={{ boxShadow: "none" }}>Users: {analytics.totals.users}</div>
            <div className="card" style={{ boxShadow: "none" }}>Projects: {analytics.totals.projects}</div>
            <div className="card" style={{ boxShadow: "none" }}>Vendors: {analytics.totals.vendors}</div>
            <div className="card" style={{ boxShadow: "none" }}>Products: {analytics.totals.products}</div>
          </div>
          <div className="grid" style={{ marginTop: 12 }}>
            <div className="muted">Top products by clicks</div>
            {analytics.topProducts.map((p) => (
              <div key={p.id} className="card" style={{ boxShadow: "none" }}>
                <div style={{ fontFamily: "var(--font-display)" }}>{p.name}</div>
                <div className="muted">Clicks: {p.clicks}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-2" style={{ marginTop: 18 }}>
        <div className="card">
          <h3 style={{ fontFamily: "var(--font-display)" }}>Vendor applications</h3>
          <div className="grid">
            {apps.map((a) => (
              <div key={a.id} className="card" style={{ boxShadow: "none" }}>
                <div style={{ fontFamily: "var(--font-display)" }}>{a.name}</div>
                <div className="muted">{a.city} - {a.years_exp} yrs</div>
                <div className="muted">Services: {(a.service_types || []).join(", ")}</div>
                <div className="muted">Status: {a.status}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn" onClick={() => approve(a.id)}>Approve</button>
                  <button className="btn btn-outline" onClick={() => reject(a.id)}>Reject</button>
                </div>
              </div>
            ))}
            {!apps.length && <div className="muted">No applications loaded.</div>}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontFamily: "var(--font-display)" }}>Add vendor directly</h3>
          <form onSubmit={createVendor} className="grid">
            <input className="input" placeholder="Business name" value={vendor.name} onChange={(e) => setVendor({ ...vendor, name: e.target.value })} />
            <input className="input" placeholder="City" value={vendor.city} onChange={(e) => setVendor({ ...vendor, city: e.target.value })} />
            <input className="input" placeholder="Services (comma separated)" value={vendor.service_types} onChange={(e) => setVendor({ ...vendor, service_types: e.target.value })} />
            <input className="input" placeholder="Phone" value={vendor.phone} onChange={(e) => setVendor({ ...vendor, phone: e.target.value })} />
            <input className="input" placeholder="WhatsApp" value={vendor.whatsapp} onChange={(e) => setVendor({ ...vendor, whatsapp: e.target.value })} />
            <input className="input" placeholder="Website" value={vendor.website} onChange={(e) => setVendor({ ...vendor, website: e.target.value })} />
            <input className="input" placeholder="Portfolio image URLs (comma separated)" value={vendor.portfolio} onChange={(e) => setVendor({ ...vendor, portfolio: e.target.value })} />
            <input
              className="input"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setVendor({ ...vendor, files: Array.from(e.target.files || []) })}
            />
            <textarea className="textarea" placeholder="About" value={vendor.about} onChange={(e) => setVendor({ ...vendor, about: e.target.value })} />
            <input className="input" placeholder="Years experience" type="number" value={vendor.years_exp} onChange={(e) => setVendor({ ...vendor, years_exp: e.target.value })} />
            <button className="btn" type="submit">Create vendor</button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ fontFamily: "var(--font-display)" }}>Live product ingest</h3>
          <div className="grid">
            <input className="input" placeholder="Search query" value={liveQuery} onChange={(e) => setLiveQuery(e.target.value)} />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-outline" onClick={loadLive}>Search live</button>
              <button className="btn" onClick={ingestLive}>Ingest to DB</button>
            </div>
            <div className="grid">
              {liveItems.slice(0, 6).map((p, idx) => {
                const img = p.image_url
                  ? (p.image_url.startsWith("http") ? p.image_url : `${BASE}${p.image_url}`)
                  : "";
                return (
                  <div key={`${p.product_url}-${idx}`} className="card" style={{ boxShadow: "none" }}>
                    {img && <img src={img} alt={p.title} style={{ width: "100%", borderRadius: 12 }} />}
                  <div style={{ fontFamily: "var(--font-display)" }}>{p.title}</div>
                  <div className="muted">{p.currency} {p.price || "-"}</div>
                  </div>
                );
              })}
              {!liveItems.length && <div className="muted">No live items loaded.</div>}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontFamily: "var(--font-display)" }}>Admin actions</h3>
          <div className="grid">
            <div className="card" style={{ boxShadow: "none" }}>
              <div className="muted">Delete vendor by ID</div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input className="input" placeholder="Vendor ID" value={deleteVendorId} onChange={(e) => setDeleteVendorId(e.target.value)} />
                <button className="btn btn-outline" onClick={removeVendor}>Delete</button>
              </div>
            </div>
            <div className="card" style={{ boxShadow: "none" }}>
              <div className="muted">Delete product by ID</div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input className="input" placeholder="Product ID" value={deleteProductId} onChange={(e) => setDeleteProductId(e.target.value)} />
                <button className="btn btn-outline" onClick={removeProduct}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
