/*
 * |--------------------------------------------------------------------------
 * | GET INTERVENTION BY ID SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération d'une intervention par son UUID.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { InterventionRepository } from '../repositories/intervention.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';
import type { Intervention } from '../types/intervention.types';

export class GetInterventionByIdService {
  constructor(
    private readonly interventionRepository: InterventionRepository,
    private readonly logger: Logger,
  ) {}

  /** Récupère une intervention par son identifiant UUID. */
  public async getInterventionById(id: string): Promise<Intervention> {
    try {
      const intervention = await this.interventionRepository.getInterventionById(id);
      if (!intervention) {
        throw new NotFoundError('Intervention introuvable.');
      }
      this.logger.info(`Intervention récupérée par ID : ${intervention.interventionType}`);
      return intervention;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur getInterventionById (service): ${error.message}`);
      throw error;
    }
  }
}