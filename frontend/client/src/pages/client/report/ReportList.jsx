import React, { useState, useEffect } from "react";
import { ArrowLeft, MessageSquare, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getReportsByParent } from "../../../services/report.service.js";

export default function ReportList() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await getReportsByParent();
      if (res.data?.success) {
        setReports(res.data.data.reports || []);
      } else {
        // Fallback if axios directly returns data
        setReports(res.data?.reports || res.data || []);
      }
    } catch (err) {
      console.error(err);
      setReports([]);
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col pb-24 bg-surface min-h-screen">
      {/* Header */}
      <header className="px-5 py-4 flex items-center gap-4 bg-white sticky top-0 z-40 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} className="text-on-surface" />
        </button>
        <h1 className="text-xl font-bold text-on-surface">
          Lịch sử phản hồi
        </h1>
      </header>

      <main className="px-5 pt-6 space-y-4">
        {loading ? (
          <div className="text-center text-on-surface-variant py-4">
            Đang tải...
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-secondary-container rounded-3xl p-5 text-white flex flex-col justify-between h-36 shadow-lg shadow-tertiary/20 w-full mt-4">
            <MessageSquare size={32} strokeWidth={1.5} />
            <div>
              <h3 className="font-bold text-lg">Chưa có phản hồi</h3>
              <p className="text-white/80 text-sm">
                Bạn chưa gửi phản hồi nào cho hệ thống.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report._id}
                className="bg-white p-5 rounded-3xl shadow-sm border border-outline-variant/30 relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {report.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(report.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
                      report.status === "RESOLVED"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {report.status === "RESOLVED" ? (
                      <>
                        <CheckCircle size={12} />
                        Đã trả lời
                      </>
                    ) : (
                      <>
                        <Clock size={12} />
                        Chờ xử lý
                      </>
                    )}
                  </span>
                </div>

                <div className="bg-gray-50 p-3 rounded-2xl mb-3">
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {report.content}
                  </p>
                </div>

                {report.status === "RESOLVED" && report.adminAnswer && (
                  <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                    <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
                      Phản hồi từ Admin
                    </h4>
                    <p className="text-sm text-blue-800">
                      {report.adminAnswer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
