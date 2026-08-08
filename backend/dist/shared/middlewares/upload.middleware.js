"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gisUploadMiddleware = exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const appErrors_1 = require("../errors/appErrors");
const fs_1 = __importDefault(require("fs"));
// Utilisation de memoryStorage pour permettre le traitement par Sharp
// avant l'envoi vers Cloudinary (évite de saturer le disque local)
const storage = multer_1.default.memoryStorage();
exports.uploadMiddleware = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite à 5 Mo
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const mimeType = allowedTypes.test(file.mimetype);
        const extName = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        if (mimeType && extName) {
            return cb(null, true);
        }
        cb(new appErrors_1.BadRequestError('Seules les images (jpeg, jpg, png, webp) sont autorisées'));
    }
});
// Middleware pour les fichiers SIG (GeoJSON, Shapefile ZIP)
exports.gisUploadMiddleware = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            const dir = 'uploads/gis';
            if (!fs_1.default.existsSync(dir)) {
                fs_1.default.mkdirSync(dir, { recursive: true });
            }
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            cb(null, `gis-${Date.now()}-${file.originalname}`);
        }
    }),
    limits: { fileSize: 100 * 1024 * 1024 }, // Limite à 100 Mo pour le SIG
    fileFilter: (req, file, cb) => {
        const allowedExtensions = /\.(json|geojson|zip)$/i;
        if (allowedExtensions.test(file.originalname)) {
            return cb(null, true);
        }
        cb(new appErrors_1.BadRequestError('Seuls les fichiers .geojson, .json ou .zip (Shapefile) sont autorisés'));
    }
});
//# sourceMappingURL=upload.middleware.js.map