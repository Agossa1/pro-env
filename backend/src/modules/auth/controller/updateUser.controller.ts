import { Request, Response, NextFunction } from 'express';
import { UpdateUserService } from '../services/updateUser.service';

export class UpdateUserController {
  constructor(private readonly updateUserService: UpdateUserService) {
    this.update = this.update.bind(this);
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { fullName, phone, roleId, regionId, municipalityId, districtId, neighborhoodId } = req.body;
      await this.updateUserService.execute(id, { fullName, phone, roleId, regionId, municipalityId, districtId, neighborhoodId });


      res.status(200).json({
        success: true,
        message: 'Utilisateur mis à jour avec succès.',
      });
    } catch (error) {
      next(error);
    }
  }
}
