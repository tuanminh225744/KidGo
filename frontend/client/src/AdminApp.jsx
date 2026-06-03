import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore.js";
import { connectAdminSocket, disconnectAdminSocket } from "./socket/adminSocket.js";
import Login from "./pages/admin/Login.jsx";
import DriverApproval from "./pages/admin/DriverApproval.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

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
      <div className="flex-1 overflow-y-auto bg-gray-50 min-h-screen">
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
            <Route
              path="home"
              element={<Navigate to="/admin/driver-approval" replace />}
            />
            <Route path="driver-approval" element={<DriverApproval />} />
          </Route>
        </Routes>
      </div>
    </>
  );
}
