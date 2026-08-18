/*
 * |--------------------------------------------------------------------------
 * | UPDATE INFRASTRUCTURE SERVICE
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { InfrastructureRepository } from '../repositories/infrastructure.repositories';
import type { Infrastructure, UpdateInfrastructurePayload } from '../types/infrastructure.types';

export class UpdateInfrastructureService {
  constructor(
    private readonly infrastructureRepository: InfrastructureRepository,
    private readonly logger: Logger,
  ) {}

  /** Met à jour une infrastructure. */
  public async updateInfrastructure(
    id: string,
    payload: UpdateInfrastructurePayload
  ): Promise<Infrastructure> {
    try {
      const updated = await this.infrastructureRepository.updateInfrastructure(id, payload);
      this.logger.info(`Infrastructure mise à jour : ${id}`);
      return updated as Infrastructure;
    } catch (error: any) {
      this.logger.error(`Erreur updateInfrastructure (service): ${error.message}`);
      throw error;
    }
  }
}
