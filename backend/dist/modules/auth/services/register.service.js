"use strict";
/*
|--------------------------------------------------------------------------
| REGISTER SERVICE
|--------------------------------------------------------------------------
| Service métier gérant la création d'utilisateurs.
| Applique les règles de contrôle d'accès hiérarchique et territorial.
|--------------------------------------------------------------------------
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
const auth_enums_1 = require("../types/auth.enums");
const auth_enums_2 = require("../types/auth.enums");
const authMailer_1 = require("../../../utils/mailer/authMailer");
class RegisterService {
    constructor(authRepository, logger, password) {
        this.authRepository = authRepository;
        this.logger = logger;
        this.password = password;
    }
    async registerUser(dto, creatorContext) {
        try {
            // 1. Vérifier si l'utilisateur existe déjà
            const existenceCheck = await this.authRepository.checkUserExistence(dto.email, dto.phone);
            if (existenceCheck.exists) {
                throw new appErrors_1.BadRequestError(existenceCheck.reason);
            }
            // 2. Validation du rôle demandé
            const targetRole = await this.authRepository.getRoleByCode(dto.roleCode);
            if (!targetRole) {
                throw new appErrors_1.BadRequestError(`Le rôle demandé n'existe pas : ${dto.roleCode}`);
            }
            // 3. Application des Règles Métier (RBAC & Héritage)
            const { territoryId, organizationId } = this.applyCreationRules(dto, targetRole, creatorContext);
            // 4. Hachage du mot de passe
            // Si aucun mot de passe n'est fourni, on pourrait en générer un aléatoirement.
            const rawPassword = dto.password || this.password.generateRandomPassword();
            const passwordHash = await this.password.hashPassword(rawPassword);
            // 5. Préparation du payload pour le Repository
            const createPayload = {
                fullName: dto.fullName,
                email: dto.email,
                phone: dto.phone,
                passwordHash,
                roleId: targetRole.id,
                territoryId,
                organizationId,
                createdBy: creatorContext.userId
            };
            // 6. Exécution via le Repository
            const createdUser = await this.authRepository.createUser(createPayload);
            // Hydratation complète du rôle pour le retour
            createdUser.role = {
                id: targetRole.id,
                code: targetRole.code,
                name: targetRole.name,
                tier: targetRole.tier,
                canManageUsers: targetRole.canManageUsers
            };
            this.logger.info(`Nouvel utilisateur créé: ${createdUser.email} (Role: ${targetRole.code}) par ${creatorContext.userId}`);
            // Génération et envoi de l'OTP via authMailer (utils)
            const rawOtp = this.generateOtp();
            const codeHash = await this.password.hashPassword(rawOtp);
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
            await this.authRepository.saveOtp({
                authId: createdUser.id,
                codeHash,
                type: auth_enums_2.OtpType.EMAIL_VERIFICATION,
                expiresAt,
            });
            await authMailer_1.authMailer.sendSigieOtp(dto.email, dto.fullName, rawOtp);
            return createdUser;
        }
        catch (error) {
            this.logger.error(`Erreur lors de la création de l'utilisateur`);
            throw new appErrors_1.BadRequestError('Erreur lors de la création de l\'utilisateur');
        }
    }
    /**
     * Vérifie les droits de création et applique l'héritage territorial / organisationnel.
     */
    applyCreationRules(dto, targetRole, creatorContext) {
        // Si le créateur est un Super Admin (Platform)
        if (creatorContext.roleTier === auth_enums_1.RoleTier.PLATFORM) {
            // Il peut créer n'importe qui et assigner n'importe quel territoire/organisation
            return {
                territoryId: dto.territoryId || null,
                organizationId: dto.organizationId || null
            };
        }
        // Si le créateur est un Administrateur Territorial (ex: Mairie)
        if (creatorContext.roleTier === auth_enums_1.RoleTier.TERRITORIAL) {
            if (!creatorContext.territoryId) {
                throw new appErrors_1.ForbiddenError('Votre compte territorial est mal configuré (aucun territoire assigné).');
            }
            // Un admin territorial ne peut pas créer un rôle 'platform'
            if (targetRole.tier === auth_enums_1.RoleTier.PLATFORM) {
                throw new appErrors_1.ForbiddenError('Vous ne pouvez pas créer d\'administrateur système.');
            }
            // Règles spécifiques selon le profil cible
            if (targetRole.code === 'technicien') {
                if (dto.organizationId) {
                    // Création d'un Technicien Prestataire
                    // Optionnel : Vérifier si l'organizationId fait partie du territoire de la mairie.
                    return {
                        territoryId: null,
                        organizationId: dto.organizationId
                    };
                }
                else {
                    // Création d'un Technicien Mairie (hérite du territoire du créateur)
                    return {
                        territoryId: creatorContext.territoryId,
                        organizationId: null
                    };
                }
            }
            // Par défaut pour les autres rôles territoriaux créés par la mairie
            return {
                territoryId: creatorContext.territoryId,
                organizationId: null
            };
        }
        // Auto-inscription publique (citoyen uniquement)
        if (!creatorContext.userId && !creatorContext.organizationId && !creatorContext.territoryId) {
            if (targetRole.code !== 'citoyen') {
                throw new appErrors_1.ForbiddenError('Inscription publique limitée au rôle citoyen.');
            }
            return { territoryId: null, organizationId: null };
        }
        // Si le créateur est un Prestataire (Field ou Territorial rattaché à une orga)
        if (creatorContext.organizationId) {
            if (targetRole.code !== 'technicien') {
                throw new appErrors_1.ForbiddenError('Un prestataire ne peut créer que des techniciens.');
            }
            // Hérite de l'organisation du créateur
            return {
                territoryId: null,
                organizationId: creatorContext.organizationId
            };
        }
        throw new appErrors_1.ForbiddenError('Vous n\'avez pas les droits pour créer des utilisateurs.');
    }
    generateOtp() {
        return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');
    }
}
exports.RegisterService = RegisterService;
//# sourceMappingURL=register.service.js.map