import { X, Calendar as CalendarIcon, ArrowRight, CalendarCheck, Clock, ChevronUp, ChevronDown } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function SetDateTime() {
  const navigate = useNavigate();
  const location = useLocation();
  const { kidId, tripType, startPoint, endPoint, routeInfo } = location.state || {};

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(30);
  const [localTripType, setLocalTripType] = useState(tripType || 'one-time');

  // Sinh danh sách 7 ngày tiếp theo
  const days = useMemo(() => {
    const list = [];
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      list.push({
        dateObj: d,
        name: i === 0 ? 'Hôm nay' : dayNames[d.getDay()],
        date: d.getDate(),
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        isToday: i === 0,
        fullDateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      });
    }
    return list;
  }, []);

  const selectedDayItem = days.find(d =>
    d.dateObj.getDate() === selectedDate.getDate() &&
    d.dateObj.getMonth() === selectedDate.getMonth()
  ) || days[0];

  const handleHourChange = (delta) => {
    setHour((prev) => {
      let newHour = prev + delta;
      if (newHour > 23) newHour = 0;
      if (newHour < 0) newHour = 23;
      return newHour;
    });
  };

  const handleMinuteChange = (delta) => {
    setMinute((prev) => {
      let newMin = prev + delta;
      if (newMin >= 60) newMin = 0;
      if (newMin < 0) newMin = 59;
      return newMin;
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-surface min-h-screen">
      <header className="px-5 py-4 flex justify-between items-center sticky top-0 bg-white z-20">
        <button onClick={() => navigate('/booking/location')} className="flex items-center gap-1 text-on-surface-variant p-2 rounded-xl hover:bg-surface-container-low transition-colors">
          <X size={20} />
          <span className="text-sm font-bold">Huỷ</span>
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">Đặt xe</h1>
          <p className="text-[10px] font-bold text-on-surface-variant">Bước 3 trên 4</p>
        </div>
        <span className="text-sm font-bold text-primary">3/4</span>
      </header>

      {/* Progress Bar */}
      <div className="px-5 mt-2">
        <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
          <div className="bg-primary-container h-full w-3/4 rounded-full transition-all duration-500" />
        </div>
      </div>

      <main className="px-5 pt-8 pb-52 space-y-8">
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Khi nào?</h2>

        <div className="flex p-1 bg-surface-container rounded-2xl">
          <button
            onClick={() => setLocalTripType('one-time')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${localTripType === 'one-time' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
          >
            Một lần
          </button>
          <button
            onClick={() => setLocalTripType('recurring')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${localTripType === 'recurring' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
          >
            Định kỳ
          </button>
        </div>

        <section>
          <label className="block text-sm font-bold text-on-surface-variant mb-4 px-1">Chọn ngày</label>
          <div className="flex gap-4 overflow-x-auto scroll-hide py-2">
            {days.map((day) => {
              const isSelected = selectedDayItem.fullDateStr === day.fullDateStr;
              return (
                <div
                  key={day.fullDateStr}
                  onClick={() => setSelectedDate(day.dateObj)}
                  className={`flex-shrink-0 w-16 h-20 flex flex-col items-center justify-center rounded-2xl border-2 transition-all cursor-pointer ${isSelected ? 'bg-primary-container border-primary-container text-white shadow-xl scale-110' : 'bg-white border-outline-variant/30 text-on-surface-variant hover:border-primary-container/30'}`}
                >
                  <span className={`text-[10px] font-bold uppercase mb-1 ${isSelected ? 'opacity-90' : 'opacity-60'}`}>{day.name}</span>
                  <span className="text-xl font-extrabold">{day.date}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-white rounded-[32px] p-8 soft-shadow border border-surface-container-high text-center">
          <label className="text-sm font-bold text-on-surface-variant mb-6 block text-left">Chọn thời gian</label>
          <div className="flex items-center justify-center gap-8 py-4 relative">

            {/* Hour Picker */}
            <div className="flex flex-col items-center gap-2">
              <button onClick={() => handleHourChange(1)} className="p-2 text-on-surface-variant/40 hover:text-primary transition-colors active:scale-95"><ChevronUp size={24} /></button>
              <div className="px-4 py-2 bg-primary/5 rounded-xl border-y-2 border-primary/20">
                <span className="text-4xl font-extrabold text-primary">{String(hour).padStart(2, '0')}</span>
              </div>
              <button onClick={() => handleHourChange(-1)} className="p-2 text-on-surface-variant/40 hover:text-primary transition-colors active:scale-95"><ChevronDown size={24} /></button>
            </div>

            <span className="text-5xl font-extrabold text-on-surface-variant/40 mb-1">:</span>

            {/* Minute Picker */}
            <div className="flex flex-col items-center gap-2">
              <button onClick={() => handleMinuteChange(5)} className="p-2 text-on-surface-variant/40 hover:text-primary transition-colors active:scale-95"><ChevronUp size={24} /></button>
              <div className="px-4 py-2 bg-primary/5 rounded-xl border-y-2 border-primary/20">
                <span className="text-4xl font-extrabold text-primary">{String(minute).padStart(2, '0')}</span>
              </div>
              <button onClick={() => handleMinuteChange(-5)} className="p-2 text-on-surface-variant/40 hover:text-primary transition-colors active:scale-95"><ChevronDown size={24} /></button>
            </div>

          </div>
        </section>

        <div className="flex items-center gap-4 bg-[#8A4CFC]/5 border border-[#8A4CFC]/10 p-5 rounded-3xl shadow-sm">
          <div className="p-3 bg-white rounded-2xl shadow-sm text-secondary">
            <CalendarCheck size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest leading-loose">Thời gian đã chọn</p>
            <p className="text-sm font-extrabold text-on-surface">
              {selectedDayItem.name}, {String(selectedDayItem.date).padStart(2, '0')}/{String(selectedDayItem.month).padStart(2, '0')}/{selectedDayItem.year} lúc {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
            </p>
          </div>
        </div>
      </main>

      <div className="fixed bottom-22 left-0 right-0 p-5 bg-white shadow-[0px_-4px_20px_0px_rgba(79,70,200,0.06)] z-30 max-w-[430px] mx-auto">
        <button
          onClick={() => {
            const finalDateTime = new Date(selectedDate);
            finalDateTime.setHours(hour, minute, 0, 0);
            navigate('/booking/driver', {
              state: {
                kidId,
                tripType: localTripType,
                startPoint,
                endPoint,
                routeInfo,
                bookingDateTime: finalDateTime.toISOString()
              }
            });
          }}
          className="w-full bg-primary-container text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
        >
          Tiếp tục <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
