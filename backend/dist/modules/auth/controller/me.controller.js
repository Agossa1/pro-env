"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeController = void 0;
class MeController {
    constructor(authRepository) {
        this.authRepository = authRepository;
        this.me = async (req, res, next) => {
            try {
                const user = req.user;
                if (!user) {
                    res.status(401).json({ success: false, message: 'Non authentifié.' });
                    return;
                }
                const profile = await this.authRepository.findAuthByIdForToken(user.userId);
                if (!profile) {
                    res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: {
                        id: profile.id,
                        email: profile.email,
                        fullName: profile.fullName,
                        regionId: profile.regionId,
                        municipalityId: profile.municipalityId,
                        districtId: profile.districtId,
                        neighborhoodId: profile.neighborhoodId,
                        organizationId: profile.organizationId,
                        isActive: profile.isActive,
                        isVerified: profile.isVerified,
                        roleCode: profile.roleCode,
                        roleName: profile.roleName,
                        roleTier: profile.roleTier,
                        createdAt: profile.createdAt,
                        updatedAt: profile.updatedAt,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.MeController = MeController;
//# sourceMappingURL=me.controller.js.map