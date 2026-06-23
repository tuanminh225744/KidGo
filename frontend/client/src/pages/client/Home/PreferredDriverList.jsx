import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Search,
  Star,
  Trash2,
  Phone,
  Plus,
  ChevronRight,
  Users,
  Wifi,
  WifiOff,
  AlertCircle,
  X,
  Check,
} from "lucide-react";
import {
  getPreferredDrivers,
  addPreferredDriver,
  removePreferredDriver,
  updatePreferredDriver,
} from "../../../services/preferredDriver.service.js";

const PRIORITY_LABELS = {
  1: { label: "Ưu tiên cao nhất", color: "text-green-600 bg-green-50" },
  2: { label: "Ưu tiên cao", color: "text-blue-600 bg-blue-50" },
  3: { label: "Bình thường", color: "text-orange-500 bg-orange-50" },
  4: { label: "Thấp", color: "text-gray-500 bg-gray-100" },
  5: { label: "Thấp nhất", color: "text-gray-400 bg-gray-50" },
};

// Modal thêm tài xế qua SĐT
function AddDriverModal({ onClose, onSuccess }) {
  const [phone, setPhone] = useState("");
  const [nickname, setNickname] = useState("");
  const [priority, setPriority] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!phone.trim()) {
      setError("Vui lòng nhập số điện thoại.");
      return;
    }
    setLoading(true);
    try {
      const res = await addPreferredDriver({
        phone: phone.trim(),
        nickname: nickname.trim() || undefined,
        priority,
      });
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || "Không thể thêm tài xế.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Đã có lỗi xảy ra."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative bg-white rounded-t-[32px] w-full max-w-[430px] p-6 pb-10 shadow-2xl"
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-on-surface">
            Thêm tài xế ưu tiên
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low text-on-surface-variant"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* SĐT */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Số điện thoại tài xế *
            </label>
            <div className="relative">
              <Phone
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912 345 678"
                className="w-full h-13 bg-surface-container-low border border-outline-variant focus:border-primary-container focus:ring-2 focus:ring-primary-container/15 rounded-2xl pl-11 pr-4 py-3 font-medium outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Nickname */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Tên gọi (tuỳ chọn)
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="VD: Bác Hùng chở bé An"
              className="w-full h-13 bg-surface-container-low border border-outline-variant focus:border-primary-container focus:ring-2 focus:ring-primary-container/15 rounded-2xl px-4 py-3 font-medium outline-none transition-all text-sm"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Độ ưu tiên
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border-2 ${priority === p
                    ? "bg-primary-container text-white border-primary-container shadow-md"
                    : "bg-surface-container-low text-on-surface-variant border-transparent"
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="text-xs text-on-surface-variant mt-1.5">
              <span className="font-bold text-primary-container">
                {priority}
              </span>{" "}
              — {PRIORITY_LABELS[priority]?.label}
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle
                size={14}
                className="text-red-500 mt-0.5 shrink-0"
              />
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-primary-container text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-60 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Plus size={18} /> Thêm tài xế
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// Modal cập nhật priority
function EditPriorityModal({ item, onClose, onSuccess }) {
  const [priority, setPriority] = useState(item.priority || 1);
  const [nickname, setNickname] = useState(item.nickname || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await updatePreferredDriver(item.driverId, {
        priority,
        ...(nickname.trim() ? { nickname: nickname.trim() } : {}),
      });
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || "Không thể cập nhật.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Đã có lỗi xảy ra."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative bg-white rounded-t-[32px] w-full max-w-[430px] p-6 pb-10 shadow-2xl"
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-on-surface">
            Chỉnh sửa tài xế
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low text-on-surface-variant"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Tên gọi
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={item.driver?.fullName || "Tên gọi"}
              className="w-full h-13 bg-surface-container-low border border-outline-variant focus:border-primary-container focus:ring-2 focus:ring-primary-container/15 rounded-2xl px-4 py-3 font-medium outline-none transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Độ ưu tiên (1 = cao nhất, 5 = thấp nhất)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border-2 ${priority === p
                    ? "bg-primary-container text-white border-primary-container shadow-md"
                    : "bg-surface-container-low text-on-surface-variant border-transparent"
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="text-xs text-on-surface-variant mt-1.5">
              <span className="font-bold text-primary-container">
                {priority}
              </span>{" "}
              — {PRIORITY_LABELS[priority]?.label}
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle
                size={14}
                className="text-red-500 mt-0.5 shrink-0"
              />
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-primary-container text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-60 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check size={18} /> Lưu thay đổi
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function PreferredDriverList() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPreferredDrivers();
      if (res.success) {
        setDrivers(res.data || []);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách tài xế ưu tiên:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  const handleDelete = async (driverId) => {
    setDeletingId(driverId);
    try {
      await removePreferredDriver(driverId);
      setDrivers((prev) => prev.filter((d) => d.driverId !== driverId));
    } catch (err) {
      console.error("Lỗi xóa tài xế:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-surface min-h-screen">
      {/* Header */}
      <header className="px-5 py-4 flex items-center gap-4 sticky top-0 bg-white z-30 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-on-surface">Tài xế ưu tiên</h1>
          <p className="text-xs text-on-surface-variant">
            {drivers.length}/20 tài xế
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={drivers.length >= 20}
          className="flex items-center gap-1.5 bg-primary-container text-white px-4 py-2 rounded-2xl text-sm font-bold active:scale-95 transition-transform shadow-md shadow-primary/20 disabled:opacity-40"
        >
          <Plus size={16} /> Thêm
        </button>
      </header>

      <main className="px-5 pt-5 pb-24 space-y-3">
        {/* Chú thích */}
        <div className="bg-surface-container rounded-2xl px-4 py-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Users size={15} className="text-primary" />
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Tài xế ưu tiên sẽ nhận cuốc xe trực tiếp từ bạn. Thêm{" "}
            <span className="font-bold text-on-surface">qua số điện thoại</span>{" "}
            hoặc sau khi hoàn thành chuyến xe.
          </p>
        </div>

        {/* Danh sách */}
        {loading ? (
          <div className="space-y-3 mt-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-surface-container-low rounded-3xl p-4 animate-pulse h-24"
              />
            ))}
          </div>
        ) : drivers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-4">
              <Users size={36} className="text-outline" />
            </div>
            <h3 className="font-bold text-on-surface mb-1">
              Chưa có tài xế ưu tiên
            </h3>
            <p className="text-sm text-on-surface-variant max-w-[200px]">
              Nhấn nút Thêm để thêm tài xế yêu thích của bạn
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {drivers.map((item, index) => {
              const priorityInfo = PRIORITY_LABELS[item.priority] || PRIORITY_LABELS[1];
              const isDeleting = deletingId === item.driverId;

              return (
                <motion.div
                  key={item._id || item.driverId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ delay: index * 0.04 }}
                  className="bg-white border border-outline-variant/30 rounded-3xl p-4 shadow-sm active-shadow flex items-center gap-3"
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-container-low border-2 border-surface-container">
                      <img
                        src={
                          item.driver?.avatar ||
                          `/images/anh-avatar-trang.jpg`
                        }
                        alt={item.driver?.fullName || "Driver"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Online dot */}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${item.isAvailable
                        ? "bg-green-500"
                        : item.isOnline
                          ? "bg-yellow-400"
                          : "bg-gray-300"
                        }`}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm text-on-surface truncate">
                        {item.nickname || item.driver?.fullName || "Tài xế"}
                      </p>
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase ${priorityInfo.color}`}
                      >
                        P{item.priority}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {item.driver?.phone || "---"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.driver?.certificationLevel !== undefined && (
                        <span className="flex items-center gap-0.5 text-orange-500 text-[10px] font-bold">
                          <Star size={10} fill="currentColor" />
                          {item.driver.certificationLevel.toFixed(1)}
                        </span>
                      )}
                      <span
                        className={`flex items-center gap-1 text-[10px] font-bold ${item.isAvailable
                          ? "text-green-600"
                          : item.isOnline
                            ? "text-yellow-600"
                            : "text-gray-400"
                          }`}
                      >
                        {item.isAvailable ? (
                          <>
                            <Wifi size={10} /> Sẵn sàng
                          </>
                        ) : item.isOnline ? (
                          <>
                            <Wifi size={10} /> Đang bận
                          </>
                        ) : (
                          <>
                            <WifiOff size={10} /> Ngoại tuyến
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => setEditItem(item)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.driverId)}
                      disabled={isDeleting}
                      className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <AddDriverModal
            onClose={() => setShowAddModal(false)}
            onSuccess={loadDrivers}
          />
        )}
        {editItem && (
          <EditPriorityModal
            item={editItem}
            onClose={() => setEditItem(null)}
            onSuccess={loadDrivers}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
