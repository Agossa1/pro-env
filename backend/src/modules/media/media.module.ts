import { Router } from 'express';
import PostgresDatabase from '../../config/database/postgres';
import { logger } from '../../config/loggers/logger';

// Repositories
import { MediaRepository } from './repositories/media.repositories';

// Services
import { GetMediaService } from './services/getMedia.service';
import { GetMediaByIdService } from './services/getMediaById.service';
import { UploadMediaService } from './services/uploadMedia.service';
import { DeleteMediaService } from './services/deleteMedia.service';
import { GetEntityMediaService } from './services/getEntityMedia.service';

// Services partagés
import { CloudinaryService } from '../../shared/services/cloudinary.service';

// Controllers
import { GetMediaController } from './controller/getMedia.controller';
import { GetMediaByIdController } from './controller/getMediaById.controller';
import { UploadMediaController } from './controller/uploadMedia.controller';
import { DeleteMediaController } from './controller/deleteMedia.controller';
import { GetEntityMediaController } from './controller/getEntityMedia.controller';

// Routes
import { MediaRoutes } from './routes/media.route';

export const initMediaModule = (db: PostgresDatabase): Router => {
  // 1. Initialiser le Repository + services partagés
  const mediaRepository = new MediaRepository(db, logger);
  const cloudinaryService = new CloudinaryService();

  // 2. Initialiser les Services Métiers
  const getMediaService = new GetMediaService(mediaRepository, logger);
  const getMediaByIdService = new GetMediaByIdService(mediaRepository, logger);
  const uploadMediaService = new UploadMediaService(mediaRepository, cloudinaryService, logger);
  const deleteMediaService = new DeleteMediaService(mediaRepository, cloudinaryService, logger);
  const getEntityMediaService = new GetEntityMediaService(mediaRepository, logger);

  // 3. Initialiser les Contrôleurs
  const getMediaController = new GetMediaController(getMediaService);
  const getMediaByIdController = new GetMediaByIdController(getMediaByIdService);
  const uploadMediaController = new UploadMediaController(uploadMediaService);
  const deleteMediaController = new DeleteMediaController(deleteMediaService);
  const getEntityMediaController = new GetEntityMediaController(getEntityMediaService);

  // 4. Lier les Contrôleurs aux Routes
  const mediaRoutes = new MediaRoutes(
    getMediaController,
    getMediaByIdController,
    uploadMediaController,
    deleteMediaController,
    getEntityMediaController,
  );

  return mediaRoutes.router;
};