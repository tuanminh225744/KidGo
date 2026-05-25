import { ChevronLeft, Clock, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DeviationView({ tripData }) {
  const navigate = useNavigate();
  const [selectedReason, setSelectedReason] = useState(1);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const data = tripData || {};

  const reasons = [
    { id: 1, title: 'Tắc đường, phải đi đường vòng', icon: '🚦' },
    { id: 2, title: 'Sự cố đường / công trình', icon: '🛠️' },
    { id: 3, title: 'Phụ huynh yêu cầu thay đổi', icon: '👨‍👩‍👧' },
    { id: 4, title: 'Lý do khác', icon: '...' }
  ];

  const handleSubmit = async () => {
    // try {
    //   setLoading(true);
    //   await someApiToResolveDeviation(data._id, selectedReason, note);
    //   navigate('/driver/history');
    // } catch ...
    navigate('/driver/history');
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="flex items-center gap-3 p-4 border-b border-gray-50">
        <ChevronLeft className="w-6 h-6 text-gray-600 cursor-pointer" onClick={() => window.history.back()} />
        <h1 className="text-xl font-bold text-gray-800">Giải thích lộ trình</h1>
      </div>

      <div className="p-4">
        <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 flex gap-4 mb-6 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400" />
          <AlertTriangle className="w-8 h-8 text-orange-500 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-orange-800 mb-2 leading-tight">Hệ thống phát hiện xe lệch lộ trình đã đăng ký</h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-orange-700">
                <Clock className="w-3 h-3" />
                <span>Thời gian: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-orange-700">
                <MapPin className="w-3 h-3 mt-0.5" />
                <span className="line-clamp-2">{data.currentLocation?.address || 'Vị trí hiện tại'}</span>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Xem lại đường đi</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8 relative">
          <img src="https://api.dicebear.com/9.x/shapes/svg?seed=map" className="w-full h-40 object-cover opacity-20" />
          <div className="absolute inset-0 p-4">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M 20 20 L 50 50 L 50 80" fill="none" stroke="#1D7C45" strokeWidth="2" strokeDasharray="4 2" />
              <path d="M 20 20 L 50 50 L 80 50 L 80 80" fill="none" stroke="#EF4444" strokeWidth="2" />
              <circle cx="20" cy="20" r="3" fill="#1D7C45" />
              <circle cx="80" cy="80" r="3" fill="#EF4444" />
            </svg>
            <div className="absolute top-2 right-2 flex gap-2">
               <div className="bg-white/90 backdrop-blur px-2 py-1 rounded-md border border-gray-200 text-[10px] font-bold flex items-center gap-1">
                 <div className="w-3 h-0.5 bg-[#1D7C45]" /> Lộ trình gốc
               </div>
               <div className="bg-white/90 backdrop-blur px-2 py-1 rounded-md border border-gray-200 text-[10px] font-bold flex items-center gap-1">
                 <div className="w-3 h-0.5 bg-red-500" /> Thực tế
               </div>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-800 mb-4">Chọn lý do lệch tuyến</h2>
        <div className="space-y-3 mb-8">
          {reasons.map((reason) => (
            <div
              key={reason.id}
              onClick={() => setSelectedReason(reason.id)}
              className={`p-4 rounded-2xl flex items-center justify-between border-2 cursor-pointer transition-all ${selectedReason === reason.id ? 'bg-green-50/50 border-[#1D7C45]' : 'bg-gray-50/30 border-gray-100 hover:border-gray-200'}`}>
              <div className="flex items-center gap-4">
                <span className="text-xl">{reason.icon}</span>
                <span className={`font-bold text-sm ${selectedReason === reason.id ? 'text-gray-800' : 'text-gray-500'}`}>{reason.title}</span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedReason === reason.id ? 'bg-green-600 border-green-600' : 'border-gray-300'}`}>
                {selectedReason === reason.id && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Ghi chú bổ sung</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-gray-50 rounded-2xl p-4 mt-2 border border-gray-100 min-h-[100px] outline-none focus:border-[#1D7C45] transition-colors"
              placeholder="Mô tả thêm (không bắt buộc)">
            </textarea>
          </div>
          
          <div className="space-y-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#1D7C45] text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-100 disabled:opacity-70">
              {loading ? 'Đang gửi...' : 'Gửi giải thích'}
            </button>
            <button className="w-full bg-white text-[#1D7C45] font-bold py-4 rounded-2xl border-2 border-[#1D7C45]">
              Liên hệ Admin ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}