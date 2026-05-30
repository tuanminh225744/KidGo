import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ClientApp from "./ClientApp.jsx";
import DriverApp from "./DriverApp.jsx";
import AdminApp from "./AdminApp.jsx";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <Routes>
        {/* Redirect root to client home or login */}
        <Route path="/" element={<Navigate to="/driver/login" replace />} />

        {/* Client Routes */}
        <Route path="/client/*" element={<ClientApp />} />

        {/* Driver Routes */}
        <Route path="/driver/*" element={<DriverApp />} />

        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </div>
  );
}

export default App;
