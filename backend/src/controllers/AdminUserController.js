import * as userService from "../services/user.service.js";

export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive field must be a boolean",
      });
    }

    const updatedUser = await userService.toggleUserStatus(id, isActive);
    res.status(200).json({
      success: true,
      message: `Tài khoản đã được ${isActive ? "mở khóa" : "khóa"}.`,
      data: {
        _id: updatedUser._id,
        isActive: updatedUser.isActive,
        email: updatedUser.email,
        driverId: updatedUser.driverId,
      },
    });
  } catch (error) {
    next(error);
  }
};
