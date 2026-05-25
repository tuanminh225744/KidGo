
import { useState, useEffect } from 'react';
import { ChevronLeft, GraduationCap, Delete } from 'lucide-react';
import { DRIVER_DATA } from '../constants';





export const PinEntryScreen = ({ onNext }) => {
  const [pin, setPin] = useState([]);

  const handleKey = (key) => {
    if (key === 'del') {
      setPin((prev) => prev.slice(0, -1));
    } else if (pin.length < 4) {
      setPin((prev) => [...prev, key]);
    }
  };

  useEffect(() => {
    if (pin.length === 4) {
      const timer = setTimeout(onNext, 600);
      return () => clearTimeout(timer);
    }
  }, [pin, onNext]);

  return (
    <div className="bg-white min-h-screen">
      <div className="px-6 py-12 flex justify-between items-center">
        <button onClick={() => window.history.back()} className="p-2 -ml-2"><ChevronLeft size={24} className="text-gray-400" /></button>
        <span className="text-primary italic font-black text-xl">KidGo</span>
        <img src={DRIVER_DATA.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
      </div>

      <div className="px-6 text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Xác nhận đón bé</h1>
        <p className="text-gray-500 text-sm">Yêu cầu phụ huynh/người thân đọc mã PIN</p>
      </div>

      <div className="px-10 mb-12">
        <div className="bg-white rounded-3xl p-4 border border-gray-100 flex items-center gap-4 mb-10 shadow-sm">
           <img src="https://images.unsplash.com/photo-1544253198-2ae98b252033?w=200&h=200&fit=crop" className="w-14 h-14 rounded-2xl object-cover" />
           <div className="flex-1">
              <h3 className="font-bold text-base leading-tight">Bé Minh, 8 tuổi</h3>
              <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                 <GraduationCap size={12} className="text-primary" />
                 Trường Tiểu học Nguyễn Huệ
              </div>
           </div>
        </div>

        <div className="flex justify-center gap-4">
           {[0, 1, 2, 3].map((i) =>
          <div key={i} className={`w-14 h-20 rounded-2xl border-2 flex items-center justify-center text-3xl font-black transition-all ${
          pin[i] ? 'border-primary bg-primary-light text-primary' : 'border-gray-200'}`
          }>
               {pin[i] || ''}
             </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white">
        <div className="grid grid-cols-3 gap-y-4 gap-x-6 text-center mb-8">
           {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((k, i) =>
          <button
            key={i}
            onClick={() => k && handleKey(k)}
            className={`py-4 text-2xl font-bold text-gray-800 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors ${!k ? 'invisible' : ''}`}>
            
               {k === 'del' ? <Delete className="mx-auto" /> : k}
             </button>
          )}
        </div>
        <button className="w-full text-primary font-black text-sm pb-8">Gửi lại mã PIN</button>
      </div>
    </div>);

};