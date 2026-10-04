import ApiError from "../../helper/api-responce/api-errors";
import pool from "../../helper/config/db";
import { verifyAccessToken, type JwtPayload } from "../../helper/utils/tokens";
import type { NextFunction, Request, Response } from "express";

export const isLoggedInUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token: string | undefined;
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    throw ApiError.unauthorised("Access token is missing");
  }

  const decoded = verifyAccessToken(token) as JwtPayload;
  if (!decoded) {
    throw ApiError.unauthorised("Invalid access token");
  }

  const sql = "SELECT id, name, email FROM users WHERE id = $1";
  const row = await pool.query(sql, [decoded.id]);
  if (!row) {
    throw ApiError.internal("Failed to fetch user details");
  }
  if ((row.rowCount ?? 0) === 0) {
    throw ApiError.unauthorised("User not found");
  }

  req.user = row.rows[0];
  next();
};
