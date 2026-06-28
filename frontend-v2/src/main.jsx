import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles.css";

import App from "./App";

import UserDashboard from "./dashboards/UserDashboard";
import TeamDashboard from "./dashboards/TeamDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";


const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <Routes>

      {/* Chat UI */}
      <Route path="/" element={<App />} />

      {/* Dashboards (no auth for now) */}
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/team" element={<TeamDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />

      {/* fallback */}
      <Route path="*" element={<div className="p-10 text-white">Page not found</div>} />

    </Routes>
  </BrowserRouter>
);
