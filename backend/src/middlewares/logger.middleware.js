import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const { createWriteStream } = fs;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SENSITIVE_FIELDS = ["password", "token", "secret", "creditCard"];
// Sanitize sensitive data trước khi ghi log
const sanitizeBody = (body) => {
  if (!body) return undefined;
  const sanitized = { ...body };
  SENSITIVE_FIELDS.forEach((field) => {
    if (sanitized[field]) sanitized[field] = "***";
  });
  return sanitized;
};

// Tạo thư mục logs nếu chưa tồn tại
const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logStreams = new Map();

const getLogStream = (filePath) => {
  if (logStreams.has(filePath)) {
    return logStreams.get(filePath);
  }

  const stream = createWriteStream(filePath, { flags: "a" });
  stream.on("error", (err) => {
    console.error("[Logger Error] Stream error:", err);
  });
  logStreams.set(filePath, stream);
  return stream;
};

export const closeLogStreams = () => {
  for (const stream of logStreams.values()) {
    stream.end();
  }
};

process.on("beforeExit", closeLogStreams);

/**
 * Logger Middleware
 * Ghi lại thông tin request/response
 */
export const loggerMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Attach requestId to request object
  req.requestId = requestId;

  // Lưu original send function
  const originalSend = res.send;

  // Override send function để ghi log khi response được gửi
  res.send = function (data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Tạo log entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      requestId,
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.method !== "GET" ? sanitizeBody(req.body) : undefined,
      statusCode,
      duration: `${duration}ms`,
      clientIp: req.ip || req.connection.remoteAddress,
      userAgent: req.headers["user-agent"],
      user: req.user ? req.user.id : "anonymous",
    };

    // Ghi log
    logRequest(logEntry);

    // Ghi log vào console nếu development
    if (process.env.NODE_ENV === "development") {
      const statusColor = statusCode >= 400 ? "\x1b[31m" : "\x1b[32m"; // Red for error, Green for success
      const resetColor = "\x1b[0m";
      console.log(
        `${statusColor}[${statusCode}]${resetColor} ${req.method} ${req.path} - ${duration}ms`,
      );
    }

    // Gọi original send
    return originalSend.call(this, data);
  };

  next();
};

/**
 * Ghi log request vào file
 */
const logRequest = (logEntry) => {
  const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
  const logFile = path.join(logsDir, `${today}.log`);
  const logLine = JSON.stringify(logEntry) + "\n";

  const stream = getLogStream(logFile);
  stream.write(logLine);
};

/**
 * Middleware ghi log exception/error
 */
export const errorLoggerMiddleware = (err, req, res, next) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    type: "ERROR",
    method: req.method,
    path: req.path,
    statusCode: err.statusCode || 500,
    message: err.message,
    stack: err.stack,
    clientIp: req.ip || req.connection.remoteAddress,
    user: req.user ? req.user.id : "anonymous",
  };

  const today = new Date().toISOString().split("T")[0];
  const errorLogFile = path.join(logsDir, `${today}-errors.log`);
  const logLine = JSON.stringify(logEntry) + "\n";

  const stream = getLogStream(errorLogFile);
  stream.write(logLine);

  // Pass to next error handler
  next(err);
};
