import type { Request, Response, NextFunction } from "express";
import ApiError from "../api-responce/api-errors";

export function validateRequest(schema: any) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
        const validationResult = await schema.safeParseAsync(req.body);

        if (!validationResult.success) {
            throw ApiError.badRequest(validationResult.error.message);
        }

        req.body = validationResult.data;
        next();
        } catch (error) {
        next(error);
        }
    };
}

export function validateRequestParams(schema: any) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validationResult = await schema.safeParseAsync(req.params);
            if (!validationResult.success) {
                throw ApiError.badRequest(validationResult.error.message);
            }
            req.params = validationResult.data;
            next();
        } catch (error) {
            next(error);
        }
    };
}
