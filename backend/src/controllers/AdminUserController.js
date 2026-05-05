import * as userService from "../services/user.service.js";

/**
 * GET /api/v1/admin/users
 * Danh sách phụ huynh (filter + search + phân trang)
 * Role: admin
 */
export const listParents = async (req, res, next) => {
  try {
    const { search, isActive, page, limit } = req.query;
    const result = await userService.listParents({
      search,
      isActive: isActive !== undefined ? isActive === "true" : undefined,
      page: +page || 1,
      limit: +limit || 20,
    });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/users/:userId
 * Chi tiết phụ huynh
 * Role: admin
 */
export const getParentDetail = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await userService.getParentById(userId);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/users/:userId/suspend
 * Khóa tài khoản phụ huynh
 * Role: admin
 */
export const suspendUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await userService.suspendUser(userId);
    res.status(200).json({
      success: true,
      message: "Tài khoản đã bị khóa.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/admin/users/:userId/reactivate
 * Mở khóa tài khoản
 * Role: admin
 */
export const reactivateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await userService.reactivateUser(userId);
    res.status(200).json({
      success: true,
      message: "Tài khoản đã được mở khóa.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/admin/users/:id/status  (legacy — giữ lại để không break)
 */
export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ success: false, message: "isActive phải là boolean." });
    }
    const updatedUser = isActive
      ? await userService.reactivateUser(id)
      : await userService.suspendUser(id);
    res.status(200).json({
      success: true,
      message: `Tài khoản đã được ${isActive ? "mở khóa" : "khóa"}.`,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
