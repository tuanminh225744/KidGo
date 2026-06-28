import User from "../models/core/user.model.js";
import Driver from "../models/core/driver.model.js";
import Kid from "../models/core/kid.model.js";

/**
 * Get user by ID including their role-specific details
 * @param {String} userId
 * @returns {Object} User document
 */
export const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId)
      .select("-password")
      .populate("driverId"); // Populate driver info if available

    if (!user || !user.isActive) {
      throw new Error("User not found or is inactive");
    }
    return { success: true, message: "User fetched", data: user };
  } catch (error) {
    throw new Error(`Error fetching user: ${error.message}`);
  }
};

/**
 * Update user details
 * @param {String} userId
 * @param {Object} updateData
 * @returns {Object} Updated user document
 */
export const updateUser = async (userId, updateData) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { returnDocument: "after", runValidators: true },
    ).select("-password");
    if (!updatedUser) {
      throw new Error("User not found");
    }
    return { success: true, message: "User updated", data: updatedUser };
  } catch (error) {
    throw new Error(`Error updating user: ${error.message}`);
  }
};

/**
 * Soft delete a user by setting isActive to false
 * @param {String} userId
 * @returns {Object} Soft deleted user document
 */
export const softDeleteUser = async (userId) => {
  try {
    const deletedUser = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { returnDocument: "after" },
    ).select("-password");
    if (!deletedUser) {
      throw new Error("User not found");
    }
    return { success: true, message: "User soft deleted", data: deletedUser };
  } catch (error) {
    throw new Error(`Error soft deleting user: ${error.message}`);
  }
};

/**
 * Toggle user active status and sync with Driver mapping if applicable
 * @param {String} userId
 * @param {Boolean} isActive
 * @returns {Object} Updated user document
 */
export const toggleUserStatus = async (userId, isActive) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { returnDocument: "after", runValidators: true },
    ).select("-password");
    if (!updatedUser) {
      throw new Error("User not found");
    }

    if (updatedUser.driverId) {
      await Driver.findByIdAndUpdate(updatedUser.driverId, { isActive });
    }

    return { success: true, message: "User status toggled", data: updatedUser };
  } catch (error) {
    throw new Error(`Error toggling user status: ${error.message}`);
  }
};

// ── Admin User Management ───────────────────────────────────────────────────────

/**
 * Lấy danh sách phụ huynh (có filter + phân trang)
 */
export const listParents = async ({
  search,
  isActive,
  page = 1,
  limit = 20,
} = {}) => {
  const query = { role: "parent" };
  if (typeof isActive === "boolean") query.isActive = isActive;
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  return {
    success: true,
    message: "Parents list fetched",
    data: { page, total, totalPages: Math.ceil(total / limit), users },
  };
};

/**
 * Chi tiết một phụ huynh theo userId
 */
export const getParentById = async (userId) => {
  const user = await User.findById(userId).select("-password").lean();
  if (!user || user.role !== "parent")
    throw new Error("Phụ huynh không tồn tại.");

  const kids = await Kid.find({ parentId: userId });
  user.kids = kids;

  return { success: true, message: "Parent fetched", data: user };
};

/**
 * Khóa tài khoản phụ huynh
 */
export const suspendUser = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true },
  ).select("-password");
  if (!user) throw new Error("Người dùng không tồn tại.");
  return { success: true, message: "User suspended", data: user };
};

/**
 * Mở khóa tài khoản phụ huynh
 */
export const reactivateUser = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: true },
    { new: true },
  ).select("-password");
  if (!user) throw new Error("Người dùng không tồn tại.");
  return { success: true, message: "User reactivated", data: user };
};
