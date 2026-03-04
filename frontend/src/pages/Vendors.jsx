import { useEffect, useState } from "react";
import { VendorsAPI } from "../api/endpoints";
import { useAuth } from "../hooks/useAuth";

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function Vendors() {
  const { token } = useAuth();
  const [city, setCity] = useState("");
  const [vendors, setVendors] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [step, setStep] = useState(0);
  const [previews, setPreviews] = useState([]);
  const [apply, setApply] = useState({
    name: "",
    city: "",
    service_types: "interior,carpentry",
    phone: "",
    whatsapp: "",
    website: "",
    about: "",
    years_exp: 2,
    portfolio_links: "",
    files: []
  });

  useEffect(() => {
    VendorsAPI.list(city ? { city, include_external: "1" } : {})
      .then(setVendors)
      .catch((e) => setError(String(e.message || e)));
  }, [city]);

  function normalizeUrl(url) {
    if (!url) return "";
    const t = String(url).trim();
    if (!t) return "";
    if (t.startsWith("http://") || t.startsWith("https://")) return t;
    return `https://${t}`;
  }

  async function submitApply(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    try {
      if (apply.files.length) {
        const fd = new FormData();
        fd.append("name", apply.name);
        fd.append("city", apply.city);
        fd.append("service_types", apply.service_types);
        fd.append("phone", apply.phone);
        fd.append("whatsapp", apply.whatsapp);
        fd.append("website", apply.website);
        fd.append("about", apply.about);
        fd.append("years_exp", String(apply.years_exp || 0));
        for (const f of apply.files) fd.append("images", f);
        await VendorsAPI.applyForm(fd);
      } else {
        await VendorsAPI.apply({
          ...apply,
          service_types: apply.service_types.split(",").map((s) => s.trim()).filter(Boolean),
          portfolio_links: apply.portfolio_links.split(",").map((s) => s.trim()).filter(Boolean)
        });
      }
      setApply({ ...apply, name: "", phone: "", whatsapp: "", website: "", about: "", portfolio_links: "", files: [] });
      setPreviews([]);
      setStep(0);
      setNotice("Application submitted. We will review it soon.");
      if (city) {
        const next = await VendorsAPI.list({ city, include_external: "1" });
        setVendors(next);
      }
    } catch (err) {
      setError(String(err.message || err));
    }
  }

  return (
    <div className="container">
      <div className="nav">
        <div className="nav-brand">
          <span style={{ color: "var(--accent)" }}>Dream</span>Nest AI
        </div>
        <div className="nav-actions">
          <a className="btn btn-outline" href="/">Continue as Customer</a>
          <button
            className="btn btn-outline"
            onClick={() => {
              const root = document.documentElement;
              root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
            }}
          >
            Theme
          </button>
        </div>
      </div>

      <div className="card" style={{ borderColor: "rgba(42,229,192,.45)" }}>
        <h2 style={{ fontFamily: "var(--font-display)" }}>Vendor Marketplace</h2>
        <p className="muted">Vendor-only area. Register your studio to get customer projects.</p>
        <div className="icon-row" style={{ justifyContent: "flex-start" }}>
          {[
            { t: "Leads", svg: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h12M4 17h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>) },
            { t: "Portfolio", svg: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 7h18v10H3z" stroke="currentColor" strokeWidth="2"/><path d="M7 7V5h10v2" stroke="currentColor" strokeWidth="2"/></svg>) },
            { t: "Ratings", svg: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="m12 3 3 6 6 .9-4.5 4.4 1 6.4L12 17l-5.5 3.7 1-6.4L3 9.9 9 9l3-6Z" stroke="currentColor" strokeWidth="2"/></svg>) }
          ].map((x)=>(
            <div key={x.t} className="icon-chip">
              <i>{x.svg}</i>
              {x.t}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 18 }}>
        <div className="card">
          <h3 style={{ fontFamily: "var(--font-display)" }}>Local vendors</h3>
          <input
            className="input"
            placeholder="Filter by city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <div className="grid" style={{ marginTop: 14 }}>
            {vendors.map((v) => (
              <div key={v.id} className="card" style={{ boxShadow: "none" }}>
                <div style={{ fontFamily: "var(--font-display)" }}>{v.name}</div>
                <div className="muted">{v.city} - {v.years_exp} yrs</div>
                <div className="muted">Rating {v.avg_rating || "-"} ({v.review_count || 0})</div>
                <div className="muted">Services: {(v.service_types || []).join(", ")}</div>
                {v.external && <div className="badge">Live vendor</div>}
                {v.website && (
                  <a className="btn btn-outline" href={normalizeUrl(v.website)} target="_blank" rel="noreferrer">
                    {v.external ? "Open vendor site" : "Visit site"}
                  </a>
                )}
                {v.external ? (
                  <a
                    className="btn btn-outline"
                    href={normalizeUrl(v.maps_url || `https://www.google.com/maps/search/${encodeURIComponent(`${v.name} ${v.city || ""}`)}`)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open on maps
                  </a>
                ) : (
                  <a className="btn btn-outline" href={`/vendor/${v.id}`}>View profile</a>
                )}
                {!!v.portfolio?.length && (
                  <div style={{ marginTop: 10 }}>
                    <div className="muted">Portfolio</div>
                    <div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                      {v.portfolio.map((p) => {
                        const img = p.image_url?.startsWith("http") ? p.image_url : `${BASE}${p.image_url}`;
                        return <img key={p.image_url} src={img} alt={p.title} style={{ width: "100%", borderRadius: 12 }} />;
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {!vendors.length && <div className="muted">No vendors yet.</div>}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontFamily: "var(--font-display)" }}>Apply as a vendor</h3>
          <div className="glass-panel" style={{ marginBottom: 12 }}>
            <div className="section-sub">Why join DreamNest</div>
            <div className="muted">Get qualified leads and showcase your best work.</div>
          </div>
          <div className="stepper">
            {[0,1,2].map((s)=>(
              <div key={s} className={`step-dot ${step===s ? "active":""}`}>{s+1}</div>
            ))}
          </div>
          <form onSubmit={submitApply} className="grid">
            {step === 0 && (
              <>
                <input className="input" placeholder="Business name" value={apply.name} onChange={(e) => setApply({ ...apply, name: e.target.value })} />
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="input" placeholder="City" value={apply.city} onChange={(e) => setApply({ ...apply, city: e.target.value })} />
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      if (!navigator.geolocation) return;
                      navigator.geolocation.getCurrentPosition(async (pos) => {
                        const { latitude, longitude } = pos.coords;
                        try {
                          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                          const data = await r.json();
                          const cityName =
                            data.address?.city ||
                            data.address?.town ||
                            data.address?.village ||
                            data.address?.state ||
                            "";
                          if (cityName) setApply((p) => ({ ...p, city: cityName }));
                        } catch {}
                      });
                    }}
                  >
                    Detect
                  </button>
                </div>
                <input className="input" placeholder="Services (comma separated)" value={apply.service_types} onChange={(e) => setApply({ ...apply, service_types: e.target.value })} />
                <input className="input" placeholder="Years experience" type="number" value={apply.years_exp} onChange={(e) => setApply({ ...apply, years_exp: e.target.value })} />
              </>
            )}
            {step === 1 && (
              <>
                <input className="input" placeholder="Phone" value={apply.phone} onChange={(e) => setApply({ ...apply, phone: e.target.value })} />
                <input className="input" placeholder="WhatsApp" value={apply.whatsapp} onChange={(e) => setApply({ ...apply, whatsapp: e.target.value })} />
                <input className="input" placeholder="Website" value={apply.website} onChange={(e) => setApply({ ...apply, website: e.target.value })} />
                <textarea className="textarea" placeholder="About" value={apply.about} onChange={(e) => setApply({ ...apply, about: e.target.value })} />
              </>
            )}
            {step === 2 && (
              <>
                <input className="input" placeholder="Portfolio links (comma separated)" value={apply.portfolio_links} onChange={(e) => setApply({ ...apply, portfolio_links: e.target.value })} />
                <input
                  className="input"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setApply({ ...apply, files });
                    setPreviews(files.map((f) => URL.createObjectURL(f)));
                  }}
                />
                {previews.length > 0 && (
                  <div className="preview-grid">
                    {previews.map((src) => (
                      <img key={src} src={src} alt="preview" />
                    ))}
                  </div>
                )}
              </>
            )}
            {error && <div className="muted">{error}</div>}
            {notice && <div className="muted">{notice}</div>}
            <div style={{ display: "flex", gap: 10 }}>
              {step > 0 && (
                <button type="button" className="btn btn-outline" onClick={() => setStep(step - 1)}>Back</button>
              )}
              {step < 2 && (
                <button type="button" className="btn btn-accent2" onClick={() => setStep(step + 1)}>Next</button>
              )}
              {step === 2 && (
                <button className="btn" type="submit">Submit application</button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
