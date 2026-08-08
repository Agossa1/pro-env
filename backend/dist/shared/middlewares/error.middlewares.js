"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const zod_1 = require("zod");
const appErrors_1 = require("../errors/appErrors");
const logger_1 = require("../../config/loggers/logger");
const errorMiddleware = (err, req, res, next) => {
    // Handle Zod Validation Errors
    if (err instanceof zod_1.ZodError) {
        const payload = {
            status: 'error',
            message: 'Erreur de validation',
            errors: err.issues.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }))
        };
        logger_1.logger.error('Zod Validation Error:', payload.errors);
        return res.status(400).json(payload);
    }
    if (err instanceof appErrors_1.AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            errors: err instanceof appErrors_1.ValidationError ? err.errors : undefined,
        });
    }
    // Log unexpected errors
    logger_1.logger.error('Unexpected Error', err);
    return res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
    });
};
exports.errorMiddleware = errorMiddleware;
//# sourceMappingURL=error.middlewares.js.map