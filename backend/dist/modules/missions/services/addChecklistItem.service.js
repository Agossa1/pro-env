"use strict";
/*
 * |--------------------------------------------------------------------------
 * | ADD CHECKLIST ITEM SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier d'ajout d'un élément à la checklist d'une mission.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddChecklistItemService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class AddChecklistItemService {
    constructor(missionRepository, logger) {
        this.missionRepository = missionRepository;
        this.logger = logger;
    }
    /** Ajoute un élément de checklist à une mission. */
    async addChecklistItem(missionId, label) {
        try {
            if (!label || !label.trim()) {
                throw new appErrors_1.BadRequestError('Le libellé de la tâche est requis.');
            }
            const item = await this.missionRepository.addChecklistItem(missionId, label.trim());
            this.logger.info(`Tâche ajoutée à la mission ${missionId} : ${item.label}`);
            return item;
        }
        catch (error) {
            if (error instanceof appErrors_1.BadRequestError)
                throw error;
            this.logger.error(`Erreur addChecklistItem (service): ${error.message}`);
            throw error;
        }
    }
}
exports.AddChecklistItemService = AddChecklistItemService;
//# sourceMappingURL=addChecklistItem.service.js.map