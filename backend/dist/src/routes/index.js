"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureRoutes = void 0;
const express_1 = require("express");
const auth_module_1 = require("../modules/auth/auth.module");
const configureRoutes = (db) => {
    const router = (0, express_1.Router)();
    router.use('/auth', (0, auth_module_1.initAuthModule)(db));
    return router;
};
exports.configureRoutes = configureRoutes;
//# sourceMappingURL=index.js.map