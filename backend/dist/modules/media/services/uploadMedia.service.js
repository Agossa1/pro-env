"use strict";
/*
 * |--------------------------------------------------------------------------
 * | UPLOAD MEDIA SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier d'upload d'un fichier :
 * | 1. Redimensionne les images avec Sharp
 * | 2. Upload vers Cloudinary
 * | 3. Enregistre les métadonnées en base
 * |--------------------------------------------------------------------------
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadMediaService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
const sharp_1 = __importDefault(require("sharp"));
class UploadMediaService {
    constructor(mediaRepository, cloudinaryService, logger) {
        this.mediaRepository = mediaRepository;
        this.cloudinaryService = cloudinaryService;
        this.logger = logger;
    }
    /** Upload un fichier : optimisation image + Cloudinary + métadonnées BDD. */
    async uploadMedia(input) {
        try {
            if (!input.buffer || input.buffer.length === 0) {
                throw new appErrors_1.BadRequestError('Fichier vide ou manquant.');
            }
            // 1. Optimisation de l'image avec Sharp (si c'est une image)
            let bufferToUpload = input.buffer;
            const isImage = input.mimetype.startsWith('image/');
            if (isImage) {
                try {
                    bufferToUpload = await (0, sharp_1.default)(input.buffer)
                        .resize({ width: 1200, withoutEnlargement: true })
                        .jpeg({ quality: 80 })
                        .toBuffer();
                }
                catch {
                    // Si Sharp échoue, on garde le buffer original
                    bufferToUpload = input.buffer;
                }
            }
            // 2. Upload vers Cloudinary
            const { url, publicId } = await this.cloudinaryService.uploadBuffer(bufferToUpload, {
                folder: 'sigie',
            });
            // 3. Enregistrement des métadonnées
            return await this.mediaRepository.saveMedia({
                module: input.module ?? null,
                entityId: input.entityId ?? null,
                fileName: input.originalName,
                mimeType: input.mimetype,
                sizeBytes: bufferToUpload.length,
                storagePath: url,
                publicId,
                uploadedBy: input.uploadedBy ?? null,
            });
        }
        catch (error) {
            if (error instanceof appErrors_1.BadRequestError)
                throw error;
            this.logger.error(`Erreur uploadMedia (service): ${error.message}`);
            throw error;
        }
    }
}
exports.UploadMediaService = UploadMediaService;
//# sourceMappingURL=uploadMedia.service.js.map