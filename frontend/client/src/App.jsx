import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ClientApp from "./ClientApp.jsx";
import DriverApp from "./DriverApp.jsx";
import AdminApp from "./AdminApp.jsx";

function App() {
  return (
    <div className="max-w-[430px] mx-auto min-h-screen relative bg-surface flex flex-col shadow-2xl overflow-hidden">
      <Routes>
        {/* Redirect root to client home or login */}
        <Route path="/" element={<Navigate to="/client/login" replace />} />
        
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
