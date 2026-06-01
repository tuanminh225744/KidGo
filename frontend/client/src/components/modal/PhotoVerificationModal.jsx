import { motion } from 'motion/react';
import { Camera } from 'lucide-react';

export const PhotoVerificationModal = ({ fileInputRef, handlePhotoChange, photoInput, submitPhoto, errorMsg, loading }) => (
  <motion.div
    initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
    className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-[44px] px-8 pt-8 pb-10 shadow-[0_-15px_50px_rgba(0,0,0,0.06)] z-30">
    <h3 className="text-2xl font-black text-primary mb-2">Chụp ảnh đón bé</h3>
    <p className="text-gray-500 text-sm mb-6">Xin hãy chụp 1 bức ảnh với bé tại điểm đón để phụ huynh yên tâm.</p>
    
    <input 
      type="file" 
      accept="image/*" 
      capture="environment" 
      ref={fileInputRef}
      className="hidden"
      onChange={handlePhotoChange}
    />

    <div 
      onClick={() => fileInputRef.current?.click()}
      className="w-full h-40 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center mb-4 cursor-pointer overflow-hidden">
      {photoInput ? (
        <img src={photoInput} alt="Preview" className="w-full h-full object-cover" />
      ) : (
        <>
          <Camera size={32} className="text-gray-400 mb-2" />
          <span className="text-gray-500 font-semibold text-sm">Chạm để mở Camera</span>
        </>
      )}
    </div>
    
    {errorMsg && <p className="text-red-500 text-sm text-center mb-4">{errorMsg}</p>}

    <button
      disabled={loading}
      onClick={submitPhoto}
      className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-md disabled:opacity-70">
      {loading ? "Đang xử lý..." : "Xác nhận hình ảnh"}
    </button>
  </motion.div>
);
