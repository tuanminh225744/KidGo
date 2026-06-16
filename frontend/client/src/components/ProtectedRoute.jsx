import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { message } from "antd";
import { clearAuthTokens } from "../services/auth.service.js";
import { useAuthStore } from "../store/useAuthStore.js";

const SESSION_EXPIRED_MESSAGE = "Phiên đăng nhập của bạn đã hết hạn";

export default function ProtectedRoute({
  allowedRoles = [],
  loginPath = "/login",
}) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const notifiedRef = useRef(false);

  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const hasToken = Boolean(accessToken || refreshToken);
  const hasValidRole =
    !allowedRoles.length || (user?.role && allowedRoles.includes(user.role));
  const isAllowed = hasToken && hasValidRole;

  useEffect(() => {
    if (isAllowed) {
      notifiedRef.current = false;
      return;
    }

    if (notifiedRef.current) return;

    notifiedRef.current = true;
    clearAuthTokens();
    logout();
    message.error(SESSION_EXPIRED_MESSAGE);
  }, [isAllowed, logout]);

  if (!isAllowed) {
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
