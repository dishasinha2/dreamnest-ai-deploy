import { BrowserRouter, Routes, Route } from "react-router-dom";
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
  return (
    <BrowserRouter>
      <div className="bg-atmos grid-veil">
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
