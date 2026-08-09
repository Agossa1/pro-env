import multer from 'multer';
import path from 'path';
import { BadRequestError } from '../errors/appErrors';
import fs from 'fs';

// Utilisation de memoryStorage pour permettre le traitement par Sharp
// avant l'envoi vers Cloudinary (évite de saturer le disque local)
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite à 5 Mo
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const mimeType = allowedTypes.test(file.mimetype);
        const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (mimeType && extName) {
            return cb(null, true);
        }
        cb(new BadRequestError('Seules les images (jpeg, jpg, png, webp) sont autorisées'));
    }
});
// Middleware pour les fichiers SIG (GeoJSON, Shapefile ZIP)
export const gisUploadMiddleware = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = 'uploads/gis';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
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
        cb(new BadRequestError('Seuls les fichiers .geojson, .json ou .zip (Shapefile) sont autorisés'));
    }
});
