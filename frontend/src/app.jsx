import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Landing from "./pages/Landing.jsx";
import Auth from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Project from "./pages/Project.jsx";
import Vendors from "./pages/Vendors.jsx";
import Admin from "./pages/Admin.jsx";
import About from "./pages/About.jsx";
import Feedback from "./pages/Feedback.jsx";
import VendorProfile from "./pages/VendorProfile.jsx";
import ProductMarketplace from "./pages/ProductMarketplace.jsx";
import Wishlist from "./pages/Wishlist.jsx";

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
      setIsNarrowViewport(window.innerWidth <= 900);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const mode = isNarrowViewport ? "phone" : (preferredDeviceMode === "phone" ? "phone" : "laptop");
    document.documentElement.dataset.device = mode;
    localStorage.setItem("dreamnest_device_mode", preferredDeviceMode);
  }, [preferredDeviceMode, isNarrowViewport]);

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
      </div>
    </BrowserRouter>
  );
}
