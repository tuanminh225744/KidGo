import {
  ArrowLeft,
  Camera,
  User,
  Calendar,
  Phone,
  School,
  ShieldCheck,
  Save,
  ChevronDown,
  Shield,
  ImagePlus,
  MessageCircleQuestion,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  getKidById,
  createKid,
  updateKid,
  getKidSecurityQuestion,
  uploadKidAvatar,
} from "../../services/kid.service.js";

export default function KidProfile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const kidId = searchParams.get("kidId");
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    phone: "",
    school: "",
    notes: "",
    avatar: "",
  });
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [securityOptions, setSecurityOptions] = useState({
    otp: false,
    tripPhotoVerification: false,
    securityQuestion: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  const parseDateValue = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  useEffect(() => {
    if (kidId) {
      loadKidData();
      loadSecurityQuestion();
    }
  }, [kidId]);

  const loadKidData = async () => {
    const result = await getKidById(kidId);

    if (result.success) {
      const kid = result.data || result;

      setFormData({
        fullName: kid.fullName || "",
        dateOfBirth: kid.dateOfBirth ? new Date(kid.dateOfBirth) : null,
        phone: kid.phone || "",
        school: kid.school || "",
        notes: kid.notes || "",
        avatar: kid.avatar || "",
      });

      setSecurityOptions({
        otp: !!kid.securitySettings?.otp,

        tripPhotoVerification:
          !!kid.securitySettings?.tripPhotoVerification ||
          !!kid.securitySettings?.pickupPhoto ||
          !!kid.securitySettings?.dropoffPhoto,

        securityQuestion: !!kid.securitySettings?.securityQuestion,
      });
    }
  };

  const loadSecurityQuestion = async () => {
    const result = await getKidSecurityQuestion(kidId);
    if (result.success) {
      setSecurityQuestion(result.data?.securityQuestion || "");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    if (!formData.fullName.trim()) {
      setError("Tên của bé là bắt buộc");
      setLoading(false);
      return;
    }

    if (
      !securityOptions.otp &&
      !securityOptions.tripPhotoVerification &&
      !securityOptions.securityQuestion
    ) {
      setError("Vui lòng chọn ít nhất 1 phương thức bảo mật");
      setLoading(false);
      return;
    }

    if (securityOptions.securityQuestion) {
      if (!securityQuestion.trim() || !securityAnswer.trim()) {
        setError("Vui lòng nhập đầy đủ câu hỏi và đáp án bảo mật");
        setLoading(false);
        return;
      }
    }

    const payload = { ...formData };
    if (payload.dateOfBirth instanceof Date) {
      payload.dateOfBirth = payload.dateOfBirth.toISOString();
    }
    payload.securitySettings = {
      otp: securityOptions.otp,

      securityQuestion: securityOptions.securityQuestion,

      // Legacy fields
      pickupPhoto: securityOptions.tripPhotoVerification,

      dropoffPhoto: securityOptions.tripPhotoVerification,

      // New clean field
      tripPhotoVerification: securityOptions.tripPhotoVerification,
    };
    if (securityOptions.securityQuestion) {
      payload.securityQuestion = securityQuestion;
      payload.securityAnswer = securityAnswer;
    }
    Object.keys(payload).forEach((key) => {
      if (payload[key] === "") {
        delete payload[key];
      }
    });

    let result;
    if (kidId) {
      result = await updateKid(kidId, payload);
    } else {
      result = await createKid(payload);
    }

    if (!result.success) {
      setError(result.message || "Không thể lưu hồ sơ");
      setLoading(false);
      return;
    }

    const savedKidId = result.data?._id || kidId;

    if (avatarFile && savedKidId) {
      const uploadResult = await uploadKidAvatar(savedKidId, avatarFile);
      if (!uploadResult.success) {
        setError(uploadResult.message || "Không thể tải lên ảnh đại diện");
        setLoading(false);
        return;
      }
    }

    setSuccess("Hồ sơ đã được lưu thành công");
    setLoading(false);
    setTimeout(() => navigate("/client/home"), 1000);
  };

  return (
    <div className="flex-1 flex flex-col bg-surface min-h-screen">
      <header className="px-5 py-4 flex justify-between items-center sticky top-0 bg-white z-20 shadow-sm">
        <button
          onClick={() => navigate("/client/home")}
          className="flex items-center justify-center p-2 rounded-full hover:bg-surface-container-low active:scale-90 transition-transform"
        >
          <ArrowLeft size={24} className="text-primary" />
        </button>
        <h1 className="text-xl font-bold text-primary">Hồ sơ của bé</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 px-5 py-8 space-y-10 pb-30">
        {/* Avatar Section */}
        <section className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-surface-container-high flex items-center justify-center border-4 border-white shadow-xl overflow-hidden ring-4 ring-primary/5">
              <img
                src={
                  avatarPreview ||
                  formData.avatar ||
                  "/images/anh-avatar-trang.jpg"
                }
                alt="Kid avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <input
              type="file"
              accept="image/*"
              hidden
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              className="absolute bottom-1 right-1 bg-primary-container p-2.5 rounded-full text-white shadow-xl active:scale-90 transition-all border-4 border-white"
            >
              <Camera size={20} fill="currentColor" stroke="none" />
            </button>
          </div>
          <p className="mt-4 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
            Thêm ảnh của bé
          </p>
        </section>

        {/* Form Fields */}
        <section className="space-y-6">
          <div className="bg-white p-6 rounded-[32px] soft-shadow space-y-8 border border-outline-variant/10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] px-1">
                Tên của bé
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Nhập tên của bé"
                  className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-2 focus:ring-primary-container transition-all"
                />
                <User
                  size={20}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-outline-variant"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] px-1">
                Ngày sinh
              </label>
              <div className="relative">
                <DatePicker
                  selected={parseDateValue(formData.dateOfBirth)}
                  onChange={(date) =>
                    setFormData((prev) => ({ ...prev, dateOfBirth: date }))
                  }
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Chọn ngày sinh"
                  wrapperClassName="w-full"
                  className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-2 focus:ring-primary-container transition-all"
                />
                <Calendar
                  size={20}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] px-1">
                Số điện thoại liên hệ (Nếu có)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="0xxx xxx xxx"
                  className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-2 focus:ring-primary-container transition-all"
                />
                <Phone
                  size={20}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-outline-variant"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] px-1">
                Trường học (Nếu có)
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="school"
                  value={formData.school}
                  onChange={handleInputChange}
                  placeholder="Nhập tên trường học"
                  className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-2 focus:ring-primary-container transition-all"
                />
                <School
                  size={20}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-outline-variant"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] px-1">
                Ghi chú thêm
              </label>
              <textarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Sở thích, dị ứng, hoặc lưu ý đặc biệt..."
                className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-2 focus:ring-primary-container transition-all resize-none"
              />
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <ShieldCheck
              size={20}
              className="text-primary"
              fill="currentColor"
              stroke="none"
            />
            <h2 className="text-lg font-bold text-on-surface">Bảo mật hồ sơ</h2>
          </div>
          <div className="bg-white p-6 rounded-[32px] soft-shadow space-y-6 border border-outline-variant/10">
            <p className="text-sm text-on-surface-variant font-medium">
              Chọn ít nhất 1 phương thức bảo mật để sử dụng khi xác nhận đón
              trả.
            </p>

            <button
              type="button"
              onClick={() =>
                setSecurityOptions((prev) => ({ ...prev, otp: !prev.otp }))
              }
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${securityOptions.otp ? "border-primary-container bg-[#EEF2FF]" : "border-outline-variant/20 bg-surface-container-low"}`}
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <Shield className="text-primary" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-on-surface">Mã OTP</h3>
                  <p className="text-xs text-on-surface-variant">
                    Xác nhận đón trả bằng mã một lần
                  </p>
                </div>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${securityOptions.otp ? "border-primary-container" : "border-outline-variant"}`}
              >
                {securityOptions.otp && (
                  <div className="w-3 h-3 rounded-full bg-primary-container" />
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                setSecurityOptions((prev) => ({
                  ...prev,
                  tripPhotoVerification: !prev.tripPhotoVerification,
                }))
              }
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${securityOptions.tripPhotoVerification
                  ? "border-primary-container bg-[#EEF2FF]"
                  : "border-outline-variant/20 bg-surface-container-low"
                }`}
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <ImagePlus className="text-primary" size={20} />
                </div>

                <div>
                  <h3 className="font-bold text-on-surface">
                    Ảnh xác nhận đón trả
                  </h3>

                  <p className="text-xs text-on-surface-variant">
                    Yêu cầu tài xế chụp ảnh khi đón và trả bé
                  </p>
                </div>
              </div>

              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${securityOptions.tripPhotoVerification
                    ? "border-primary-container"
                    : "border-outline-variant"
                  }`}
              >
                {securityOptions.tripPhotoVerification && (
                  <div className="w-3 h-3 rounded-full bg-primary-container" />
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                setSecurityOptions((prev) => ({
                  ...prev,
                  securityQuestion: !prev.securityQuestion,
                }))
              }
              className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${securityOptions.securityQuestion ? "border-primary-container bg-[#EEF2FF]" : "border-outline-variant/20 bg-surface-container-low"}`}
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <MessageCircleQuestion className="text-primary" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-on-surface">Câu hỏi bảo mật</h3>
                  <p className="text-xs text-on-surface-variant">
                    Dùng câu hỏi và đáp án bí mật
                  </p>
                </div>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${securityOptions.securityQuestion ? "border-primary-container" : "border-outline-variant"}`}
              >
                {securityOptions.securityQuestion && (
                  <div className="w-3 h-3 rounded-full bg-primary-container" />
                )}
              </div>
            </button>

            {securityOptions.securityQuestion && (
              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] px-1">
                  Câu hỏi bảo mật
                </label>
                <div className="relative">
                  <select
                    value={securityQuestion}
                    onChange={(e) => setSecurityQuestion(e.target.value)}
                    className="w-full appearance-none bg-surface-container-low border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-2 focus:ring-primary-container transition-all pr-12"
                  >
                    <option value="">Chọn câu hỏi bảo mật</option>
                    <option value="Biệt danh của bé là gì?">
                      Biệt danh của bé là gì?
                    </option>
                    <option value="Thú cưng đầu tiên của bé tên gì?">
                      Thú cưng đầu tiên của bé tên gì?
                    </option>
                    <option value="Màu sắc yêu thích của bé?">
                      Màu sắc yêu thích của bé?
                    </option>
                  </select>
                  <ChevronDown
                    size={20}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none"
                  />
                </div>
                <input
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  placeholder="Câu trả lời của bạn"
                  className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-2 focus:ring-primary-container transition-all"
                />
              </div>
            )}
          </div>
        </section>
        <div className="max-w-[430px] mx-auto z-30">
          {error && (
            <div className="text-sm text-error font-semibold mb-3 text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-primary font-semibold mb-3 text-center">
              {success}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-primary-container text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang lưu..." : "Lưu hồ sơ"} <Save size={20} />
          </button>
        </div>
      </main>

      {/* Button */}
    </div>
  );
}
