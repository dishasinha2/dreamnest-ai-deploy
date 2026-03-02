import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const stagger = { show: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

export default function Landing() {
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="container">
      {showSplash && (
        <div className="splash">
          <div className="splash-title">DreamNest</div>
        </div>
      )}
      <motion.div initial="hidden" animate="show" variants={stagger}>
        <motion.div variants={item} className="nav">
          <div className="nav-brand">
            <span style={{ color: "var(--accent)" }}>Dream</span>Nest AI
          </div>
          <div className="nav-actions">
            <a className="btn btn-outline" href="/auth">Login / Signup</a>
            <a className="btn btn-accent3" href="/vendors">Continue as Vendor</a>
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
        </motion.div>

        <motion.div variants={item} className="hero-wrap hero-center reveal-block">
          <div className="hero-spark" />
          <div className="hero-burst" />
          <div className="hero-ring">
            <span>DreamNest</span>
          </div>
          <motion.h1 variants={item} className="hero-title">
            <span className="dream-start">DreamNest AI</span>
            <br />
            Design your home with a real studio workflow.
          </motion.h1>
          <motion.p variants={item} className="hero-sub muted">
            Budget + location + aesthetics {"->"} AI layout plan, real product links, and local vendors.
            Upload a room image {"->"} decor ideas + Pinterest keywords.
          </motion.p>
          <div className="pill-row">
            {["Budget plan", "Furniture links", "Local vendors", "Vision ideas", "Chatbot progress"].map((t) => (
              <div key={t} className="feature-pill">{t}</div>
            ))}
          </div>
          <div className="icon-row">
            {[
              { t: "Studio plan", svg: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h10M4 17h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>) },
              { t: "Visual ideas", svg: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 12s3-5 9-5 9 5 9 5-3 5-9 5-9-5-9-5Z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="2"/></svg>) },
              { t: "Budget split", svg: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M7 6v12M17 6v12M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>) },
              { t: "Local vendors", svg: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 21s6-5 6-10a6 6 0 1 0-12 0c0 5 6 10 6 10Z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="2"/></svg>) }
            ].map((x) => (
              <div key={x.t} className="icon-chip">
                <i>{x.svg}</i>
                {x.t}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.p variants={item} className="hero-sub muted">
          Enter requirements, get a budget split and real product links, plus local vendors with
          ratings and previous work. Upload a room image to receive decor ideas and Pinterest
          search keywords.
        </motion.p>

        <motion.div variants={item} style={{ display: "flex", gap: 14, marginTop: 24, justifyContent: "center", flexWrap: "wrap" }}>
          <a className="btn" href="/auth">Start as Customer</a>
          <a className="btn btn-outline" href="/about">Why DreamNest</a>
          <a className="btn btn-outline" href="/feedback">Feedback</a>
        </motion.div>

        <motion.div variants={item} className="card soft-glow reveal-block" style={{ marginTop: 32 }}>
          <div className="card-grid reveal-stagger">
            {[
              { t: "Budget split", d: "Clear allocation for furniture, decor, lighting." },
              { t: "Real product links", d: "Click to buy from real e-commerce stores." },
              { t: "Vendor portfolios", d: "Verified local vendors with ratings." }
            ].map((c) => (
              <div key={c.t} className="glass-panel">
                <div className="badge">{c.t}</div>
                <div className="muted" style={{ marginTop: 10, fontSize: 18 }}>{c.d}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="card reveal-block" style={{ marginTop: 28 }}>
          <div className="intro-grid">
            <div>
              <div className="section-title">What DreamNest does</div>
              <p className="muted">
                DreamNest transforms your space planning into a clear, guided studio flow:
                you enter budget, location, room type, and aesthetics. The AI builds a layout plan,
                recommends furniture with real purchase links, and shows local vendors you can contact.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                {["Budget + Style input", "AI layout plan", "Live purchase links", "Local vendors", "Vision ideas", "Progress chatbot"].map((f) => (
                  <div key={f} className="feature-pill">{f}</div>
                ))}
              </div>
            </div>
            <div className="intro-images">
              <img src="https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop" alt="Living room" />
              <img src="https://images.unsplash.com/photo-1502005097973-6a7082348e28?q=80&w=1200&auto=format&fit=crop" alt="Bedroom" />
              <img src="https://images.unsplash.com/photo-1501876725168-00c445821c9e?q=80&w=1200&auto=format&fit=crop" alt="Studio" />
              <img src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop" alt="Desk" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={item} className="card reveal-block" style={{ marginTop: 20 }}>
          <div className="section-title">Expanded Design Library</div>
          <p className="muted">More room types and aesthetics are now supported in project creation for better personalization.</p>
          <div className="pill-row">
            {["Home Theatre", "Terrace", "Walk-in Closet", "Gaming Room", "Mid-century", "Wabi-sabi", "Mediterranean", "Minimal Luxe"].map((x) => (
              <div key={x} className="feature-pill">{x}</div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="section parallax-band reveal-block">
          <div className="parallax-content">
            <div className="section-title">From idea to execution</div>
            <p className="muted">
              We don't stop at inspiration. DreamNest connects you to real products and real vendors.
              One workflow, start to finish.
            </p>
            <div className="pill-row">
              <div className="feature-pill">Studio-grade planning</div>
              <div className="feature-pill">Vendor-ready specs</div>
              <div className="feature-pill">Buy links in one click</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
