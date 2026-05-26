import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/admin/Login.jsx";
import DriverApproval from "./pages/admin/DriverApproval.jsx";

export default function AdminApp() {
  return (
    <>
      <div className="flex-1 overflow-y-auto bg-gray-50 min-h-screen">
        <Routes>
          <Route path="/" element={<Navigate to="login" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="home" element={<Navigate to="/admin/driver-approval" replace />} />
          <Route path="driver-approval" element={<DriverApproval />} />
        </Routes>
      </div>
    </>
  );
}
