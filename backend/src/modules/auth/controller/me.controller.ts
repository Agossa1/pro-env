import type { Request, Response, NextFunction } from 'express';
import { AuthRepository } from '../repositories/auth.repositories';

export class MeController {
  constructor(private readonly authRepository: AuthRepository) {}

  public me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
          id:             profile.id,
          email:          profile.email,
          fullName:       profile.fullName,
          territoryId:    profile.territoryId,
          organizationId: profile.organizationId,
          isActive:       profile.isActive,
          isVerified:     profile.isVerified,
          roleCode:       profile.roleCode,
          roleName:       profile.roleName,
          roleTier:       profile.roleTier,
          createdAt:      profile.createdAt,
          updatedAt:      profile.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
