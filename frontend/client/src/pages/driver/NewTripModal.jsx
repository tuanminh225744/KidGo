import { motion } from 'motion/react';
import { Calendar, GraduationCap } from 'lucide-react';
import { acceptBooking, rejectBooking } from '../../../services/driver.service';
import { useState } from 'react';

export const NewTripModal = ({ tripRequest, onAccept, onSkip }) => {
   const [loading, setLoading] = useState(false);
   const data = tripRequest;

   const handleAccept = async () => {
      if (tripRequest && tripRequest._id) {
         try {
            setLoading(true);
            await acceptBooking(tripRequest._id);
            onAccept();
         } catch (error) {
            console.error('Lỗi khi nhận chuyến:', error);
         } finally {
            setLoading(false);
         }
      } else {
         onAccept();
      }
   };

   const handleSkip = async () => {
      if (tripRequest && tripRequest._id) {
         try {
            setLoading(true);
            await rejectBooking(tripRequest._id);
            onSkip();
         } catch (error) {
            console.error('Lỗi khi từ chối chuyến:', error);
         } finally {
            setLoading(false);
         }
      } else {
         onSkip();
      }
   };

   return (
      <div className="fixed inset-0 z-50 flex flex-col justify-end">
         <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={loading ? null : handleSkip}></div>
         <motion.div
            initial={{ y: 500 }}
            animate={{ y: 0 }}
            className="bg-white rounded-t-[40px] px-6 pt-10 pb-12 relative z-10">

            <div className="w-12 h-1.5 bg-gray-200 rounded-full absolute top-4 left-1/2 -translate-x-1/2"></div>

            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-black italic text-gray-900 leading-none">Chuyến mới!</h2>
               <div className="w-10 h-10 rounded-full border-2 border-primary-light flex items-center justify-center text-primary font-bold">13</div>
            </div>

            <div className="bg-[#f0f4f8] rounded-[32px] p-5 mb-6 border border-gray-100">
               <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                     <img src={data.avatar || CHILD_DATA.avatar} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
                     <div>
                        <h3 className="font-bold text-lg leading-tight">{data.name || data.kidName || CHILD_DATA.name}</h3>
                        <div className="text-xs text-gray-500">{data.age || CHILD_DATA.age} tuổi • Lớp {data.grade || CHILD_DATA.grade}</div>
                     </div>
                  </div>
                  <div className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1.5 rounded-full border border-green-200">
                     Gia đình quen
                  </div>
               </div>

               <div className="space-y-4 relative mb-6">
                  <div className="absolute left-[11px] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-gray-300"></div>

                  <div className="flex gap-4">
                     <div className="w-6 h-6 bg-green-500 rounded-full border-4 border-green-100 flex-shrink-0 z-10"></div>
                     <div className="flex-1 -mt-1">
                        <div className="text-xs text-gray-500 leading-none mb-1">{data.pickupLocation?.address || '123 Lê Lợi,'}</div>
                        <div className="font-bold text-sm">Cách bạn {data.distFromDriver || CHILD_DATA.distFromDriver}</div>
                     </div>
                  </div>

                  <div className="flex gap-4">
                     <div className="w-6 h-6 bg-[#854d0e] rounded-full border-4 border-orange-100 flex items-center justify-center flex-shrink-0 z-10 text-white">
                        <GraduationCap size={10} />
                     </div>
                     <div className="flex-1 -mt-1">
                        <div className="font-bold text-sm leading-tight line-clamp-2">{data.dropoffLocation?.address || data.destination || CHILD_DATA.destination}</div>
                     </div>
                  </div>
               </div>

               <div className="h-px bg-gray-200 my-4"></div>

               <div className="flex items-center gap-2 text-gray-600 text-xs font-semibold mb-4">
                  <Calendar size={14} className="text-gray-400" />
                  <span>{data.plannedStartTime ? new Date(data.plannedStartTime).toLocaleString() : '07:30 – Thứ 2, 24/06'}</span>
               </div>

               <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                     <div className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1.5 rounded-lg border border-blue-100">~{data.estTime || CHILD_DATA.estTime}</div>
                     <div className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-1.5 rounded-lg border border-gray-200">{data.distance ? `${data.distance}km` : CHILD_DATA.tripDist}</div>
                  </div>
                  <div className="text-2xl font-black text-primary leading-none">{data.fare ? `${data.fare.toLocaleString()}đ` : CHILD_DATA.fare}</div>
               </div>
            </div>

            <div className="space-y-3">
               <button
                  disabled={loading}
                  onClick={handleAccept}
                  className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70">
                  {loading ? 'Đang xử lý...' : 'Nhận chuyến'}
               </button>
               <button
                  disabled={loading}
                  onClick={handleSkip}
                  className="w-full border-2 border-gray-100 text-gray-400 font-bold py-4 rounded-2xl hover:bg-gray-50 transition-colors disabled:opacity-70">
                  Bỏ qua
               </button>
            </div>
         </motion.div>
      </div>
   );
};