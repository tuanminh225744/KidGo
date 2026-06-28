import { getUserById, updateUser } from "../services/user.service.js";
import { AppError } from "../utils/AppError.js";
import { success, error } from "../utils/response.js";

/**
 * GET /api/v1/users/me
 * Lấy profile user hiện tại
 */
export const getCurrentProfile = async (req, res, next) => {
  try {
    const result = await getUserById(req.user.id);
    return success(res, result.data, result.message, 200);
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

    const result = await updateUser(req.user.id, updateData);
    return success(
      res,
      result.data,
      result.message || "Cập nhật profile thành công",
      200,
    );
  } catch (error) {
    next(error);
  }
};

// /**
//  * PUT /api/v1/users/me/device-token
//  * Cập nhật FCM token
//  */
// export const updateDeviceToken = async (req, res, next) => {
//   try {
//     const { deviceToken } = req.body;
//     if (!deviceToken) {
//       throw new AppError("Vui lòng cung cấp deviceToken", 400);
//     }

//     const fetchResult = await getUserById(req.user.id);
//     const user = fetchResult.data;

//     // Thêm token nếu chưa tồn tại
//     let deviceTokens = user.deviceTokens || [];
//     if (!deviceTokens.includes(deviceToken)) {
//       deviceTokens.push(deviceToken);
//       await updateUser(req.user.id, { deviceTokens });
//     }

//     return success(res, null, "Cập nhật Device Token thành công", 200);
//   } catch (error) {
//     next(error);
//   }
// };

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
    const result = await updateUser(req.user.id, { avatar: avatarUrl });
    return success(
      res,
      { avatarUrl, user: result.data },
      result.message || "Upload ảnh đại diện thành công",
      200,
    );
  } catch (error) {
    next(error);
  }
};
