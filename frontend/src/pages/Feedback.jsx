import { useState } from "react";
import { FeedbackAPI } from "../api/endpoints";

export default function Feedback() {
  const [form, setForm] = useState({ name: "", email: "", rating: 5, message: "" });
  const [status, setStatus] = useState("");

  async function submit(e) {
    e.preventDefault();
    setStatus("");
    try {
      await FeedbackAPI.submit(form);
      setForm({ name: "", email: "", rating: 5, message: "" });
      setStatus("Thanks for the feedback!");
    } catch (e) {
      setStatus(String(e.message || e));
    }
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
        </div>
      </div>

      <div className="card" style={{ maxWidth: 720, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "var(--font-display)" }}>Feedback</h2>
        <p className="muted">Tell us what worked, what didn’t, and how DreamNest can improve.</p>
        <form onSubmit={submit} className="grid">
          <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" type="number" min="1" max="5" placeholder="Rating (1-5)" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
          <textarea className="textarea" placeholder="Your feedback" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <button className="btn btn-accent2" type="submit">Send feedback</button>
        </form>
        {status && <div className="muted" style={{ marginTop: 10 }}>{status}</div>}
      </div>
    </div>
  );
}
