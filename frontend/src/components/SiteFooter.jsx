export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-brand">
        <div className="nav-brand site-footer-mark">
          <span style={{ color: "var(--accent)" }}>Dream</span>Nest AI
        </div>
        <p className="muted">
          Interior planning, sourcing, and execution in one studio workflow.
        </p>
      </div>
      <div className="site-footer-links">
        <a href="/about">Studio</a>
        <a href="/vendors">Vendors</a>
        <a href="/feedback">Feedback</a>
        <a href="/auth">Start Project</a>
      </div>
      <div className="site-footer-meta muted">
        <span>Designer-grade room planning</span>
        <span>Built for fast decisions and cleaner execution</span>
      </div>
    </footer>
  );
}
