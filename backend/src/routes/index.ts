 import { Router } from 'express';
import PostgresDatabase from '../config/database/postgres';
import { initAuthModule } from '../modules/auth/auth.module';
import { initTerritoryModule } from '../modules/territory/territory.module';
import { initPermissionModule } from '../modules/permissions/permission.module';
import { initRoleModule } from '../modules/roles/role.module';
import { initSocieteModule } from '../modules/societes/societe.module';
import { initReportModule } from '../modules/reports/report.module';
import { initMissionModule } from '../modules/missions/mission.module';
import { initInterventionModule } from '../modules/interventions/intervention.module';
import { initInfrastructureModule } from '../modules/infrastructures/infrastructure.module';
import { initMediaModule } from '../modules/media/media.module';
import { initTeamModule } from '../modules/teams/team.module';
import { initDashboardModule } from '../modules/dashboard/dashboard.module';

export const configureRoutes = (db: PostgresDatabase) => {
    const router = Router();

    router.use('/auth', initAuthModule(db));
    router.use('/territories', initTerritoryModule(db));
    router.use('/permissions', initPermissionModule(db));
    router.use('/roles', initRoleModule(db));
    router.use('/societes', initSocieteModule(db));
    router.use('/reports', initReportModule(db));
    router.use('/missions', initMissionModule(db));
    router.use('/interventions', initInterventionModule(db));
    router.use('/infrastructures', initInfrastructureModule(db));
    router.use('/media', initMediaModule(db));
    router.use('/teams', initTeamModule(db));
    router.use('/dashboard', initDashboardModule(db));

    return router;
};
