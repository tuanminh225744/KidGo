import {
  ArrowLeft,
  Mail,
  Lock,
  Phone,
  User,
  Monitor as Facebook,
  Globe as Google,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  registerUser,
  sendOtp,
  savePendingEmail,
} from "../services/auth.service.js";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    const result = await registerUser({
      email,
      password,
      fullName,
      phone,
      role: "parent",
    });

    if (!result.success) {
      setError(result.message || "Đăng ký thất bại. Vui lòng thử lại.");
      setLoading(false);
      return;
    }

    savePendingEmail(email);

    const otpResult = await sendOtp(email);
    if (!otpResult.success) {
      setError(
        otpResult.message || "Không thể gửi mã xác thực. Vui lòng thử lại.",
      );
      setLoading(false);
      return;
    }

    setSuccessMessage("Đăng ký thành công. Mã OTP đã được gửi vào email.");
    setLoading(false);
    navigate("/otp");
  };

  return (
    <div className="flex-1 flex flex-col bg-surface min-h-screen">
      <header className="p-5 flex items-center justify-between sticky top-0 bg-transparent z-10">
        <button
          onClick={() => navigate("/login")}
          className="w-10 h-10 flex items-center justify-center text-primary rounded-full hover:bg-surface-container-low active:scale-90 transition-transform"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-2xl font-bold text-primary-container">Kid Go</div>
        <div className="w-10" />
      </header>

      <main className="px-6 pt-10 flex-1 pb-28">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">
            Tạo tài khoản mới
          </h1>
          <p className="text-on-surface-variant text-sm">
            Tham gia cộng đồng Kid Go để quản lý lịch trình của con bạn tốt hơn.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 soft-shadow border border-outline-variant/30">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant px-1">
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
                  placeholder="example@gmail.com"
                  className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary-container outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant px-1">
                Username
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"
                  size={18}
                />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tên đăng nhập"
                  className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary-container outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant px-1">
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
                  className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 pl-12 pr-12 focus:ring-2 focus:ring-primary-container outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant px-1">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"
                  size={18}
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09xx xxx xxx"
                  className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary-container outline-none transition-all font-medium"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-error font-semibold mt-2">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="text-sm text-primary font-semibold mt-2">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-container text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 mt-4 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>

          <div className="flex items-center my-8">
            <div className="flex-1 h-px bg-outline-variant/30" />
            <span className="px-4 text-[10px] font-bold text-outline uppercase tracking-widest">
              Hoặc tiếp tục với
            </span>
            <div className="flex-1 h-px bg-outline-variant/30" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 border border-outline-variant rounded-2xl py-3.5 hover:bg-surface-container transition-colors font-bold text-xs">
              <Google size={18} /> Google
            </button>
            <button className="flex items-center justify-center gap-2 border border-outline-variant rounded-2xl py-3.5 hover:bg-surface-container transition-colors font-bold text-xs">
              <Facebook size={18} /> Facebook
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-on-surface-variant">
            Bạn đã có tài khoản?
            <button
              onClick={() => navigate("/login")}
              className="text-primary-container font-bold ml-1 hover:underline underline-offset-4"
            >
              Đăng nhập ngay
            </button>
          </p>
        </div>
      </main>

      <footer className="p-10 text-center">
        <p className="text-[10px] text-outline leading-relaxed max-w-[240px] mx-auto">
          Bằng cách đăng ký, bạn đồng ý với{" "}
          <span className="underline">Điều khoản</span> và{" "}
          <span className="underline">Chính sách</span> của chúng tôi.
        </p>
      </footer>
    </div>
  );
}
