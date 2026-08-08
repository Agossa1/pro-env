/*
 * |--------------------------------------------------------------------------
 * | ADD CHECKLIST ITEM SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier d'ajout d'un élément à la checklist d'une mission.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { MissionRepository } from '../repositories/mission.repositories';
import { BadRequestError } from '../../../shared/errors/appErrors';
import type { MissionChecklistItem } from '../types/mission.types';

export class AddChecklistItemService {
  constructor(
    private readonly missionRepository: MissionRepository,
    private readonly logger: Logger,
  ) {}

  /** Ajoute un élément de checklist à une mission. */
  public async addChecklistItem(
    missionId: string,
    label: string
  ): Promise<MissionChecklistItem> {
    try {
      if (!label || !label.trim()) {
        throw new BadRequestError('Le libellé de la tâche est requis.');
      }

      const item = await this.missionRepository.addChecklistItem(missionId, label.trim());

      this.logger.info(`Tâche ajoutée à la mission ${missionId} : ${item.label}`);
      return item;
    } catch (error: any) {
      if (error instanceof BadRequestError) throw error;
      this.logger.error(`Erreur addChecklistItem (service): ${error.message}`);
      throw error;
    }
  }
}