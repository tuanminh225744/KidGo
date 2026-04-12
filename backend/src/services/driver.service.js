import Driver from '../models/core/driver.model.js';
import User from '../models/core/user.model.js';

/**
 * Create a new driver profile for a user
 * @param {Object} driverData - Contains 'user' (userId) and driver fields
 * @returns {Object} Created driver document
 */
export const createDriver = async (driverData) => {
  try {
    const newDriver = new Driver(driverData);
    await newDriver.save();
    
    // Also update the User document to hold this driverId
    await User.findByIdAndUpdate(driverData.user, { 
      driverId: newDriver._id,
      role: 'driver' // Optionally upgrade their role
    });

    return newDriver;
  } catch (error) {
    throw new Error(`Error creating driver: ${error.message}`);
  }
};

/**
 * Get Driver by ID
 * @param {String} driverId 
 * @returns {Object} Driver document
 */
export const getDriverById = async (driverId) => {
  try {
    const driver = await Driver.findById(driverId).populate('user');
    if (!driver || !driver.isActive) {
      throw new Error('Driver not found or is inactive');
    }
    return driver;
  } catch (error) {
    throw new Error(`Error fetching driver: ${error.message}`);
  }
};

/**
 * Update Driver details
 * @param {String} driverId 
 * @param {Object} updateData 
 * @returns {Object} Updated driver document
 */
export const updateDriver = async (driverId, updateData) => {
  try {
    const updatedDriver = await Driver.findByIdAndUpdate(
      driverId,
      { $set: updateData },
      { returnDocument: 'after', runValidators: true }
    );
    if (!updatedDriver) {
      throw new Error('Driver not found');
    }
    return updatedDriver;
  } catch (error) {
    throw new Error(`Error updating driver: ${error.message}`);
  }
};

/**
 * Soft delete a driver
 * @param {String} driverId 
 * @returns {Object} Soft deleted driver document
 */
export const softDeleteDriver = async (driverId) => {
  try {
    const deletedDriver = await Driver.findByIdAndUpdate(
      driverId,
      { isActive: false },
      { returnDocument: 'after' }
    );
    if (!deletedDriver) {
      throw new Error('Driver not found');
    }
    return deletedDriver;
  } catch (error) {
    throw new Error(`Error soft deleting driver: ${error.message}`);
  }
};
