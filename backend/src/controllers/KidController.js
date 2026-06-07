import * as kidService from "../services/kid.service.js";
import { AppError, AuthorizationError } from "../utils/AppError.js";
import { success, error } from "../utils/response.js";

const sanitizeKid = (kid) => {
  const kidObject = kid.toObject ? kid.toObject() : { ...kid };
  delete kidObject.securityAnswer;
  return kidObject;
};

const ensureParentOwnsKid = async (kidId, parentId) => {
  const result = await kidService.getKidById(kidId);
  const kid = result.data;
  const ownerId =
    kid.parentId?._id?.toString?.() || kid.parentId?.toString?.() || null;

  if (ownerId !== parentId.toString()) {
    throw new AuthorizationError("Bạn không có quyền truy cập hồ sơ kid này.");
  }

  return kid;
};

// GET /api/v1/kids
export const getKids = async (req, res, next) => {
  try {
    const result = await kidService.getKidsByParent(req.user.id);
    return success(
      res,
      { count: result.data.length, data: result.data.map(sanitizeKid) },
      result.message,
      200,
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/kids
export const createKid = async (req, res, next) => {
  try {
    const {
      securitySettings = {},
      securityQuestion,
      securityAnswer,
      ...restBody
    } = req.body;
    const kidPayload = {
      ...restBody,
      parentId: req.user.id,
      securitySettings: {
        otp: !!securitySettings.otp,
        pickupPhoto: !!securitySettings.pickupPhoto,
        dropoffPhoto: !!securitySettings.dropoffPhoto,
        securityQuestion: !!securitySettings.securityQuestion,
      },
    };

    if (kidPayload.securitySettings.securityQuestion) {
      kidPayload.securityQuestion = securityQuestion;
      kidPayload.securityAnswer = securityAnswer;
    } else {
      kidPayload.securityQuestion = undefined;
      kidPayload.securityAnswer = undefined;
    }

    const result = await kidService.createKid({ ...kidPayload });
    return success(
      res,
      sanitizeKid(result.data),
      result.message || "Tạo hồ sơ kid thành công.",
      201,
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/kids/:kidId
export const getKidDetail = async (req, res, next) => {
  try {
    const kid = await ensureParentOwnsKid(req.params.kidId, req.user.id);
    return success(res, sanitizeKid(kid), "Kid fetched", 200);
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/kids/:kidId
export const updateKidDetail = async (req, res, next) => {
  try {
    await ensureParentOwnsKid(req.params.kidId, req.user.id);
    const {
      securitySettings = {},
      securityQuestion,
      securityAnswer,
      ...restBody
    } = req.body;
    const updatePayload = {
      ...restBody,
      securitySettings: {
        otp: !!securitySettings.otp,
        pickupPhoto: !!securitySettings.pickupPhoto,
        dropoffPhoto: !!securitySettings.dropoffPhoto,
        securityQuestion: !!securitySettings.securityQuestion,
      },
    };

    if (updatePayload.securitySettings.securityQuestion) {
      updatePayload.securityQuestion = securityQuestion;
      updatePayload.securityAnswer = securityAnswer;
    } else {
      updatePayload.securityQuestion = undefined;
      updatePayload.securityAnswer = undefined;
    }

    const result = await kidService.updateKid(req.params.kidId, updatePayload);
    return success(
      res,
      sanitizeKid(result.data),
      result.message || "Cập nhật hồ sơ kid thành công.",
      200,
    );
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/kids/:kidId
export const deleteKid = async (req, res, next) => {
  try {
    await ensureParentOwnsKid(req.params.kidId, req.user.id);
    const result = await kidService.softDeleteKid(req.params.kidId);
    return success(
      res,
      sanitizeKid(result.data),
      result.message || "Đã vô hiệu hóa hồ sơ kid.",
      200,
    );
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/kids/:kidId/security-question
export const setupKidSecurity = async (req, res, next) => {
  try {
    await ensureParentOwnsKid(req.params.kidId, req.user.id);
    const { securityQuestion, securityAnswer } = req.body;

    const result = await kidService.setupSecurityQuestion(
      req.params.kidId,
      securityQuestion,
      securityAnswer,
    );
    return success(
      res,
      sanitizeKid(result.data),
      result.message || "Thiết lập security question thành công.",
      200,
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/kids/:kidId/security-question
export const getKidSecurityQuestion = async (req, res, next) => {
  try {
    const result = await kidService.getKidSecurityQuestion(req.params.kidId);
    const kid = result.data;
    return success(
      res,
      {
        kidId: kid._id,
        fullName: kid.fullName,
        securityQuestion: kid.securityQuestion,
      },
      result.message,
      200,
    );
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/kids/:kidId/security-answer/verify
export const verifyKidSecurityAnswer = async (req, res, next) => {
  try {
    const { securityAnswer } = req.body;
    const result = await kidService.verifySecurityAnswer(
      req.params.kidId,
      securityAnswer,
    );
    return success(res, { isValid: result.data }, result.message, 200);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/kids/:kidId/upload-avatar
export const uploadKidAvatar = async (req, res, next) => {
  try {
    await ensureParentOwnsKid(req.params.kidId, req.user.id);

    if (!req.file) {
      throw new AppError("Không tìm thấy file ảnh được upload", 400);
    }

    const avatarUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    const result = await kidService.updateKid(req.params.kidId, {
      avatar: avatarUrl,
    });
    return success(
      res,
      { avatarUrl, kid: sanitizeKid(result.data) },
      result.message || "Upload ảnh đại diện kid thành công.",
      200,
    );
  } catch (error) {
    next(error);
  }
};
