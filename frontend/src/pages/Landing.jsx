import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import AmbientCanvas from "../components/AmbientCanvas";
import SiteFooter from "../components/SiteFooter";

const stagger = { show: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

export default function Landing() {
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1300);
    return () => clearTimeout(t);
  }, []);

  function toggleTheme() {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    localStorage.setItem("dreamnest_theme", next);
  }

  return (
    <div className="container landing-shell">
      <div className="landing-bg-layer landing-bg-mesh ambient-panel" aria-hidden="true">
        <AmbientCanvas variant="gold" mode="full" intensity={0.8} />
      </div>
      <div className="landing-bg-layer landing-bg-particles ambient-panel" aria-hidden="true">
        <AmbientCanvas variant="default" mode="full" intensity={1} />
      </div>
      <div className="landing-bg-layer landing-bg-glow ambient-panel" aria-hidden="true">
        <AmbientCanvas variant="green" mode="full" intensity={0.65} />
      </div>
      <div className="landing-aura landing-aura-1" aria-hidden="true" />
      <div className="landing-aura landing-aura-2" aria-hidden="true" />
      <div className="landing-grid" aria-hidden="true" />
      {showSplash && (
        <div className="splash">
          <div className="splash-title">DreamNest</div>
        </div>
      )}
      <motion.div initial="hidden" animate="show" variants={stagger}>
        <motion.div variants={item} className="nav landing-nav">
          <div className="nav-brand">
            <span style={{ color: "var(--accent)" }}>Dream</span>Nest AI
          </div>
          <div className="nav-actions">
            <a className="btn btn-outline" href="/auth">Login / Signup</a>
            <a className="btn btn-outline" href="/about">Our Studio</a>
            <a className="btn btn-accent3" href="/vendors">For Vendors</a>
            <button className="btn btn-outline" onClick={toggleTheme}>Theme</button>
          </div>
        </motion.div>

        <motion.section variants={item} className="studio-hero landing-hero-clean">
          <div className="card studio-intro reveal-block landing-panel landing-copy-panel">
            <div className="studio-kicker">Interior Design Studio Workflow</div>
            <h1>
              Build a <span className="landing-highlight">designer-grade</span>
              <br />
              home interior website
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
            <div className="landing-copy-metrics">
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
            <div className="landing-copy-signals">
              <span>Editorial visuals</span>
              <span>AI room concepts</span>
              <span>Vendor-ready outputs</span>
            </div>
          </div>

          <div className="card landing-stage-panel ambient-panel reveal-block">
            <AmbientCanvas variant="gold" mode="panel" intensity={0.9} />
            <div className="landing-status-badge">AI Rendering Room</div>
            <div className="landing-stage-frame">
              <div className="landing-stage-main-wrap">
                <img
                  src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1400&auto=format&fit=crop"
                  alt="Interior moodboard style space"
                  decoding="async"
                  className="landing-stage-main"
                />
                <div className="landing-stage-caption">
                  <strong>Signature Living Concept</strong>
                  <span>Warm palette, clean circulation, layered textures</span>
                </div>
              </div>
              <div className="landing-stage-stack">
                <div className="landing-stage-secondary">
                  <img
                    src="https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=1200&auto=format&fit=crop"
                    alt="Living room styling"
                    loading="lazy"
                    decoding="async"
                  />
                  <span>Studio moodboard</span>
                </div>
                <div className="landing-stage-secondary landing-stage-secondary-tall">
                  <img
                    src="https://images.unsplash.com/photo-1617104551722-3b2d51366464?q=80&w=1200&auto=format&fit=crop"
                    alt="Designer living room setup"
                    loading="lazy"
                    decoding="async"
                  />
                  <span>Designer-ready setup</span>
                </div>
              </div>
            </div>
            <div className="landing-stage-stats">
              <div className="landing-stage-metric">
                <span>Budget Utilized</span>
                <strong>{"\u20B9"}2.4L</strong>
                <small>of {"\u20B9"}3L total budget</small>
              </div>
              <div className="landing-stage-metric">
                <span>Style Match</span>
                <strong>98%</strong>
                <small>Scandinavian · Minimal</small>
              </div>
              <div className="landing-stage-metric">
                <span>Design Score</span>
                <strong>A+</strong>
                <small>Client presentation ready</small>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section variants={item} className="landing-feature-strip">
          {[
            "Moodboard-style visual references",
            "Budget split with practical categories",
            "Live product links from multiple stores",
            "Pinterest-ready inspiration keywords"
          ].map((n) => (
            <div key={n} className="landing-feature-pill">{n}</div>
          ))}
        </motion.section>

        <motion.section variants={item} className="landing-marquee-wrap">
          <div className="landing-marquee">
            {[
              "Moodboard-style visual references",
              "Budget split with practical categories",
              "Live product links from multiple stores",
              "Pinterest-ready inspiration keywords",
              "Room-by-room design presentations"
            ]
              .concat([
                "Moodboard-style visual references",
                "Budget split with practical categories",
                "Live product links from multiple stores",
                "Pinterest-ready inspiration keywords",
                "Room-by-room design presentations"
              ])
              .map((text, idx) => (
                <span key={`${text}-${idx}`}>{text}</span>
              ))}
          </div>
        </motion.section>

        <motion.section variants={item} className="card studio-section reveal-block landing-panel">
          <div className="landing-section-head">
            <div className="studio-kicker">Studio Services</div>
          </div>
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

        <motion.section variants={item} className="card studio-section reveal-block landing-panel">
          <div className="landing-section-head">
            <div className="studio-kicker">Project Workflow</div>
          </div>
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

        <motion.section variants={item} className="card studio-section reveal-block landing-panel">
          <div className="landing-section-head">
            <div className="studio-kicker">Portfolio Atmosphere</div>
          </div>
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

        <motion.section variants={item} className="studio-cta reveal-block landing-cta-panel">
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
        <motion.div variants={item}>
          <SiteFooter />
        </motion.div>
      </motion.div>
    </div>
  );
}
