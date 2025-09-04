export class AppError extends Error {
    status: number;
    code?: string;
    details?: unknown;
    
    constructor(message: string, status = 400, code?: string, details?: unknown) {
        super(message);
        this.name = 'AppError';
        this.status = status;
        this.code = code;
        this.details = details;
        Error.captureStackTrace(this, AppError);
    }
}