import { Request, Response, NextFunction } from 'express';
import { ToggleUserActiveService } from '../services/toggleUserActive.service';

export class ToggleUserActiveController {
  constructor(private readonly toggleUserActiveService: ToggleUserActiveService) {
    this.toggle = this.toggle.bind(this);
  }

  public async toggle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const isActive = await this.toggleUserActiveService.execute(id as string);
      res.status(200).json({
        success: true,
        message: `Utilisateur ${isActive ? 'activé' : 'désactivé'} avec succès.`,
        data: { isActive }
      });
    } catch (error) {
      next(error);
    }
  }
}