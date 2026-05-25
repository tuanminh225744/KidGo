import {
  ArrowLeft,
  Mail,
  Lock,
  Phone,
  User,
  CreditCard,
  Calendar,
  Car,
  Tag,
  Palette,
  CheckCircle,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    fullName: "",
    password: "",
    licenseNumber: "",
    licenseExpiry: "",
    licensePlate: "",
    brand: "",
    model: "",
    color: "",
    seatCount: "",
    inspectionExpiry: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep1 = (e) => {
    e.preventDefault();
    // Validate step 1 if needed
    setStep(2);
  };

  const handleSubmitStep2 = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Mock API call to submit driver registration data
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col bg-surface min-h-screen">
      {step < 3 && (
        <header className="p-5 flex items-center justify-between sticky top-0 bg-surface z-10">
          <button
            onClick={() => {
              if (step === 2) setStep(1);
              else navigate("/driver/login");
            }}
            className="w-10 h-10 flex items-center justify-center text-green-600 rounded-full hover:bg-surface-container-low active:scale-90 transition-transform"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="text-2xl font-bold text-green-600">Kid Go</div>
          <div className="w-10" />
        </header>
      )}

      <main className="px-6 pt-6 flex-1 pb-28 flex flex-col">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-on-surface mb-2 tracking-tight">
                Thông tin cá nhân
              </h1>
              <p className="text-on-surface-variant text-sm">
                Bước 1/2: Vui lòng cung cấp thông tin liên hệ và bằng lái.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 soft-shadow border border-outline-variant/30">
              <form className="space-y-4" onSubmit={handleNextStep1}>
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant px-1">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                    <input
                      required
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn A"
                      className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant px-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="taixe@gmail.com"
                      className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant px-1">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="09xx xxx xxx"
                      className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant px-1">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                    <input
                      required
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                {/* License Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant px-1">
                    Số GPLX
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                    <input
                      required
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      placeholder="Nhập số giấy phép lái xe"
                      className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                {/* License Expiry */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant px-1">
                    Ngày hết hạn GPLX
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                    <input
                      required
                      type="date"
                      name="licenseExpiry"
                      value={formData.licenseExpiry}
                      onChange={handleChange}
                      className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium text-on-surface"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-green-600/20 mt-6 active:scale-[0.98] transition-all"
                >
                  Tiếp theo
                </button>
              </form>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-on-surface-variant">
                Bạn đã có tài khoản?
                <button
                  onClick={() => navigate("/driver/login")}
                  className="text-green-600 font-bold ml-1 hover:underline underline-offset-4"
                >
                  Đăng nhập
                </button>
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-on-surface mb-2 tracking-tight">
                Thông tin phương tiện
              </h1>
              <p className="text-on-surface-variant text-sm">
                Bước 2/2: Cung cấp chi tiết xe bạn sẽ sử dụng.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 soft-shadow border border-outline-variant/30">
              <form className="space-y-4" onSubmit={handleSubmitStep2}>
                {/* License Plate */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant px-1">
                    Biển số xe
                  </label>
                  <div className="relative">
                    <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                    <input
                      required
                      name="licensePlate"
                      value={formData.licensePlate}
                      onChange={handleChange}
                      placeholder="29A-123.45"
                      className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Brand */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant px-1">
                    Hãng xe
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                    <input
                      required
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="Toyota, Honda,..."
                      className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Model */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant px-1">
                    Mẫu xe
                  </label>
                  <div className="relative">
                    <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                    <input
                      required
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      placeholder="Vios, City,..."
                      className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Color & Seat Count row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant px-1">
                      Màu sắc
                    </label>
                    <div className="relative">
                      <Palette className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                      <input
                        required
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        placeholder="Trắng"
                        className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant px-1">
                      Số chỗ
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                      <input
                        required
                        type="number"
                        name="seatCount"
                        value={formData.seatCount}
                        onChange={handleChange}
                        placeholder="4"
                        className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Inspection Expiry */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant px-1">
                    Hạn đăng kiểm
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                    <input
                      required
                      type="date"
                      name="inspectionExpiry"
                      value={formData.inspectionExpiry}
                      onChange={handleChange}
                      className="w-full bg-surface-container-low border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-green-500 outline-none transition-all font-medium text-on-surface"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-green-600/20 mt-6 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? "Đang gửi thông tin..." : "Gửi đăng ký"}
                </button>
              </form>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="text-green-600 w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-on-surface text-center mb-4">
              Đăng ký thành công!
            </h2>
            <p className="text-on-surface-variant text-center max-w-xs mb-8 leading-relaxed">
              Thông tin của bạn đã được gửi cho admin duyệt. Vui lòng chờ bộ phận hỗ trợ liên hệ sớm nhất.
            </p>
            <button
              onClick={() => navigate("/driver/login")}
              className="w-full max-w-xs bg-green-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-green-600/20 active:scale-[0.98] transition-all"
            >
              Về trang đăng nhập
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
