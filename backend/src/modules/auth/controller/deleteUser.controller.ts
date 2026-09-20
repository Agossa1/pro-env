import { Request, Response, NextFunction } from 'express';
import { DeleteUserService } from '../services/deleteUser.service';

export class DeleteUserController {
  constructor(private readonly deleteUserService: DeleteUserService) {
    this.delete = this.delete.bind(this);
  }

  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await this.deleteUserService.execute(id);


      res.status(200).json({
        success: true,
        message: 'Utilisateur supprimé avec succès.',
      });
    } catch (error) {
      next(error);
    }
  }
}
