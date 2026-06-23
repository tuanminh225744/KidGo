import { useState, useEffect } from 'react';
import { Bell, Car, Clock, MapPin } from 'lucide-react';
import { getDriverTrips } from '../../services/driver.service';
import { useNavigate } from 'react-router-dom';

export default function ScheduleView() {
  const navigate = useNavigate();
  const [scheduledTrips, setScheduledTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const res = await getDriverTrips({ status: 'scheduled' });
        if (res?.data?.data) {
          setScheduledTrips(res.data.data);
        }
      } catch (error) {
        console.error('Lỗi khi tải lịch chuyến:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between p-4 bg-white">
        <div className="flex items-center gap-3">
          <img src="/images/anh-avatar-trang.jpg" className="w-10 h-10 rounded-full border-2 border-[#1D7C45] p-0.5" />
          <h1 className="text-xl font-bold text-[#1D7C45]">Lịch chuyến</h1>
        </div>
        <Bell className="w-6 h-6 text-[#1D7C45]" onClick={() => navigate('/driver/notifications')} />
      </div>

      <div className="flex overflow-x-auto p-4 gap-2 no-scrollbar bg-white">
        {[
          { d: 'CN', n: 19 },
          { d: 'T2', n: 20 },
          { d: 'T3', n: 21, active: true },
          { d: 'T4', n: 22 },
          { d: 'T5', n: 23 },
          { d: 'T6', n: 24 },
          { d: 'T7', n: 25 }].map((day, idx) => (
            <div
              key={idx}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-12 py-3 rounded-xl transition-all ${day.active ? 'bg-[#1D7C45] text-white shadow-lg shadow-green-100' : 'bg-gray-50 text-gray-500'}`}>
              <span className="text-[10px] font-bold uppercase mb-1">{day.d}</span>
              <span className="text-lg font-bold">{day.n}</span>
              {day.active && <div className="w-1 h-1 bg-white rounded-full mt-1" />}
            </div>
          ))}
      </div>

      <div className="p-4">
        <h2 className="font-bold text-gray-800 mb-4">Chuyến trong ngày đã chọn</h2>

        <div className="space-y-6 relative">
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-100" />

          {loading ? (
            <p className="text-gray-500 text-center py-5">Đang tải...</p>
          ) : scheduledTrips.length === 0 ? (
            <p className="text-gray-500 text-center py-5">Không có chuyến nào được lên lịch</p>
          ) : (
            scheduledTrips.map((trip, idx) => {
              const time = new Date(trip.plannedStartTime || trip.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const isFirst = idx === 0;
              return (
                <div key={trip._id} className="relative pl-14">
                  <div className={`absolute left-3 top-2 w-7 h-7 rounded-lg flex items-center justify-center z-10 ${isFirst ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {isFirst ? <Car className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div className={`bg-white p-4 rounded-2xl border border-gray-100 shadow-sm ${isFirst ? '' : 'opacity-80 hover:opacity-100 transition-opacity'}`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className={`font-bold ${isFirst ? 'text-[#1D7C45]' : 'text-gray-600'}`}>{time}</span>
                      <span className={`text-[10px] px-3 py-1 rounded-full font-bold ${isFirst ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                        {isFirst ? 'Sắp diễn ra' : 'Đã lên lịch'}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-3">{trip.kid?.name || 'Bé A'}</h3>
                    <div className="flex gap-3 mb-4">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <p className="text-sm text-gray-600">{trip.pickupLocation?.address || 'Điểm đón'}</p>
                    </div>
                    <div className="h-6 border-l-2 border-dashed border-gray-200 ml-2" />
                    <div className="flex gap-3">
                      <div className="w-4 h-4 rounded border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-sm" />
                      </div>
                      <p className="text-sm text-gray-600">{trip.dropoffLocation?.address || 'Điểm đến'}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <h2 className="font-bold text-gray-800 mt-8 mb-4">Chuyến định kỳ của tôi</h2>
        <div className="space-y-3">
          {[
            { tag: 'T2-T6', time: '07:30', name: 'Bé A', path: 'Nhà → Trường' },
            { tag: 'T2-T6', time: '12:00', name: 'Bé A', path: 'Trường → Nhà' }].map((trip, idx) => (
              <div key={idx} className="bg-blue-50/40 p-4 rounded-xl flex items-center justify-between border border-blue-100/50">
                <div>
                  <p className="text-[10px] font-bold text-green-700 mb-1">{trip.tag} • {trip.time}</p>
                  <p className="font-bold text-gray-800">{trip.name} <span className="text-gray-400 font-normal">→ {trip.path}</span></p>
                </div>
                <div className="w-12 h-6 bg-green-600 rounded-full p-1 relative shadow-inner">
                  <div className="absolute right-1 top-1 bottom-1 w-4 bg-white rounded-full" />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}