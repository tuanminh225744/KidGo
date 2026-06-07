export const success = (
  res,
  data = null,
  message = "Operation successful",
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const error = (res, message = "Error message", statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export default { success, error };
