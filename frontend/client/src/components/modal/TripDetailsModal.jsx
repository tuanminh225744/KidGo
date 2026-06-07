import { motion, AnimatePresence } from "motion/react";
import { X, MapPin, Clock, Car, Wallet, Star } from "lucide-react";

export const TripDetailsModal = ({ isOpen, onClose, trip, role }) => {
  if (!isOpen || !trip) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl flex flex-col relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 active:scale-95 transition-all"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-gray-800 mb-6 pr-8">
              Chi tiết chuyến đi
            </h2>

            <div className="space-y-4">
              {/* Status & Time */}
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Thời gian</p>
                  <p className="font-bold text-sm text-gray-800">{trip.time || trip.createdAt}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-medium mb-1">Trạng thái</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${trip.status === 'HOÀN THÀNH' || trip.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : trip.status === 'HUỶ' || trip.status === 'cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                    {trip.status === 'completed' ? 'HOÀN THÀNH' : trip.status === 'cancelled' ? 'HUỶ' : trip.status}
                  </span>
                </div>
              </div>

              {/* People involved */}
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <UserIcon size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Hành khách nhí</p>
                    <p className="font-bold text-gray-800">{trip.name || trip.kid?.fullName || 'Bé'}</p>
                  </div>
                </div>
                {role === 'client' && trip.driver && (
                  <div className="flex items-center gap-3 pt-3 border-t border-blue-100/50">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                      <Car size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Tài xế</p>
                      <p className="font-bold text-gray-800">{trip.driver?.user?.fullName || trip.driver?.fullName || 'Tài xế'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Route */}
              <div className="bg-gray-50 p-4 rounded-2xl relative">
                <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200"></div>
                <div className="flex gap-4 mb-4 relative z-10">
                  <div className="w-4 h-4 rounded-full bg-green-500 ring-4 ring-gray-50 mt-1 shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-medium">Điểm đón</p>
                    <p className="text-sm font-medium text-gray-800 break-words line-clamp-2">{trip.from || trip.plannedRoute?.estimatedPickupAddress || trip.plannedRoute?.actualPickupAddress || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex gap-4 relative z-10">
                  <div className="w-4 h-4 rounded-full bg-primary ring-4 ring-gray-50 mt-1 shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-medium">Điểm trả</p>
                    <p className="text-sm font-medium text-gray-800 break-words line-clamp-2">{trip.to || trip.plannedRoute?.estimatedDropoffAddress || trip.plannedRoute?.actualDropoffAddress || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-white rounded-full shadow-sm"><MapPin size={16} className="text-primary" /></div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-medium">Quãng đường</p>
                    <p className="font-bold text-sm text-gray-800">{trip.dist || (trip.plannedRoute?.estimatedDistance ? `${trip.plannedRoute.estimatedDistance} km` : trip.plannedRoute?.actualDistance ? `${trip.plannedRoute.actualDistance} km` : 'N/A')}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-white rounded-full shadow-sm"><Clock size={16} className="text-primary" /></div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-medium">Thời gian</p>
                    <p className="font-bold text-sm text-gray-800">{trip.duration || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Fare & Rating */}
              <div className="flex justify-between items-center bg-green-50 p-4 rounded-2xl border border-green-100">
                <div className="flex items-center gap-2">
                  <Wallet size={20} className="text-green-600" />
                  <span className="text-sm font-bold text-green-800">
                    {role === 'driver' ? 'Thu nhập' : 'Thanh toán'}
                  </span>
                </div>
                <span className="text-lg font-black text-green-700">{trip.price || (trip.fare ? `${trip.fare.toLocaleString()}đ` : '0đ')}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full py-4 bg-primary text-white font-bold rounded-2xl active:scale-95 transition-transform"
            >
              Đóng
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const UserIcon = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
