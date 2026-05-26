import React, { useState, useEffect } from "react";
import {
  getDrivers,
  approveDriver,
  rejectDriver,
} from "../../services/admin.service";
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Filter,
  ChevronRight,
  LogOut,
  FileText,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function DriverApproval() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const response = await getDrivers({ status: "pending" });
      const data = response?.drivers || [];
      setDrivers(data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleApprove = async () => {
    if (!selectedDriver) return;
    setActionLoading(true);
    try {
      await approveDriver(selectedDriver._id);
      setSelectedDriver(null);
      fetchDrivers();
    } catch (error) {
      console.error("Error approving driver:", error);
      alert("Failed to approve driver");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedDriver) return;
    setActionLoading(true);
    try {
      await rejectDriver(selectedDriver._id);
      setSelectedDriver(null);
      fetchDrivers();
    } catch (error) {
      console.error("Error rejecting driver:", error);
      alert("Failed to reject driver");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200 p-4 flex flex-col">
        <div className="flex items-center gap-3 px-2 py-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-extrabold text-lg tracking-tighter">
              KG
            </span>
          </div>
          <span className="font-bold text-xl text-gray-900 tracking-tight">
            AdminPanel
          </span>
        </div>

        <nav className="flex-1 mt-6 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-semibold transition-colors">
            <Users size={20} />
            Duyệt tài xế
          </button>
          {/* Future nav items can go here */}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
          >
            <LogOut size={20} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Duyệt đăng ký tài xế
              </h1>
              <p className="text-gray-500 mt-2 text-sm md:text-base">
                Quản lý và xét duyệt các hồ sơ tài xế đang chờ chấp thuận.
              </p>
            </div>

            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium shadow-sm hover:bg-gray-50 transition-colors text-sm">
                <Filter size={16} /> Lọc
              </button>
              <button
                onClick={fetchDrivers}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium shadow-sm hover:bg-gray-50 transition-colors text-sm"
              >
                Làm mới
              </button>
            </div>
          </div>

          {/* Search Bar (Visual Only for now) */}
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 mb-6">
            <div className="pl-4 text-gray-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, SĐT hoặc email..."
              className="flex-1 py-3 bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
            />
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center text-gray-400">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="font-medium">Đang tải dữ liệu...</p>
              </div>
            ) : drivers.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                  <FileText size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Không có hồ sơ chờ duyệt
                </h3>
                <p className="text-gray-500 mt-1 max-w-sm">
                  Hiện tại tất cả các đăng ký tài xế đã được xử lý xong.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                      <th className="px-6 py-5 font-bold">Họ và Tên</th>
                      <th className="px-6 py-5 font-bold hidden sm:table-cell">
                        Số điện thoại
                      </th>
                      <th className="px-6 py-5 font-bold hidden md:table-cell">
                        Email
                      </th>
                      <th className="px-6 py-5 font-bold">Trạng thái</th>
                      <th className="px-6 py-5 font-bold text-right">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {drivers.map((driver) => (
                      <tr
                        key={driver._id}
                        className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                        onClick={() => setSelectedDriver(driver)}
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {driver.userInfo?.fullName ||
                              driver.name ||
                              "Chưa cập nhật"}
                          </div>
                          <div className="text-sm text-gray-500 sm:hidden mt-0.5">
                            {driver.userInfo?.phone || driver.phone || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-medium hidden sm:table-cell">
                          {driver.userInfo?.phone || driver.phone || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-gray-500 hidden md:table-cell">
                          {driver.userInfo?.email || driver.email || "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                            Chờ duyệt
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            className="inline-flex items-center gap-1 text-blue-600 font-bold text-sm bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDriver(driver);
                            }}
                          >
                            Xem chi tiết <ChevronRight size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm sm:p-6">
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-full animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">
                  Chi tiết hồ sơ
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  ID: <span className="font-mono">{selectedDriver._id}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedDriver(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm border border-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="px-8 py-8 overflow-y-auto">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
                  {(selectedDriver.userInfo?.fullName || "U")[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedDriver.userInfo?.fullName || "Chưa cập nhật"}
                  </h3>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 mt-1 border border-yellow-200">
                    Trạng thái: Chờ duyệt
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      Số điện thoại
                    </label>
                    <p className="font-semibold text-gray-900 text-lg">
                      {selectedDriver.userInfo?.phone || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      Email
                    </label>
                    <p
                      className="font-semibold text-gray-900 text-lg truncate"
                      title={selectedDriver.userInfo?.email || "N/A"}
                    >
                      {selectedDriver.userInfo?.email || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Additional Info Section Example */}
                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                  <h4 className="font-bold text-blue-900 mb-3 text-sm flex items-center gap-2">
                    <FileText size={16} /> Thông tin bổ sung
                  </h4>
                  <p className="text-sm text-blue-800/80 mb-2">
                    Vui lòng kiểm tra các thông tin pháp lý (CCCD, Bằng lái) qua
                    kênh hỗ trợ trước khi duyệt nếu cần thiết.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-red-700 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <XCircle size={20} />
                {actionLoading ? "Đang xử lý..." : "Từ chối hồ sơ"}
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                {actionLoading ? "Đang xử lý..." : "Phê duyệt tài xế"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
