"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const validateRequest = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
            cookies: req.cookies,
        });
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            // error.middlewares.ts attrape cette erreur
            next(error);
        }
        else {
            next(error);
        }
    }
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validate.middleware.js.map