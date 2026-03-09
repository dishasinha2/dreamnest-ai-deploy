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
            <a className="btn btn-outline" href="/about">Our Studio</a>
            <a className="btn btn-accent3" href="/vendors">For Vendors</a>
            <button
              className="btn btn-outline"
              onClick={() => {
                const root = document.documentElement;
                const next = root.dataset.theme === "light" ? "dark" : "light";
                root.dataset.theme = next;
                localStorage.setItem("dreamnest_theme", next);
              }}
            >
              Theme
            </button>
          </div>
        </motion.div>

        <motion.section variants={item} className="studio-hero">
          <div className="card studio-intro reveal-block">
            <div className="studio-kicker">Interior Design Studio Workflow</div>
            <h1>
              A designer-grade website
              <br />
              for your home interiors
            </h1>
            <p className="muted">
              DreamNest combines aesthetic direction, budget logic, product sourcing, and vendor execution in one place.
              Build each room like a real interior designer presentation.
            </p>
            <div className="studio-actions">
              <a className="btn" href="/auth">Start New Project</a>
              <a className="btn btn-outline" href="/about">View Studio Process</a>
              <a className="btn btn-outline" href="/feedback">Client Feedback</a>
            </div>
            <div className="studio-notes">
              {[
                "Moodboard-style visual references",
                "Budget split with practical categories",
                "Live product links from multiple stores",
                "Pinterest-ready inspiration keywords"
              ].map((n) => (
                <div key={n} className="studio-note muted">{n}</div>
              ))}
            </div>
            <div className="studio-metric-row">
              <div className="studio-metric">
                <div className="value">20+</div>
                <div className="muted">Room categories</div>
              </div>
              <div className="studio-metric">
                <div className="value">220</div>
                <div className="muted">Product links per run</div>
              </div>
              <div className="studio-metric">
                <div className="value">1</div>
                <div className="muted">Unified workflow</div>
              </div>
            </div>
          </div>
          <div className="card studio-visual reveal-block">
            <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1400&auto=format&fit=crop" alt="Interior moodboard style space" decoding="async" />
            <img src="https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=1200&auto=format&fit=crop" alt="Living room styling" loading="lazy" decoding="async" />
            <img src="https://images.unsplash.com/photo-1617104551722-3b2d51366464?q=80&w=1200&auto=format&fit=crop" alt="Designer living room setup" loading="lazy" decoding="async" />
          </div>
        </motion.section>

        <motion.section variants={item} className="card studio-section reveal-block">
          <h2>Studio Services</h2>
          <div className="studio-service-grid">
            {[
              { t: "Concept + Moodboards", d: "Generate room concepts, design language, and Pinterest-driven references in minutes." },
              { t: "Procurement Planning", d: "Find real ecommerce links, compare options, and balance spend by category." },
              { t: "Execution Coordination", d: "Shortlist city-based vendors with portfolio context and move from idea to install." }
            ].map((s) => (
              <article key={s.t} className="studio-service">
                <h3>{s.t}</h3>
                <div className="muted">{s.d}</div>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section variants={item} className="card studio-section reveal-block">
          <h2>How A Project Moves</h2>
          <div className="studio-process">
            {[
              ["01", "Brief", "Define room type, area, style, city, and budget."],
              ["02", "Design Direction", "Get layout guidance, visual cues, and decor ideas."],
              ["03", "Sourcing", "Pull live product links and shortlist market-ready options."],
              ["04", "Execution", "Connect with vendors and track project progress."]
            ].map(([n, t, d]) => (
              <article key={n} className="studio-step">
                <div className="num">{n}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28 }}>{t}</div>
                <div className="muted">{d}</div>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section variants={item} className="card studio-section reveal-block">
          <h2>Portfolio Atmosphere</h2>
          <div className="studio-gallery">
            {[
              "https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=1200&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1616594039964-3ad2f516f4c5?q=80&w=1200&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?q=80&w=1200&auto=format&fit=crop",
              "https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=1200&auto=format&fit=crop"
            ].map((src) => (
              <img key={src} src={src} alt="Interior design portfolio" loading="lazy" decoding="async" />
            ))}
          </div>
        </motion.section>

        <motion.section variants={item} className="studio-cta reveal-block">
          <h3>Make Your Home Feel Designer-Planned</h3>
          <p className="muted" style={{ maxWidth: 760, margin: "0 auto 16px" }}>
            DreamNest is built like an interior design website first, then powered by AI for speed.
            Start your room and generate a complete direction instantly.
          </p>
          <div className="studio-actions" style={{ justifyContent: "center", marginTop: 0 }}>
            <a className="btn" href="/auth">Start Designing</a>
            <a className="btn btn-outline" href="/vendors">Explore Vendors</a>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}
