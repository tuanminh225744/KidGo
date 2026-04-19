import User from '../models/core/user.model.js';
import Driver from '../models/core/driver.model.js';

/**
 * Get user by ID including their role-specific details
 * @param {String} userId 
 * @returns {Object} User document
 */
export const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId)
      .populate('driverId'); // Populate driver info if available
    
    if (!user || !user.isActive) {
      throw new Error('User not found or is inactive');
    }
    return user;
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
      { returnDocument: 'after', runValidators: true }
    );
    if (!updatedUser) {
      throw new Error('User not found');
    }
    return updatedUser;
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
      { returnDocument: 'after' }
    );
    if (!deletedUser) {
      throw new Error('User not found');
    }
    return deletedUser;
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
      { returnDocument: "after", runValidators: true }
    );
    if (!updatedUser) {
      throw new Error("User not found");
    }

    if (updatedUser.driverId) {
      await Driver.findByIdAndUpdate(updatedUser.driverId, { isActive });
    }

    return updatedUser;
  } catch (error) {
    throw new Error(`Error toggling user status: ${error.message}`);
  }
};
