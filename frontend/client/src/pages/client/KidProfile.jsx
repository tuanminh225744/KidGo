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
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getKidById,
  createKid,
  updateKid,
  setupSecurityQuestion,
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

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
        dateOfBirth: kid.dateOfBirth ? kid.dateOfBirth.split("T")[0] : "",
        phone: kid.phone || "",
        school: kid.school || "",
        notes: kid.notes || "",
        avatar: kid.avatar || "",
      });
    }
  };

  const loadSecurityQuestion = async () => {
    const result = await getKidSecurityQuestion(kidId);
    if (result.success) {
      setSecurityQuestion(result.securityQuestion || "");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    const payload = { ...formData };
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

    const savedKidId = result.data?._id || result._id || kidId;

    if (securityQuestion && securityAnswer && savedKidId) {
      const securityResult = await setupSecurityQuestion(
        savedKidId,
        securityQuestion,
        securityAnswer,
      );
      if (!securityResult.success) {
        setError(securityResult.message || "Không thể lưu câu hỏi bảo mật");
        setLoading(false);
        return;
      }
    }

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
    setTimeout(() => navigate(-1), 1500);
  };

  return (
    <div className="flex-1 flex flex-col bg-surface min-h-screen">
      <header className="px-5 py-4 flex justify-between items-center sticky top-0 bg-white z-20 shadow-sm">
        <button
          onClick={() => navigate('/client/home')}
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
                src={avatarPreview || formData.avatar || "https://i.pinimg.com/736x/bc/43/98/bc439871417621836a0eeea768d60944.jpg"}
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
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
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
                Số điện thoại liên hệ
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
                Trường học
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
          <div className="bg-white p-6 rounded-[32px] soft-shadow space-y-8 border border-outline-variant/10">
            <div className="space-y-3">
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
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] px-1">
                Đáp án bảo mật
              </label>
              <input
                type="text"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                placeholder="Câu trả lời của bạn"
                className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-5 text-sm font-bold focus:ring-2 focus:ring-primary-container transition-all"
              />
            </div>
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
