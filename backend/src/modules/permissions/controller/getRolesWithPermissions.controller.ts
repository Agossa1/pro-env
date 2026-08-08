import type { Request, Response, NextFunction } from 'express';
import { GetRolesWithPermissionsService } from '../services/getRolesWithPermissions.service';

export class GetRolesWithPermissionsController {
  constructor(
    private readonly getRolesWithPermissionsService: GetRolesWithPermissionsService
  ) {}

  public getRolesWithPermissions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const roles = await this.getRolesWithPermissionsService.getRolesWithPermissions();

      res.status(200).json({
        success: true,
        message: 'Rôles avec permissions récupérés avec succès.',
        data: roles,
      });
    } catch (error) {
      next(error);
    }
  };
}