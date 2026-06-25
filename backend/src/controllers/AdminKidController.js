import * as kidService from "../services/kid.service.js";
import { success, error } from "../utils/response.js";

/**
 * GET /api/v1/admin/kids
 * Danh sách trẻ em (filter + search + phân trang)
 * Role: admin
 */
export const listKids = async (req, res, next) => {
  try {
    const { search, isActive, page, limit } = req.query;
    const result = await kidService.listAllKids({
      search,
      isActive: isActive !== undefined ? isActive === "true" : undefined,
      page: +page || 1,
      limit: +limit || 20,
    });
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/kids/:kidId
 * Chi tiết trẻ em
 * Role: admin
 */
export const getKidDetail = async (req, res, next) => {
  try {
    const { kidId } = req.params;
    const result = await kidService.getKidById(kidId);
    return success(res, result.data, result.message, 200);
  } catch (error) {
    next(error);
  }
};
