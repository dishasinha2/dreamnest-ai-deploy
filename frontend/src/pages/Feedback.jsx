import { useState } from "react";
import { motion } from "framer-motion";
import { FeedbackAPI } from "../api/endpoints";
import SiteFooter from "../components/SiteFooter";

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
    } catch (err) {
      setStatus(String(err.message || err));
    }
  }

  return (
    <div className="container landing-shell page-shell-v2 feedback-page-v2">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <div className="nav landing-nav page-nav-v2">
          <div className="nav-brand landing-brand-v2">Dream Nest AI</div>
          <div className="nav-actions">
            <a className="btn btn-outline" href="/dashboard">Dashboard</a>
            <a className="btn btn-outline" href="/vendors">Vendors</a>
            <a className="btn btn-outline" href="/about">Studio</a>
          </div>
        </div>

        <section className="feedback-stage-v2">
          <div className="card landing-panel feedback-copy-v2">
            <div className="studio-kicker">Feedback Loop</div>
            <h1 className="feedback-title-v2">Tell us where DreamNest should get sharper</h1>
            <p className="muted">
              Share what felt clear, where the planning flow lagged, and what would make the product more useful in real interior work.
            </p>
            <div className="feedback-points-v2">
              <div className="feedback-point-v2">
                <strong>Product clarity</strong>
                <span className="muted">UI friction, navigation gaps, and workflow confusion.</span>
              </div>
              <div className="feedback-point-v2">
                <strong>AI usefulness</strong>
                <span className="muted">Budget split quality, sourcing accuracy, and vendor relevance.</span>
              </div>
              <div className="feedback-point-v2">
                <strong>Execution quality</strong>
                <span className="muted">Loading speed, polish, and how well decisions move toward execution.</span>
              </div>
            </div>
          </div>

          <div className="card landing-panel feedback-form-v2">
            <h2 style={{ fontFamily: "var(--font-display)" }}>Feedback</h2>
            <p className="muted">Tell us what worked, what didn&apos;t, and how DreamNest can improve.</p>
            <form onSubmit={submit} className="grid">
              <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className="input" type="number" min="1" max="5" placeholder="Rating (1-5)" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
              <textarea className="textarea" placeholder="Your feedback" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              <button className="btn btn-accent2" type="submit">Send feedback</button>
            </form>
            {status && <div className="muted" style={{ marginTop: 10 }}>{status}</div>}
          </div>
        </section>

        <SiteFooter />
      </motion.div>
    </div>
  );
}
