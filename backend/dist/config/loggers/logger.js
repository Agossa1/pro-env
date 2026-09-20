"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const appConfig_1 = require("../app/appConfig");
const winston_1 = __importDefault(require("winston"));
const { combine, timestamp, json, colorize, printf } = winston_1.default.format;
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}] : ${message}`;
    // Supprimer les informations sensibles en production
    if (appConfig_1.appConfig.app.isProduction && metadata) {
        if (metadata.stack)
            delete metadata.stack;
        if (metadata.trace)
            delete metadata.trace;
    }
    if (Object.keys(metadata).length > 0) {
        // Ne pas afficher un objet vide si on a juste supprimé la stack
        const metadataStr = JSON.stringify(metadata);
        if (metadataStr !== '{}') {
            msg += ` ${metadataStr}`;
        }
    }
    return msg;
});
exports.logger = winston_1.default.createLogger({
    level: appConfig_1.appConfig.app.isProduction ? 'info' : 'debug',
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json()),
    transports: [
        new winston_1.default.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            silent: !appConfig_1.appConfig.app.isProduction
        }),
        new winston_1.default.transports.File({
            filename: 'logs/combined.log',
            silent: !appConfig_1.appConfig.app.isProduction
        }),
        new winston_1.default.transports.Console({
            format: combine(colorize(), consoleFormat)
        })
    ]
});
//# sourceMappingURL=logger.js.map