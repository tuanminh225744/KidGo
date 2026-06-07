import Kid from "../models/core/kid.model.js";
import bcrypt from "bcryptjs";
import { AppError, NotFoundError } from "../utils/AppError.js";

export const getKidsByParent = async (parentId) => {
  const list = await Kid.find({ parentId, isActive: true }).sort({
    createdAt: -1,
  });
  return { success: true, message: "Kids fetched", data: list };
};

export const createKid = async (kidData) => {
  const kid = await Kid.create(kidData);
  return { success: true, message: "Kid created", data: kid };
};

export const getKidById = async (kidId) => {
  const kid = await Kid.findById(kidId).populate(
    "parentId",
    "fullName phone email avatar",
  );

  if (!kid || !kid.isActive) {
    throw new NotFoundError("Không tìm thấy hồ sơ kid.");
  }

  return { success: true, message: "Kid fetched", data: kid };
};

export const updateKid = async (kidId, updateData) => {
  const updatedKid = await Kid.findOneAndUpdate(
    { _id: kidId, isActive: true },
    { $set: updateData },
    { new: true, runValidators: true },
  ).populate("parentId", "fullName phone email avatar");

  if (!updatedKid) {
    throw new NotFoundError("Không tìm thấy hồ sơ kid.");
  }

  return { success: true, message: "Kid updated", data: updatedKid };
};

export const softDeleteKid = async (kidId) => {
  const deletedKid = await Kid.findOneAndUpdate(
    { _id: kidId, isActive: true },
    { $set: { isActive: false } },
    { new: true },
  ).populate("parentId", "fullName phone email avatar");

  if (!deletedKid) {
    throw new NotFoundError("Không tìm thấy hồ sơ kid.");
  }

  return { success: true, message: "Kid soft-deleted", data: deletedKid };
};

export const setupSecurityQuestion = async (kidId, question, answer) => {
  const salt = await bcrypt.genSalt(10);
  const hashedAnswer = await bcrypt.hash(answer.toLowerCase().trim(), salt);

  const updatedKid = await Kid.findOneAndUpdate(
    { _id: kidId, isActive: true },
    {
      $set: {
        securityQuestion: question.trim(),
        securityAnswer: hashedAnswer,
      },
    },
    { new: true, runValidators: true },
  ).populate("parentId", "fullName phone email avatar");

  if (!updatedKid) {
    throw new NotFoundError("Không tìm thấy hồ sơ kid.");
  }

  return { success: true, message: "Security question set", data: updatedKid };
};

export const getKidSecurityQuestion = async (kidId) => {
  const kid = await Kid.findById(kidId).select(
    "fullName securityQuestion isActive",
  );

  if (!kid || !kid.isActive) {
    throw new NotFoundError("Không tìm thấy hồ sơ kid.");
  }

  // if (!kid.securityQuestion) {
  //   throw new NotFoundError("Kid này chưa thiết lập security question.");
  // }

  return { success: true, message: "Kid security question fetched", data: kid };
};

export const verifySecurityAnswer = async (kidId, answer) => {
  const kid = await Kid.findById(kidId).select("securityAnswer isActive");

  if (!kid || !kid.isActive) {
    throw new NotFoundError("Không tìm thấy hồ sơ kid.");
  }

  if (!kid.securityAnswer) {
    throw new NotFoundError("Kid này chưa thiết lập security answer.");
  }

  const match = await bcrypt.compare(
    answer.toLowerCase().trim(),
    kid.securityAnswer,
  );
  return { success: true, message: "Security answer verified", data: match };
};
