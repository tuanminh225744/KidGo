
import { useState } from 'react';
import { ChevronLeft, Settings, Star, Navigation, ShieldCheck, Calendar, CheckCircle2 } from 'lucide-react';
import { DRIVER_DATA } from '../constants';






export const ProfileScreen = ({ onNavigate }) => {
  const [isAccepting, setIsAccepting] = useState(true);

  return (
    <div className="pb-24 overflow-y-auto h-screen">
      <div className="bg-primary pt-12 pb-24 px-6 relative rounded-b-[40px]">
        <div className="flex justify-between items-center text-white mb-8">
          <button onClick={() => onNavigate('home')} className="p-2 -ml-2"><ChevronLeft size={24} /></button>
          <h1 className="text-xl font-bold">Hồ sơ</h1>
          <button className="p-2 -mr-2"><Settings size={24} /></button>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <img
              src={DRIVER_DATA.avatar}
              alt="Avatar"
              className="w-24 h-24 rounded-full border-4 border-white/20 object-cover" />
            
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#d97706] text-white text-[10px] font-bold px-3 py-1 rounded-full border-2 border-primary">
              Cấp 3
            </div>
          </div>
          <h2 className="text-white text-xl font-bold mb-1">{DRIVER_DATA.name}</h2>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Star size={14} className="fill-accent text-accent" />
            <span>4.8 • 142 chuyến</span>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="font-medium text-primary text-sm">Đang nhận chuyến</span>
          </div>
          <button
            onClick={() => setIsAccepting(!isAccepting)}
            className={`w-14 h-7 rounded-full p-1 transition-colors relative ${isAccepting ? 'bg-primary' : 'bg-gray-200'}`}>
            
            <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${isAccepting ? 'translate-x-7' : 'translate-x-0'}`}></div>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-[#f0f4ff] p-4 rounded-2xl text-center">
            <span className="text-[10px] text-gray-500 block mb-1">Hôm nay</span>
            <div className="text-lg font-bold text-primary">3</div>
            <span className="text-[8px] text-gray-400">chuyến</span>
          </div>
          <div className="bg-[#f0f4ff] p-4 rounded-2xl text-center">
            <span className="text-[10px] text-gray-500 block mb-1">Tuần</span>
            <div className="text-lg font-bold text-primary">18</div>
            <span className="text-[8px] text-gray-400">chuyến</span>
          </div>
          <div className="bg-[#fff7ed] p-4 rounded-2xl text-center">
            <span className="text-[10px] text-gray-500 block mb-1">Thu nhập</span>
            <div className="text-lg font-bold text-accent">450k</div>
            <span className="text-[8px] text-gray-400">VNĐ</span>
          </div>
        </div>

        <h3 className="text-lg font-bold mb-4">Thông tin hồ sơ</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-4 flex items-center justify-between border-b border-gray-50">
            <div className="flex items-center gap-4">
              <Navigation className="text-primary" size={20} />
              <span className="text-gray-600 text-sm">Biển số xe</span>
            </div>
            <span className="font-bold text-sm">51G-123.45</span>
          </div>
          <div className="p-4 flex items-center justify-between border-b border-gray-50">
            <div className="flex items-center gap-4">
              <ShieldCheck className="text-primary" size={20} />
              <span className="text-gray-600 text-sm">Hạng GPLX</span>
            </div>
            <span className="font-bold text-sm">B2</span>
          </div>
          <div className="p-4 flex items-center justify-between border-b border-gray-50">
            <div className="flex items-center gap-4">
              <Calendar className="text-primary" size={20} />
              <span className="text-gray-600 text-sm">Ngày hết hạn</span>
            </div>
            <span className="font-bold text-sm">20/12/2026</span>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CheckCircle2 className="text-primary" size={20} />
              <span className="text-gray-600 text-sm">Trạng thái hồ sơ</span>
            </div>
            <div className="bg-green-100 text-green-600 text-[10px] font-bold px-3 py-1 rounded-full">
              Đã duyệt
            </div>
          </div>
        </div>
      </div>
    </div>);

};