/*
 * |--------------------------------------------------------------------------
 * | INFRASTRUCTURE REPOSITORY
 * |--------------------------------------------------------------------------
 * | Couche d'accès aux données pour le module Infrastructures, alignée sur le
 * | schéma 01.schema.sql (table `infrastructures`).
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import PostgresDatabase from '../../../config/database/postgres';
import { BadRequestError, NotFoundError } from '../../../shared/errors/appErrors';
import { redisCache } from '../../../infra/redis/redis.service';

import type {
  Infrastructure,
  CreateInfrastructurePayload,
  UpdateInfrastructurePayload,
  PaginationQuery,
  PaginatedResult,
} from '../types/infrastructure.types';

export interface GetAllInfrastructuresQuery extends PaginationQuery {
  territoryId?: string;
  type?: string;
  status?: string;
  condition?: string;
  search?: string;
}

export class InfrastructureRepository {
  constructor(
    private readonly db: PostgresDatabase,
    private readonly logger: Logger,
  ) {}

  private readonly infrastructureSelect = `
    SELECT
      i.id,
      i.territory_id          AS "territoryId",
      t.name                  AS "territoryName",
      i.mapped_area_id        AS "mappedAreaId",
      i.name,
      i.reference_code        AS "referenceCode",
      i.type,
      i.condition,
      i.status,
      i.description,
      i.material,
      i.dimensions,
      i.installation_date     AS "installationDate",
      i.last_maintained_at    AS "lastMaintainedAt",
      i.location,
      i.geometry,
      i.latitude,
      i.longitude,
      i.metadata,
      i.created_by            AS "createdBy",
      i.created_at            AS "createdAt",
      i.updated_at            AS "updatedAt",
      i.deleted_at            AS "deletedAt"
  `;

  private readonly joinFrom = `
    FROM infrastructures i
    LEFT JOIN territories t ON t.id = i.territory_id
  `;

  /** Récupère les infrastructures avec pagination + filtres + recherche */
  public async getAllInfrastructures(
    query: GetAllInfrastructuresQuery = {}
  ): Promise<PaginatedResult<Infrastructure>> {
    try {
      const page = Math.max(1, query.page ?? 1);
      const limit = Math.min(100, Math.max(1, query.limit ?? 50));
      const offset = (page - 1) * limit;

      const conditions: string[] = [`i.deleted_at IS NULL`];
      const params: any[] = [];

      if (query.territoryId) {
        params.push(query.territoryId);
        conditions.push(`i.territory_id = $${params.length}`);
      }
      if (query.type) {
        params.push(query.type);
        conditions.push(`i.type = $${params.length}`);
      }
      if (query.status) {
        params.push(query.status);
        conditions.push(`i.status = $${params.length}`);
      }
      if (query.condition) {
        params.push(query.condition);
        conditions.push(`i.condition = $${params.length}`);
      }
      if (query.search) {
        params.push(`%${query.search}%`);
        conditions.push(`(i.name ILIKE $${params.length} OR i.reference_code ILIKE $${params.length})`);
      }
      const where = conditions.join(' AND ');

      const key = `infrastructures:all:${page}:${limit}:${query.territoryId ?? ''}:${query.type ?? ''}:${query.status ?? ''}:${query.condition ?? ''}:${query.search ?? ''}`;
      return await redisCache.getOrSet(key, async () => {
        const countRes = await this.db.query(
          `SELECT COUNT(*)::int AS total FROM infrastructures i WHERE ${where}`,
          params
        );
        const total = countRes.rows[0].total as number;

        params.push(limit, offset);
        const res = await this.db.query(
          `${this.infrastructureSelect}
           ${this.joinFrom}
           WHERE ${where}
           ORDER BY i.created_at DESC
           LIMIT $${params.length - 1} OFFSET $${params.length}`,
          params
        );

        return {
          data: res.rows as Infrastructure[],
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      }, 600);
    } catch (error: any) {
      this.logger.error(`Erreur getAllInfrastructures: ${error.message}`);
      throw error;
    }
  }

  /** Récupère une infrastructure par son id (UUID). */
  public async getInfrastructureById(id: string): Promise<Infrastructure | null> {
    try {
      const key = `infrastructure:id:${id}`;
      return await redisCache.getOrSet(key, async () => {
        const res = await this.db.query(
          `${this.infrastructureSelect}
           ${this.joinFrom}
           WHERE i.id = $1
             AND i.deleted_at IS NULL
           LIMIT 1`,
          [id]
        );
        return res.rowCount > 0 ? (res.rows[0] as Infrastructure) : null;
      }, 600);
    } catch (error: any) {
      this.logger.error(`Erreur getInfrastructureById: ${error.message}`);
      throw error;
    }
  }

    /** Crée une infrastructure. */
    public async createInfrastructure(
        payload: CreateInfrastructurePayload
    ): Promise<Infrastructure> {
        try {
            const res = await this.db.query(
                `INSERT INTO infrastructures (
                    territory_id, mapped_area_id, name, reference_code,
                    type, condition, status, description, material,
                    dimensions, installation_date, last_maintained_at,
                    location, geometry, latitude, longitude, metadata, created_by
                )
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                     RETURNING id`,
                [
                    payload.territoryId,
                    payload.mappedAreaId ?? null,
                    payload.name,
                    payload.referenceCode ?? null,
                    payload.type,
                    payload.condition ?? 'good',
                    payload.status ?? 'ACTIVE',
                    payload.description ?? null,
                    payload.material ?? null,
                    payload.dimensions ?? null,
                    payload.installationDate ?? null,
                    payload.lastMaintainedAt ?? null,
                    payload.location ?? null,
                    payload.geometry ?? null,
                    payload.latitude ?? null,
                    payload.longitude ?? null,
                    JSON.stringify(payload.metadata ?? {}), // <-- CORRECTION ICI
                    payload.createdBy ?? null,
                ]
            );
            const created = res.rows[0] as { id: string };

            await redisCache.invalidatePattern('infrastructures:all:*');

            return await this.getInfrastructureById(created.id) as Infrastructure;
        } catch (error: any) {
            if (error.code === '23503') {
                throw new BadRequestError('Référence invalide : territoire ou zone cartographiée.');
            }
            if (error.code === '23505') {
                throw new BadRequestError('Le code de référence existe déjà.');
            }
            this.logger.error(`Erreur createInfrastructure: ${error.message}`);
            throw error;
        }
    } 

    /** Met à jour une infrastructure. */
  public async updateInfrastructure(
    id: string,
    payload: UpdateInfrastructurePayload
  ): Promise<Infrastructure | null> {
    try {
      const res = await this.db.query(
        `UPDATE infrastructures
         SET name = COALESCE($1, name),
             reference_code = COALESCE($2, reference_code),
             type = COALESCE($3, type),
             condition = COALESCE($4, condition),
             status = COALESCE($5, status),
             description = COALESCE($6, description),
             material = COALESCE($7, material),
             dimensions = COALESCE($8, dimensions),
             installation_date = COALESCE($9, installation_date),
             last_maintained_at = COALESCE($10, last_maintained_at),
             location = COALESCE($11, location),
             geometry = COALESCE($12, geometry),
             latitude = COALESCE($13, latitude),
             longitude = COALESCE($14, longitude),
             metadata = COALESCE($15, metadata)
         WHERE id = $16
           AND deleted_at IS NULL
         RETURNING id`,
        [
          payload.name ?? null,
          payload.referenceCode ?? null,
          payload.type ?? null,
          payload.condition ?? null,
          payload.status ?? null,
          payload.description ?? null,
          payload.material ?? null,
          payload.dimensions ?? null,
          payload.installationDate ?? null,
          payload.lastMaintainedAt ?? null,
          payload.location ?? null,
          payload.geometry ?? null,
          payload.latitude ?? null,
          payload.longitude ?? null,
          payload.metadata ?? null,
          id,
        ]
      );

      if (res.rowCount === 0) {
        throw new NotFoundError('Infrastructure introuvable.');
      }

      await redisCache.invalidate(`infrastructure:id:${id}`);
      await redisCache.invalidatePattern('infrastructures:all:*');

      return await this.getInfrastructureById(id);
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur updateInfrastructure: ${error.message}`);
      throw error;
    }
  }

  /** Suppression logique d'une infrastructure. */
  public async deleteInfrastructure(id: string): Promise<void> {
    try {
      const res = await this.db.query(
        `UPDATE infrastructures SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
        [id]
      );

      if ((res.rowCount ?? 0) === 0) {
        throw new NotFoundError('Infrastructure introuvable.');
      }

      await redisCache.invalidate(`infrastructure:id:${id}`);
      await redisCache.invalidatePattern('infrastructures:all:*');
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur deleteInfrastructure: ${error.message}`);
      throw error;
    }
  }
}