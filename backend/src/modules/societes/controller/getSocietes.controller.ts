import type { Request, Response, NextFunction } from 'express';
import { GetSocietesService } from '../services/getSocietes.service';

export class GetSocietesController {
  constructor(private readonly getSocietesService: GetSocietesService) {}

  public getSocietes = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        type: req.query.type as string | undefined,
      };

      const result = await this.getSocietesService.getSocietes(query);

      res.status(200).json({
        success: true,
        message: 'Liste des sociétés récupérée avec succès.',
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}