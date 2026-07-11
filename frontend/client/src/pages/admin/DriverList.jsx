import React, { useState, useEffect } from "react";
import {
  getDrivers,
  getDriverDetail,
  suspendDriver,
  reactivateDriver,
  updateDriverCertification,
  getDriverEarnings,
} from "../../services/admin.service";
import { useNavigate } from "react-router-dom";
import {
  Search,
  CheckCircle,
  XCircle,
  Filter,
  ChevronRight,
  FileText,
  Lock,
  Unlock,
  MapPin,
  Map,
  Wallet,
} from "lucide-react";

export default function DriverList() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [driverEarnings, setDriverEarnings] = useState(null);

  // States for search and filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isOnlineFilter, setIsOnlineFilter] = useState("");
  const [rideStatusFilter, setRideStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (isOnlineFilter !== "") params.isOnline = isOnlineFilter;
      if (rideStatusFilter) params.rideStatus = rideStatusFilter;

      const response = await getDrivers(params);
      const data = response?.data?.drivers || [];
      setDrivers(data);
      setTotalPages(response?.data?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [page, search, statusFilter, isOnlineFilter, rideStatusFilter]);

  const handleSelectDriver = async (driver) => {
    setDetailLoading(true);
    setSelectedDriver(driver);
    setDriverEarnings(null);
    try {
      const response = await getDriverDetail(driver._id);
      setSelectedDriver(response?.data || driver);
      console.log("Selected driver:", response?.data);

      const earningsRes = await getDriverEarnings(driver._id, { period: 'month' });
      console.log("Driver earnings:", earningsRes?.data);
      if (earningsRes?.data) {
        setDriverEarnings(earningsRes.data);
      }
    } catch (error) {
      console.error("Error fetching driver details:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedDriver) return;
    if (!window.confirm("Bạn có chắc muốn khóa tài xế này?")) return;
    setActionLoading(true);
    try {
      await suspendDriver(selectedDriver._id);
      setSelectedDriver((prev) => ({ ...prev, status: "suspended" }));
      fetchDrivers();
    } catch (error) {
      console.error("Error suspending driver:", error);
      alert("Lỗi khi khóa tài xế.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!selectedDriver) return;
    if (!window.confirm("Bạn có chắc muốn mở khóa tài xế này?")) return;
    setActionLoading(true);
    try {
      const result = await reactivateDriver(selectedDriver._id);
      if (result.success) {
        alert("Đã mở khóa tài xế!");
        setSelectedDriver(null);
        fetchDrivers();
      }
    } catch (error) {
      alert("Lỗi khi mở khóa tài xế: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCertification = async (level) => {
    if (!window.confirm(`Bạn có chắc muốn cập nhật chứng chỉ thành cấp ${level}?`)) return;
    setActionLoading(true);
    try {
      const result = await updateDriverCertification(selectedDriver._id, level);
      if (result.success) {
        alert("Cập nhật chứng chỉ thành công!");
        setSelectedDriver((prev) => ({ ...prev, certificationLevel: level }));
        fetchDrivers();
      }
    } catch (error) {
      alert("Lỗi khi cập nhật chứng chỉ: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Hoạt động
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Đã khóa
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
            Chờ duyệt
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
            Từ chối
          </span>
        );
      default:
        return null;
    }
  };

  const getRideStatusLabel = (rideStatus) => {
    switch (rideStatus) {
      case "free": return "Đang rảnh";
      case "driving_to_pickup": return "Đang đi đón khách";
      case "waiting_for_kid": return "Đang chờ khách";
      case "in_trip": return "Đang trong chuyến";
      default: return "Không rõ";
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Quản lý tài xế
            </h1>
            <p className="text-gray-500 mt-2 text-sm md:text-base">
              Theo dõi và quản lý danh sách toàn bộ tài xế trong hệ thống.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium shadow-sm hover:bg-gray-50 transition-colors text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Trạng thái (Tất cả)</option>
              <option value="active">Hoạt động</option>
              <option value="pending">Chờ duyệt</option>
              <option value="suspended">Đã khóa</option>
              <option value="rejected">Từ chối</option>
            </select>

            <select
              value={isOnlineFilter}
              onChange={(e) => {
                setIsOnlineFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium shadow-sm hover:bg-gray-50 transition-colors text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Trực tuyến (Tất cả)</option>
              <option value="true">Online</option>
              <option value="false">Offline</option>
            </select>

            {/* <select
              value={rideStatusFilter}
              onChange={(e) => {
                setRideStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium shadow-sm hover:bg-gray-50 transition-colors text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chuyến xe (Tất cả)</option>
              <option value="free">Đang rảnh</option>
              <option value="driving_to_pickup">Đang đi đón khách</option>
              <option value="waiting_for_kid">Đang chờ khách</option>
              <option value="in_trip">Đang trong chuyến</option>
            </select> */}
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setIsOnlineFilter("");
                setRideStatusFilter("");
                setPage(1);
                fetchDrivers();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium shadow-sm hover:bg-gray-50 transition-colors text-sm"
            >
              Làm mới
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 mb-6">
          <div className="pl-4 text-gray-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, SĐT, Email hoặc Bằng lái..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1 py-3 bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-6">
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
                Không tìm thấy tài xế nào
              </h3>
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
                      Trực tuyến
                    </th>
                    <th className="px-6 py-5 font-bold hidden lg:table-cell">
                      Trạng thái xe
                    </th>
                    <th className="px-6 py-5 font-bold hidden md:table-cell">
                      Chứng chỉ
                    </th>
                    <th className="px-6 py-5 font-bold">Hồ sơ</th>
                    <th className="px-6 py-5 font-bold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {drivers.map((driver) => (
                    <tr
                      key={driver._id}
                      className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                      onClick={() => handleSelectDriver(driver)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {driver.userInfo?.fullName || driver.name || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500 sm:hidden mt-0.5">
                          {driver.userInfo?.phone || driver.phone || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium hidden sm:table-cell">
                        {driver.userInfo?.phone || driver.phone || "N/A"}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        {driver.isOnline ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-500 border border-gray-200">
                            <span className="w-2 h-2 rounded-full bg-gray-400"></span> Offline
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        {driver.rideStatus === "free" && (
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                            Đang rảnh
                          </span>
                        )}
                        {driver.rideStatus === "driving_to_pickup" && (
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-100">
                            Đi đón khách
                          </span>
                        )}
                        {driver.rideStatus === "waiting_for_kid" && (
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-orange-50 text-orange-700 border border-orange-100">
                            Chờ khách
                          </span>
                        )}
                        {driver.rideStatus === "in_trip" && (
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
                            Trong chuyến
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Cấp {driver.certificationLevel || 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(driver.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          className="inline-flex items-center gap-1 text-blue-600 font-bold text-sm bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectDriver(driver);
                          }}
                        >
                          Chi tiết <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-50"
            >
              Trước
            </button>
            <span className="px-4 py-2 font-medium text-gray-700">
              Trang {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 disabled:opacity-50 hover:bg-gray-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>

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
                  Chi tiết Tài xế
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
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold relative">
                  {selectedDriver.user?.avatar ? (
                    <img
                      src={selectedDriver.user.avatar}
                      alt={selectedDriver.user?.fullName || "Driver"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-blue-600">
                      {(selectedDriver.user?.fullName || "U")[0].toUpperCase()}
                    </span>
                  )}
                  {selectedDriver.isOnline && (
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedDriver.user?.fullName || "Chưa cập nhật"}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {getStatusBadge(selectedDriver.status)}
                    {selectedDriver.isOnline ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        Online ({getRideStatusLabel(selectedDriver.rideStatus)})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                        Offline
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      Số điện thoại
                    </label>
                    <p className="font-semibold text-gray-900 text-lg">
                      {selectedDriver.user?.phone || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      Email
                    </label>
                    <p
                      className="font-semibold text-gray-900 text-lg truncate"
                      title={selectedDriver.user?.email || "N/A"}
                    >
                      {selectedDriver.user?.email || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Bằng lái xe
                  </label>
                  <p className="font-semibold text-gray-900 text-lg">
                    {selectedDriver.licenseNumber || "Chưa cập nhật"}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                    Cấp chứng chỉ
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        onClick={() => handleUpdateCertification(level)}
                        disabled={actionLoading}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${(selectedDriver.certificationLevel || 1) === level
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                          }`}
                      >
                        Cấp {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Earnings section */}
                {driverEarnings && (
                  <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
                    <h4 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                      <Wallet size={18} /> Thu nhập tháng này
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-green-700/70 uppercase mb-1">Tổng thu nhập</p>
                        <p className="text-xl font-black text-green-700">
                          {driverEarnings.actualEarnings?.toLocaleString() || 0}đ
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-green-700/70 uppercase mb-1">Tiền mặt đã thu</p>
                        <p className="text-xl font-black text-green-700">
                          {driverEarnings.cashReceived?.toLocaleString() || 0}đ
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-green-200">
                      {driverEarnings.actualEarnings - driverEarnings.cashReceived >= 0 ? (
                        <div>
                          <p className="text-sm font-bold text-gray-700 mb-1">Hệ thống nợ tài xế:</p>
                          <p className="text-2xl font-black text-blue-600">
                            {Math.abs(driverEarnings.actualEarnings - driverEarnings.cashReceived).toLocaleString()}đ
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-bold text-gray-700 mb-1">Tài xế nợ hệ thống:</p>
                          <p className="text-2xl font-black text-red-600">
                            {Math.abs(driverEarnings.actualEarnings - driverEarnings.cashReceived).toLocaleString()}đ
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedDriver.activeTripId && (
                  <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                    <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <MapPin size={18} /> Chuyến xe hiện tại
                    </h4>
                    <p className="text-sm text-blue-800/80 mb-4">
                      Tài xế đang thực hiện chuyến đi. Bạn có thể xem trực tiếp vị trí và trạng thái chuyến xe.
                    </p>
                    <button
                      onClick={() => navigate(`/admin/live-trip?tripId=${selectedDriver.activeTripId}`)}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition-colors shadow-sm text-sm"
                    >
                      <Map size={16} /> Xem trạng thái chuyến xe
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:justify-end">
              {selectedDriver.status === "active" ? (
                <button
                  onClick={handleSuspend}
                  disabled={actionLoading}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-red-700 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Lock size={20} />
                  {actionLoading ? "Đang xử lý..." : "Khóa tài khoản"}
                </button>
              ) : selectedDriver.status === "suspended" ? (
                <button
                  onClick={handleReactivate}
                  disabled={actionLoading}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-green-700 bg-white border border-green-200 hover:bg-green-50 hover:border-green-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Unlock size={20} />
                  {actionLoading ? "Đang xử lý..." : "Mở khóa"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
