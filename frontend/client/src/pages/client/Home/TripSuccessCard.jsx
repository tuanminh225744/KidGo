import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, Wifi, WifiOff, Check, X } from "lucide-react";
import { useSocketStore } from "../../../store/useSocketStore.js";
import {
  addPreferredDriver,
  getPreferredDrivers,
} from "../../../services/preferredDriver.service.js";
import { createReview } from "../../../services/review.service.js";

const TAGS = ["Đúng giờ", "Thân thiện", "Lái xe cẩn thận", "Giao tiếp tốt", "Xe sạch sẽ"];

// Modal đánh giá chuyến xe
function ReviewModal({ trip, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await createReview({
        tripId: trip.tripId,
        driverId: trip.driverId,
        rating,
        comment,
        tags: selectedTags,
      });
      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(res.message || "Không thể gửi đánh giá.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="relative bg-white rounded-t-[32px] w-full max-w-[430px] p-6 pb-10 shadow-2xl"
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-on-surface">Đánh giá chuyến xe</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low text-on-surface-variant">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating sao */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-on-surface-variant font-medium">
              Bạn cảm thấy thế nào về chuyến đi?
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="transition-transform active:scale-90"
                >
                  <Star
                    size={36}
                    className={s <= rating ? "text-orange-400" : "text-gray-200"}
                    fill={s <= rating ? "currentColor" : "currentColor"}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-bold text-orange-500">
              {["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Tuyệt vời"][rating]}
            </p>
          </div>

          {/* Tags */}
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Nhãn đánh giá
            </p>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${selectedTags.includes(tag)
                    ? "bg-primary-container text-white border-primary-container"
                    : "bg-surface-container-low text-on-surface-variant border-outline-variant/30"
                    }`}
                >
                  {selectedTags.includes(tag) && <Check size={10} className="inline mr-1" />}
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ thêm về trải nghiệm của bạn..."
              rows={3}
              className="w-full bg-surface-container-low border border-outline-variant focus:border-primary-container focus:ring-2 focus:ring-primary-container/15 rounded-2xl px-4 py-3 text-sm font-medium outline-none transition-all resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-primary-container text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Gửi đánh giá"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// Modal thêm tài xế ưu tiên sau chuyến xe
function AddPreferredModal({ trip, onClose, onSuccess }) {
  const [nickname, setNickname] = useState("");
  const [priority, setPriority] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await addPreferredDriver({
        driverId: trip.driverId,
        nickname: nickname.trim() || undefined,
        priority,
      });
      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(res.message || "Không thể thêm tài xế ưu tiên.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="relative bg-white rounded-t-[32px] w-full max-w-[430px] p-6 pb-10 shadow-2xl"
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-on-surface">Thêm vào ưu tiên</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low text-on-surface-variant">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Tên gọi (tuỳ chọn)
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={`VD: Bác ${trip.driverName || "Tài xế"}`}
              className="w-full h-13 bg-surface-container-low border border-outline-variant focus:border-primary-container focus:ring-2 focus:ring-primary-container/15 rounded-2xl px-4 py-3 font-medium outline-none transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Độ ưu tiên (1 = cao nhất)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${priority === p
                    ? "bg-primary-container text-white border-primary-container shadow-md"
                    : "bg-surface-container-low text-on-surface-variant border-transparent"
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-secondary-container text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all disabled:opacity-60 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Thêm tài xế ưu tiên"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

/**
 * TripSuccessCard
 * Hiển thị khi nhận socket event "trip_completed" từ server
 * Props:
 *   event: { type, payload: { tripId, driverId, driverName, driverAvatar, message } }
 *   onDismiss: () => void
 */
export default function TripSuccessCard({ event, onDismiss }) {
  const markAsRead = useSocketStore((s) => s.markAsRead);
  const [showReview, setShowReview] = useState(false);
  const [showAddPreferred, setShowAddPreferred] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const [preferredDone, setPreferredDone] = useState(false);

  const { payload } = event;

  // Kiểm tra xem tài xế đã có trong danh sách ưu tiên chưa
  useEffect(() => {
    if (!payload?.driverId) return;
    getPreferredDrivers()
      .then((res) => {
        const list = res?.data || [];
        const already = list.some(
          (item) =>
            (item.driverId?._id || item.driverId)?.toString() ===
            payload.driverId.toString()
        );
        if (already) setPreferredDone(true);
      })
      .catch(() => { });
  }, [payload?.driverId]);

  const dismiss = () => {
    markAsRead(event.id);
    onDismiss?.();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: "spring", damping: 22, stiffness: 260 }}
        className="bg-white border-2 border-green-200 rounded-[24px] p-5 shadow-xl relative overflow-hidden"
      >
        {/* Decorative top stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400 rounded-t-[22px]" />

        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors"
        >
          <X size={14} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 mt-1">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl shrink-0">
            🎉
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-green-600 font-extrabold">
              Chuyến xe hoàn thành
            </p>
            <h3 className="font-bold text-on-surface text-base leading-tight">
              Bé đã đến nơi an toàn!
            </h3>
          </div>
        </div>

        {/* Driver info */}
        {(payload?.driverName || payload?.driverAvatar) && (
          <div className="bg-surface-container-low rounded-2xl p-3 flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow shrink-0">
              <img
                src={
                  payload?.driverAvatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${payload?.driverId}`
                }
                alt={payload?.driverName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-on-surface truncate">
                {payload?.driverName || "Tài xế"}
              </p>
              <p className="text-[10px] text-on-surface-variant">
                {payload?.message || "Cảm ơn bạn đã sử dụng KidGo"}
              </p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          {/* Đánh giá */}
          <button
            onClick={() => setShowReview(true)}
            disabled={reviewDone}
            className={`py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${reviewDone
              ? "bg-green-50 text-green-600 border border-green-200"
              : "bg-primary-container text-white shadow-md shadow-primary/20"
              }`}
          >
            {reviewDone ? (
              <>
                Đã đánh giá
              </>
            ) : (
              <>
                Nhận xét
              </>
            )}
          </button>

          {/* Thêm ưu tiên */}
          <button
            onClick={() => setShowAddPreferred(true)}
            disabled={preferredDone || !payload?.driverId}
            className={`py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${preferredDone
              ? "bg-orange-50 text-orange-600 border border-orange-200"
              : "bg-secondary-container text-white shadow-md shadow-secondary/20"
              }`}
          >
            {preferredDone ? (
              <>
                Đã thêm tài xế ưu tiên
              </>
            ) : (
              <>
                Thêm tài xế ưu tiên
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showReview && (
          <ReviewModal
            trip={{ tripId: payload?.tripId, driverId: payload?.driverId }}
            onClose={() => setShowReview(false)}
            onSuccess={() => setReviewDone(true)}
          />
        )}
        {showAddPreferred && (
          <AddPreferredModal
            trip={{
              driverId: payload?.driverId,
              driverName: payload?.driverName,
            }}
            onClose={() => setShowAddPreferred(false)}
            onSuccess={() => setPreferredDone(true)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
