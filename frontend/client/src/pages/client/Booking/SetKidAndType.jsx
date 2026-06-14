import {
  X,
  Check,
  Plus,
  Calendar,
  RefreshCcw,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getKidsByParent } from "../../../services/kid.service.js";
import { useBookingStore } from "../../../store/useBookingStore.js";

export default function SetKidAndType() {
  const navigate = useNavigate();
  const setBookingData = useBookingStore((state) => state.setBookingData);
  const [kids, setKids] = useState([]);
  const [selectedKid, setSelectedKid] = useState("");
  const [tripType, setTripType] = useState("one-time");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKids();
  }, []);

  const loadKids = async () => {
    setLoading(true);
    const result = await getKidsByParent();
    if (result.success) {
      const kidList = result.data || result;
      setKids(kidList);
      if (kidList.length > 0) {
        setSelectedKid(kidList[0]._id);
      }
    } else {
      setKids([]);
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-surface min-h-screen">
      <header className="px-5 py-4 flex justify-between items-center sticky top-0 bg-white z-20">
        <button
          onClick={() => navigate("/client/home")}
          className="flex items-center gap-1 text-on-surface-variant p-2 rounded-xl hover:bg-surface-container-low transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-bold">Quay lại</span>
        </button>
        <h1 className="text-2xl font-bold text-primary">Đặt xe</h1>
        <span className="text-sm font-bold text-on-surface-variant mx-8">
          1/4
        </span>
      </header>

      {/* Progress Bar */}
      <div className="px-5 mt-2">
        <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
          <div className="bg-primary-container h-full w-1/4 rounded-full transition-all duration-500" />
        </div>
      </div>

      <main className="px-5 pt-8 pb-52 space-y-10">
        <section>
          <h2 className="text-3xl font-extrabold text-on-surface mb-2 tracking-tight">
            Đặt xe cho ai?
          </h2>
          <p className="text-on-surface-variant text-sm font-medium">
            Chọn bé bạn muốn đăng ký chuyến đi hôm nay.
          </p>
        </section>

        <section className="grid grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 text-center text-on-surface-variant py-4">
              Đang tải danh sách bé...
            </div>
          ) : (
            kids.map((kid) => (
              <div
                key={kid._id}
                onClick={() => setSelectedKid(kid._id)}
                className={`relative rounded-3xl p-5 flex flex-col items-center text-center transition-all cursor-pointer border-2 ${selectedKid === kid._id ? "bg-[#EEF2FF] border-primary-container active-shadow" : "bg-white border-outline-variant soft-shadow"}`}
              >
                {selectedKid === kid._id && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-primary-container text-white rounded-full flex items-center justify-center">
                    <Check size={14} strokeWidth={4} />
                  </div>
                )}
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl mb-4 shadow-sm border border-outline-variant/10 overflow-hidden">
                  <img
                    src={
                      kid.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${kid.fullName}`
                    }
                    alt={kid.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3
                  className={`font-bold ${selectedKid === kid._id ? "text-primary" : "text-on-surface"} mb-1`}
                >
                  {kid.fullName}
                </h3>
              </div>
            ))
          )}

          <div
            onClick={() => navigate("/client/kid-profile")}
            className="border-2 border-dashed border-outline-variant rounded-3xl p-5 flex flex-col items-center justify-center text-center bg-transparent active:bg-surface-container-low transition-all cursor-pointer h-full"
          >
            <div className="w-12 h-12 rounded-full bg-primary-container/10 text-primary-container flex items-center justify-center mb-2">
              <Plus size={32} />
            </div>
            <span className="text-xs font-bold text-primary-container">
              Thêm bé mới
            </span>
          </div>
        </section>

        {/* <section>
          <h2 className="text-xl font-bold text-on-surface mb-5">Loại chuyến</h2>
          <div className="space-y-4">
            <div
              onClick={() => setTripType('one-time')}
              className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between ${tripType === 'one-time' ? 'bg-[#EEF2FF] border-primary-container' : 'bg-surface-container-low border-transparent'}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="font-bold">Một lần 📅</h3>
                  <p className="text-xs text-on-surface-variant font-medium">Chuyến đi riêng lẻ theo nhu cầu</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${tripType === 'one-time' ? 'border-primary-container' : 'border-outline'}`}>
                {tripType === 'one-time' && <div className="w-3 h-3 rounded-full bg-primary-container" />}
              </div>
            </div>

            <div
              onClick={() => setTripType('recurring')}
              className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between ${tripType === 'recurring' ? 'bg-[#EEF2FF] border-primary-container' : 'bg-surface-container-low border-transparent'}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-secondary shadow-sm">
                  <RefreshCcw size={24} />
                </div>
                <div>
                  <h3 className="font-bold">Định kỳ 🔄</h3>
                  <p className="text-xs text-on-surface-variant font-medium">Lịch trình lặp lại hàng tuần</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${tripType === 'recurring' ? 'border-primary-container' : 'border-outline'}`}>
                {tripType === 'recurring' && <div className="w-3 h-3 rounded-full bg-primary-container" />}
              </div>
            </div>
          </div>
        </section> */}
      </main>

      <div className="fixed bottom-22 left-0 right-0 p-5 bg-white shadow-[0px_-4px_20px_0px_rgba(79,70,200,0.06)] z-30 max-w-[430px] mx-auto">
        <button
          onClick={() => {
            setBookingData({ kidId: selectedKid, tripType });
            navigate("/client/booking/location");
          }}
          disabled={!selectedKid}
          className="w-full bg-primary-container text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Tiếp tục <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
