
import { ChevronLeft, Car, Star, AlertTriangle, CheckCircle2, Info, Bell } from 'lucide-react';






export default function NotificationsView({ onNavigate }) {
  return (
    <div className="pb-24">
      <div className="p-4 bg-white border-b border-gray-50 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <ChevronLeft className="w-6 h-6 text-gray-600 cursor-pointer" onClick={() => onNavigate('schedule')} />
          <h1 className="text-xl font-bold text-[#1D7C45]">Thông báo</h1>
        </div>
        <button className="text-sm font-bold text-[#1D7C45]">Đọc tất cả</button>
      </div>

      <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar">
        {['Tất cả', 'Chuyến xe', 'Hệ thống', 'Khác'].map((tab, idx) =>
        <button
          key={idx}
          className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${idx === 0 ? 'bg-[#1D7C45] text-white' : 'bg-gray-100 text-gray-500'}`}>
          
            {tab}
          </button>
        )}
      </div>

      <div className="px-4 space-y-3">
        {[
        { id: 1, type: 'trip', title: 'Chuyến mới được ghép', desc: 'Bé An · 07:30 sáng mai · Gò Vấp', time: '5 phút trước', icon: 'car', color: 'green', isNew: true },
        { id: 2, type: 'reward', title: 'Thưởng tuần!', desc: 'Bạn hoàn thành 25 chuyến tuần này. Thưởng +50,000đ', time: '1 giờ trước', icon: 'star', color: 'orange', isNew: true },
        { id: 3, type: 'alert', title: 'Cảnh báo lộ trình', desc: 'Chuyến 14:30 bị hệ thống ghi nhận lệch lộ trình', time: '2 giờ trước', icon: 'alert', color: 'red' },
        { id: 4, type: 'complete', title: 'Chuyến hoàn thành', desc: 'Bé Minh · 07:54 · Đánh giá 5 sao từ phụ huynh', time: '3 giờ trước', icon: 'check', color: 'emerald' },
        { id: 5, type: 'system', title: 'Hệ thống bảo trì', desc: 'Ứng dụng sẽ bảo trì định kỳ từ 00:00 - 02:00 ngày mai', time: '5 giờ trước', icon: 'info', color: 'blue' }].
        map((noti) =>
        <div key={noti.id} className="bg-white p-4 rounded-xl border border-gray-100 flex gap-4 relative">
            {noti.isNew && <div className="absolute right-4 top-4 w-1.5 h-1.5 bg-green-600 rounded-full" />}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
          noti.color === 'green' ? 'bg-green-100 text-green-600' :
          noti.color === 'orange' ? 'bg-orange-100 text-orange-600 border-l-4 border-orange-600 rounded-l-none' :
          noti.color === 'red' ? 'bg-red-50 text-red-600' :
          noti.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
          'bg-blue-50 text-blue-600'}`
          }>
              {noti.icon === 'car' && <Car className="w-5 h-5" />}
              {noti.icon === 'star' && <Star className="w-5 h-5 fill-current" />}
              {noti.icon === 'alert' && <AlertTriangle className="w-5 h-5" />}
              {noti.icon === 'check' && <CheckCircle2 className="w-5 h-5" />}
              {noti.icon === 'info' && <Info className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm mb-1">{noti.title}</h3>
              <p className="text-sm text-gray-600 leading-tight mb-2">{noti.desc}</p>
              <p className="text-[10px] text-gray-400 italic">{noti.time}</p>
            </div>
          </div>
        )}
        
        <div className="flex flex-col items-center justify-center py-12 opacity-30">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Đã xem hết các thông báo cũ</p>
        </div>
      </div>
    </div>);

}