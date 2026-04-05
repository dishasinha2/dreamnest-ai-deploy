import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import SiteFooter from "../components/SiteFooter";

const stagger = { show: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } };

const featureTags = [
  "Moodboard-style visual references",
  "Budget split with practical categories",
  "Live product links from multiple stores",
  "Pinterest-ready inspiration keywords"
];

const renderMetrics = [
  {
    icon: "SM",
    title: "Style Match",
    value: "98%",
    meta: "Scandinavian · Minimal",
    progress: 98
  },
  {
    icon: "BU",
    title: "Budget Utilized",
    value: "₹2.4L",
    meta: "of ₹3L total budget",
    progress: 80
  },
  {
    icon: "A+",
    title: "Design Score",
    value: "Client-ready",
    meta: "Presentation quality locked",
    progress: null
  }
];

const serviceCards = [
  {
    icon: "01",
    title: "Concept + Moodboards",
    text: "Generate room concepts, design language, and Pinterest-driven references in minutes."
  },
  {
    icon: "02",
    title: "Procurement Planning",
    text: "Find real ecommerce links, compare options, and balance spend by category."
  },
  {
    icon: "03",
    title: "Execution Coordination",
    text: "Shortlist city-based vendors with portfolio context and move from idea to install."
  }
];

const workflowSteps = [
  ["01", "Brief", "Define room type, area, style, city, and budget."],
  ["02", "Design Direction", "Get layout guidance, visual cues, and decor ideas."],
  ["03", "Sourcing", "Pull live product links and shortlist market-ready options."],
  ["04", "Execution", "Connect with vendors and track project progress."]
];

