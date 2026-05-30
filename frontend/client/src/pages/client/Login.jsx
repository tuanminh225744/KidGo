import { ArrowLeft, Mail, Lock, LogIn, ChevronRight } from "lucide-react";
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

    const result = await loginUser(email, password);

    if (!result.success) {
      setError(result.message || "Đăng nhập thất bại. Vui lòng thử lại.");
      setLoading(false);
      return;
    }

    if (result?.user?.role !== "parent") {
      setError("Đăng nhập thất bại. Sai email hoặc mật khẩu!");
      setLoading(false);
      return;
    }

    setAuthTokens({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    useAuthStore.getState().setUser(result.user);

    navigate("/client/home");
  };

  return (
    <div className="flex-1 flex flex-col bg-surface min-h-screen px-6 pt-20 pb-28">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
            <span className="text-white text-5xl font-extrabold tracking-tighter">
              KG
            </span>
          </div>
        </div>
        <h1 className="text-4xl font-extrabold text-primary mb-2">Kid Go</h1>
        <p className="text-on-surface-variant font-medium">
          Đưa đón an toàn — Mỗi ngày
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 soft-shadow border border-outline-variant/30 mt-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-widest">
              Gmail
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"
                size={18}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vidu@email.com"
                className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary-container outline-none transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-widest">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"
                size={18}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary-container outline-none transition-all font-medium"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-error font-semibold mt-2">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 mt-4 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"} <LogIn size={20} />
          </button>
        </form>
      </div>

      <div className="mt-12 text-center">
        <p className="text-on-surface-variant font-medium">
          Bạn chưa có tài khoản?
          <button
            type="button"
            onClick={() => navigate("/client/register")}
            className="text-primary font-bold ml-2 hover:underline underline-offset-4"
          >
            Đăng ký ngay <ChevronRight size={16} className="inline-block" />
          </button>
        </p>
      </div>

      <div className="mt-auto mb-10 text-center text-[10px] text-outline font-bold tracking-[0.2em]">
        KID GO © 2026
      </div>
    </div>
  );
}
