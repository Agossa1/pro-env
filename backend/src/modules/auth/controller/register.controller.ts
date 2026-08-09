import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { RegisterService } from '../services/register.service';
import { RegisterSchema } from '../validations/auth.validations';
import type { TokenPayload } from '../types/auth.types';

export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  /**
   * Auto-inscription publique (rôle citoyen uniquement).
   * POST /auth/register — non authentifié.
   */
  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Validation des données d'entrée
      const payload = RegisterSchema.parse(req.body);

      // 2. Construction du contexte créateur (auto-inscription publique)
      const creatorContext: TokenPayload = {
        id: '',
        userId: '',
        email: '',
        roleCode: 'citoyen',
        roleTier: null,
        territoryId: null,
        organizationId: null,
        roles: [],
      };

      // 3. Appel au service métier
      const user = await this.registerService.registerUser(payload, creatorContext);

      // 4. Réponse standardisée
      res.status(201).json({
        success: true,
        message: 'Utilisateur créé avec succès. Un code de vérification a été envoyé à votre adresse email.',
        data: {
          id: user.id,
          email: user.email,
          fullName: user.fullName
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Erreur de validation des données.',
          errors: error.issues
        });
        return;
      }
      next(error);
    }
  };

  /**
   * Création d'un utilisateur par un administrateur connecté.
   * POST /auth/register-admin — protégé par authMiddleware (req.user).
   */
  public registerAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Validation des données d'entrée
      const payload = RegisterSchema.parse(req.body);

      // 2. Contexte créateur = utilisateur connecté (injecté par authMiddleware)
      const creatorContext: TokenPayload = req.user as TokenPayload;
      if (!creatorContext?.userId) {
        res.status(401).json({
          success: false,
          message: 'Authentification requise pour créer un utilisateur.',
        });
        return;
      }

      // 3. Appel au service métier (applyCreationRules applique le RBAC selon le créateur)
      const user = await this.registerService.registerUser(payload, creatorContext);

      // 4. Réponse standardisée
      res.status(201).json({
        success: true,
        message: 'Utilisateur créé avec succès. Un code de vérification a été envoyé à son adresse email.',
        data: {
          id: user.id,
          email: user.email,
          fullName: user.fullName
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Erreur de validation des données.',
          errors: error.issues
        });
        return;
      }
      next(error);
    }
  };
}