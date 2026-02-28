import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app.jsx";
import "./styles/theme.css";
import "./styles/patterns.css";
import "./styles/app.css";
import "./styles/motion.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
