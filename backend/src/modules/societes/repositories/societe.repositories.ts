/*
 * |--------------------------------------------------------------------------
 * | SOCIETE REPOSITORY
 * |--------------------------------------------------------------------------
 * | Couche d'accès aux données pour le module Societes.
 * | Alignée sur le schéma 01.schema.sql — la table SQL reste `organizations`.
 * | Gère le CRUD des sociétés + la lecture des territoires de compétence.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import PostgresDatabase from '../../../config/database/postgres';
import { BadRequestError, NotFoundError } from '../../../shared/errors/appErrors';
import { redisCache } from '../../../infra/redis/redis.service';

import type {
  AppSociete,
  SocieteTerritory,
  CreateSocietePayload,
  UpdateSocietePayload,
  PaginationQuery,
  PaginatedResult,
} from '../types/societe.types';

export class SocieteRepository {
  constructor(
    private readonly db: PostgresDatabase,
    private readonly logger: Logger,
  ) {}

  // ───────────────────────────────────────────────────────────────────────────
  // CRUD SOCIETES
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Récupère les sociétés avec pagination (page 1-based, limit par page —
   * défauts 1 et 50). Filtre optionnel par type.
   */
  public async getAllSocietes(
    query: PaginationQuery & { type?: string } = {}
  ): Promise<PaginatedResult<AppSociete>> {
    try {
      const page = Math.max(1, query.page ?? 1);
      const limit = Math.min(100, Math.max(1, query.limit ?? 50));
      const offset = (page - 1) * limit;

      const conditions: string[] = [];
      const params: any[] = [];
      if (query.type) {
        params.push(query.type);
        conditions.push(`type = $${params.length}`);
      }
      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const key = `societes:all:${page}:${limit}:${query.type ?? ''}`;
      return await redisCache.getOrSet(key, async () => {
        const countRes = await this.db.query(
          `SELECT COUNT(*)::int AS total FROM organizations ${where}`,
          params
        );
        const total = countRes.rows[0].total as number;

        params.push(limit, offset);
        const res = await this.db.query(
          `SELECT id, name, type,
             registration_number AS "registrationNumber",
             contact_email AS "contactEmail",
             contact_phone AS "contactPhone",
             is_active AS "isActive",
             created_at AS "createdAt",
             updated_at AS "updatedAt"
           FROM organizations
           ${where}
           ORDER BY name ASC
           LIMIT $${params.length - 1} OFFSET $${params.length}`,
          params
        );

        return {
          data: res.rows as AppSociete[],
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      }, 3600);
    } catch (error: any) {
      this.logger.error(`Erreur getAllSocietes: ${error.message}`);
      throw error;
    }
  }

  /** Récupère une société par son id (UUID). */
  public async getSocieteById(id: string): Promise<AppSociete | null> {
    try {
      const key = `societes:id:${id}`;
      return await redisCache.getOrSet(key, async () => {
        const res = await this.db.query(
          `SELECT id, name, type,
             registration_number AS "registrationNumber",
             contact_email AS "contactEmail",
             contact_phone AS "contactPhone",
             is_active AS "isActive",
             created_at AS "createdAt",
             updated_at AS "updatedAt"
           FROM organizations
           WHERE id = $1
           LIMIT 1`,
          [id]
        );
        return res.rowCount > 0 ? (res.rows[0] as AppSociete) : null;
      }, 3600);
    } catch (error: any) {
      this.logger.error(`Erreur getSocieteById: ${error.message}`);
      throw error;
    }
  }

  /** Récupère une société par son numéro d'enregistrement. */
  public async getSocieteByRegistrationNumber(
    registrationNumber: string
  ): Promise<AppSociete | null> {
    try {
      const key = `societes:registration:${registrationNumber}`;
      return await redisCache.getOrSet(key, async () => {
        const res = await this.db.query(
          `SELECT id, name, type,
             registration_number AS "registrationNumber",
             contact_email AS "contactEmail",
             contact_phone AS "contactPhone",
             is_active AS "isActive",
             created_at AS "createdAt",
             updated_at AS "updatedAt"
           FROM organizations
           WHERE registration_number = $1
           LIMIT 1`,
          [registrationNumber]
        );
        return res.rowCount > 0 ? (res.rows[0] as AppSociete) : null;
      }, 3600);
    } catch (error: any) {
      this.logger.error(`Erreur getSocieteByRegistrationNumber: ${error.message}`);
      throw error;
    }
  }

  /** Crée une société (transaction + invalidation cache). */
  public async createSociete(payload: CreateSocietePayload): Promise<AppSociete> {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');

      const res = await client.query(
        `INSERT INTO organizations (
           name, type, registration_number, contact_email, contact_phone, is_active
         )
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING
           id, name, type,
           registration_number AS "registrationNumber",
           contact_email AS "contactEmail",
           contact_phone AS "contactPhone",
           is_active AS "isActive",
           created_at AS "createdAt",
           updated_at AS "updatedAt"`,
        [
          payload.name,
          payload.type,
          payload.registrationNumber ?? null,
          payload.contactEmail ?? null,
          payload.contactPhone ?? null,
          payload.isActive ?? true,
        ]
      );
      const societe = res.rows[0] as AppSociete;
      const societeId = societe.id;

      // Association optionnelle à un territoire (mairie/commune ou ministère) —
      // table organization_territories (zone de compétence de la société)
      if (payload.territoryId) {
        await client.query(
          `INSERT INTO organization_territories (organization_id, territory_id, is_active)
           VALUES ($1, $2, TRUE)
           ON CONFLICT (organization_id, territory_id) DO NOTHING`,
          [societeId, payload.territoryId]
        );
      }

      await client.query('COMMIT');

      await redisCache.invalidatePattern('societes:all:*');
      if (payload.territoryId) {
        await redisCache.invalidate(`societes:territories:${societeId}`);
      }

      return societe;
    } catch (error: any) {
      await client.query('ROLLBACK');
      if (error.code === '23505' && error.constraint === 'organizations_registration_number_key') {
        throw new BadRequestError(
          `Une société existe déjà avec le n° d'enregistrement "${payload.registrationNumber}".`
        );
      }
      if (error.code === '23503') {
        throw new BadRequestError(
          'Territoire d\'association introuvable ou invalide.'
        );
      }
      this.logger.error(`Erreur createSociete: ${error.message}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /** Met à jour une société. */
  public async updateSociete(
    id: string,
    payload: UpdateSocietePayload
  ): Promise<AppSociete | null> {
    try {
      const res = await this.db.query(
        `UPDATE organizations
         SET name = COALESCE($1, name),
             type = COALESCE($2, type),
             registration_number = COALESCE($3, registration_number),
             contact_email = COALESCE($4, contact_email),
             contact_phone = COALESCE($5, contact_phone),
             is_active = COALESCE($6, is_active)
         WHERE id = $7
         RETURNING
           id, name, type,
           registration_number AS "registrationNumber",
           contact_email AS "contactEmail",
           contact_phone AS "contactPhone",
           is_active AS "isActive",
           created_at AS "createdAt",
           updated_at AS "updatedAt"`,
        [
          payload.name ?? null,
          payload.type ?? null,
          payload.registrationNumber ?? null,
          payload.contactEmail ?? null,
          payload.contactPhone ?? null,
          payload.isActive ?? null,
          id,
        ]
      );

      if (res.rowCount === 0) {
        throw new NotFoundError('Société introuvable.');
      }

      await redisCache.invalidatePattern('societes:all:*');
      await redisCache.invalidate(`societes:id:${id}`);
      if (payload.registrationNumber) {
        await redisCache.invalidate(`societes:registration:${payload.registrationNumber}`);
      }

      return res.rows[0] as AppSociete;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur updateSociete: ${error.message}`);
      throw error;
    }
  }

  /** Supprime une société (RESTRICT si références autres tables). */
  public async deleteSociete(id: string): Promise<void> {
    try {
      const res = await this.db.query(`DELETE FROM organizations WHERE id = $1`, [id]);

      if ((res.rowCount ?? 0) === 0) {
        throw new NotFoundError('Société introuvable.');
      }

      await redisCache.invalidatePattern('societes:all:*');
      await redisCache.invalidate(`societes:id:${id}`);
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      if (error.code === '23503') {
        throw new BadRequestError(
          'Impossible de supprimer cette société : des références y sont encore rattachées (utilisateurs, missions, territoires, équipes).'
        );
      }
      this.logger.error(`Erreur deleteSociete: ${error.message}`);
      throw error;
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TERRITOIRES DE COMPÉTENCE
  // ───────────────────────────────────────────────────────────────────────────

  /** Récupère les territoires de compétence d'une société. */
  public async getSocieteTerritories(societeId: string): Promise<SocieteTerritory[]> {
    try {
      const key = `societes:territories:${societeId}`;
      return await redisCache.getOrSet(key, async () => {
        const res = await this.db.query(
          `SELECT ot.id,
             ot.organization_id AS "societeId",
             ot.territory_id AS "territoryId",
             ot.is_active AS "isActive"
           FROM organization_territories ot
           WHERE ot.organization_id = $1
           ORDER BY ot.created_at ASC`,
          [societeId]
        );
        return res.rows as SocieteTerritory[];
      }, 3600);
    } catch (error: any) {
      this.logger.error(`Erreur getSocieteTerritories: ${error.message}`);
      throw error;
    }
  }
}