import { motion } from "framer-motion";
import AmbientCanvas from "../components/AmbientCanvas";
import SiteFooter from "../components/SiteFooter";

const stagger = { show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function About() {
  const features = [
    {
      title: "Budget Blueprint",
      desc: "AI budget split by category with practical cost ranges and priority mapping."
    },
    {
      title: "Real Product Links",
      desc: "Furniture suggestions with direct buy links from real marketplaces."
    },
    {
      title: "Local Vendor Match",
      desc: "City-based vendor discovery with portfolios, ratings, and contact options."
    },
    {
      title: "Vision + Pinterest",
      desc: "Upload your wall or room image and get decor direction plus Pinterest keywords."
    }
  ];

  const benefits = [
    "Actionable output, not only ideas",
    "Studio-style planning flow",
    "Budget and execution visibility",
    "Local-first implementation support"
  ];

  const steps = [
    { n: "01", t: "Define brief", d: "Room type, area, style, location, and budget." },
    { n: "02", t: "Generate plan", d: "Budget split, shopping guidance, and decor direction." },
    { n: "03", t: "Execute smart", d: "Shortlist products and connect vendors with confidence." }
  ];

  const useCases = [
    "New apartment setup",
    "Single-room redesign under fixed budget",
    "Rental upgrade without structural work",
    "Premium-looking home office",
    "Kids room with practical storage",
    "Compact studio optimization"
  ];

  return (
    <div className="container about-page about-page-v2">
      <div className="landing-bg-layer landing-bg-mesh ambient-panel" aria-hidden="true">
        <AmbientCanvas variant="gold" mode="full" intensity={0.92} />
      </div>
      <div className="landing-bg-layer landing-bg-particles ambient-panel" aria-hidden="true">
        <AmbientCanvas variant="default" mode="full" intensity={1.05} />
      </div>
      <div className="landing-bg-layer landing-bg-glow ambient-panel" aria-hidden="true">
        <AmbientCanvas variant="green" mode="full" intensity={0.78} />
      </div>
      <div className="landing-aura landing-aura-1" aria-hidden="true" />
      <div className="landing-aura landing-aura-2" aria-hidden="true" />
      <div className="landing-grid" aria-hidden="true" />

      <motion.div initial="hidden" animate="show" variants={stagger}>
        <motion.div variants={item} className="nav landing-nav about-nav-v2">
          <div className="nav-brand landing-brand-v2">
            Dream Nest AI <span className="landing-brand-mark">✦</span>
          </div>
          <div className="nav-actions about-nav-actions-v2">
            <a className="landing-nav-link-v2" href="/auth">Login</a>
            <span className="landing-nav-divider-v2">/</span>
            <a className="landing-nav-link-v2" href="/auth">Signup</a>
            <a className="btn btn-outline" href="/dashboard">Dashboard</a>
            <a className="btn btn-outline" href="/vendors">Vendors</a>
            <a className="btn btn-outline" href="/feedback">Feedback</a>
          </div>
        </motion.div>

        <motion.section variants={item} className="about-editorial-split">
          <div className="about-editorial-visual rev-l">
            <div className="about-editorial-main-image" />
            <div className="about-editorial-inset-image" />
            <div className="about-editorial-visual-overlay" />
          </div>

          <div className="about-editorial-copy rev-r">
            <div className="hero-kicker-v3">
              <span className="hero-kicker-line-v3" />
              <span className="hero-kicker-text-v3">Why DreamNest</span>
            </div>
            <h1 className="about-editorial-title">
              From vision
              <em> to vetted reality.</em>
            </h1>
            <p className="about-editorial-desc">
              DreamNest turns a room brief into a polished studio workflow: concept direction, budget clarity,
              purchasable sourcing, and city-ready execution support in one place.
            </p>
            <ul className="about-editorial-list">
              {features.concat([
                {
                  title: "Execution Support",
                  desc: "Vendor-friendly notes and implementation guidance that reduce back-and-forth."
                }
              ]).map((feature, index) => (
                <li key={feature.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{feature.title}</strong>
                    <p>{feature.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="about-editorial-actions">
              <a className="btn btn-editorial" href="/auth">Explore Studio</a>
              <a className="btn btn-outline btn-editorial-outline" href="/dashboard">Open Dashboard</a>
            </div>
          </div>
        </motion.section>

        <motion.section variants={item} className="about-editorial-band">
          <div className="about-editorial-band-copy">
            <div className="hero-kicker-v3">
              <span className="hero-kicker-line-v3" />
              <span className="hero-kicker-text-v3">Studio Process</span>
            </div>
            <h2 className="about-editorial-heading">Planning that stays practical, polished, and executable.</h2>
            <p className="about-editorial-desc about-editorial-desc-wide">
              The platform is built to move a room from taste discovery to buy-ready action without losing design quality.
            </p>
          </div>
          <div className="about-editorial-benefits">
            {benefits.map((b) => (
              <div key={b} className="about-editorial-benefit">
                <span className="about-editorial-benefit-dot" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section variants={item} className="about-editorial-process">
          <div className="about-editorial-process-header">
            <div>
              <div className="hero-kicker-v3">
                <span className="hero-kicker-line-v3" />
                <span className="hero-kicker-text-v3">How It Works</span>
              </div>
              <h2 className="about-editorial-heading">A simple workflow with real execution value.</h2>
            </div>
            <p className="about-editorial-process-note">
              Each step reduces uncertainty so users can move from inspiration to buying and implementation with confidence.
            </p>
          </div>
          <div className="about-editorial-process-grid">
            {steps.map((s) => (
              <article key={s.n} className="about-editorial-step">
                <div className="about-editorial-step-number">{s.n}</div>
                <div className="about-editorial-step-title">{s.t}</div>
                <div className="muted">{s.d}</div>
              </article>
            ))}
          </div>
        </motion.section>

        <motion.section variants={item} className="about-editorial-usecases">
          <div className="hero-kicker-v3">
            <span className="hero-kicker-line-v3" />
            <span className="hero-kicker-text-v3">Best-fit Use Cases</span>
          </div>
          <h2 className="about-editorial-heading">Where DreamNest fits best.</h2>
          <div className="about-editorial-usecase-grid">
            {useCases.map((u) => (
              <div key={u} className="about-editorial-usecase">
                {u}
              </div>
            ))}
          </div>
        </motion.section>

        <motion.div variants={item} className="about-bottom-cta about-bottom-cta-v2">
          <a className="btn" href="/auth">Login / Signup</a>
          <a className="btn btn-outline" href="/vendors">Explore Vendors</a>
        </motion.div>

        <motion.div variants={item}>
          <SiteFooter />
        </motion.div>
      </motion.div>
    </div>
  );
}
