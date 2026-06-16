import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { useSocketStore } from "../store/useSocketStore.js";
import {
  connectAdminSocket,
  disconnectAdminSocket,
} from "../socket/adminSocket.js";

export default function AdminSocketManager() {
  const user = useAuthStore((s) => s.user);
  const events = useSocketStore((s) => s.events);
  const markAsRead = useSocketStore((s) => s.markAsRead);

  const [toastEvent, setToastEvent] = useState(null);

  useEffect(() => {
    if (user && user._id && user.role === "admin") {
      connectAdminSocket({ adminId: user._id });
    }
    return () => {
      disconnectAdminSocket();
    };
  }, [user?._id]);

  useEffect(() => {
    if (!events || events.length === 0) return;
    const last = events[events.length - 1];
    if (last.namespace !== "admin" || last.isRead) return;

    setToastEvent(last);
    const timer = setTimeout(() => {
      setToastEvent(null);
      markAsRead(toastEvent.id);
    }, 10000);

    return () => clearTimeout(timer);
  }, [events]);

  if (!toastEvent) return null;

  const { type, payload } = toastEvent;
  const title = payload?.report?.title || "Thông báo";

  return (
    <div className="fixed top-5 left-5 right-5 z-[500] mx-auto max-w-[420px] md:left-auto md:right-5 md:w-96 md:mx-0">
      <div className="bg-white border-2 border-outline-variant rounded-3xl p-4 flex items-start gap-3 shadow-lg">
        <div className="flex-1">
          <p className="text-sm font-bold text-on-surface">Report từ khách</p>
          <p className="text-xs text-on-surface-variant mt-1">{title}</p>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => {
              markAsRead(toastEvent.id);
              setToastEvent(null);
            }}
            className="bg-primary-container text-white px-4 py-2 rounded-xl font-bold"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
