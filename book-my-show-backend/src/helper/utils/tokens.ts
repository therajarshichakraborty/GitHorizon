import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs";
import crypto from "crypto";
export interface JwtPayload {
    id: number;
}

export const generateHashedPasswordToken = async(textPassword: string) => {
    return await bcrypt.hash(textPassword, 10)
}
export const verifyHashedPasswordToken = async(token: string, textPassword: string) => {
    return await bcrypt.compare(textPassword, token)
}

export const generateRefreshTokenHash = (textToken: string) => {
    return crypto.createHash("sha256").update(textToken).digest("hex")
}

export const generateAccessToken = (payload: JwtPayload)=>{
    return jwt.sign(payload, process.env.JWT_ACCESS_KEY_SECRET!, {expiresIn:"15m"})
}
export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, process.env.JWT_ACCESS_KEY_SECRET!)
}
export const generateRefreshToken = (payload: JwtPayload) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_KEY_SECRET!, { expiresIn: "1d" })
}
export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, process.env.JWT_REFRESH_KEY_SECRET!)
}
