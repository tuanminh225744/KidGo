import { ArrowLeft, ShieldCheck } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPendingEmail,
  verifyOtp,
  setAuthTokens,
  clearPendingEmail,
  sendOtp,
} from "../../services/auth.service.js";
import { useAuthStore } from "../../store/useAuthStore.js";

export default function OTP() {
  const navigate = useNavigate();
  const [codes, setCodes] = useState(["", "", "", "", "", ""]);
  const [pendingEmail, setPendingEmail] = useState("");
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const email = getPendingEmail();
    if (!email) {
      setError("Không tìm thấy email xác thực. Vui lòng đăng ký lại.");
      return;
    }
    setPendingEmail(email);
  }, []);

  const handleChange = (index, value) => {
    if (value.length > 1) value = value[value.length - 1];
    const newCodes = [...codes];
    newCodes[index] = value;
    setCodes(newCodes);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-surface min-h-screen pb-28">
      <header className="p-5 flex items-center justify-between">
        <button
          onClick={() => navigate("/client/register")}
          className="w-10 h-10 flex items-center justify-center text-primary rounded-full hover:bg-surface-container-low active:scale-90 transition-transform"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-primary">Xác thực OTP</h1>
        <div className="w-10" />
      </header>

      <main className="px-6 pt-10 flex-1 flex flex-col items-center">
        <div className="mb-12 flex flex-col items-center">
          <div className="w-24 h-24 bg-primary-container text-white rounded-full flex items-center justify-center shadow-2xl mb-8 relative">
            <ShieldCheck size={48} fill="currentColor" stroke="none" />
            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping pointer-events-none" />
          </div>
          <h2 className="text-3xl font-extrabold text-on-surface mb-3 text-center tracking-tight">
            Nhập mã xác thực
          </h2>
          <p className="text-on-surface-variant text-center max-w-xs leading-relaxed">
            Mã OTP đã được gửi đến số điện thoại của bạn. Vui lòng nhập mã gồm 6
            chữ số để tiếp tục.
          </p>
        </div>

        <div className="flex justify-between w-full max-w-sm gap-3 mb-10">
          {codes.map((code, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              type="number"
              value={code}
              onChange={(e) => handleChange(i, e.target.value)}
              className="w-12 h-16 bg-surface-container-low border border-outline-variant focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 rounded-2xl text-center text-2xl font-bold text-primary outline-none transition-all"
            />
          ))}
        </div>

        {pendingEmail && (
          <p className="text-sm text-on-surface-variant mb-4 text-center">
            Mã xác thực đã được gửi đến: <strong>{pendingEmail}</strong>
          </p>
        )}

        {error && (
          <div className="text-sm text-error font-semibold mb-4">{error}</div>
        )}
        {notification && (
          <div className="text-sm text-primary font-semibold mb-4">
            {notification}
          </div>
        )}

        <button
          onClick={async () => {
            setError("");
            setNotification("");
            const code = codes.join("");
            if (code.length !== 6) {
              setError("Vui lòng nhập đủ 6 chữ số OTP.");
              return;
            }
            if (!pendingEmail) {
              setError("Không tìm thấy email. Vui lòng quay lại đăng ký.");
              return;
            }
            setLoading(true);
            const result = await verifyOtp(pendingEmail, code);
            setLoading(false);
            if (!result.success) {
              setError(result.message || "Mã OTP không chính xác.");
              return;
            }
            setAuthTokens({
              accessToken: result.accessToken,
              refreshToken: result.refreshToken,
            });
            useAuthStore.getState().setUser(result.user);
            clearPendingEmail();
            navigate("/kid-profile");
          }}
          disabled={loading}
          className="w-full max-w-sm bg-primary-container text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Đang xác nhận..." : "Xác nhận"}
        </button>

        <div className="mt-12 text-center text-sm font-medium text-on-surface-variant">
          Bạn chưa nhận được mã?
          <button
            onClick={async () => {
              if (!pendingEmail) {
                setError("Không tìm thấy email để gửi lại OTP.");
                return;
              }
              setError("");
              setNotification("");
              setLoading(true);
              const result = await sendOtp(pendingEmail);
              setLoading(false);
              if (!result.success) {
                setError(result.message || "Không thể gửi lại mã OTP.");
                return;
              }
              setNotification("Mã OTP mới đã được gửi lại vào email.");
            }}
            className="text-primary-container font-extrabold ml-2 hover:underline"
          >
            Gửi lại
          </button>
        </div>
      </main>
    </div>
  );
}
