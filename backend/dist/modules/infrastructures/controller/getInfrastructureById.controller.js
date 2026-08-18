"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInfrastructureByIdController = void 0;
const zod_1 = require("zod");
const infrastructure_validations_1 = require("../validations/infrastructure.validations");
class GetInfrastructureByIdController {
    constructor(getInfrastructureByIdService) {
        this.getInfrastructureByIdService = getInfrastructureByIdService;
        this.getInfrastructureById = async (req, res, next) => {
            try {
                const { id } = infrastructure_validations_1.IdParamSchema.parse(req.params);
                const infrastructure = await this.getInfrastructureByIdService.getInfrastructureById(id);
                res.status(200).json({
                    success: true,
                    message: 'Infrastructure récupérée avec succès.',
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
exports.GetInfrastructureByIdController = GetInfrastructureByIdController;
//# sourceMappingURL=getInfrastructureById.controller.js.map