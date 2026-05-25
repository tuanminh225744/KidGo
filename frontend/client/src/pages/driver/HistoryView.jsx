
import { ChevronLeft, CalendarDays, Star, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';






export default function HistoryView({ onNavigate }) {
  const [selectedTab, setSelectedTab] = useState('today');

  const getStatusStyle = (status) => {
    switch (status) {
      case 'HOÀN THÀNH':return 'bg-green-100 text-green-700';
      case 'LỆCH LỘ TRÌNH':return 'bg-orange-100 text-orange-700';
      case 'HUỶ':return 'bg-red-100 text-red-700';
      default:return 'bg-gray-100 text-gray-700';
    }
  };

  const trips = [
  { id: 1, time: 'Hôm nay, 16:45', status: 'HOÀN THÀNH', name: 'Bé Minh', from: 'Nhà', to: 'Trường TH Trần Phú', price: '45,000đ', dist: '5.1km', duration: '22 phút', rating: 5 },
  { id: 2, time: 'Hôm nay, 14:10', status: 'LỆCH LỘ TRÌNH', name: 'Bé Na', from: 'Trường MG', to: 'Nhà Bà Nội', price: '32,000đ', dist: '3.4km', duration: '15 phút', rating: 4, hasAlert: true },
  { id: 3, time: 'Hôm nay, 08:30', status: 'HOÀN THÀNH', name: 'Bé Tèo', from: 'Nhà', to: 'Trung tâm Ngoại ngữ', price: '68,000đ', dist: '7.2km', duration: '30 phút', rating: 5 },
  { id: 4, time: 'Hôm nay, 07:15', status: 'HUỶ', name: 'Bé Lan', from: 'Chung cư Him Lam', to: 'Trường MN', price: '0đ', dist: '0.0km', duration: '0 phút', cancelled: true },
  { id: 5, time: 'Hôm qua, 17:30', status: 'HOÀN THÀNH', name: 'Bé Hưng', from: 'Trường THCS', to: 'Sân Bóng', price: '40,000đ', dist: '4.5km', duration: '18 phút', rating: 5 }];


  return (
    <div className="pb-24">
      <div className="flex items-center justify-between p-4 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <ChevronLeft className="w-6 h-6 text-gray-600" />
          <h1 className="text-xl font-bold text-[#1D7C45]">Lịch sử chuyến</h1>
        </div>
        <CalendarDays className="w-6 h-6 text-gray-600" />
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

      <div className="grid grid-cols-3 gap-3 p-4">
        {[
        { label: 'Số chuyến', val: '12' },
        { label: 'Tổng km', val: '84.2' },
        { label: 'Thu nhập', val: '540k' }].
        map((stat) =>
        <div key={stat.label} className="bg-white p-4 rounded-xl border border-gray-100 text-center shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-[#1D7C45]">{stat.val}</p>
          </div>
        )}
      </div>

      <div className="px-4 space-y-4">
        {trips.map((trip) =>
        <div
          key={trip.id}
          onClick={() => trip.hasAlert && onNavigate('deviation')}
          className={`bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden ${trip.hasAlert ? 'cursor-pointer hover:border-orange-300' : ''}`}>
          
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
              <h3 className={`font-bold ${trip.cancelled ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                {trip.name} • {trip.from} → {trip.to}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{trip.dist} • {trip.duration}</p>
            </div>

            <div className="flex justify-end items-center gap-2 pt-2 border-t border-gray-50">
              {!trip.cancelled &&
            <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                  <span className="text-xs font-bold text-orange-500">{trip.rating}</span>
                </div>
            }
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        )}
      </div>
    </div>);

}