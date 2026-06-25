import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  Settings,
  Star,
  Camera,
  Mail,
  IdCard,
  Car,
  PaintBucket,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { useDriverStore } from "../../store/useDriverStore";
import {
  getDriverVehicles,
  uploadVehiclePhoto,
} from "../../services/driver.service";
import { uploadAvatar } from "../../services/user.service";

export const ProfileScreen = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const { driverInfo } = useDriverStore();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  const avatarInputRef = useRef(null);
  const vehiclePhotoInputRef = useRef(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await getDriverVehicles();
        if (res?.data?.length > 0) {
          setVehicle(res.data[0]);
        }
      } catch (error) {
        console.error("Lỗi khi tải phương tiện:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadAvatar(file);
      console.log(res)
      if (res.success && res.data?.avatar) {
        // Update user state
        setUser({ ...user, avatar: res.data.avatarUrl });
      }
    } catch (error) {
      console.error("Lỗi khi tải ảnh đại diện lên:", error);
    }
  };

  const handleVehiclePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !vehicle?._id) return;

    try {
      const res = await uploadVehiclePhoto(vehicle._id, file);
      if (res.success && res.data?.photo) {
        setVehicle((prev) => ({ ...prev, photo: res.data.photo }));
      }
    } catch (error) {
      console.error("Lỗi khi tải ảnh xe lên:", error);
    }
  };

  if (loading) {
    return <div className="p-5 text-center">Đang tải...</div>;
  }

  return (
    <div className="pb-24 overflow-y-auto h-screen bg-gray-50">
      <div className="absolute top-0 left-0 right-0 h-48  rounded-b-[40px] z-0"></div>

      <div className="relative z-10 px-6 mt-4 flex justify-between items-center  mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-black">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-xl text-black font-bold mr-24">Hồ sơ của tôi</h1>

      </div>

      <div className="flex flex-col items-center relative z-10">
        <div className="relative mb-4">
          <img
            src={user?.avatar || "/images/anh-avatar-trang.jpg"}
            alt="Avatar"
            className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-lg bg-white"
          />
          <button
            onClick={() => avatarInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-primary-container text-white p-2 rounded-full border-2 border-white shadow-md active:scale-95 transition-transform"
          >
            <Camera size={14} />
          </button>
          <input
            type="file"
            accept="image/*"
            ref={avatarInputRef}
            className="hidden"
            onChange={handleAvatarUpload}
          />

          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#d97706] text-white text-[10px] font-bold px-3 py-1 rounded-full border-2 border-white shadow-sm whitespace-nowrap">
            Cấp {driverInfo?.certificationLevel || 0}
          </div>
        </div>
        <h2 className="text-black text-2xl font-bold mt-2">
          {user?.fullName || "Tài xế"}
        </h2>
        <p className="text-white/80 text-sm">{user?.phone}</p>
        {/* <div className="flex items-center gap-2 mt-2 bg-black/20 px-4 py-1.5 rounded-full text-white text-sm font-medium">
          <Star size={14} className="fill-accent text-accent" />
          <span>
            Cấp độ {driverInfo?.certificationLevel || 0} • {driverInfo?.totalTrips || 0} chuyến
          </span>
        </div> */}
      </div>

      <div className="px-5 mt-6 relative z-10 space-y-4">
        {/* User Info Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            Thông tin cá nhân
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-semibold text-sm text-gray-800">
                  {user?.email || "Chưa cập nhật"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 shrink-0">
                <IdCard size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Số bằng lái (GPLX)</p>
                <p className="font-semibold text-sm text-gray-800">
                  {driverInfo?.licenseNumber || "Chưa cập nhật"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Info Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Car size={18} className="text-primary" />
              Phương tiện
            </h3>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex justify-center mb-4">
              <div className="relative w-full aspect-video rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden group">
                {vehicle?.photo ? (
                  <img
                    src={vehicle.photo}
                    alt="Vehicle"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Car size={40} className="mb-2 opacity-50" />
                    <span className="text-xs font-medium">Chưa có ảnh xe</span>
                  </div>
                )}
                <div
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  onClick={() => vehiclePhotoInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center text-white">
                    <Camera size={24} className="mb-1" />
                    <span className="text-xs font-bold">Cập nhật ảnh</span>
                  </div>
                </div>
                <button
                  onClick={() => vehiclePhotoInputRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-white/90 p-2 rounded-full shadow text-gray-700 hover:text-primary active:scale-95 transition-all md:hidden"
                >
                  <Camera size={16} />
                </button>
              </div>
              <input
                type="file"
                accept="image/*"
                ref={vehiclePhotoInputRef}
                className="hidden"
                onChange={handleVehiclePhotoUpload}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Biển số
                </p>
                <p className="font-bold text-sm text-gray-800">
                  {vehicle?.licensePlate || "---"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Hiệu xe
                </p>
                <p className="font-bold text-sm text-gray-800">
                  {vehicle?.brand || "---"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <PaintBucket size={10} /> Màu sắc
                </p>
                <p className="font-bold text-sm text-gray-800">
                  {vehicle?.color || "---"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Users size={10} /> Số chỗ
                </p>
                <p className="font-bold text-sm text-gray-800">
                  {vehicle?.seatCount ? `${vehicle.seatCount} chỗ` : "---"}
                </p>
              </div>
              <div className="col-span-2 bg-gray-50 rounded-2xl p-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Mẫu xe (Model)
                </p>
                <p className="font-bold text-sm text-gray-800">
                  {vehicle?.model || "---"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};