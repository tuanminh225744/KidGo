import { useState, useEffect } from 'react';
import { Bell, Car, Clock, MapPin } from 'lucide-react';
import { getDriverDailySchedules, getDriverSubscriptionSchedules } from '../../services/driver.service';
import { useNavigate } from 'react-router-dom';

export default function ScheduleView() {
  const navigate = useNavigate();
  const [scheduledTrips, setScheduledTrips] = useState([]);
  const [subTrips, setSubTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const dateStr = selectedDate.toISOString().split('T')[0];

        const [dailyRes, subRes] = await Promise.all([
          getDriverDailySchedules(dateStr),
          getDriverSubscriptionSchedules()
        ]);

        if (dailyRes?.data) {
          setScheduledTrips(dailyRes.data);
        }
        if (subRes?.data) {
          setSubTrips(subRes.data);
        }
      } catch (error) {
        console.error('Lỗi khi tải lịch chuyến:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [selectedDate]);

  const generateWeekDates = () => {
    const dates = [];
    for (let i = -2; i <= 4; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        date: d,
        d: d.getDay() === 0 ? 'CN' : `T${d.getDay() + 1}`,
        n: d.getDate(),
        active: d.toDateString() === selectedDate.toDateString()
      });
    }
    return dates;
  };
  const weekDates = generateWeekDates();

  const formatRepeatDays = (days) => {
    if (!days || days.length === 0) return 'Tất cả các ngày';
    const map = { 0: 'CN', 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7' };
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'T2-T6';
    return days.map(d => map[d]).join(', ');
  }

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between p-4 bg-white">
        <div className="flex items-center gap-3">
          {/* <img src="/images/anh-avatar-trang.jpg" className="w-10 h-10 rounded-full border-2 border-[#1D7C45] p-0.5" /> */}
          <h1 className="text-xl font-bold text-[#1D7C45]">Lịch chuyến</h1>
        </div>
        {/* <Bell className="w-6 h-6 text-[#1D7C45]" onClick={() => navigate('/driver/notifications')} /> */}
      </div>

      <div className="flex overflow-x-auto p-4 gap-2 no-scrollbar bg-white">
        {weekDates.map((day, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedDate(day.date)}
            className={`cursor-pointer flex-shrink-0 flex flex-col items-center justify-center w-12 py-3 rounded-xl transition-all ${day.active ? 'bg-[#1D7C45] text-white shadow-lg shadow-green-100' : 'bg-gray-50 text-gray-500'}`}>
            <span className="text-[10px] font-bold uppercase mb-1">{day.d}</span>
            <span className="text-lg font-bold">{day.n}</span>
            {day.active && <div className="w-1 h-1 bg-white rounded-full mt-1" />}
          </div>
        ))}
      </div>

      <div className="p-4">
        <h2 className="font-bold text-gray-800 mb-4">Các chuyến trong ngày</h2>

        <div className="space-y-6 relative">
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-100" />

          {loading ? (
            <p className="text-gray-500 text-center py-5">Đang tải...</p>
          ) : scheduledTrips.length === 0 ? (
            <p className="text-gray-500 text-center py-5">Không có chuyến nào được lên lịch</p>
          ) : (
            scheduledTrips.map((trip, idx) => {
              const time = trip.pickupTime || new Date(trip.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const isFirst = idx === 0;
              return (
                <div key={trip._id} className="relative">
                  {/* <div className={`absolute left-3 top-2 w-7 h-7 rounded-lg flex items-center justify-center z-10 ${isFirst ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {isFirst ? <Car className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div> */}
                  <div className={`bg-white p-4 rounded-2xl border border-gray-100 shadow-sm ${isFirst ? '' : 'opacity-80 hover:opacity-100 transition-opacity'}`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className={`font-bold text-[#1D7C45]`}>{time}</span>
                      {/* <span className={`text-[10px] px-3 py-1 rounded-full font-bold ${isFirst ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                        {isFirst ? 'Sắp diễn ra' : 'Đã lên lịch'}
                      </span> */}
                    </div>
                    <h3 className="font-bold text-gray-800 mb-3">{trip.kidId?.fullName || 'Bé Gia Bảo'}</h3>
                    <div className="flex gap-3 mb-4">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <p className="text-sm text-gray-600">{trip.routeId?.actualPickupAddress || trip.routeId?.estimatedPickupAddress || 'Điểm đón'}</p>
                    </div>
                    <div className="h-6 border-l-2 border-dashed border-gray-200 ml-2" />
                    <div className="flex gap-3">
                      <div className="w-4 h-4 rounded border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-sm" />
                      </div>
                      <p className="text-sm text-gray-600">{trip.routeId?.actualDropoffAddress || trip.routeId?.estimatedDropoffAddress || 'Điểm đến'}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <h2 className="font-bold text-gray-800 mt-8 mb-4">Chuyến định kỳ của tôi</h2>
        <div className="space-y-3">
          {subTrips.length === 0 && !loading && (
            <p className="text-gray-500 text-center py-5">Bạn chưa có chuyến định kỳ nào được đặt theo gói.</p>
          )}
          {subTrips.map((trip, idx) => (
            <div key={trip._id} className="bg-blue-50/40 p-4 rounded-xl flex items-center justify-between border border-blue-100/50">
              <div>
                <p className="text-[10px] font-bold text-green-700 mb-1">{formatRepeatDays(trip.repeatDays)} • {trip.pickupTime || '--:--'}</p>
                <p className="font-bold text-gray-800">{trip.kidId?.fullName} <span className="text-gray-400 font-normal">→ {trip.routeId?.estimatedDropoffAddress?.substring(0, 20)}...</span></p>
              </div>
              {/* <div className={`w-12 h-6 ${trip.isActive ? 'bg-green-600' : 'bg-gray-400'} rounded-full p-1 relative shadow-inner`}>
                <div className={`absolute ${trip.isActive ? 'right-1' : 'left-1'} top-1 bottom-1 w-4 bg-white rounded-full`} />
              </div> */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}