"use strict";
/*
 * |--------------------------------------------------------------------------
 * | CLOUDINARY SERVICE
 * |--------------------------------------------------------------------------
 * | Service central d'upload/suppression Cloudinary.
 * | Configure l'SDK depuis les variables d'environnement et expose
 * | uploadBuffer()/remove() pour le module Media.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
require("dotenv/config");
const cloudinary_1 = require("cloudinary");
const appErrors_1 = require("../errors/appErrors");
const logger_1 = require("../../config/loggers/logger");
// Configuration Cloudinary depuis le .env
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ?? process.env.API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET ?? process.env.API_SECRET,
    secure: true,
});
class CloudinaryService {
    /**
     * Upload un buffer binaire (venant de multer memoryStorage) vers Cloudinary.
     * @param buffer Contenu binaire du fichier
     * @param options Options d'upload (folder, publicId)
     */
    async uploadBuffer(buffer, options = {}) {
        try {
            const folder = options.folder ?? 'sigie';
            const publicId = options.publicId ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary_1.v2.uploader.upload_stream({
                    folder,
                    public_id: publicId,
                    resource_type: 'auto',
                }, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                });
                stream.end(buffer);
            });
            return {
                url: result.secure_url,
                publicId: result.public_id,
            };
        }
        catch (error) {
            logger_1.logger.error(`Erreur Cloudinary uploadBuffer: ${error.message}`);
            throw new appErrors_1.BadRequestError('Échec de l\'upload vers Cloudinary.');
        }
    }
    /**
     * Supprime un fichier Cloudinary par son public_id.
     * @param publicId Identifiant public Cloudinary (format 'folder/file')
     */
    async remove(publicId) {
        try {
            await cloudinary_1.v2.uploader.destroy(publicId);
        }
        catch (error) {
            logger_1.logger.error(`Erreur Cloudinary remove: ${error.message}`);
            throw new appErrors_1.BadRequestError('Échec de la suppression Cloudinary.');
        }
    }
}
exports.CloudinaryService = CloudinaryService;
//# sourceMappingURL=cloudinary.service.js.map