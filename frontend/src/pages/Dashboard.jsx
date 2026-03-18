import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AIAPI, ProjectAPI, AuthAPI, SearchAPI } from "../api/endpoints";
import { useAuth } from "../hooks/useAuth";

const IMAGE_FALLBACK = "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1200&auto=format&fit=crop";

const ROOM_OPTIONS = [
  { id: "living_room", label: "Living Room", img: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1200&auto=format&fit=crop" },
  { id: "bedroom", label: "Bedroom", img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop" },
  { id: "kitchen", label: "Kitchen", img: "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=1200&auto=format&fit=crop" },
  { id: "office", label: "Office", img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop" },
  { id: "kids_room", label: "Kids Room", img: "https://images.unsplash.com/photo-1505693314120-0d443867891c?q=80&w=1200&auto=format&fit=crop" },
  { id: "studio", label: "Studio", img: "https://images.unsplash.com/photo-1501876725168-00c445821c9e?q=80&w=1200&auto=format&fit=crop" },
  { id: "dining_room", label: "Dining", img: "https://images.unsplash.com/photo-1617104678098-de229db51175?q=80&w=1200&auto=format&fit=crop" },
  { id: "bathroom", label: "Bathroom", img: "https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=1200&auto=format&fit=crop" },
  { id: "balcony", label: "Balcony", img: "https://images.unsplash.com/photo-1617104678018-df7f2ca8f5a2?q=80&w=1200&auto=format&fit=crop" },
  { id: "entryway", label: "Entryway", img: "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1200&auto=format&fit=crop" },
  { id: "guest_room", label: "Guest Room", img: "https://images.unsplash.com/photo-1505693314120-0d443867891c?q=80&w=1200&auto=format&fit=crop" },
  { id: "pooja_room", label: "Pooja Room", img: "https://images.unsplash.com/photo-1616594039964-3ad2f516f4c5?q=80&w=1200&auto=format&fit=crop" },
  { id: "dressing_room", label: "Dressing", img: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?q=80&w=1200&auto=format&fit=crop" },
  { id: "laundry", label: "Laundry", img: "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?q=80&w=1200&auto=format&fit=crop" },
  { id: "home_theatre", label: "Home Theatre", img: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?q=80&w=1200&auto=format&fit=crop" },
  { id: "terrace", label: "Terrace", img: "https://images.unsplash.com/photo-1600607687644-c7f34b5f11c8?q=80&w=1200&auto=format&fit=crop" },
  { id: "kids_study", label: "Kids Study", img: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200&auto=format&fit=crop" },
  { id: "walkin_closet", label: "Walk-in Closet", img: "https://images.unsplash.com/photo-1556020685-ae41abfc9365?q=80&w=1200&auto=format&fit=crop" },
  { id: "gaming_room", label: "Gaming Room", img: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=1200&auto=format&fit=crop" }
];

const STYLE_OPTIONS = [
  { id: "modern", label: "Modern", img: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=1200&auto=format&fit=crop" },
  { id: "warm", label: "Warm", img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop" },
  { id: "minimal", label: "Minimal", img: "https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=1200&auto=format&fit=crop" },
  { id: "boho", label: "Boho", img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop" },
  { id: "industrial", label: "Industrial", img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop" },
  { id: "classic", label: "Classic", img: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?q=80&w=1200&auto=format&fit=crop" },
  { id: "scandinavian", label: "Scandi", img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200&auto=format&fit=crop" },
  { id: "luxury", label: "Luxury", img: "https://images.unsplash.com/photo-1616594039964-3ad2f516f4c5?q=80&w=1200&auto=format&fit=crop" },
  { id: "coastal", label: "Coastal", img: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=1200&auto=format&fit=crop" },
  { id: "rustic", label: "Rustic", img: "https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=1200&auto=format&fit=crop" },
  { id: "japandi", label: "Japandi", img: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?q=80&w=1200&auto=format&fit=crop" },
  { id: "traditional", label: "Traditional", img: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?q=80&w=1200&auto=format&fit=crop" },
  { id: "contemporary", label: "Contemporary", img: "https://images.unsplash.com/photo-1617104551722-3b2d51366464?q=80&w=1200&auto=format&fit=crop" },
  { id: "mid_century", label: "Mid-century", img: "https://images.unsplash.com/photo-1617104551722-3b2d51366464?q=80&w=1200&auto=format&fit=crop" },
  { id: "wabi_sabi", label: "Wabi-sabi", img: "https://images.unsplash.com/photo-1615875605825-5eb9bb5d52cb?q=80&w=1200&auto=format&fit=crop" },
  { id: "mediterranean", label: "Mediterranean", img: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200&auto=format&fit=crop" },
  { id: "maximalist", label: "Maximalist", img: "https://images.unsplash.com/photo-1493666438817-866a91353ca9?q=80&w=1200&auto=format&fit=crop" },
  { id: "minimal_luxe", label: "Minimal Luxe", img: "https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=1200&auto=format&fit=crop" }
];

function setImageFallback(e) {
  const el = e.currentTarget;
  if (el.dataset.fallbackApplied === "1") return;
  el.dataset.fallbackApplied = "1";
  el.src = IMAGE_FALLBACK;
}

export default function Dashboard() {
  const nav = useNavigate();
  const { token, setToken } = useAuth();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chat, setChat] = useState({ message: "", reply: "", image: null });
  const [chatImagePreview, setChatImagePreview] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState({ projects: [], products: [], vendors: [], counts: null });
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", text: "Hi, I'm Nestie. Tumhara DreamNest buddy. Batao, kis room ke liye help chahiye? Budget aur style bhi share karo.", links: [] }
  ]);
  const [userName, setUserName] = useState("");
  const [themeMode, setThemeMode] = useState(() => document.documentElement.dataset.theme || localStorage.getItem("dreamnest_theme") || "dark");
  const chatEndRef = useRef(null);
  const [form, setForm] = useState({
    title: "",
    room_type: "living_room",
    budget_inr: 600000,
    style_tags: "modern,warm",
    location_city: "",
    area_sqft: 300
  });
  const [step, setStep] = useState(0);

  function toggleTheme() {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    localStorage.setItem("dreamnest_theme", next);
    setThemeMode(next);
  }

  useEffect(() => {
    if (!token) return;
    ProjectAPI.list(token)
      .then((rows) => {
        startTransition(() => {
          setProjects(rows);
        });
      })
      .catch((e) => setError(String(e.message || e)));
    AuthAPI.me(token)
      .then((u) => setUserName(u.name || ""))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) nav("/auth");
  }, [token, nav]);

  useEffect(() => {
    document.body.classList.toggle("chat-open", chatOpen);
    return () => document.body.classList.remove("chat-open");
  }, [chatOpen]);


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatHistory, chatOpen]);


  useEffect(() => {
    return () => {
      if (chatImagePreview) URL.revokeObjectURL(chatImagePreview);
    };
  }, [chatImagePreview]);

  async function createProject(e) {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...form,
        style_tags: form.style_tags.split(",").map((s) => s.trim()).filter(Boolean)
      };
      const res = await ProjectAPI.create(payload, token);
      nav(`/project/${res.projectId}`);
    } catch (err) {
      const msg = String(err.message || err);
      if (msg.toLowerCase().includes("session expired") || msg.toLowerCase().includes("invalid token")) {
        setToken("");
        nav("/auth");
        return;
      }
      setError(msg);
    }
  }

  async function deleteProject(projectId) {
    if (!window.confirm("Delete this project permanently?")) return;
    setError("");
    try {
      await ProjectAPI.remove(projectId, token);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      setError(String(err.message || err));
    }
  }

  const minBudget = Math.max(1500 * Number(form.area_sqft || 0), 60000);
  const roomTypes = useMemo(
    () => (form.room_type || "").split(",").map((s) => s.trim()).filter(Boolean),
    [form.room_type]
  );
  const roomTypeSet = useMemo(() => new Set(roomTypes), [roomTypes]);
  const styleTags = useMemo(
    () => (form.style_tags || "").split(",").map((s) => s.trim()).filter(Boolean),
    [form.style_tags]
  );
  const styleTagSet = useMemo(() => new Set(styleTags), [styleTags]);
  const budgetSplit = form.budget_inr
    ? [
        { label: "Furniture", pct: 45 },
        { label: "Lighting", pct: 12 },
        { label: "Decor", pct: 18 },
        { label: "Soft Furnishings", pct: 10 },
        { label: "Contingency", pct: 15 }
      ].map((b) => ({
        ...b,
        amount: Math.round((Number(form.budget_inr) * b.pct) / 100)
      }))
    : [];
  const plannedTotal = budgetSplit.reduce((a, b) => a + b.amount, 0);
  const formatINR = (n) => {
    const num = Number(n || 0);
    const inr = "\u20B9";
    if (num >= 10000000) return `${inr}${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `${inr}${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${inr}${(num / 1000).toFixed(1)}K`;
    return `${inr}${num}`;
  };

  async function sendChat(e) {
    e.preventDefault();
    const message = chat.message.trim();
    if (!message) return;
    try {
      setChatHistory((h) => [...h, { role: "user", text: message }]);
      setChat((c) => ({ ...c, message: "" }));
      setIsTyping(true);
      const res = await AIAPI.chat(
        {
          message,
          room_type: roomTypes[0] || "living_room",
          style_tags: styleTags,
          notes: `Dashboard quick chat. City: ${form.location_city || "not set"}`
        },
        token
      );
      const reply = res.reply || "Sorry, reply generate nahi ho paaya. Please try again.";
      setChatHistory((h) => [
        ...h,
        {
          role: "assistant",
          text: reply,
          links: Array.isArray(res.links) ? res.links : []
        }
      ]);
      setChat((c) => ({ ...c, reply }));
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setIsTyping(false);
    }
  }

  async function runSearch(e) {
    if (e?.preventDefault) e.preventDefault();
    const q = searchInput.trim();
    if (!q) return;
    setSearchLoading(true);
    setError("");
    try {
      const data = await SearchAPI.query({ q, limit: "6" }, token);
      startTransition(() => {
        setSearchResults({
          projects: Array.isArray(data.projects) ? data.projects : [],
          products: Array.isArray(data.products) ? data.products : [],
          vendors: Array.isArray(data.vendors) ? data.vendors : [],
          counts: data.counts || null
        });
      });
    } catch (err) {
      setError(String(err.message || err));
      setSearchResults({ projects: [], products: [], vendors: [], counts: null });
    } finally {
      setSearchLoading(false);
    }
  }

  async function sendVisionFromChat(e) {
    if (e?.preventDefault) e.preventDefault();
    if (!chat.image) return;
    try {
      setChatHistory((h) => [...h, { role: "user", text: "Image upload kiya hai. Decor ideas do." }]);
      setIsTyping(true);
      const fd = new FormData();
      fd.append("image", chat.image);
      fd.append("budget_inr", form.budget_inr || "");
      fd.append("style", form.style_tags || "");
      const res = await AIAPI.vision(fd, token);
      const reply = res.ideas || "Image analyze nahi ho paya. Please try a clearer photo.";
      setChatHistory((h) => [...h, { role: "assistant", text: reply }]);
      setChat((c) => ({ ...c, image: null, reply }));
      if (chatImagePreview) URL.revokeObjectURL(chatImagePreview);
      setChatImagePreview("");
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setIsTyping(false);
    }
  }

  function startVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recog = new SpeechRecognition();
    recog.lang = "en-IN";
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript || "";
      setChat((c) => ({ ...c, message: text }));
    };
    recog.start();
  }

  if (!token) {
    return (
      <div className="container">
        <div className="card">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="container studio-page">
      <div className="nav studio-nav">
        <div className="nav-brand">
          <span style={{ color: "var(--accent)" }}>Dream</span>Nest AI
          <div className="nav-sub">Welcome{userName ? `, ${userName}` : ""}</div>
        </div>
        <div className="nav-actions">
          <button
            className="btn btn-outline nav-icon-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${themeMode === "light" ? "dark" : "light"} theme`}
            title={`Switch to ${themeMode === "light" ? "dark" : "light"} theme`}
          >
            {themeMode === "light" ? (
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3v2.5M12 18.5V21M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M3 12h2.5M18.5 12H21M4.93 19.07 6.7 17.3M17.3 6.7l1.77-1.77M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20 15.2A7.8 7.8 0 0 1 8.8 4 8.4 8.4 0 1 0 20 15.2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <a className="btn btn-outline" href="/feedback">Feedback</a>
          <button className="btn btn-outline" onClick={() => setToken("")}>Logout</button>
        </div>
      </div>

      <div className="card studio-header-band">
        <div>
          <div className="studio-kicker">Interior Designer Workspace</div>
          <h2>Plan rooms like a design studio, not a form wizard</h2>
          <p className="muted">Build brief, define aesthetics, lock budget, and move into sourced products and vendor execution.</p>
        </div>
        <div className="studio-mini-metrics">
          <div className="studio-mini-metric">
            <span>Projects</span>
            <strong>{projects.length}</strong>
          </div>
          <div className="studio-mini-metric">
            <span>Budget Target</span>
            <strong>{formatINR(form.budget_inr)}</strong>
          </div>
          <div className="studio-mini-metric">
            <span>Planned Spend</span>
            <strong>{formatINR(plannedTotal)}</strong>
          </div>
        </div>
      </div>

      <div className="dash-wrap">
        <aside className="dash-side">
          <div className="card studio-side-card">
            <div className="panel-title">Project Snapshot</div>
            <div className="muted">Track the current brief without splitting attention away from the wizard.</div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="muted">Projects</div>
                <div className="stat-number">{projects.length}</div>
              </div>
              <div className="stat-card">
                <div className="muted">Active</div>
                <div className="stat-number">{projects.length ? 1 : 0}</div>
              </div>
              <div className="stat-card">
                <div className="muted">Planned Spend</div>
                <div className="stat-number">{formatINR(plannedTotal)}</div>
              </div>
              <div className="stat-card">
                <div className="muted">Budget</div>
                <div className="stat-number">{formatINR(form.budget_inr)}</div>
              </div>
            </div>
            <div className="status-lines">
              <span>Current step</span>
              <strong>{step + 1} / 3</strong>
            </div>
            {budgetSplit.length > 0 && (
              <div className="glass-panel compact-panel" style={{ marginTop: 12 }}>
                <div className="panel-title">Spend Distribution</div>
                <div className="grid">
                  {budgetSplit.slice(0, 3).map((b) => (
                    <div key={b.label} className="card" style={{ boxShadow: "none" }}>
                      <div style={{ fontFamily: "var(--font-display)" }}>{b.label}</div>
                      <div className="muted">{b.pct}% | INR {b.amount}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="card studio-side-card" style={{ marginTop: 12 }}>
            <div className="panel-title">Data Retrieval</div>
            <div className="muted">Search projects, products, and vendors from one compact panel.</div>
            <form onSubmit={runSearch} className="grid" style={{ marginTop: 12 }}>
              <input
                className="input"
                placeholder="Search room, city, style"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button className="btn btn-accent2 retrieval-btn" type="submit">
                {searchLoading ? "Searching..." : "Retrieve"}
              </button>
            </form>
            {searchResults.counts && (
              <div className="stats-grid compact-stats" style={{ marginTop: 12 }}>
                <div className="stat-card">
                  <div className="muted">Projects</div>
                  <div className="stat-number">{searchResults.counts.projects}</div>
                </div>
                <div className="stat-card">
                  <div className="muted">Products</div>
                  <div className="stat-number">{searchResults.counts.products}</div>
                </div>
                <div className="stat-card">
                  <div className="muted">Vendors</div>
                  <div className="stat-number">{searchResults.counts.vendors}</div>
                </div>
              </div>
            )}
            {(searchResults.projects.length > 0 || searchResults.products.length > 0 || searchResults.vendors.length > 0) && (
              <div className="retrieval-stack">
                {searchResults.projects.slice(0, 2).map((p) => (
                  <button key={`project-${p.id}`} className="retrieval-item" onClick={() => nav(`/project/${p.id}`)} type="button">
                    <strong>{p.title}</strong>
                    <span>{p.room_type} • {p.location_city}</span>
                  </button>
                ))}
                {searchResults.products.slice(0, 2).map((p) => (
                  <div key={`product-${p.id}`} className="retrieval-item static">
                    <strong>{p.name}</strong>
                    <span>{p.category} • {p.style}</span>
                  </div>
                ))}
                {searchResults.vendors.slice(0, 2).map((v) => (
                  <div key={`vendor-${v.id}`} className="retrieval-item static">
                    <strong>{v.name}</strong>
                    <span>{v.city}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        <div className="dash-main">
          <div className="card studio-main-card wizard-card">
            <h3 style={{ fontFamily: "var(--font-display)" }}>Design Brief Wizard</h3>
            <p className="muted">The main control surface for room type, style, and budget planning.</p>
            <div className="wizard-meta">
              <span>Step {step + 1} of 3</span>
              <span>{roomTypes.length || 0} room types selected</span>
              <span>{styleTags.length || 0} styles selected</span>
            </div>
            <div className="progress-bar" style={{ marginBottom: 12 }}>
              <span style={{ width: `${((step + 1) / 3) * 100}%` }} />
            </div>
            <div className="stepper">
              {[0,1,2].map((s)=>(
                <div key={s} className={`step-dot ${step===s ? "active":""}`}>{s+1}</div>
              ))}
            </div>
            <form onSubmit={createProject} className="grid">
            {step === 0 && (
              <>
                <div className="grid grid-2 wizard-brief-row">
                  <div className="glass-panel brief-panel">
                    <div className="panel-title">Room Basics</div>
                    <div className="muted">Name the project and define the core brief clearly.</div>
                    <input
                      className="input"
                      style={{ marginTop: 12 }}
                      placeholder="Project title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                  <div className="glass-panel brief-panel">
                    <div className="panel-title">Area</div>
                    <div className="muted">Enter the total area in square feet for more accurate planning.</div>
                    <input
                      className="input"
                      style={{ marginTop: 12 }}
                      placeholder="Area (sqft)"
                      type="number"
                      value={form.area_sqft}
                      onChange={(e) => setForm({ ...form, area_sqft: e.target.value })}
                    />
                    <div className="wizard-inline-note">Recommended minimum budget: INR {minBudget}</div>
                  </div>
                </div>
                <div className="glass-panel room-select-panel">
                  <div className="room-selection-top">
                    <div>
                      <div className="panel-title">Select Room Type</div>
                      <div className="muted">Choose one or more spaces from the visual brief board.</div>
                    </div>
                    <div className="room-selection-meta">
                      <div className="room-selection-kpi">
                        <strong>{roomTypes.length || 0}</strong>
                        <span>rooms</span>
                      </div>
                      <div className="room-selection-kpi">
                        <strong>{form.area_sqft || 0}</strong>
                        <span>sqft</span>
                      </div>
                    </div>
                  </div>
                  <div className="choice-grid">
                    {ROOM_OPTIONS.map((r) => {
                      const selected = roomTypeSet.has(r.id);
                      return (
                      <div
                        key={r.id}
                        className={`choice-card ${selected ? "selected multi" : ""}`}
                        onClick={() => {
                          const roomSet = new Set(roomTypeSet);
                          if (selected) roomSet.delete(r.id); else roomSet.add(r.id);
                          setForm({ ...form, room_type: Array.from(roomSet).join(",") });
                        }}
                      >
                        <img src={r.img} alt={r.label} loading="lazy" onError={setImageFallback} />
                        <div className="choice-label">{r.label}</div>
                      </div>
                    )})}
                  </div>
                </div>
                {null}
              </>
            )}
            {step === 1 && (
              <>
                <div className="glass-panel">
                  <div className="panel-title">Aesthetic</div>
                  <div className="muted">Modern, warm, minimal, boho, etc.</div>
                </div>
                <div className="choice-grid">
                  {STYLE_OPTIONS.map((r) => {
                    const selected = styleTagSet.has(r.id);
                    return (
                      <div
                        key={r.id}
                        className={`choice-card ${selected ? "selected" : ""}`}
                        onClick={() => {
                          const tags = new Set(styleTagSet);
                          if (selected) tags.delete(r.id); else tags.add(r.id);
                          setForm({ ...form, style_tags: Array.from(tags).join(",") });
                        }}
                      >
                        <img src={r.img} alt={r.label} loading="lazy" onError={setImageFallback} />
                        <div className="choice-label">{r.label}</div>
                      </div>
                    );
                  })}
                </div>
                <input
                  className="input"
                  placeholder="Selected styles (comma separated)"
                  value={form.style_tags}
                  onChange={(e) => setForm({ ...form, style_tags: e.target.value })}
                />
                <div className="glass-panel">
                  <div className="panel-title">City</div>
                  <div className="muted">Detect your location or enter manually.</div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    className="input"
                    placeholder="City"
                    value={form.location_city}
                    onChange={(e) => setForm({ ...form, location_city: e.target.value })}
                  />
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      if (!navigator.geolocation) return;
                      navigator.geolocation.getCurrentPosition(async (pos) => {
                        const { latitude, longitude } = pos.coords;
                        try {
                          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                          const data = await r.json();
                          const city =
                            data.address?.city ||
                            data.address?.town ||
                            data.address?.village ||
                            data.address?.state ||
                            "";
                          if (city) setForm({ ...form, location_city: city });
                        } catch {}
                      });
                    }}
                  >
                    Detect
                  </button>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div className="glass-panel">
                  <div className="panel-title">Budget</div>
                  <div className="muted">Set an investment target for this room.</div>
                </div>
                <input
                  className="input"
                  placeholder="Budget INR"
                  type="number"
                  value={form.budget_inr}
                  onChange={(e) => setForm({ ...form, budget_inr: e.target.value })}
                />
                {budgetSplit.length > 0 && (
                  <div className="glass-panel">
                    <div className="panel-title">Money Distribution (AI)</div>
                    <div className="grid">
                      {budgetSplit.map((b) => (
                        <div key={b.label} className="card" style={{ boxShadow: "none" }}>
                          <div style={{ fontFamily: "var(--font-display)" }}>{b.label}</div>
                          <div className="muted">{b.pct}% | INR {b.amount}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="glass-panel">
                  <div className="section-sub">Summary</div>
                  <div className="muted">{form.title || "Untitled"}</div>
                  <div className="muted">{form.room_type} - {form.area_sqft} sqft</div>
                  <div className="muted">{form.location_city}</div>
                  <div className="muted">Style: {form.style_tags}</div>
                  <div className="muted">Budget: INR {form.budget_inr}</div>
                </div>
              </>
            )}
            {error && <div className="muted">{error}</div>}
            <div style={{ display: "flex", gap: 10 }}>
              {step > 0 && (
                <button type="button" className="btn btn-outline" onClick={() => setStep(step - 1)}>
                  Back
                </button>
              )}
              {step < 2 && (
                <button type="button" className="btn btn-accent2" onClick={() => setStep(step + 1)}>
                  Next
                </button>
              )}
              {step === 2 && (
                <button className="btn btn-accent3" type="submit">Create Project</button>
              )}
            </div>
            </form>
          </div>

          <div className="card studio-main-card projects-card">
            <h3 style={{ fontFamily: "var(--font-display)" }}>Your projects</h3>
            <div className="glass-panel" style={{ marginBottom: 12 }}>
              <div className="section-sub">Quick Start</div>
              <div className="muted">1. Create project</div>
              <div className="muted">2. Add requirements</div>
              <div className="muted">3. Generate AI plan</div>
              <div className="muted">4. Shortlist products and vendors</div>
            </div>
          <div className="glass-panel" style={{ marginBottom: 12 }}>
            <div className="section-sub">Studio Gallery</div>
            <div className="gallery-scroll">
              {[
                "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1484101403633-562f891dc89a?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1502005097973-6a7082348e28?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1501876725168-00c445821c9e?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1502005097973-6a7082348e28?q=80&w=800&auto=format&fit=crop"
              ].map((src) => (
                <img key={src} src={src} alt="Studio" loading="lazy" decoding="async" />
              ))}
            </div>
          </div>
            <div className="glass-panel" style={{ marginBottom: 12 }}>
              <div className="section-sub">AI Modules</div>
              <div className="muted">Budget split + layout plan</div>
              <div className="muted">Furniture recommendations with buy links</div>
              <div className="muted">Vision-based decor ideas</div>
              <div className="muted">Progress chatbot</div>
            </div>
            <div className="grid">
              {projects.map((p) => (
                <div key={p.id} className="card" style={{ boxShadow: "none" }}>
                  <div style={{ fontFamily: "var(--font-display)" }}>{p.title}</div>
                  <div className="muted">{p.room_type} - {p.location_city}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button className="btn btn-outline" onClick={() => nav(`/project/${p.id}`)}>
                      Open project
                    </button>
                    <button className="btn btn-outline" onClick={() => deleteProject(p.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {!projects.length && <div className="muted">No projects yet.</div>}
            </div>
          </div>
        </div>
      </div>

      <button className="chat-fab" onClick={() => setChatOpen(!chatOpen)} aria-label="Open chatbot">
        <svg className="chat-fab-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3v3M8 8h8a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-2l-2 2-2-2H8a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 13h.01M14 13h.01" strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
        <span className="chat-fab-badge">1</span>
      </button>
      {chatOpen && (
        <div className="chat-drawer">
          <header>
            <span>Nestie | DreamNest</span>
            <button className="btn btn-outline" onClick={() => setChatOpen(false)}>Close</button>
          </header>
          <div className="muted">Hinglish mode. Ask progress, budget, or Pinterest ideas. Image bhi upload kar sakte ho.</div>
          <div className="chat-suggestions">
            {["Progress update", "Modern living room ideas", "Budget split for 6L", "Pinterest keywords for boho"].map((s) => (
              <button
                key={s}
                type="button"
                className="chat-chip"
                onClick={() => setChat((c) => ({ ...c, message: s }))}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="chat-messages">
            {chatHistory.map((m, idx) => (
              <div key={idx} className={`chat-bubble ${m.role === "user" ? "user" : "assistant"}`}>
                <div>{m.text}</div>
                {m.role === "assistant" && Array.isArray(m.links) && m.links.length > 0 && (
                  <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {m.links.map((p) => (
                      <a key={`${idx}-${p.url}`} className="badge" href={p.url} target="_blank" rel="noreferrer">
                        {p.keyword}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && <div className="chat-bubble assistant">Typing...</div>}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={sendChat} className="grid">
            {chatImagePreview && (
              <div className="chat-preview">
                <img src={chatImagePreview} alt="Upload preview" loading="lazy" decoding="async" />
                <button type="button" className="btn btn-outline" onClick={() => {
                  if (chatImagePreview) URL.revokeObjectURL(chatImagePreview);
                  setChatImagePreview("");
                  setChat((c) => ({ ...c, image: null }));
                }}>
                  Remove
                </button>
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="input"
                placeholder="Ask anything"
                value={chat.message}
                onChange={(e) => setChat({ ...chat, message: e.target.value })}
              />
              <button type="button" className="btn btn-outline" onClick={startVoice} title="Voice input">Mic</button>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <label className="btn btn-outline" title="Add image/file">
                +
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (!file) return;
                    if (chatImagePreview) URL.revokeObjectURL(chatImagePreview);
                    setChatImagePreview(URL.createObjectURL(file));
                    setChat((c) => ({ ...c, image: file }));
                  }}
                />
              </label>
              <button className="btn btn-accent2 chat-send" type="submit">
                Send
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M4 12h16M14 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="btn btn-outline" type="button" onClick={sendVisionFromChat}>Analyze image</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

