import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Banknote,
  QrCode,
  Loader2,
  CheckCircle2,
  Receipt,
  Car
} from "lucide-react";
import { previewPayment, createPayment, updatePaymentStatus } from "../../../services/payment.service.js";
import { createBooking, toggleTripSchedule } from "../../../services/booking.service.js";
import { useBookingStore } from "../../../store/useBookingStore.js";

export default function PaymentScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const { tripScheduleId, isImmediate, kidName } = state;

  const [pricingInfo, setPricingInfo] = useState(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState(isImmediate ? "cash" : "QRPayment");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [createdPaymentId, setCreatedPaymentId] = useState(null);

  const {
    kidId,
    routeId,
    bookingDateTime,
    selectedDriverId,
    resetBooking,
  } = useBookingStore();

  useEffect(() => {
    if (!tripScheduleId) {
      navigate("/client/home");
      return;
    }

    const fetchPrice = async () => {
      try {
        const res = await previewPayment({ tripScheduleId });
        if (res.success || res.data) {
          setPricingInfo(res.data?.data || res.data || res);
        }
      } catch (error) {
        alert("Lỗi tải thông tin thanh toán: " + (error.message || "Unknown"));
      } finally {
        setIsLoadingPrice(false);
      }
    };

    fetchPrice();
  }, [tripScheduleId, navigate]);

  const handleConfirmSelection = async () => {
    setIsSubmitting(true);
    try {
      // 1. Tạo Payment (trạng thái pending)
      const payRes = await createPayment({
        tripScheduleId,
        method: paymentMethod
      });

      if (!payRes.success && !payRes.data?.success) {
        throw new Error(payRes.message || "Lỗi tạo thanh toán");
      }

      const payment = payRes.data?.data?.payment || payRes.data?.payment || payRes.payment;
      if (!payment || !payment._id) throw new Error("Không lấy được ID thanh toán");

      setCreatedPaymentId(payment._id);

      if (paymentMethod === "QRPayment") {
        setIsSubmitting(false);
        setShowQRModal(true);
        return;
      } else {
        // Cash: Thanh toán thành công luôn
        await handlePaymentSuccess(payment._id);
      }
    } catch (error) {
      setIsSubmitting(false);
      alert("Lỗi tạo thanh toán: " + error.message);
    }
  };

  const handlePaymentSuccess = async (payId) => {
    setIsSubmitting(true);
    try {
      // Cập nhật payment -> completed
      await updatePaymentStatus(payId, { status: "completed" });

      // Cập nhật tripSchedule -> active
      await toggleTripSchedule(tripScheduleId, true);

      // Nếu đặt ngay lập tức -> Tạo Booking
      if (isImmediate) {
        const bookRes = await createBooking({
          kidId,
          routeId: routeId,
          scheduledTime: bookingDateTime,
          preferredDriverId: selectedDriverId || undefined,
          scheduleId: tripScheduleId,
        });

        if (!bookRes.success && !bookRes.data?.success) {
          throw new Error(bookRes.message || "Lỗi tạo chuyến (booking)");
        }
      }

      setShowQRModal(false);
      setShowSuccess(true);
      resetBooking();
    } catch (error) {
      alert("Lỗi xác nhận: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-surface">
      <header className="sticky top-0 z-20 flex items-center justify-between bg-white px-5 py-4">
        <button
          onClick={() => navigate(-1)}
          className="rounded-full p-2 transition-transform active:scale-90 hover:bg-surface-container-low"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">Thanh toán</h1>
        </div>
        <div className="w-10" />
      </header>

      <main className="flex-1 px-5 pt-6 pb-32 overflow-y-auto space-y-6">

        {/* Chi tiết thanh toán */}
        <section className="bg-white rounded-3xl p-6 soft-shadow border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-4">
            <Receipt className="text-primary" size={24} />
            <h2 className="text-lg font-bold text-on-surface">Chi tiết thanh toán</h2>
          </div>

          {isLoadingPrice ? (
            <div className="py-10 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-primary mb-2" size={32} />
              <p className="text-sm font-medium text-on-surface-variant">Đang tính toán giá...</p>
            </div>
          ) : pricingInfo ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Số chuyến</span>
                <span className="font-bold text-on-surface">{pricingInfo.tripCount} chuyến</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Đơn giá / chuyến</span>
                <span className="font-bold text-on-surface">{(pricingInfo.pricePerTrip || 0).toLocaleString("vi-VN")} đ</span>
              </div>

              {pricingInfo.discount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">Giảm giá gói</span>
                  <span className="font-bold text-green-600">
                    -{(pricingInfo.discount * 100)}%
                  </span>
                </div>
              )}

              <div className="border-t border-outline-variant/20 pt-4 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Tổng cần thanh toán</span>
                  <span className="text-3xl font-extrabold text-primary">
                    {(pricingInfo.amount || 0).toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-error">Không lấy được thông tin giá.</p>
          )}
        </section>

        {/* Phương thức thanh toán */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest px-1">
            Chọn phương thức thanh toán
          </h2>

          <div className="grid gap-3">
            {isImmediate && (
              <label className={`flex items-center gap-4 p-4 rounded-3xl border-2 transition-all cursor-pointer ${paymentMethod === 'cash' ? 'border-primary bg-primary/5' : 'border-outline-variant/30 bg-white hover:border-primary/30'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                  className="hidden"
                />
                <div className={`p-3 rounded-2xl ${paymentMethod === 'cash' ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'}`}>
                  <Banknote size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-on-surface">Tiền mặt</p>
                  <p className="text-xs text-on-surface-variant">Thanh toán trực tiếp cho tài xế</p>
                </div>
                {paymentMethod === 'cash' && (
                  <CheckCircle2 className="text-primary" size={24} />
                )}
              </label>
            )}

            <label className={`flex items-center gap-4 p-4 rounded-3xl border-2 transition-all cursor-pointer ${paymentMethod === 'QRPayment' ? 'border-primary bg-primary/5' : 'border-outline-variant/30 bg-white hover:border-primary/30'}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="QRPayment"
                checked={paymentMethod === 'QRPayment'}
                onChange={() => setPaymentMethod('QRPayment')}
                className="hidden"
              />
              <div className={`p-3 rounded-2xl ${paymentMethod === 'QRPayment' ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'}`}>
                <QrCode size={24} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-on-surface">Chuyển khoản QR</p>
                <p className="text-xs text-on-surface-variant">Mở ứng dụng ngân hàng quét mã</p>
              </div>
              {paymentMethod === 'QRPayment' && (
                <CheckCircle2 className="text-primary" size={24} />
              )}
            </label>
          </div>
        </section>

      </main>

      <footer className="fixed bottom-20 left-0 right-0 z-30 mx-auto max-w-[430px] bg-white p-5 border-t border-outline-variant/10">
        <button
          onClick={handleConfirmSelection}
          disabled={isSubmitting || isLoadingPrice || !pricingInfo}
          className="flex h-16 w-full items-center justify-center gap-3 rounded-3xl bg-primary text-xl font-bold text-white shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:scale-100 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            `Xác nhận thanh toán ${pricingInfo ? (pricingInfo.amount || 0).toLocaleString("vi-VN") + "đ" : ""}`
          )}
        </button>
      </footer>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-6"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-sm bg-white rounded-t-[32px] sm:rounded-[32px] p-6 pb-10 sm:pb-6 shadow-2xl flex flex-col items-center"
            >
              <h2 className="text-xl font-extrabold text-on-surface mb-2">Quét mã QR để thanh toán</h2>
              <p className="text-sm text-on-surface-variant mb-6 text-center">
                Sử dụng ứng dụng ngân hàng hoặc ví điện tử để quét mã
              </p>

              <div className="bg-white p-3 rounded-3xl border-2 border-outline-variant/20 shadow-sm mb-6">
                <img
                  src={`https://img.vietqr.io/image/970422-113366668888-compact2.png?amount=${pricingInfo?.amount || 0}&addInfo=Thanh toan KidGo&accountName=KIDGO`}
                  alt="QR Code"
                  className="w-48 h-48 sm:w-64 sm:h-64 object-contain"
                />
              </div>

              <div className="w-full bg-surface-container-low p-4 rounded-2xl mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-on-surface-variant">Ngân hàng:</span>
                  <span className="font-bold text-on-surface">MB Bank</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-on-surface-variant">Số tài khoản:</span>
                  <span className="font-bold text-on-surface">113366668888</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Chủ tài khoản:</span>
                  <span className="font-bold text-on-surface">KIDGO</span>
                </div>
              </div>

              <div className="w-full space-y-3">
                <button
                  onClick={() => handlePaymentSuccess(createdPaymentId)}
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg active:scale-95 transition-transform flex justify-center"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Tôi đã thanh toán"}
                </button>
                <button
                  onClick={() => setShowQRModal(false)}
                  disabled={isSubmitting}
                  className="w-full bg-transparent text-on-surface-variant py-3 font-bold active:scale-95 transition-transform"
                >
                  Hủy / Đổi phương thức
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative flex w-full max-w-sm flex-col items-center overflow-hidden rounded-[40px] bg-white p-8 text-center shadow-2xl"
            >
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 shadow-inner">
                <CheckCircle2 size={48} className="text-green-500" />
              </div>
              <h2 className="mb-3 text-2xl font-extrabold tracking-tight text-on-surface">
                Thanh toán thành công!
              </h2>
              <p className="mb-10 text-sm font-medium leading-relaxed text-on-surface-variant">
                {isImmediate
                  ? `Hệ thống đã điều phối tài xế đến đón bé ${kidName || "của bạn"}.`
                  : `Hệ thống đã lưu lại lịch trình dài hạn cho bé ${kidName || "của bạn"}.`}
              </p>

              <div className="w-full space-y-4">
                <button
                  onClick={() => navigate("/client/tracking")}
                  className="h-14 w-full rounded-2xl bg-primary-container text-lg font-bold text-white transition-all hover:brightness-110 active:scale-95"
                >
                  Theo dõi chuyến đi
                </button>
                <button
                  onClick={() => navigate("/client/home")}
                  className="h-14 w-full rounded-2xl bg-surface-container-high text-lg font-bold text-on-surface transition-colors hover:bg-outline-variant active:scale-95"
                >
                  Về trang chủ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
