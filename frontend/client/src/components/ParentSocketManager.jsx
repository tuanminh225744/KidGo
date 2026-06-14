import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { useSocketStore } from "../store/useSocketStore.js";
import {
  connectParentSocket,
  disconnectParentSocket,
} from "../socket/parentSocket.js";

export default function ParentSocketManager() {
  const user = useAuthStore((s) => s.user);
  const events = useSocketStore((s) => s.events);
  const markAsRead = useSocketStore((s) => s.markAsRead);

  const [toastEvent, setToastEvent] = useState(null);

  useEffect(() => {
    if (user && user._id) {
      connectParentSocket({ parentId: user._id });
    }
    return () => {
      disconnectParentSocket();
    };
  }, [user?._id]);

  // show toast when a new parent event arrives
  useEffect(() => {
    if (!events || events.length === 0) return;
    const last = events[events.length - 1];
    if (last.namespace !== "parent" || last.isRead) return;

    setToastEvent(last);
    const timer = setTimeout(() => {
      setToastEvent(null);
      markAsRead(toastEvent.id);
    }, 10000);

    return () => clearTimeout(timer);
  }, [events]);

  if (!toastEvent) return null;

  const { type, payload } = toastEvent;
  const title =
    payload?.title || (type && type.replace(/_/g, " ")) || "Thông báo";
  const message =
    payload?.message ||
    (payload?.otp
      ? `Mã OTP: ${payload.otp}`
      : JSON.stringify(payload).slice(0, 120));

  return (
    <div className="fixed left-5 right-5 z-50 top-5 max-w-[420px] mx-auto">
      <div className="bg-white border-2 border-outline-variant rounded-3xl p-4 flex items-start gap-3 shadow-lg">
        <div className="flex-1">
          <p className="text-sm font-bold text-on-surface">{title}</p>
          <p className="text-xs text-on-surface-variant mt-1">{message}</p>
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
