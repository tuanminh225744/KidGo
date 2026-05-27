import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock3 } from "lucide-react";

export default function SuccessfullyRegistered() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-surface min-h-screen">
      <main className="px-6 py-10 flex-1 flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-on-surface text-center mb-3">
          Đăng ký thành công
        </h1>

        <p className="text-on-surface-variant text-center max-w-sm leading-relaxed mb-6">
          Hồ sơ của bạn đã được gửi đến hệ thống. Vui lòng chờ admin duyệt tài
          khoản trước khi sử dụng ứng dụng.
        </p>

        <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-outline-variant/30 soft-shadow mb-8">
          <div className="flex items-start gap-3">
            <Clock3 className="w-5 h-5 text-green-600 mt-0.5" />
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Trạng thái hiện tại của tài khoản là đang chờ duyệt. Bạn sẽ chỉ
              có thể đăng nhập và nhận chuyến sau khi admin kích hoạt tài khoản
              tài xế.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/driver/login")}
          className="w-full max-w-sm bg-green-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-green-600/20 active:scale-[0.98] transition-all"
        >
          Về trang đăng nhập
        </button>
      </main>
    </div>
  );
}
