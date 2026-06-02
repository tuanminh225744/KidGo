import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const PaymentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    // Tham chiếu đến thực thể sinh ra giao dịch này
    referenceId: { type: Schema.Types.ObjectId, required: true },
    referenceType: { type: String, enum: ['Booking', 'Subscription', 'WalletTopUp', 'TripSchedule'] },

    // Giá tiền
    amount: { type: Number, required: true },         // Tổng tiền khách phải trả cho chuyến này/lịch này
    driverEarning: { type: Number, required: true },  // Số tiền tài xế nhận được 

    // Trạng thái và Phương thức
    method: {
      type: String,
      enum: ['cash', 'QRPayment'],
      default: 'cash'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },

    // Mã giao dịch nếu thanh toán qua ví điện tử
    gatewayTransactionId: { type: String, default: null },
    paidAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export default models.Payment || model('Payment', PaymentSchema);
