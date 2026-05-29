import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  ChevronRight,
  Eye,
  Megaphone,
  Send,
  Trash2,
} from "lucide-react";
import {
  getNotifications,
  markAllRead,
} from "../../services/notification.service.js";
import { getAlertDetail, escalateAlert } from "../../services/alert.service.js";

const typeMeta = {
  alert: {
    label: "Cảnh báo",
    icon: AlertTriangle,
    tone: "bg-amber-50 text-amber-600",
    border: "border-amber-200",
  },
  trip_start: {
    label: "Chuyến xe",
    icon: Megaphone,
    tone: "bg-emerald-50 text-emerald-600",
    border: "border-emerald-200",
  },
  system: {
    label: "Hệ thống",
    icon: Bell,
    tone: "bg-sky-50 text-sky-600",
    border: "border-sky-200",
  },
  default: {
    label: "Thông báo",
    icon: Bell,
    tone: "bg-slate-50 text-slate-600",
    border: "border-slate-200",
  },
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      console.log("danh sach thong bao:", res);
      const list = res?.notifications || [];
      setNotifications(
        list.map((item) => ({
          id: item._id,
          type: item.type || "default",
          title: item.title || "Thông báo",
          body: item.body || item.message || "",
          isRead: Boolean(item.isRead),
          createdAt: item.createdAt,
          refId: item.refId || null,
        })),
      );
    } catch (error) {
      console.error("Lỗi khi tải thông báo:", error);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (notification) => {
    setSelectedNotification(notification);
    setDetail(null);
    setDetailLoading(true);

    try {
      if (notification.type === "alert" && notification.refId) {
        const res = await getAlertDetail(notification.refId);
        setDetail(res?.data?.data || res?.data || null);
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết thông báo:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Xóa toàn bộ thông báo đã hiển thị?")) return;

    try {
      await markAllRead();
      setNotifications([]);
      setSelectedNotification(null);
      setDetail(null);
    } catch (error) {
      console.error("Lỗi khi xóa tất cả thông báo:", error);
    }
  };

  const handleSendReport = async () => {
    if (!selectedNotification?.refId || selectedNotification.type !== "alert") {
      return;
    }

    try {
      setActionLoading(true);
      await escalateAlert(selectedNotification.refId);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === selectedNotification.id
            ? { ...item, isRead: true }
            : item,
        ),
      );
    } catch (error) {
      console.error("Lỗi khi gửi báo cáo:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendReportForItem = async (notification) => {
    if (!notification?.refId || notification.type !== "alert") {
      return;
    }

    setSelectedNotification(notification);
    setDetail(null);

    try {
      setActionLoading(true);
      await escalateAlert(notification.refId);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, isRead: true } : item,
        ),
      );
    } catch (error) {
      console.error("Lỗi khi gửi báo cáo:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const currentMeta = typeMeta[selectedNotification?.type] || typeMeta.default;
  const CurrentIcon = currentMeta.icon;

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,#f7fbf7_0%,#ffffff_36%,#f4f7fb_100%)]">
      <header className="sticky top-0 z-20 border-b border-white/70 bg-white/85 backdrop-blur px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 active:scale-95 transition-transform"
            aria-label="Quay lại"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            {/* <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400 font-semibold">
              Inbox
            </p> */}
            <h1 className="text-xl font-black text-slate-900">Thông báo</h1>
          </div>
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-3 py-2 text-rose-600 font-bold text-sm active:scale-95 transition-transform"
          >
            <Trash2 size={16} />
            Xóa tất cả
          </button>
        </div>
      </header>

      <main className="px-4 py-4 pb-24">
        {loading ? (
          <div className="py-16 text-center text-slate-500">Đang tải...</div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Bell size={28} />
            </div>
            <p className="font-bold text-slate-900">Không có thông báo nào</p>
            <p className="mt-1 text-sm text-slate-500">
              Danh sách sẽ xuất hiện ở đây khi có cập nhật mới.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => {
              const meta = typeMeta[item.type] || typeMeta.default;
              const Icon = meta.icon;

              return (
                <article
                  key={item.id}
                  className={`rounded-3xl border ${meta.border} bg-white px-4 py-3 shadow-sm ${!item.isRead ? "ring-2 ring-slate-900/5" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${meta.tone}`}
                    >
                      <Icon size={20} />
                    </div>
                    <button
                      type="button"
                      onClick={() => openDetail(item)}
                      className="min-w-0 flex-1 text-left active:scale-[0.99] transition-transform"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h2 className="mt-1 text-sm font-bold text-slate-900">
                            {item.title}
                          </h2>
                          <p className="mt-1 text-[11px] text-slate-400">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleString(
                                  "vi-VN",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )
                              : ""}
                          </p>
                        </div>
                        {!item.isRead && (
                          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        )}
                      </div>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSendReportForItem(item)}
                        disabled={item.type !== "alert" || actionLoading}
                        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-rose-600 text-white active:scale-95 transition-transform disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Gửi báo cáo"
                        title="Gửi báo cáo"
                      >
                        <Send size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openDetail(item)}
                        className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white active:scale-95 transition-transform"
                        aria-label="Xem chi tiết"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      {/* <ChevronRight size={18} className="text-slate-300" /> */}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {selectedNotification && (
        <div className="fixed inset-0 z-30 bg-slate-950/50 px-4 pb-46 py-6 backdrop-blur-sm">
          <div className="mx-auto flex h-full max-w-md items-end">
            <div className="w-full rounded-[28px] bg-white p-5 shadow-2xl">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${currentMeta.tone}`}
                  >
                    <CurrentIcon size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Chi tiết
                    </p>
                    <h3 className="text-base font-black text-slate-900">
                      {selectedNotification.title}
                    </h3>
                  </div>
                </div>
                {/* <button
                  type="button"
                  onClick={() => {
                    setSelectedNotification(null);
                    setDetail(null);
                  }}
                  className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-600"
                >
                  Đóng
                </button> */}
              </div>

              {detailLoading ? (
                <div className="py-10 text-center text-slate-500">
                  Đang tải chi tiết...
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Nội dung
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {selectedNotification.body ||
                        "Không có nội dung chi tiết."}
                    </p>
                  </div>

                  {detail && (
                    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                      <p className="font-bold text-slate-900">
                        Dữ liệu liên quan
                      </p>
                      <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-slate-600">
                        {JSON.stringify(detail, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedNotification(null);
                        setDetail(null);
                      }}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700"
                    >
                      Đóng
                    </button>
                    <button
                      type="button"
                      disabled={
                        selectedNotification.type !== "alert" || actionLoading
                      }
                      onClick={handleSendReport}
                      className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-rose-300"
                    >
                      {actionLoading ? "Đang gửi..." : "Gửi báo cáo"}
                    </button>
                  </div>
                  {/* {selectedNotification.type !== "alert" && (
                    <p className="text-xs text-slate-400">
                      Báo cáo chỉ áp dụng cho thông báo cảnh báo có liên kết đến
                      alert.
                    </p>
                  )} */}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
