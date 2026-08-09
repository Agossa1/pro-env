"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initMediaModule = void 0;
const logger_1 = require("../../config/loggers/logger");
// Repositories
const media_repositories_1 = require("./repositories/media.repositories");
// Services
const getMedia_service_1 = require("./services/getMedia.service");
const getMediaById_service_1 = require("./services/getMediaById.service");
const uploadMedia_service_1 = require("./services/uploadMedia.service");
const deleteMedia_service_1 = require("./services/deleteMedia.service");
const getEntityMedia_service_1 = require("./services/getEntityMedia.service");
// Services partagés
const cloudinary_service_1 = require("../../shared/services/cloudinary.service");
// Controllers
const getMedia_controller_1 = require("./controller/getMedia.controller");
const getMediaById_controller_1 = require("./controller/getMediaById.controller");
const uploadMedia_controller_1 = require("./controller/uploadMedia.controller");
const deleteMedia_controller_1 = require("./controller/deleteMedia.controller");
const getEntityMedia_controller_1 = require("./controller/getEntityMedia.controller");
// Routes
const media_route_1 = require("./routes/media.route");
const initMediaModule = (db) => {
    // 1. Initialiser le Repository + services partagés
    const mediaRepository = new media_repositories_1.MediaRepository(db, logger_1.logger);
    const cloudinaryService = new cloudinary_service_1.CloudinaryService();
    // 2. Initialiser les Services Métiers
    const getMediaService = new getMedia_service_1.GetMediaService(mediaRepository, logger_1.logger);
    const getMediaByIdService = new getMediaById_service_1.GetMediaByIdService(mediaRepository, logger_1.logger);
    const uploadMediaService = new uploadMedia_service_1.UploadMediaService(mediaRepository, cloudinaryService, logger_1.logger);
    const deleteMediaService = new deleteMedia_service_1.DeleteMediaService(mediaRepository, cloudinaryService, logger_1.logger);
    const getEntityMediaService = new getEntityMedia_service_1.GetEntityMediaService(mediaRepository, logger_1.logger);
    // 3. Initialiser les Contrôleurs
    const getMediaController = new getMedia_controller_1.GetMediaController(getMediaService);
    const getMediaByIdController = new getMediaById_controller_1.GetMediaByIdController(getMediaByIdService);
    const uploadMediaController = new uploadMedia_controller_1.UploadMediaController(uploadMediaService);
    const deleteMediaController = new deleteMedia_controller_1.DeleteMediaController(deleteMediaService);
    const getEntityMediaController = new getEntityMedia_controller_1.GetEntityMediaController(getEntityMediaService);
    // 4. Lier les Contrôleurs aux Routes
    const mediaRoutes = new media_route_1.MediaRoutes(getMediaController, getMediaByIdController, uploadMediaController, deleteMediaController, getEntityMediaController);
    return mediaRoutes.router;
};
exports.initMediaModule = initMediaModule;
//# sourceMappingURL=media.module.js.map