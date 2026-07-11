import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Car,
  Wallet,
  Calendar,
  Activity,
  Award,
  Star
} from "lucide-react";
import { getFullAdminDashboard } from "../../services/admin.service";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [timeRange, setTimeRange] = useState("today"); // 'today', 'week', 'month'

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await getFullAdminDashboard();
        if (res?.data) {
          setStats(res.data);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex-1 p-8 bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Đang tải bảng điều khiển...</p>
        </div>
      </div>
    );
  }

  // Helper values
  const currentTrips = stats.trips[timeRange] || 0;
  const currentEarnings = stats.earnings[timeRange] || 0;

  return (
    <div className="flex-1 p-4 md:p-8 bg-gray-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Bảng điều khiển
            </h1>
            <p className="text-gray-500 mt-1 font-medium">
              Theo dõi hiệu suất và thống kê tổng quan của hệ thống KidGo
            </p>
          </div>

          <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1">
            {[
              { id: "today", label: "Hôm nay" },
              { id: "week", label: "Tuần này" },
              { id: "month", label: "Tháng này" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTimeRange(tab.id)}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                  timeRange === tab.id
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Top Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card: Trips */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="flex items-center justify-between relative z-10 mb-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <Car size={24} />
              </div>
              <span className="text-sm font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                {timeRange === 'today' ? 'Ngày' : timeRange === 'week' ? 'Tuần' : 'Tháng'}
              </span>
            </div>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-1">Số chuyến đi</p>
            <h3 className="text-3xl font-black text-gray-900">{currentTrips.toLocaleString()}</h3>
          </div>

          {/* Card: Earnings */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="flex items-center justify-between relative z-10 mb-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                <Wallet size={24} />
              </div>
              <span className="text-sm font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                {timeRange === 'today' ? 'Ngày' : timeRange === 'week' ? 'Tuần' : 'Tháng'}
              </span>
            </div>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-1">Thu nhập hệ thống</p>
            <h3 className="text-3xl font-black text-gray-900">{currentEarnings.toLocaleString()} đ</h3>
          </div>

          {/* Card: Drivers */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="flex items-center justify-between relative z-10 mb-4">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                <Award size={24} />
              </div>
              <span className="text-sm font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Tổng</span>
            </div>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-1">Tài xế</p>
            <h3 className="text-3xl font-black text-gray-900">{stats.users?.drivers?.toLocaleString() || 0}</h3>
          </div>

          {/* Card: Parents */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="flex items-center justify-between relative z-10 mb-4">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                <Users size={24} />
              </div>
              <span className="text-sm font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Tổng</span>
            </div>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-1">Khách hàng</p>
            <h3 className="text-3xl font-black text-gray-900">{stats.users?.parents?.toLocaleString() || 0}</h3>
          </div>
        </div>

        {/* Driver Ranking Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                <Star size={20} className="fill-amber-500 text-amber-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Bảng xếp hạng tài xế
              </h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100">
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Hạng</th>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Tài xế</th>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Cấp chứng chỉ</th>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Tổng chuyến</th>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Đánh giá</th>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Bằng lái xe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(stats.driverRankings || []).map((driver, index) => (
                  <tr key={driver.driverId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      {index < 3 ? (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0 ? 'bg-amber-100 text-amber-700' :
                          index === 1 ? 'bg-gray-200 text-gray-700' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {index + 1}
                        </div>
                      ) : (
                        <span className="text-gray-500 font-medium ml-3">{index + 1}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{driver.driverName || "Chưa cập nhật"}</div>
                      <div className="text-xs text-gray-500 font-medium mt-0.5">{driver.status === 'active' ? 'Đang hoạt động' : 'Bị khóa/Chờ'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        Cấp {driver.certificationLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-gray-900">{driver.totalTrips}</span>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-1">
                      <span className="font-bold text-amber-600">
                        {driver.avgRating ? driver.avgRating.toFixed(1) : "N/A"}
                      </span>
                      <Star size={14} className="fill-amber-500 text-amber-500" />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 font-medium font-mono text-sm">{driver.licenseNumber}</span>
                    </td>
                  </tr>
                ))}
                {(!stats.driverRankings || stats.driverRankings.length === 0) && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Chưa có dữ liệu xếp hạng tài xế
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
