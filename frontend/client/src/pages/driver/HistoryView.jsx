import { ChevronLeft, CalendarDays, Star, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { getDriverTrips, getDriverMeEarnings, getDriverMeTripsStats } from '../../services/driver.service';
import { useNavigate } from 'react-router-dom';
import { TripDetailsModal } from '../../components/modal/TripDetailsModal';

export default function HistoryView() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('today');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const [stats, setStats] = useState({ totalTrips: 0, earnings: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tripsRes, earningsRes, statsRes] = await Promise.all([
          getDriverTrips({ period: selectedTab }),
          getDriverMeEarnings({ period: selectedTab }),
          getDriverMeTripsStats({ period: selectedTab })
        ]);

        if (tripsRes?.success || tripsRes?.data?.success) {
          const tripsData = tripsRes.data?.trips || tripsRes.data?.data?.trips || [];
          const formatted = tripsData.map(t => ({
            id: t._id,
            time: new Date(t.createdAt).toLocaleString(),
            status: t.status === 'completed' ? 'HOÀN THÀNH' : t.status === 'cancelled' ? 'HUỶ' : t.status === 'deviated' ? 'LỆCH LỘ TRÌNH' : t.status,
            name: t.kidId?.fullName || 'Unknown',
            from: t.routeId?.estimatedPickupAddress || t.routeId?.actualPickupAddress || 'N/A',
            to: t.routeId?.estimatedDropoffAddress || t.routeId?.actualDropoffAddress || 'N/A',
            price: t.paymentId?.amount ? `${t.paymentId.amount.toLocaleString()}đ` : '0đ',
            dist: t.routeId?.estimatedDistance ? `${t.routeId.estimatedDistance}km` : t.routeId?.actualDistance ? `${t.routeId.actualDistance}km` : '0.0km',
            duration: t.routeId?.estimatedDuration ? `${t.routeId.estimatedDuration} phút` : t.routeId?.actualDuration ? `${t.routeId.actualDuration} phút` : '0 phút',
            rating: t.rating || null,
            hasAlert: t.status === 'deviated',
            cancelled: t.status === 'cancelled'
          }));
          setTrips(formatted);
        } else {
          setTrips([]);
        }

        const totalTrips = statsRes?.data?.totalTrips || 0;
        const actualEarnings = earningsRes?.data?.actualEarnings || 0;

        setStats({
          totalTrips,
          earnings: actualEarnings
        });

      } catch (error) {
        console.error('Lỗi khi tải lịch sử chuyến:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedTab]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'HOÀN THÀNH': return 'bg-green-100 text-green-700';
      case 'LỆCH LỘ TRÌNH': return 'bg-orange-100 text-orange-700';
      case 'HUỶ': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="pb-24">
      <div className="flex items-center justify-between p-4 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {/* <ChevronLeft className="w-6 h-6 text-gray-600 cursor-pointer" onClick={() => onNavigate('home')} /> */}
          <h1 className="text-xl font-bold text-[#1D7C45]">Lịch sử chuyến</h1>
        </div>
        <CalendarDays className="w-6 h-6 text-gray-600 cursor-pointer" />
      </div>

      <div className="flex px-4 bg-white border-b border-gray-100">
        {['Hôm nay', 'Tuần này', 'Tháng này'].map((tab, idx) => {
          const tabId = idx === 0 ? 'today' : idx === 1 ? 'week' : 'month';
          const isActive = selectedTab === tabId;
          return (
            <button
              key={tabId}
              onClick={() => setSelectedTab(tabId)}
              className={`flex-1 py-4 text-sm font-medium transition-colors relative ${isActive ? 'text-[#1D7C45]' : 'text-gray-500'}`}>

              {tab}
              {isActive && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-1 bg-[#1D7C45]" />}
            </button>);
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 p-4">
        {[
          { label: 'Số chuyến', val: stats.totalTrips },
          { label: 'Thu nhập', val: stats.earnings > 0 ? `${stats.earnings.toLocaleString()}đ` : '0đ' }
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-xl border border-gray-100 text-center shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-[#1D7C45]">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="px-4 space-y-4">
        {loading ? (
          <p className="text-center text-gray-500 py-10">Đang tải...</p>
        ) : trips.length === 0 ? (
          <p className="text-center text-gray-500 py-10">Không có chuyến nào</p>
        ) : (
          trips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => setSelectedTrip(trip)}
              className={`bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform ${trip.hasAlert ? 'hover:border-orange-300' : ''}`}>

              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500 font-medium">{trip.time}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getStatusStyle(trip.status)}`}>
                    {trip.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${trip.cancelled ? 'text-gray-400 line-through' : 'text-[#1D7C45]'}`}>{trip.price}</p>
                </div>
              </div>

              <div className="mb-2">
                <h3 className="font-bold text-gray-800 truncate">
                  Bé {trip.name}
                </h3>
                <h3 className="font-bold text-gray-800 truncate">
                  Từ:  {trip.from}
                </h3>
                <h3 className="font-bold text-gray-800 truncate">
                  Đến: {trip.to}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{trip.dist} • {trip.duration}</p>
              </div>


            </div>
          ))
        )}
      </div>

      <TripDetailsModal
        isOpen={!!selectedTrip}
        onClose={() => setSelectedTrip(null)}
        trip={selectedTrip}
        role="driver"
      />
    </div>
  );
}
