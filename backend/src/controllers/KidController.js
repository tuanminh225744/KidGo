import * as kidService from "../services/kid.service.js";
import { AppError, AuthorizationError } from "../utils/AppError.js";

const sanitizeKid = (kid) => {
  const kidObject = kid.toObject ? kid.toObject() : { ...kid };
  delete kidObject.securityAnswer;
  return kidObject;
};

const ensureParentOwnsKid = async (kidId, parentId) => {
  const kid = await kidService.getKidById(kidId);
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
    const kids = await kidService.getKidsByParent(req.user.id);

    res.status(200).json({
      success: true,
      count: kids.length,
      data: kids.map(sanitizeKid),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/kids
export const createKid = async (req, res, next) => {
  try {
    const kid = await kidService.createKid({
      ...req.body,
      parentId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Tạo hồ sơ kid thành công.",
      data: sanitizeKid(kid),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/kids/:kidId
export const getKidDetail = async (req, res, next) => {
  try {
    const kid = await ensureParentOwnsKid(req.params.kidId, req.user.id);

    res.status(200).json({
      success: true,
      data: sanitizeKid(kid),
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/kids/:kidId
export const updateKidDetail = async (req, res, next) => {
  try {
    await ensureParentOwnsKid(req.params.kidId, req.user.id);
    const updatedKid = await kidService.updateKid(req.params.kidId, req.body);

    res.status(200).json({
      success: true,
      message: "Cập nhật hồ sơ kid thành công.",
      data: sanitizeKid(updatedKid),
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/kids/:kidId
export const deleteKid = async (req, res, next) => {
  try {
    await ensureParentOwnsKid(req.params.kidId, req.user.id);
    const deletedKid = await kidService.softDeleteKid(req.params.kidId);

    res.status(200).json({
      success: true,
      message: "Đã vô hiệu hóa hồ sơ kid.",
      data: sanitizeKid(deletedKid),
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/v1/kids/:kidId/security-question
export const setupKidSecurity = async (req, res, next) => {
  try {
    await ensureParentOwnsKid(req.params.kidId, req.user.id);
    const { securityQuestion, securityAnswer } = req.body;

    const updatedKid = await kidService.setupSecurityQuestion(
      req.params.kidId,
      securityQuestion,
      securityAnswer,
    );

    res.status(200).json({
      success: true,
      message: "Thiết lập security question thành công.",
      data: sanitizeKid(updatedKid),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/kids/:kidId/security-question
export const getKidSecurityQuestion = async (req, res, next) => {
  try {
    const kid = await kidService.getKidSecurityQuestion(req.params.kidId);

    res.status(200).json({
      success: true,
      data: {
        kidId: kid._id,
        fullName: kid.fullName,
        securityQuestion: kid.securityQuestion,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/kids/:kidId/security-answer/verify
export const verifyKidSecurityAnswer = async (req, res, next) => {
  try {
    const { securityAnswer } = req.body;
    const isValid = await kidService.verifySecurityAnswer(
      req.params.kidId,
      securityAnswer,
    );

    res.status(200).json({
      success: true,
      data: {
        isValid,
      },
    });
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
    const updatedKid = await kidService.updateKid(req.params.kidId, {
      avatar: avatarUrl,
    });

    res.status(200).json({
      success: true,
      message: "Upload ảnh đại diện kid thành công.",
      data: {
        avatarUrl,
        kid: sanitizeKid(updatedKid),
      },
    });
  } catch (error) {
    next(error);
  }
};
