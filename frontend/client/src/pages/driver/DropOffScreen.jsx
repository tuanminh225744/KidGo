
import { useState } from 'react';
import { ChevronLeft, Bell, CheckCircle2 } from 'lucide-react';





export const DropOffScreen = ({ onFinish }) => {
  const [confirmed, setConfirmed] = useState(false);
  const [receiver, setReceiver] = useState('');

  return (
    <div className="bg-white min-h-screen pb-24">
      <div className="px-6 pt-12 pb-6 flex justify-between items-center text-primary">
         <button onClick={() => window.history.back()} className="p-2 -ml-2"><ChevronLeft size={24} /></button>
         <h1 className="text-lg font-bold">Xác nhận bàn giao</h1>
         <button className="p-2 -mr-2"><Bell size={24} className="text-gray-600" /></button>
      </div>

      <div className="px-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-tight">Xác nhận bàn giao bé</h2>
        
        <div className="bg-white rounded-[32px] p-5 border border-gray-100 flex items-center gap-5 mb-8 shadow-sm">
           <div className="relative">
             <img src="https://images.unsplash.com/photo-1544253198-2ae98b252033?w=200&h=200&fit=crop" className="w-20 h-20 rounded-full object-cover border-2 border-primary-light" />
             <div className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full border-2 border-white flex items-center justify-center">
                <CheckCircle2 size={16} className="text-white" />
             </div>
           </div>
           <div>
              <h3 className="font-bold text-xl leading-tight">Bé Minh</h3>
              <div className="text-[11px] text-gray-400 mt-1 font-medium italic">Lớp: Mầm non 2 • Trường KidCare</div>
           </div>
        </div>

        <div
          onClick={() => setConfirmed(!confirmed)}
          className={`flex items-start gap-4 p-5 rounded-3xl border cursor-pointer transition-all ${
          confirmed ? 'bg-primary-light border-primary/20' : 'bg-gray-50 border-gray-100'}`
          }>
          
           <div className={`w-8 h-8 rounded-xl border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          confirmed ? 'bg-primary border-primary rotate-0' : 'bg-white border-gray-300'}`
          }>
             {confirmed && <CheckCircle2 size={20} className="text-white" />}
           </div>
           <p className={`text-sm font-bold leading-relaxed pr-2 ${confirmed ? 'text-primary' : 'text-gray-600'}`}>
             Tôi đã bàn giao Bé Minh cho người có thẩm quyền tại trường
           </p>
        </div>
      </div>

      <div className="px-6 mb-10">
         <h4 className="text-gray-700 text-sm font-black mb-5">Người nhận bé tại trường</h4>
         <div className="flex flex-wrap gap-3">
            {['Bảo vệ trường', 'Giáo viên', 'Phụ huynh khác'].map((tag) =>
          <button
            key={tag}
            onClick={() => setReceiver(tag)}
            className={`px-6 py-3.5 rounded-full border-2 text-sm font-black transition-all ${
            receiver === tag ? 'bg-primary-light border-primary text-primary' : 'bg-white border-gray-100 text-gray-400 font-bold'}`
            }>
            
                {tag}
              </button>
          )}
         </div>
      </div>

      <div className="px-6">
        <h4 className="text-gray-700 text-sm font-black mb-4">Ghi chú thêm...</h4>
        <textarea
          placeholder="Nhập thông tin ghi chú nếu cần thiết (ví dụ: tên giáo viên nhận bé)..."
          className="w-full bg-[#f8fafc] border-2 border-gray-100 rounded-[28px] p-5 text-sm min-h-[140px] outline-none hover:border-primary/20 focus:border-primary focus:bg-white transition-all resize-none" />
        
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-50 z-30">
        <button
          onClick={onFinish}
          disabled={!confirmed}
          className={`w-full font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all ${
          confirmed ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1]' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`
          }>
          
          Xác nhận hoàn thành
          <CheckCircle2 size={22} className={confirmed ? 'text-white' : 'text-gray-200'} />
        </button>
      </div>
    </div>);

};