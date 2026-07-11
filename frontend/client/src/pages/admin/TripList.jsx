import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Clock,
  AlertTriangle,
  User,
  Car,
  Calendar,
} from "lucide-react";
import { getAdminTrips } from "../../services/admin.service";
import moment from "moment";
import "moment/locale/vi";

moment.locale("vi");

export default function TripList() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      // Note: Backend currently supports parentId or driverId, not search string out-of-the-box in the user's new getAllTrips.
      // We will need to adapt to whatever backend offers.
      // Wait, user's backend `getAllTrips` does NOT have `search` logic anymore.
      // Let's pass search as `search` anyway and see if backend handles it or we filter locally.
      // Let's filter locally if backend doesn't support `search`.
      const res = await getAdminTrips(params);
      if (res?.data) {
        let data = res.data.data;
        if (searchQuery) {
          data = data.filter((t) => {
            const searchLower = searchQuery.toLowerCase();
            return (
              t.parentId?.fullName?.toLowerCase().includes(searchLower) ||
              t.driverId?.user?.fullName?.toLowerCase().includes(searchLower) ||
              t.kidId?.fullName?.toLowerCase().includes(searchLower)
            );
          });
        }
        console.log(data);
        setTrips(data);
        setTotalPages(res.data.totalPages);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách chuyến:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [page, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTrips();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "scheduled":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-gray-100 text-gray-700">Đã lên lịch</span>;
      case "picking_up":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-100 text-blue-700">Đang đón</span>;
      case "in_progress":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-purple-100 text-purple-700">Đang chạy</span>;
      case "completed":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-green-100 text-green-700">Hoàn thành</span>;
      case "cancelled":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-red-100 text-red-700">Đã hủy</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 bg-gray-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Quản lý chuyến xe
            </h1>
            <p className="text-gray-500 mt-1 font-medium">
              Theo dõi và quản lý lịch sử chuyến đi của hệ thống
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearch} className="flex-1 w-full max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm theo tên KH, Tài xế..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="flex gap-2 w-full md:w-auto">
            <select
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 w-full md:w-48"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="scheduled">Đã lên lịch</option>
              <option value="picking_up">Đang đón</option>
              <option value="in_progress">Đang chạy</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Chuyến / Trẻ</th>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Khách hàng</th>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Tài xế</th>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Trạng thái</th>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Thời gian</th>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Cảnh báo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-2 text-gray-500 font-medium">Đang tải dữ liệu...</p>
                    </td>
                  </tr>
                ) : trips.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">
                      Không tìm thấy chuyến xe nào.
                    </td>
                  </tr>
                ) : (
                  trips.map((trip) => (
                    <tr key={trip._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          {trip.kidId?.fullName || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-1">ID: {trip._id.slice(-6).toUpperCase()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{trip.parentId?.fullName || "N/A"}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{trip.parentId?.phone || trip.parentId?.email || ""}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          <Car size={16} className="text-gray-400" />
                          {trip.driverId?.user?.fullName || "N/A"} {/* Note: user details need correct population */}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">
                          {trip.vehicleId?.licensePlate || trip.driverId?.licenseNumber || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(trip.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                            <Clock size={14} className="text-blue-500" />
                            {trip.routeId?.actualPickupTime
                              ? moment(trip.routeId.actualPickupTime).format("HH:mm, DD/MM/YYYY")
                              : (trip.routeId?.scheduledPickupTime ? `${moment(trip.routeId.scheduledPickupTime).format("HH:mm, DD/MM/YYYY")}` : "Chưa đón")}
                          </div>
                          {/* <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                            <MapPin size={14} className="text-green-500" />
                            {trip.routeId?.actualDropoffTime 
                              ? moment(trip.routeId.actualDropoffTime).format("HH:mm, DD/MM/YYYY") 
                              : (trip.routeId?.scheduledDropoffTime ? `Dự kiến: ${moment(trip.routeId.scheduledDropoffTime).format("HH:mm, DD/MM/YYYY")}` : "Chưa trả")}
                          </div> */}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-64">
                        {trip.alerts && trip.alerts.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {trip.alerts.map((alert, idx) => (
                              <div key={idx} className="flex items-start gap-1.5 text-red-600 text-xs font-medium">
                                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                <span>{alert.body || alert.title || "Cảnh báo"}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm font-medium">Không có</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Trước
              </button>
              <span className="text-sm font-medium text-gray-600">
                Trang {page} / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
