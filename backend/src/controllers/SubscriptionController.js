import * as subscriptionService from "../services/subscription.service.js";
import {
  AppError,
  NotFoundError,
  AuthorizationError,
} from "../utils/AppError.js";
import { success, error } from "../utils/response.js";

/**
 * GET /api/v1/subscriptions/me
 * Gói tháng hiện tại của phụ huynh
 */
export const getCurrentSubscription = async (req, res, next) => {
  try {
    const result = await subscriptionService.getActiveSubscriptionByParent(
      req.user.id,
    );
    return success(res, result.data, result.message, 200);
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

    const result =
      await subscriptionService.createSubscription(subscriptionData);
    return success(
      res,
      result.data,
      result.message || "Đăng ký gói tháng thành công.",
      201,
    );
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
    const fetchResult = await subscriptionService.getSubscriptionById(
      req.params.subId,
    );
    const subscription = fetchResult.data;

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
      { status: "cancelled" },
    );
    return success(
      res,
      updated.data,
      updated.message || "Hủy gói tháng thành công.",
      200,
    );
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
    const fetchResult = await subscriptionService.getSubscriptionById(
      req.params.subId,
    );
    const subscription = fetchResult.data;

    // Verify ownership
    if (subscription.parentId.toString() !== req.user.id.toString()) {
      throw new AuthorizationError("Bạn không có quyền xem thông tin gói này.");
    }

    return success(
      res,
      {
        subscriptionId: subscription._id,
        usedTrips: subscription.usedTrips,
        status: subscription.status,
      },
      "Subscription usage fetched",
      200,
    );
  } catch (error) {
    next(error);
  }
};
