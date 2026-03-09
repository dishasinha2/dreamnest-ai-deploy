import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { VendorsAPI } from "../api/endpoints";
import { useAuth } from "../hooks/useAuth";

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function normalizeUrl(url) {
  if (!url) return "";
  const t = String(url).trim();
  if (!t) return "";
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  return `https://${t}`;
}

export default function VendorProfile() {
  const { id } = useParams();
  const { token } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [error, setError] = useState("");
  const [review, setReview] = useState({ rating: 5, comment: "" });

  useEffect(() => {
    VendorsAPI.get(id)
      .then(setVendor)
      .catch((e) => setError(String(e.message || e)));
  }, [id]);

  if (error) {
    return (
      <div className="container">
        <div className="card">{error}</div>
      </div>
    );
  }
  if (!vendor) {
    return (
      <div className="container">
        <div className="card">Loading vendor...</div>
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
          <a className="btn btn-outline" href="/vendors">Back to Vendors</a>
          <a className="btn btn-outline" href="/feedback">Feedback</a>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontFamily: "var(--font-display)" }}>{vendor.name}</h2>
        <div className="muted">{vendor.city} - {vendor.years_exp} yrs</div>
        <div className="muted">Rating {vendor.avg_rating || "-"} ({vendor.review_count || 0})</div>
        <div className="muted">Services: {(vendor.service_types || []).join(", ")}</div>
        {vendor.about && <p className="muted">{vendor.about}</p>}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {vendor.phone && <a className="btn btn-outline" href={`tel:${vendor.phone}`}>Call</a>}
          {vendor.whatsapp && <a className="btn btn-outline" href={`https://wa.me/${String(vendor.whatsapp).replace(/[^0-9]/g, "")}`}>WhatsApp</a>}
          {vendor.website && <a className="btn btn-outline" href={normalizeUrl(vendor.website)} target="_blank" rel="noreferrer">Website</a>}
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 18 }}>
        <div className="card">
          <h3 style={{ fontFamily: "var(--font-display)" }}>Portfolio</h3>
          <div className="grid grid-3">
            {(vendor.portfolio || []).map((p) => {
              const img = p.image_url?.startsWith("http") ? p.image_url : `${BASE}${p.image_url}`;
              return (
                <img key={p.id} src={img} alt={p.title} loading="lazy" decoding="async" style={{ width: "100%", borderRadius: 14 }} />
              );
            })}
            {!vendor.portfolio?.length && <div className="muted">No portfolio yet.</div>}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontFamily: "var(--font-display)" }}>Reviews</h3>
          {token ? (
            <div className="card" style={{ boxShadow: "none", marginBottom: 12 }}>
              <div className="section-sub">Leave a review</div>
              <div className="grid">
                <input
                  className="input"
                  type="number"
                  min="1"
                  max="5"
                  placeholder="Rating (1-5)"
                  value={review.rating}
                  onChange={(e) => setReview({ ...review, rating: e.target.value })}
                />
                <textarea
                  className="textarea"
                  placeholder="Your feedback"
                  value={review.comment}
                  onChange={(e) => setReview({ ...review, comment: e.target.value })}
                />
                <button
                  className="btn btn-accent2"
                  onClick={async () => {
                    try {
                      await VendorsAPI.review(vendor.id, review, token);
                      const fresh = await VendorsAPI.get(id);
                      setVendor(fresh);
                      setReview({ rating: 5, comment: "" });
                    } catch (e) {
                      setError(String(e.message || e));
                    }
                  }}
                >
                  Submit review
                </button>
              </div>
            </div>
          ) : (
            <div className="muted" style={{ marginBottom: 10 }}>Login to leave a review.</div>
          )}
          <div className="grid">
            {(vendor.reviews || []).map((r) => (
              <div key={r.id} className="card" style={{ boxShadow: "none" }}>
                <div style={{ fontFamily: "var(--font-display)" }}>{r.reviewer_name || "User"}</div>
                <div className="muted">Rating {r.rating}</div>
                <div className="muted">{r.comment}</div>
              </div>
            ))}
            {!vendor.reviews?.length && <div className="muted">No reviews yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
