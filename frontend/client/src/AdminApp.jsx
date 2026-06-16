import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore.js";
import {
  connectAdminSocket,
  disconnectAdminSocket,
} from "./socket/adminSocket.js";
import Login from "./pages/admin/Login.jsx";
import DriverApproval from "./pages/admin/DriverApproval.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminSocketManager from "./components/AdminSocketManager.jsx";
import Report from "./pages/admin/report/ReportAdmin.jsx";
import AdminLayout from "./components/AdminLayout.jsx";

export default function AdminApp() {
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user && user.role === "admin") {
      connectAdminSocket({ adminId: user._id });
    }
    return () => {
      disconnectAdminSocket();
    };
  }, [user]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="login" replace />} />
        <Route path="login" element={<Login />} />
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["admin"]}
              loginPath="/admin/login"
            />
          }
        >
          <Route element={<AdminLayout />}>
            <Route
              path="home"
              element={<Navigate to="/admin/driver-approval" replace />}
            />
            <Route path="report" element={<Report />} />
            <Route path="driver-approval" element={<DriverApproval />} />
          </Route>
        </Route>
      </Routes>
      <AdminSocketManager />
    </>
  );
}
