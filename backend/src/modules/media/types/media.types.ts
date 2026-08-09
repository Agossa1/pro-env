/*
 * |--------------------------------------------------------------------------
 * | MEDIA TYPES
 * |--------------------------------------------------------------------------
 * | Types de médias (images, documents, vidéos) uploadés sur Cloudinary.
 * |--------------------------------------------------------------------------
 */

import { MediaType } from './media.enums';

export interface Media {
  id: string;
  module: string | null;
  entityId: string | null;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string; // URL Cloudinary
  publicId: string; // ID Cloudinary
  uploadedBy: string | null;
  createdAt: Date;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}