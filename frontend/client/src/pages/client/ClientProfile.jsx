import { useEffect, useState } from "react";
import { ChevronLeft, Save, Upload, Mail, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { updateProfile, uploadAvatar } from "../../services/user.service.js";
import { useAuthStore } from "../../store/useAuthStore.js";

export default function ClientProfile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    avatar: "",
  });

  useEffect(() => {
    if (!user) return;

    setFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      avatar: user.avatar || "",
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadAvatar(file);
      const nextAvatar =
        result?.data?.data?.avatarUrl || result?.data?.data?.user?.avatar;
      if (nextAvatar) {
        setFormData((prev) => ({ ...prev, avatar: nextAvatar }));
        if (result?.data?.data?.user) {
          setUser(result.data.data.user);
        }
      }
    } catch (error) {
      console.error("Lỗi khi upload avatar:", error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        avatar: formData.avatar.trim(),
      };
      const result = await updateProfile(payload);
      if (result?.success && result?.data) {
        setUser(result.data);
        navigate(-1);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin người dùng:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="px-5 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-base font-bold text-on-surface">
            Chỉnh thông tin
          </h1>
          <div className="w-10 h-10" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-5 py-6 space-y-5">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-outline-variant/20">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="relative">
              <img
                src={
                  formData.avatar ||
                  "https://i.pinimg.com/736x/bc/43/98/bc439871417621836a0eeea768d60944.jpg"
                }
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
              />
              <label className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-lg cursor-pointer">
                <Upload size={16} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface">
                {formData.fullName || "Phụ huynh"}
              </h2>
              <p className="text-sm text-on-surface-variant">
                {formData.email || "Chưa có email"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-on-surface mb-2 block">
              Họ và tên
            </span>
            <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-outline-variant/20">
              <User className="text-on-surface-variant" size={18} />
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full outline-none bg-transparent text-on-surface"
                placeholder="Nhập họ và tên"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-on-surface mb-2 block">
              Email
            </span>
            <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-outline-variant/20">
              <Mail className="text-on-surface-variant" size={18} />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full outline-none bg-transparent text-on-surface"
                placeholder="Nhập email"
              />
            </div>
          </label>

          {/* <label className="block">
            <span className="text-sm font-medium text-on-surface mb-2 block">
              Avatar URL
            </span>
            <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-outline-variant/20">
              <UserCircle2 className="text-on-surface-variant" size={18} />
              <input
                name="avatar"
                value={formData.avatar}
                onChange={handleChange}
                className="w-full outline-none bg-transparent text-on-surface"
                placeholder="Dán link ảnh đại diện"
              />
            </div>
          </label> */}
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          className="w-full py-4 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-70"
        >
          <Save size={18} />
          {saving
            ? "Đang lưu..."
            : uploading
              ? "Đang tải ảnh..."
              : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
}
