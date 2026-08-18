/*
 * |--------------------------------------------------------------------------
 * | GET INFRASTRUCTURE BY ID SERVICE
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { InfrastructureRepository } from '../repositories/infrastructure.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';
import type { Infrastructure } from '../types/infrastructure.types';

export class GetInfrastructureByIdService {
  constructor(
    private readonly infrastructureRepository: InfrastructureRepository,
    private readonly logger: Logger,
  ) {}

  /** Récupère une infrastructure par son UUID. */
  public async getInfrastructureById(id: string): Promise<Infrastructure> {
    try {
      const infrastructure = await this.infrastructureRepository.getInfrastructureById(id);
      if (!infrastructure) {
        throw new NotFoundError('Infrastructure introuvable.');
      }
      this.logger.info(`Infrastructure récupérée : ${id}`);
      return infrastructure;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur getInfrastructureById (service): ${error.message}`);
      throw error;
    }
  }
}
