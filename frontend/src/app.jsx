import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy, startTransition, useEffect, useState } from "react";

const Landing = lazy(() => import("./pages/Landing.jsx"));
const Auth = lazy(() => import("./pages/Auth.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Project = lazy(() => import("./pages/Project.jsx"));
const Vendors = lazy(() => import("./pages/Vendors.jsx"));
const Admin = lazy(() => import("./pages/Admin.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Feedback = lazy(() => import("./pages/Feedback.jsx"));
const VendorProfile = lazy(() => import("./pages/VendorProfile.jsx"));
const ProductMarketplace = lazy(() => import("./pages/ProductMarketplace.jsx"));
const Wishlist = lazy(() => import("./pages/Wishlist.jsx"));

function RouteFallback() {
  return (
    <div className="container">
      <div className="card">Loading page...</div>
    </div>
  );
}

export default function App() {
  const [preferredDeviceMode, setPreferredDeviceMode] = useState(() => {
    const saved = localStorage.getItem("dreamnest_device_mode");
    if (saved === "phone" || saved === "laptop") return saved;
    if (typeof window !== "undefined" && window.innerWidth <= 900) return "phone";
    return "laptop";
  });
  const [isNarrowViewport, setIsNarrowViewport] = useState(
    () => (typeof window !== "undefined" ? window.innerWidth <= 900 : false)
  );

  useEffect(() => {
    function onResize() {
      startTransition(() => {
        setIsNarrowViewport(window.innerWidth <= 900);
      });
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const mode = isNarrowViewport ? "phone" : (preferredDeviceMode === "phone" ? "phone" : "laptop");
    document.documentElement.dataset.device = mode;
    localStorage.setItem("dreamnest_device_mode", preferredDeviceMode);
  }, [preferredDeviceMode, isNarrowViewport]);

  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem("dreamnest_theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      root.dataset.theme = savedTheme;
      return;
    }
    const prefersLight = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    const nextTheme = prefersLight ? "light" : "dark";
    root.dataset.theme = nextTheme;
    localStorage.setItem("dreamnest_theme", nextTheme);
  }, []);

  return (
    <BrowserRouter>
      <div className="bg-atmos grid-veil">
        <div className="device-toggle">
          <button
            className={`btn btn-outline ${!isNarrowViewport && preferredDeviceMode === "laptop" ? "is-active" : ""}`}
            onClick={() => setPreferredDeviceMode("laptop")}
            disabled={isNarrowViewport}
          >
            Laptop
          </button>
          <button
            className={`btn btn-outline ${(isNarrowViewport || preferredDeviceMode === "phone") ? "is-active" : ""}`}
            onClick={() => setPreferredDeviceMode("phone")}
          >
            Phone
          </button>
        </div>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/project/:id" element={<Project />} />
            <Route path="/project/:id/marketplace" element={<ProductMarketplace />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/about" element={<About />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/vendor/:id" element={<VendorProfile />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}
