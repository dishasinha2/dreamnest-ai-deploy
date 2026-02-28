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
      desc: "Upload your wall/room image and get decor direction plus Pinterest keywords."
    }
  ];

  const benefits = [
    "Actionable output, not only ideas",
    "Studio-style planning flow",
    "Budget and execution visibility",
    "Local-first implementation support"
  ];

  const steps = [
    { n: "01", t: "Define brief", d: "Room type, area, style, location, budget." },
    { n: "02", t: "Generate plan", d: "Budget split + shopping + decor direction." },
    { n: "03", t: "Execute smart", d: "Shortlist products and connect vendors." }
  ];

  return (
    <div className="container about-page">
      <div className="nav">
        <div className="nav-brand">
          <span style={{ color: "var(--accent)" }}>Dream</span>Nest AI
        </div>
        <div className="nav-actions">
          <a className="btn btn-outline" href="/auth">Login / Signup</a>
          <a className="btn btn-outline" href="/dashboard">Dashboard</a>
          <a className="btn btn-outline" href="/vendors">Vendors</a>
          <a className="btn btn-outline" href="/feedback">Feedback</a>
        </div>
      </div>

      <section className="about-hero card">
        <div className="about-kicker">Design planning, made executable</div>
        <h1 className="about-title">From room idea to purchase-ready plan</h1>
        <p className="about-sub muted">
          DreamNest converts your brief into an implementation workflow: budget strategy, real buy links,
          vendor options, and progress-aware AI guidance in one interface.
        </p>
        <div className="about-cta-row">
          <a className="btn" href="/auth">Start your project</a>
          <a className="btn btn-outline" href="/dashboard">View dashboard</a>
        </div>
        <div className="about-stat-row">
          <div className="about-stat">
            <div className="about-stat-value">3-step</div>
            <div className="muted">planning flow</div>
          </div>
          <div className="about-stat">
            <div className="about-stat-value">Live</div>
            <div className="muted">product links</div>
          </div>
          <div className="about-stat">
            <div className="about-stat-value">Local</div>
            <div className="muted">vendor network</div>
          </div>
        </div>
      </section>

      <section className="grid grid-2 about-panels">
        <div className="card">
          <h3 className="about-section-title">Core Features</h3>
          <div className="about-list-grid">
            {features.map((f) => (
              <article key={f.title} className="about-item">
                <div className="about-item-title">{f.title}</div>
                <div className="muted">{f.desc}</div>
              </article>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="about-section-title">Why DreamNest</h3>
          <div className="about-benefit-list">
            {benefits.map((b) => (
              <div key={b} className="about-benefit">
                <span className="about-benefit-dot" />
                <span>{b}</span>
              </div>
            ))}
          </div>
          <div className="about-callout">
            <div className="about-callout-title">Decision-ready output</div>
            <div className="muted">
              Plan, shortlist, compare, and move to execution without switching between multiple tools.
            </div>
          </div>
        </div>
      </section>

      <section className="card about-flow-card">
        <h3 className="about-section-title">How It Works</h3>
        <div className="about-flow-grid">
          {steps.map((s) => (
            <article key={s.n} className="about-step">
              <div className="about-step-number">{s.n}</div>
              <div className="about-step-title">{s.t}</div>
              <div className="muted">{s.d}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="card" style={{ marginTop: 18 }}>
        <h3 className="about-section-title">Best-fit Use Cases</h3>
        <div className="grid grid-3">
          {[
            "New apartment setup",
            "Single-room redesign under fixed budget",
            "Rental upgrade without structural work",
            "Premium-looking home office",
            "Kids room with practical storage",
            "Compact studio optimization"
          ].map((u) => (
            <div key={u} className="about-usecase">
              {u}
            </div>
          ))}
        </div>
      </section>

      <div className="about-bottom-cta">
        <a className="btn" href="/auth">Login / Signup</a>
        <a className="btn btn-outline" href="/vendors">Explore Vendors</a>
      </div>
    </div>
  );
}
