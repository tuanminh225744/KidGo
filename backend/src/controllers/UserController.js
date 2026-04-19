import { getUserById, updateUser } from "../services/user.service.js";
import { AppError } from "../utils/AppError.js";

/**
 * GET /api/v1/users/me
 * Lấy profile user hiện tại
 */
export const getCurrentProfile = async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id)
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/users/me
 * Cập nhật tên, email, avatar (cho parent)
 */
export const updateProfile = async (req, res, next) => {
  try {
    // Chỉ cho phép update fullName, email, avatar
    const { fullName, email, avatar } = req.body;
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (avatar) updateData.avatar = avatar;

    const updatedUser = await updateUser(req.user.id, updateData);

    res.status(200).json({
      success: true,
      message: "Cập nhật profile thành công",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/users/me/device-token
 * Cập nhật FCM token
 */
export const updateDeviceToken = async (req, res, next) => {
  try {
    const { deviceToken } = req.body;
    if (!deviceToken) {
      throw new AppError("Vui lòng cung cấp deviceToken", 400);
    }

    const user = await getUserById(req.user.id);

    // Thêm token nếu chưa tồn tại
    let deviceTokens = user.deviceTokens || [];
    if (!deviceTokens.includes(deviceToken)) {
      deviceTokens.push(deviceToken);
      await updateUser(req.user.id, { deviceTokens });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật Device Token thành công",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/users/upload-avatar
 * Upload ảnh đại diện
 */
export const uploadUserAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError("Không tìm thấy file ảnh được upload", 400);
    }

    // Tạo URL public để client có thể truy cập
    const avatarUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    // Lưu vào tài khoản user
    const updatedUser = await updateUser(req.user.id, { avatar: avatarUrl });

    res.status(200).json({
      success: true,
      message: "Upload ảnh đại diện thành công",
      data: {
        avatarUrl,
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};
