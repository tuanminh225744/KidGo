import * as subscriptionService from "../services/subscription.service.js";
import {
  AppError,
  NotFoundError,
  AuthorizationError,
} from "../utils/AppError.js";

/**
 * GET /api/v1/subscriptions/me
 * Gói tháng hiện tại của phụ huynh
 */
export const getCurrentSubscription = async (req, res, next) => {
  try {
    const subscription =
      await subscriptionService.getActiveSubscriptionByParent(req.user.id);

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/subscriptions
 * Đăng ký gói tháng
 */
export const createSubscription = async (req, res, next) => {
  try {
    const { plan, startDate, endDate } = req.body;

    // Tính toán thời gian hiệu lực
    const finalStartDate = startDate ? new Date(startDate) : new Date();
    const finalEndDate = endDate ? new Date(endDate) : new Date(finalStartDate);

    if (!endDate) {
      if (plan === "monthly") {
        finalEndDate.setMonth(finalEndDate.getMonth() + 1);
      } else if (plan === "yearly") {
        finalEndDate.setFullYear(finalEndDate.getFullYear() + 1);
      }
    }

    const subscriptionData = {
      parentId: req.user.id,
      plan,
      startDate: finalStartDate,
      endDate: finalEndDate,
      status: "active",
      usedTrips: 0,
    };

    const subscription =
      await subscriptionService.createSubscription(subscriptionData);

    res.status(201).json({
      success: true,
      message: "Đăng ký gói tháng thành công.",
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/subscriptions/:subId/cancel
 * Hủy gói tháng
 */
export const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.getSubscriptionById(
      req.params.subId,
    );

    // Verify ownership
    if (subscription.parentId.toString() !== req.user.id.toString()) {
      throw new AuthorizationError("Bạn không có quyền hủy gói này.");
    }

    if (subscription.status !== "active") {
      throw new AppError(
        `Không thể hủy gói với trạng thái ${subscription.status}.`,
        400,
      );
    }

    const updated = await subscriptionService.updateSubscription(
      req.params.subId,
      {
        status: "cancelled",
      },
    );

    res.status(200).json({
      success: true,
      message: "Hủy gói tháng thành công.",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * GET /api/v1/subscriptions/:subId/usage
 * Thống kê số chuyến đã dùng
 */
export const getSubscriptionUsage = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.getSubscriptionById(
      req.params.subId,
    );

    // Verify ownership
    if (subscription.parentId.toString() !== req.user.id.toString()) {
      throw new AuthorizationError("Bạn không có quyền xem thông tin gói này.");
    }

    res.status(200).json({
      success: true,
      data: {
        subscriptionId: subscription._id,
        usedTrips: subscription.usedTrips,
        status: subscription.status,
      },
    });
  } catch (error) {
    next(error);
  }
};
