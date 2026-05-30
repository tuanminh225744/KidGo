import { Mail, Lock, LogIn, ShieldCheck } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, setAuthTokens } from "../../services/auth.service.js";
import { useAuthStore } from "../../store/useAuthStore.js";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginUser(email, password);

      if (!result?.success) {
        setError(result?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
        setLoading(false);
        return;
      }

      if (result?.user?.role !== "admin") {
        setError("Đăng nhập thất bại. Sai email hoặc mật khẩu!");
        setLoading(false);
        return;
      }

      setAuthTokens({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });

      useAuthStore.getState().setUser(result.user);

      navigate("/admin/home");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Đăng nhập thất bại. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 md:p-8">
      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side - Branding / Decorative */}
        <div className="md:w-1/2 bg-blue-600 p-10 flex flex-col justify-between relative overflow-hidden hidden md:flex text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-800 opacity-90" />
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-blue-600 font-extrabold text-2xl tracking-tighter">
                KG
              </span>
            </div>
            <span className="font-bold text-2xl tracking-wide">
              KidGo Admin
            </span>
          </div>

          <div className="relative z-10 space-y-6 max-w-sm mt-20">
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">
              Quản lý hệ thống <br /> thông minh.
            </h1>
            <p className="text-blue-100 text-lg">
              Nền tảng dành riêng cho Quản trị viên để kiểm soát, phê duyệt và
              giám sát hoạt động của toàn bộ hệ thống KidGo.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2 mt-20 text-blue-200 text-sm font-medium">
            <ShieldCheck size={18} />
            Hệ thống bảo mật cấp cao
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="md:w-1/2 p-8 md:p-14 lg:p-20 flex flex-col justify-center relative">
          <div className="md:hidden flex justify-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl">
              <span className="text-white text-3xl font-extrabold tracking-tighter">
                KG
              </span>
            </div>
          </div>

          <div className="text-center md:text-left mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Đăng nhập Admin
            </h2>
            <p className="text-gray-500">
              Vui lòng nhập thông tin xác thực để tiếp tục.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                Email hoặc Tài khoản
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors"
                  size={20}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kidgo.vn"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                Mật khẩu
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors"
                  size={20}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-gray-900"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-semibold flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/20 mt-4 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : "Đăng nhập hệ thống"}{" "}
              <LogIn size={20} />
            </button>
          </form>

          <div className="mt-12 md:mt-auto pt-8 text-center md:text-left text-xs text-gray-400 font-semibold tracking-wider">
            KID GO ADMIN PLATFORM © 2026
          </div>
        </div>
      </div>
    </div>
  );
}
