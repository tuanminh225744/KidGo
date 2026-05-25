import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/admin/Login.jsx";

export default function AdminApp() {
  return (
    <>
      <div className="flex-1 overflow-y-auto relative pb-20">
        <Routes>
          <Route path="/" element={<Navigate to="login" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="home" element={<div className="p-6">Admin Home</div>} />
        </Routes>
      </div>
    </>
  );
}