export default function Landing() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroSlides = [
    "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=1920&q=85",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1920&q=85",
    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1920&q=85",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=85"
  ];

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  function toggleTheme() {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    localStorage.setItem("dreamnest_theme", next);
  }

  return (
    <div className="container landing-shell landing-shell-v2 landing-shell-cinematic">
      {showSplash && (
        <div className="splash">
          <div className="splash-title">DreamNest</div>
        </div>
      )}

      <motion.div initial="hidden" animate="show" variants={stagger}>
        <motion.nav variants={item} className="nav landing-nav landing-nav-v2 app-editorial-nav landing-nav-cinematic">
          <div className="nav-brand landing-brand-v2">
            Dream Nest AI <span className="landing-brand-mark">✦</span>
          </div>
          <div className="nav-actions landing-nav-actions-v2">
            <a className="landing-nav-link-v2" href="/auth">Login</a>
            <span className="landing-nav-divider-v2">/</span>
            <a className="landing-nav-link-v2" href="/auth">Signup</a>
            <a className="btn btn-outline" href="/about">Our Studio</a>
            <a className="landing-nav-link-v2" href="/vendors">For Vendors</a>
            <button className="btn btn-outline nav-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
              ◐
            </button>
          </div>
        </motion.nav>

        <motion.section variants={item} className="landing-hero-editorial landing-hero-cinematic">
          <div className="hero-slides-v3" aria-hidden="true">
            {heroSlides.map((src, index) => (
              <div
                key={src}
                className={`hero-slide-v3 ${index === currentSlide ? "is-active" : ""}`}
                style={{ backgroundImage: `url(${src})` }}
              />
            ))}
          </div>
          <div className="hero-grain-v3" aria-hidden="true" />
          <div className="hero-overlay-v3" aria-hidden="true" />

          <div className="hero-copy-v3">
            <div className="hero-kicker-v3">
              <span className="hero-kicker-line-v3" />
              <span className="hero-kicker-text-v3">AI Powered Interior Studio</span>
            </div>
            <h1 className="hero-title-v3">
              <span>Designer-grade</span>
              <em>home interiors,</em>
              <span className="hero-title-soft-v3">planned beautifully.</span>
            </h1>
            <p className="hero-desc-v3">
              DreamNest brings concept direction, budget clarity, sourcing, and vendor execution into one refined workflow.
              Shape every room with the polish of a designer presentation.
            </p>
            <div className="hero-actions-v3">
              <a className="btn btn-editorial" href="/auth">Start New Project</a>
              <a className="btn btn-outline btn-editorial-outline" href="/about">View Studio Process</a>
              <a className="btn btn-outline btn-editorial-outline" href="/feedback">Client Feedback</a>
            </div>
          </div>

          <div className="hero-dots-v3" aria-label="Hero slides">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`hero-dot-v3 ${index === currentSlide ? "is-active" : ""}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <div className="hero-stats-v3">
            <div className="hero-stat-v3">
              <span className="hero-stat-line-v3" />
              <div>
                <strong>20+</strong>
                <span>Room Categories</span>
              </div>
            </div>
            <div className="hero-stat-v3">
              <span className="hero-stat-line-v3" />
              <div>
                <strong>220</strong>
                <span>Product Links Per Run</span>
              </div>
            </div>
            <div className="hero-stat-v3">
              <span className="hero-stat-line-v3" />
              <div>
                <strong>1</strong>
                <span>Unified Workflow</span>
              </div>
            </div>
            <div className="hero-stat-v3">
              <span className="hero-stat-line-v3" />
              <div>
                <strong>A+</strong>
                <span>Average Design Score</span>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section variants={item} className="landing-section-v2 landing-section-cinematic">
          <div className="landing-section-heading-v2">
            <div className="studio-kicker">AI Rendering Room</div>
            <h2 className="section-title landing-section-title-v2">Live studio metrics for every room direction</h2>
          </div>

          <div className="landing-render-grid-v2">
            {renderMetrics.map((metric) => (
              <motion.article
                key={metric.title}
                className="landing-render-card-v2"
                whileHover={{ y: -6 }}
                transition={{ duration: 0.22 }}
              >
                <div className="landing-render-icon-v2">{metric.icon}</div>
                <h3>{metric.title}</h3>
                <div className="landing-render-value-v2">{metric.value}</div>
                <p>{metric.meta}</p>
                {metric.progress !== null && (
                  <div className="landing-progress-v2">
                    <span style={{ width: `${metric.progress}%` }} />
                  </div>
                )}
              </motion.article>
            ))}
          </div>

          <div className="landing-tags-v2">
            {featureTags.map((tag) => (
              <span key={tag} className="landing-tag-v2">{tag}</span>
            ))}
          </div>
        </motion.section>

        <motion.section variants={item} className="landing-section-v2 landing-section-cinematic">
          <div className="landing-section-heading-v2">
            <div className="studio-kicker">Studio Services</div>
            <h2 className="section-title landing-section-title-v2">Services built like a premium interior studio</h2>
          </div>
          <div className="landing-services-grid-v2">
            {serviceCards.map((service) => (
              <motion.article
                key={service.title}
                className="landing-service-card-v2"
                whileHover={{ y: -6 }}
                transition={{ duration: 0.22 }}
              >
                <div className="landing-service-icon-v2">{service.icon}</div>
                <h3>{service.title}</h3>
                <p className="muted">{service.text}</p>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section variants={item} className="landing-section-v2 landing-section-cinematic">
          <div className="landing-section-heading-v2">
            <div className="studio-kicker">Project Workflow</div>
            <h2 className="section-title landing-section-title-v2">How a project moves from brief to execution</h2>
          </div>
          <div className="landing-workflow-grid-v2">
            {workflowSteps.map(([n, t, d]) => (
              <motion.article
                key={n}
                className="landing-step-card-v2"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="landing-step-number-v2">{n}</div>
                <h3>{t}</h3>
                <p className="muted">{d}</p>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section variants={item} className="landing-portfolio-v2 reveal-block landing-section-cinematic">
          <div className="landing-section-heading-v2">
            <div className="studio-kicker">Portfolio Atmosphere</div>
            <h2 className="section-title landing-section-title-v2">Make your home feel designer-planned</h2>
          </div>
          <p className="muted landing-portfolio-copy-v2">
            DreamNest is built like an interior design website first, then powered by AI for speed.
            Start your room and generate a complete direction instantly.
          </p>
          <div className="landing-portfolio-actions-v2">
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
