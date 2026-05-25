
import { Bell, Car, Clock, MapPin } from 'lucide-react';







export default function ScheduleView({ onNavigate }) {
  return (
    <div className="pb-24">
      <div className="flex items-center justify-between p-4 bg-white">
        <div className="flex items-center gap-3">
          <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop" className="w-10 h-10 rounded-full border-2 border-[#1D7C45] p-0.5" />
          <h1 className="text-xl font-bold text-[#1D7C45]">Lịch chuyến</h1>
        </div>
        <Bell className="w-6 h-6 text-[#1D7C45]" onClick={() => onNavigate('notifications')} />
      </div>

      <div className="flex overflow-x-auto p-4 gap-2 no-scrollbar bg-white">
        {[
        { d: 'CN', n: 19 },
        { d: 'T2', n: 20 },
        { d: 'T3', n: 21, active: true },
        { d: 'T4', n: 22 },
        { d: 'T5', n: 23 },
        { d: 'T6', n: 24 },
        { d: 'T7', n: 25 }].
        map((day, idx) =>
        <div
          key={idx}
          className={`flex-shrink-0 flex flex-col items-center justify-center w-12 py-3 rounded-xl transition-all ${day.active ? 'bg-[#1D7C45] text-white shadow-lg shadow-green-100' : 'bg-gray-50 text-gray-500'}`}>
          
            <span className="text-[10px] font-bold uppercase mb-1">{day.d}</span>
            <span className="text-lg font-bold">{day.n}</span>
            {day.active && <div className="w-1 h-1 bg-white rounded-full mt-1" />}
          </div>
        )}
      </div>

      <div className="p-4">
        <h2 className="font-bold text-gray-800 mb-4">Chuyến trong ngày đã chọn</h2>
        
        <div className="space-y-6 relative">
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-100" />
          
          <div className="relative pl-14">
            <div className="absolute left-3 top-2 w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center text-white z-10">
              <Car className="w-4 h-4" />
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-[#1D7C45]">07:00</span>
                <span className="text-[10px] bg-green-50 text-green-600 px-3 py-1 rounded-full font-bold">Đã xác nhận</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-3">Bé Minh Quân</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 leading-tight">Chung cư Vinhomes Central Park</p>
                </div>
                <div className="h-6 border-l-2 border-dashed border-gray-200 ml-2" />
                <div className="flex gap-3">
                  <div className="w-4 h-4 rounded-full bg-orange-100 border-2 border-orange-400 flex items-center justify-center flex-shrink-0" />
                  <p className="text-sm text-gray-600">Trường Tiểu học Vinschool</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative pl-14">
            <div className="absolute left-3 top-2 w-7 h-7 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 z-10">
              <Clock className="w-4 h-4" />
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm opacity-80 transition-opacity hover:opacity-100">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-gray-600">16:30</span>
                <span className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">Chờ tài xế</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-3">Bé Minh Quân</h3>
              <div className="flex gap-3 mb-4">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <p className="text-sm text-gray-600">Trường Tiểu học Vinschool</p>
              </div>
              <div className="h-6 border-l-2 border-dashed border-gray-200 ml-2" />
              <div className="flex gap-3">
                <div className="w-4 h-4 rounded border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-sm" />
                </div>
                <p className="text-sm text-gray-600">Chung cư Vinhomes Central Park</p>
              </div>
            </div>
          </div>
        </div>

        <h2 className="font-bold text-gray-800 mt-8 mb-4">Chuyến định kỳ của tôi</h2>
        <div className="space-y-3">
          {[
          { tag: 'T2-T6', time: '07:30', name: 'Bé Minh', path: 'Nhà → Trường' },
          { tag: 'T2-T6', time: '17:00', name: 'Bé Thùy Dương', path: 'Trường → Nhà' }].
          map((trip, idx) =>
          <div key={idx} className="bg-blue-50/40 p-4 rounded-xl flex items-center justify-between border border-blue-100/50">
              <div>
                <p className="text-[10px] font-bold text-green-700 mb-1">{trip.tag} • {trip.time}</p>
                <p className="font-bold text-gray-800">{trip.name} <span className="text-gray-400 font-normal">→ {trip.path}</span></p>
              </div>
              <div className="w-12 h-6 bg-green-600 rounded-full p-1 relative shadow-inner">
                <div className="absolute right-1 top-1 bottom-1 w-4 bg-white rounded-full" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>);

}