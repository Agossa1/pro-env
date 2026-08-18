"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInfrastructureController = void 0;
const zod_1 = require("zod");
const infrastructure_validations_1 = require("../validations/infrastructure.validations");
class UpdateInfrastructureController {
    constructor(updateInfrastructureService) {
        this.updateInfrastructureService = updateInfrastructureService;
        this.updateInfrastructure = async (req, res, next) => {
            try {
                const { id } = infrastructure_validations_1.IdParamSchema.parse(req.params);
                const payload = infrastructure_validations_1.UpdateInfrastructureSchema.parse(req.body);
                const infrastructure = await this.updateInfrastructureService.updateInfrastructure(id, payload);
                res.status(200).json({
                    success: true,
                    message: 'Infrastructure mise à jour avec succès.',
                    data: infrastructure,
                });
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    res.status(400).json({ success: false, message: 'Erreur de validation des données.', errors: error.issues });
                    return;
                }
                next(error);
            }
        };
    }
}
exports.UpdateInfrastructureController = UpdateInfrastructureController;
//# sourceMappingURL=updateInfrastructure.controller.js.map