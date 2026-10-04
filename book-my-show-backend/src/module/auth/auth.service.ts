import pool from "../../helper/config/db";
import type { LoginType, RegisterType } from "./auth.model";
import ApiError from "../../helper/api-responce/api-errors";
import {
    generateAccessToken,
    generateHashedPasswordToken,
    generateRefreshToken,
    generateRefreshTokenHash,
    verifyHashedPasswordToken,
    verifyRefreshToken,
    type JwtPayload,
} from "../../helper/utils/tokens";

export const registerService = async ({
    name,
    email,
    password,
}: RegisterType) => {
    const sql = "SELECT email FROM users WHERE email = $1";
    const row = await pool.query(sql, [email]);

    if (!row) {
        throw ApiError.internal("Failed to check email existence");
    }
    if ((row?.rowCount ?? 0) > 0) {
        throw ApiError.conflict("Email already exists");
    }
    const hashedPassword = await generateHashedPasswordToken(password);
    const insertSql =
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email";
    const insertRow = await pool.query(insertSql, [name, email, hashedPassword]);

    return insertRow.rows[0];
};

export const loginService = async ({ email, password }: LoginType) => {
    const sql = "SELECT id, name, email, password FROM users WHERE email = $1";
    const row = await pool.query(sql, [email]);

    if (!row) {
        throw ApiError.internal("Failed to check user credentials");
    }
    if (row.rowCount === 0) {
        throw ApiError.badRequest("Invalid email or password");
    }
    const user = row.rows[0];
    const isValidPassword = await verifyHashedPasswordToken(
        user.password,
        password,
    );
    console.log("Is valid password: ", isValidPassword);
    if (!isValidPassword) {
        throw ApiError.badRequest("Invalid email or password");
    }

    const accessToken = generateAccessToken({ id: user.id });
    const refreshToken = generateRefreshToken({ id: user.id });

    const hashedRefreshToken = generateRefreshTokenHash(refreshToken);

    const sqlUpdate = "UPDATE users SET refresh_token = $1 WHERE id = $2";
    await pool.query(sqlUpdate, [hashedRefreshToken, user.id]);

    return { user, accessToken, refreshToken };
};

export const refreshService = async (token: string) => {
    if (!token) {
        throw ApiError.unauthorised("Refresh token is missing");
    }

    const decoded = verifyRefreshToken(token) as JwtPayload;
    if (!decoded) {
        throw ApiError.unauthorised("Invalid refresh token");
    }

    const sql = "SELECT id, refresh_token FROM users WHERE id = $1";
    const row = await pool.query(sql, [decoded.id]);

    if (!row) {
        throw ApiError.internal("Failed to check user for refresh token");
    }
    if ((row?.rowCount ?? 0) === 0) {
        throw ApiError.unauthorised("User not found for refresh token");
    }

    const user = row.rows[0];

    const hashedRefreshToken = generateRefreshTokenHash(token);
    const refreshToken = user.refresh_token;

    if (refreshToken !== hashedRefreshToken) {
        throw ApiError.unauthorised("Invalid refresh token: Please login again");
    }

    const newAccessToken = generateAccessToken({ id: user.id });

    return { accessToken: newAccessToken };
    };

export const logoutService = async (userId: number) => {
    const sql = "UPDATE users SET refresh_token = NULL WHERE id = $1";
    await pool.query(sql, [userId]);
};

export const getUserService = async (userId: number) => {
    const sql = "SELECT * FROM users WHERE id = $1";
    const row = await pool.query(sql, [userId]);
    if (!row) {
        throw ApiError.internal("Failed to fetch user details");
    }
    if ((row?.rowCount ?? 0) === 0) {
        throw ApiError.notFound("User not found");
    }
    return row.rows[0];
};
