import Payment from "../models/operational/payment.model.js";

/**
 * Tạo mới một bản ghi thanh toán
 */
export const createPayment = async (data) => {
  try {
    const newPayment = new Payment(data);
    await newPayment.save();
    return { success: true, message: "Payment created", data: newPayment };
  } catch (error) {
    throw new Error(`Lỗi tạo thanh toán: ${error.message}`);
  }
};

/**
 * Lấy chi tiết thông tin thanh toán theo ID
 */
export const getPaymentById = async (paymentId) => {
  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new Error("Không tìm thấy thông tin thanh toán.");
    return { success: true, message: "Payment fetched", data: payment };
  } catch (error) {
    throw new Error(
      error.message || `Lỗi lấy thông tin thanh toán: ${error.message}`,
    );
  }
};

/**
 * Cập nhật trạng thái thanh toán
 */
export const updatePaymentStatus = async (paymentId, status) => {
  try {
    const updateFields = { status };
    if (status === "completed") {
      updateFields.paidAt = new Date();
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      { $set: updateFields },
      { new: true, runValidators: true },
    );

    if (!updatedPayment) throw new Error("Thanh toán không tồn tại.");
    return { success: true, message: "Payment updated", data: updatedPayment };
  } catch (error) {
    throw new Error(
      error.message || `Lỗi cập nhật thanh toán: ${error.message}`,
    );
  }
};
