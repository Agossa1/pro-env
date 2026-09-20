/*
 * |--------------------------------------------------------------------------
 * | CREATE INFRASTRUCTURE SERVICE
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { InfrastructureRepository } from '../repositories/infrastructure.repositories';
import { BadRequestError } from '../../../shared/errors/appErrors';
import type { Infrastructure, CreateInfrastructurePayload } from '../types/infrastructure.types';

export class CreateInfrastructureService {
  constructor(
    private readonly infrastructureRepository: InfrastructureRepository,
    private readonly logger: Logger,
  ) {}

  /** Crée une nouvelle infrastructure (équipement physique urbain). */
  public async createInfrastructure(
    payload: CreateInfrastructurePayload
  ): Promise<Infrastructure> {
    try {
      if (!payload.municipalityId || !payload.name || !payload.type) {
        throw new BadRequestError(
          'Le territoire, le nom et le type sont requis.'
        );
      }

      const created = await this.infrastructureRepository.createInfrastructure(payload);

      this.logger.info(
        `Infrastructure créée : ${created.name} (${created.type}) dans la territoire ${created.municipalityId}`
      );
      return created;
    } catch (error: any) {
      if (error instanceof BadRequestError) throw error;
      this.logger.error(`Erreur createInfrastructure (service): ${error.message}`);
      throw error;
    }
  }
}
