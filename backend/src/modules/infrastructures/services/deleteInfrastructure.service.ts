/*
 * |--------------------------------------------------------------------------
 * | DELETE INFRASTRUCTURE SERVICE
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { InfrastructureRepository } from '../repositories/infrastructure.repositories';

export class DeleteInfrastructureService {
  constructor(
    private readonly infrastructureRepository: InfrastructureRepository,
    private readonly logger: Logger,
  ) {}

  /** Suppression logique d'une infrastructure. */
  public async deleteInfrastructure(id: string): Promise<void> {
    try {
      await this.infrastructureRepository.deleteInfrastructure(id);
      this.logger.info(`Infrastructure supprimée (logique) : ${id}`);
    } catch (error: any) {
      this.logger.error(`Erreur deleteInfrastructure (service): ${error.message}`);
      throw error;
    }
  }
}
