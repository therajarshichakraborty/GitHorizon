class ApiError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(statusCode: number, message: string) {
        super(message);

        this.statusCode = statusCode;
        this.isOperational = true;

        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(message: string = "Bad Request"): ApiError {
        return new ApiError(400, message);
    }

    static unauthorised(message: string = "Unauthorised"): ApiError {
        return new ApiError(401, message);
    }

    static conflict(message: string = "Conflict - Data already exists"): ApiError {
        return new ApiError(409, message);
    }
    static internal(message: string = "Internal Server Error"): ApiError {
        return new ApiError(500, message);
    }
    static notFound(message: string = "Not  Found"): ApiError {
        return new ApiError(404, message);
    }
}

export default ApiError;