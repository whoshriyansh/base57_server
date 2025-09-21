import type { Response } from "express";

export function successResponse<T>(
  res: Response,
  message: string = "Success",
  data: T = {} as T,
  statusCode: number = 200
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function errorResponse(
  res: Response,
  message: string = "Something went wrong",
  error: Record<string, any> = {},
  statusCode: number = 500
) {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
  });
}
