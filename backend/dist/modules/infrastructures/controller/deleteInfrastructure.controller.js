"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteInfrastructureController = void 0;
const zod_1 = require("zod");
const infrastructure_validations_1 = require("../validations/infrastructure.validations");
class DeleteInfrastructureController {
    constructor(deleteInfrastructureService) {
        this.deleteInfrastructureService = deleteInfrastructureService;
        this.deleteInfrastructure = async (req, res, next) => {
            try {
                const { id } = infrastructure_validations_1.IdParamSchema.parse(req.params);
                await this.deleteInfrastructureService.deleteInfrastructure(id);
                res.status(200).json({
                    success: true,
                    message: 'Infrastructure supprimée avec succès.',
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
exports.DeleteInfrastructureController = DeleteInfrastructureController;
//# sourceMappingURL=deleteInfrastructure.controller.js.map