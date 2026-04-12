import Kid from '../models/core/kid.model.js';
import bcrypt from 'bcryptjs';

/**
 * Create a new Kid
 * @param {Object} kidData 
 * @returns {Object} Created kid document
 */
export const createKid = async (kidData) => {
  try {
    const newKid = new Kid(kidData);
    await newKid.save();
    return newKid;
  } catch (error) {
    throw new Error(`Error creating kid: ${error.message}`);
  }
};

/**
 * Get Kid by ID with populated parent info
 * @param {String} kidId 
 * @returns {Object} Kid document
 */
export const getKidById = async (kidId) => {
  try {
    const kid = await Kid.findById(kidId).populate('parentId', 'fullName phone email avatar');
    if (!kid || !kid.isActive) {
      throw new Error('Kid not found or is inactive');
    }
    return kid;
  } catch (error) {
    throw new Error(`Error fetching kid: ${error.message}`);
  }
};

/**
 * Update Kid details
 * @param {String} kidId 
 * @param {Object} updateData 
 * @returns {Object} Updated kid document
 */
export const updateKid = async (kidId, updateData) => {
  try {
    const updatedKid = await Kid.findByIdAndUpdate(
      kidId,
      { $set: updateData },
      { returnDocument: 'after', runValidators: true }
    );
    if (!updatedKid) {
      throw new Error('Kid not found');
    }
    return updatedKid;
  } catch (error) {
    throw new Error(`Error updating kid: ${error.message}`);
  }
};

/**
 * Soft delete a Kid
 * @param {String} kidId 
 * @returns {Object} Soft deleted kid document
 */
export const softDeleteKid = async (kidId) => {
  try {
    const deletedKid = await Kid.findByIdAndUpdate(
      kidId,
      { isActive: false },
      { returnDocument: 'after' }
    );
    if (!deletedKid) {
      throw new Error('Kid not found');
    }
    return deletedKid;
  } catch (error) {
    throw new Error(`Error soft deleting kid: ${error.message}`);
  }
};

/**
 * Setup a security question and hashed answer for a Kid
 * @param {String} kidId 
 * @param {String} question 
 * @param {String} answer 
 * @returns {Object} Updated kid document
 */
export const setupSecurityQuestion = async (kidId, question, answer) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedAnswer = await bcrypt.hash(answer.toLowerCase().trim(), salt);
    
    const updatedKid = await Kid.findByIdAndUpdate(
      kidId,
      { 
        $set: { 
          securityQuestion: question, 
          securityAnswer: hashedAnswer 
        } 
      },
      { returnDocument: 'after', runValidators: true }
    );
    
    if (!updatedKid) {
      throw new Error('Kid not found');
    }
    return updatedKid;
  } catch (error) {
    throw new Error(`Error setting up security question: ${error.message}`);
  }
};

/**
 * Verify the security answer for a Kid
 * @param {String} kidId 
 * @param {String} answer 
 * @returns {Boolean} true if valid, false otherwise
 */
export const verifySecurityAnswer = async (kidId, answer) => {
  try {
    const kid = await Kid.findById(kidId);
    if (!kid || !kid.isActive) {
      throw new Error('Kid not found or is inactive');
    }
    
    if (!kid.securityAnswer) {
      throw new Error('Security question not set up for this kid');
    }

    const isMatch = await bcrypt.compare(answer.toLowerCase().trim(), kid.securityAnswer);
    return isMatch;
  } catch (error) {
    throw new Error(`Error verifying security answer: ${error.message}`);
  }
};
