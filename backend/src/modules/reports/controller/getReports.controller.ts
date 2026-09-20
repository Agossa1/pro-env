import type { Request, Response, NextFunction } from 'express';
import { GetReportsService } from '../services/getReports.service';
import { getScopeFilters } from '../../../shared/helpers/scopeFilters.helper';

export class GetReportsController {
  constructor(private readonly getReportsService: GetReportsService) {}

  public getReports = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { forcedRegionId, forcedMunicipalityId, forcedDistrictId, forcedNeighborhoodId, forcedCreatedBy } = getScopeFilters(req);

      const query = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        // Les restrictions de rôle écrasent les filtres passés en query string
        regionId: forcedRegionId ?? (req.query.regionId as string | undefined),
        municipalityId: forcedMunicipalityId ?? (req.query.municipalityId as string | undefined),
        districtId: forcedDistrictId ?? (req.query.districtId as string | undefined),
        neighborhoodId: forcedNeighborhoodId ?? (req.query.neighborhoodId as string | undefined),
        createdBy: forcedCreatedBy ?? (req.query.createdBy as string | undefined),
        status: req.query.status as string | undefined,
        issueCategory: req.query.issueCategory as string | undefined,
      };

      const result = await this.getReportsService.getReports(query);

      res.status(200).json({
        success: true,
        message: 'Liste des rapports récupérée avec succès.',
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