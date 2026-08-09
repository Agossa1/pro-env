"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddChecklistItemController = void 0;
const zod_1 = require("zod");
const mission_validations_1 = require("../validations/mission.validations");
class AddChecklistItemController {
    constructor(addChecklistItemService) {
        this.addChecklistItemService = addChecklistItemService;
        this.addChecklistItem = async (req, res, next) => {
            try {
                const { id } = mission_validations_1.IdParamSchema.parse(req.params);
                const { label } = mission_validations_1.ChecklistItemSchema.parse(req.body);
                const item = await this.addChecklistItemService.addChecklistItem(id, label);
                res.status(201).json({
                    success: true,
                    message: 'Tâche ajoutée à la checklist avec succès.',
                    data: item,
                });
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    res.status(400).json({
                        success: false,
                        message: 'Erreur de validation des données.',
                        errors: error.issues,
                    });
                    return;
                }
                next(error);
            }
        };
    }
}
exports.AddChecklistItemController = AddChecklistItemController;
//# sourceMappingURL=addChecklistItem.controller.js.map