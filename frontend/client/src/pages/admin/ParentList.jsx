import React, { useState, useEffect } from "react";
import {
  getParents,
  getParentDetail,
  suspendParent,
  reactivateParent,
} from "../../services/admin.service";
import {
  Search,
  CheckCircle,
  XCircle,
  Filter,
  ChevronRight,
  FileText,
  Lock,
  Unlock,
  Users,
} from "lucide-react";

export default function ParentList() {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedParent, setSelectedParent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // States for search and filter
  const [search, setSearch] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchParents = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (isActiveFilter !== "") params.isActive = isActiveFilter;
      
      const response = await getParents(params);
      const data = response?.data?.users || [];
      setParents(data);
      setTotalPages(response?.data?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching parents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, [page, search, isActiveFilter]);

  const handleSelectParent = async (parent) => {
    setDetailLoading(true);
    setSelectedParent(parent); // set initial to show modal quickly
    try {
      const response = await getParentDetail(parent._id);
      setSelectedParent(response?.data || parent);
    } catch (error) {
      console.error("Error fetching parent details:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedParent) return;
    if (!window.confirm("Bạn có chắc muốn khóa phụ huynh này?")) return;
    setActionLoading(true);
    try {
      await suspendParent(selectedParent._id);
      setSelectedParent((prev) => ({ ...prev, isActive: false }));
      fetchParents();
    } catch (error) {
      console.error("Error suspending parent:", error);
      alert("Lỗi khi khóa phụ huynh.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!selectedParent) return;
    if (!window.confirm("Bạn có chắc muốn mở khóa phụ huynh này?")) return;
    setActionLoading(true);
    try {
      await reactivateParent(selectedParent._id);
      setSelectedParent((prev) => ({ ...prev, isActive: true }));
      fetchParents();
    } catch (error) {
      console.error("Error reactivating parent:", error);
      alert("Lỗi khi mở khóa phụ huynh.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Quản lý phụ huynh
            </h1>
            <p className="text-gray-500 mt-2 text-sm md:text-base">
              Theo dõi và quản lý danh sách phụ huynh và trẻ em trong hệ thống.
            </p>
          </div>
          <div className="flex gap-3">
            <select
              value={isActiveFilter}
              onChange={(e) => {
                setIsActiveFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium shadow-sm hover:bg-gray-50 transition-colors text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Đang hoạt động</option>
              <option value="false">Đã bị khóa</option>
            </select>
            <button
              onClick={() => {
                setSearch("");
                setIsActiveFilter("");
                setPage(1);
                fetchParents();
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
            placeholder="Tìm kiếm theo tên, SĐT hoặc Email..."
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
          ) : parents.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                <Users size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Không tìm thấy phụ huynh nào
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
                      Email
                    </th>
                    <th className="px-6 py-5 font-bold">Trạng thái</th>
                    <th className="px-6 py-5 font-bold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {parents.map((parent) => (
                    <tr
                      key={parent._id}
                      className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                      onClick={() => handleSelectParent(parent)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {parent.fullName || "Chưa cập nhật"}
                        </div>
                        <div className="text-sm text-gray-500 sm:hidden mt-0.5">
                          {parent.phone || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium hidden sm:table-cell">
                        {parent.phone || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-gray-500 hidden md:table-cell">
                        {parent.email || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        {parent.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            Đã khóa
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          className="inline-flex items-center gap-1 text-blue-600 font-bold text-sm bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectParent(parent);
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
      {selectedParent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm sm:p-6">
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-full animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">
                  Chi tiết Phụ huynh
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  ID: <span className="font-mono">{selectedParent._id}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedParent(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm border border-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="px-8 py-8 overflow-y-auto">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
                  {(selectedParent.fullName || "U")[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedParent.fullName || "Chưa cập nhật"}
                  </h3>
                  <div className="mt-2">
                    {selectedParent.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Đã khóa
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
                      {selectedParent.phone || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      Email
                    </label>
                    <p
                      className="font-semibold text-gray-900 text-lg truncate"
                      title={selectedParent.email || "N/A"}
                    >
                      {selectedParent.email || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <Users size={20} /> Danh sách trẻ em (Kids)
                  </h4>
                  {detailLoading ? (
                    <p className="text-sm text-blue-800/80">Đang tải...</p>
                  ) : selectedParent.kids && selectedParent.kids.length > 0 ? (
                    <div className="space-y-3">
                      {selectedParent.kids.map((kid) => (
                        <div key={kid._id} className="bg-white p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                              {(kid.fullName || "K")[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{kid.fullName}</p>
                              <p className="text-xs text-gray-500">Tuổi: {kid.age || "N/A"}</p>
                            </div>
                          </div>
                          <div className="text-xs">
                            {kid.isActive ? (
                               <span className="text-green-600 font-medium bg-green-50 px-2 py-1 rounded">Hoạt động</span>
                            ) : (
                               <span className="text-red-600 font-medium bg-red-50 px-2 py-1 rounded">Khóa</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-blue-800/80">
                      Phụ huynh này chưa thêm thông tin trẻ em nào.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-3 sm:justify-end">
              {selectedParent.isActive ? (
                <button
                  onClick={handleSuspend}
                  disabled={actionLoading}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-red-700 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Lock size={20} />
                  {actionLoading ? "Đang xử lý..." : "Khóa tài khoản"}
                </button>
              ) : (
                <button
                  onClick={handleReactivate}
                  disabled={actionLoading}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-green-700 bg-white border border-green-200 hover:bg-green-50 hover:border-green-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Unlock size={20} />
                  {actionLoading ? "Đang xử lý..." : "Mở khóa"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
