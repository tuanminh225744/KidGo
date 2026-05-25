import { ChevronLeft, Car, Star, AlertTriangle, CheckCircle2, Info, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getNotifications, markAllRead } from '../../services/notification.service';
import { useNavigate } from 'react-router-dom';

export default function NotificationsView() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tất cả');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const res = await getNotifications();
        if (res?.data?.data) {
          const formatted = res.data.data.map(n => ({
            id: n._id,
            type: n.type || 'system',
            title: n.title,
            desc: n.message,
            time: new Date(n.createdAt).toLocaleString(),
            icon: n.type === 'trip' ? 'car' : n.type === 'reward' ? 'star' : n.type === 'alert' ? 'alert' : 'info',
            color: n.type === 'trip' ? 'green' : n.type === 'reward' ? 'orange' : n.type === 'alert' ? 'red' : 'blue',
            isNew: !n.isRead
          }));
          setNotifications(formatted);
        }
      } catch (error) {
        console.error('Lỗi khi tải thông báo:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleReadAll = async () => {
    try {
      await markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isNew: false })));
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc:', error);
    }
  };

  const tabs = ['Tất cả', 'Chuyến xe', 'Hệ thống', 'Khác'];

  return (
    <div className="pb-24">
      <div className="bg-white px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <ChevronLeft className="w-6 h-6 text-gray-600 cursor-pointer" onClick={() => navigate(-1)} />
        <h1 className="text-xl font-bold text-gray-800 flex-1">Thông báo</h1>
        <button onClick={handleReadAll} className="text-sm font-bold text-[#1D7C45]">Đọc tất cả</button>
      </div>

      <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab ? 'bg-[#1D7C45] text-white' : 'bg-gray-100 text-gray-500'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-3">
        {loading ? (
          <p className="text-center text-gray-500 py-10">Đang tải...</p>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 opacity-30">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Không có thông báo nào</p>
          </div>
        ) : (
          notifications.map((noti) => (
            <div key={noti.id} className="bg-white p-4 rounded-xl border border-gray-100 flex gap-4 relative">
              {noti.isNew && <div className="absolute right-4 top-4 w-1.5 h-1.5 bg-green-600 rounded-full" />}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${noti.color === 'green' ? 'bg-green-100 text-green-600' :
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
          ))
        )}

        {notifications.length > 0 && (
          <div className="flex flex-col items-center justify-center py-12 opacity-30">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Đã xem hết các thông báo cũ</p>
          </div>
        )}
      </div>
    </div>
  );
}