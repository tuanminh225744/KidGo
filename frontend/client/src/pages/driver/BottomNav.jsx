
import { Calendar, CalendarDays, Wallet, Bell, User } from 'lucide-react';
import { motion } from 'motion/react';







export default function BottomNav({ currentView, onNavigate }) {
  const items = [
  { id: 'schedule', label: 'Trang chủ', icon: <Calendar className="w-6 h-6" /> },
  { id: 'history', label: 'Lịch trình', icon: <CalendarDays className="w-6 h-6" /> },
  { id: 'income', label: 'Thu nhập', icon: <Wallet className="w-6 h-6" /> },
  { id: 'notifications', label: 'Thông báo', icon: <Bell className="w-6 h-6" /> },
  { id: 'account', label: 'Tài khoản', icon: <User className="w-6 h-6" /> }];


  return (
    <nav className="bg-white border-t border-gray-100 px-6 py-3 pb-8 flex justify-between items-center fixed bottom-0 left-0 right-0 max-w-md mx-auto z-20">
      {items.map((item) => {
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1 transition-all relative ${isActive ? 'text-[#1D7C45]' : 'text-gray-400'}`}>
            
            {isActive &&
            <motion.div
              layoutId="active-nav"
              className="absolute -top-1 px-4 py-3 bg-green-50 rounded-xl -z-10" />

            }
            {item.icon}
            <span className="text-[10px] font-bold whitespace-nowrap">{item.label}</span>
          </button>);

      })}
    </nav>);

}