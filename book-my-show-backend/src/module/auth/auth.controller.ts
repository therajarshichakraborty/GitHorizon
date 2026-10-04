import type { Request, Response } from "express";
import { getUserService, loginService, logoutService, refreshService, registerService } from "./auth.service";
import ApiResponse from "../../helper/api-responce/api-responce";
import ApiError from "../../helper/api-responce/api-errors";

export const registerUser = async (req: Request, res: Response) => {
  const user = await registerService(req.body);
  return ApiResponse.created(res, "User registered successfully", user);
};
export const loginUser = async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await loginService(req.body);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  return ApiResponse.ok(res, "User logged in successfully", {
    user,
    accessToken,
  });
};
export const refreshUser = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  const { accessToken } = await refreshService(token);
  return ApiResponse.ok(res, "Access token refreshed successfully", { accessToken });
};
export const logoutUser = async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorised("User is not authenticated");
  }

  await logoutService(req.user.id);
  res.clearCookie("refreshToken");
  return ApiResponse.ok(res, "User logged out successfully");
};
export const getUser = async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorised("User is not authenticated");
  }
  const user = await getUserService(req.user.id);
  return ApiResponse.ok(res, "User details fetched successfully", user);
};
