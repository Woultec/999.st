import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

/**
 * Handles 404 errors — kapag walang match na route.
 */
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: "Route not found",
  });
};

/**
 * Global error handler — lahat ng error dito dumadaan.
 *
 * - Kung ApiError → gagamitin ang statusCode at message nito
 * - Kung regular Error → 500 Internal Server Error
 * - Sa development mode → makikita ang stack trace
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Default values
  let statusCode = 500;
  let message = "Internal server error";

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else {
    // Pakita ang actual error message para madaling mag-debug
    message = err.message;
  }

  console.error(
    `[${new Date().toISOString()}] ❌ ${statusCode} - ${message}`,
  );

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
