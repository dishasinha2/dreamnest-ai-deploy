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
  const [deviceMode, setDeviceMode] = useState(() => localStorage.getItem("dreamnest_device_mode") || "laptop");

  useEffect(() => {
    const mode = deviceMode === "phone" ? "phone" : "laptop";
    document.documentElement.dataset.device = mode;
    localStorage.setItem("dreamnest_device_mode", mode);
  }, [deviceMode]);

  return (
    <BrowserRouter>
      <div className="bg-atmos grid-veil">
        <div className="device-toggle">
          <button
            className={`btn btn-outline ${deviceMode === "laptop" ? "is-active" : ""}`}
            onClick={() => setDeviceMode("laptop")}
          >
            Laptop
          </button>
          <button
            className={`btn btn-outline ${deviceMode === "phone" ? "is-active" : ""}`}
            onClick={() => setDeviceMode("phone")}
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
