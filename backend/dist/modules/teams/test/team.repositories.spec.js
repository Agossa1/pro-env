"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const team_repositories_1 = require("../repositories/team.repositories");
const postgres_1 = __importDefault(require("../../../config/database/postgres"));
const redis_service_1 = require("../../../infra/redis/redis.service");
const appErrors_1 = require("../../../shared/errors/appErrors");
const team_enums_1 = require("../types/team.enums");
const mockLogger = { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() };
jest.mock('@/config/database/postgres');
jest.mock('@/infra/redis/redis.service', () => ({
    redisCache: { getOrSet: jest.fn(), invalidate: jest.fn(), invalidatePattern: jest.fn() }
}));
describe('TeamRepository', () => {
    let teamRepository;
    let mockDb;
    const mockTeam = {
        id: 'team-1',
        organizationId: null,
        teamType: 'institution',
        name: 'Équipe Mairie',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
    };
    beforeEach(() => {
        mockDb = new postgres_1.default();
        mockDb.query = jest.fn();
        mockDb.getClient = jest.fn();
        teamRepository = new team_repositories_1.TeamRepository(mockDb, mockLogger);
        jest.clearAllMocks();
    });
    describe('getAllTeams', () => {
        it('doit retourner une liste paginée avec filtres', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_k, f) => f());
            mockDb.query
                .mockResolvedValueOnce({ rows: [{ total: 10 }] })
                .mockResolvedValueOnce({ rows: [mockTeam] });
            const result = await teamRepository.getAllTeams({ teamType: 'institution', page: 1, limit: 10 });
            expect(result.total).toBe(10);
            expect(result.data).toHaveLength(1);
            expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('t.team_type = $1'), expect.any(Array));
        });
    });
    describe('getTeamById', () => {
        it('doit retourner l\'équipe si trouvée', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_k, f) => f());
            mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockTeam] });
            expect(await teamRepository.getTeamById('team-1')).toEqual(mockTeam);
        });
    });
    describe('createTeam', () => {
        it('doit créer une équipe institution (org null)', async () => {
            mockDb.query.mockResolvedValueOnce({ rows: [mockTeam] });
            const result = await teamRepository.createTeam({ name: 'Équipe Mairie', teamType: 'institution' });
            expect(result).toEqual(mockTeam);
            expect(redis_service_1.redisCache.invalidatePattern).toHaveBeenCalledWith('teams:all:*');
        });
        it('doit lever BadRequestError si provider sans organizationId', async () => {
            await expect(teamRepository.createTeam({ name: 'Équipe', teamType: 'provider' }))
                .rejects.toThrow(appErrors_1.BadRequestError);
        });
        it('doit lever BadRequestError si société introuvable (23503)', async () => {
            mockDb.query.mockRejectedValueOnce({ code: '23503' });
            await expect(teamRepository.createTeam({ name: 'Équipe', teamType: 'provider', organizationId: 'org-1' }))
                .rejects.toThrow(appErrors_1.BadRequestError);
        });
    });
    describe('updateTeam / deleteTeam', () => {
        it('doit mettre à jour et lever NotFoundError', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockTeam] });
            expect(await teamRepository.updateTeam('team-1', { name: 'New' })).toEqual(mockTeam);
            mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            await expect(teamRepository.updateTeam('inexistant', { name: 'X' })).rejects.toThrow(appErrors_1.NotFoundError);
        });
        it('doit supprimer logiquement', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 1 });
            await teamRepository.deleteTeam('team-1');
            expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE field_teams SET deleted_at'), ['team-1']);
        });
    });
    describe('getTeamMembers / addMemberToTeam / removeMemberFromTeam', () => {
        it('doit retourner les membres actifs', async () => {
            const members = [{ id: 'm1', teamId: 'team-1', userId: 'u1', roleInTeam: team_enums_1.TeamMemberRole.MEMBER, isActive: true, joinedAt: new Date(), leftAt: null }];
            mockDb.query.mockResolvedValueOnce({ rows: members });
            expect(await teamRepository.getTeamMembers('team-1')).toEqual(members);
        });
        it('doit ajouter un membre', async () => {
            const member = { id: 'm1', teamId: 'team-1', userId: 'u1', roleInTeam: team_enums_1.TeamMemberRole.MEMBER, isActive: true, joinedAt: new Date(), leftAt: null };
            mockDb.query.mockResolvedValueOnce({ rows: [member] });
            expect(await teamRepository.addMemberToTeam('team-1', 'u1')).toEqual(member);
        });
        it('doit lever BadRequestError si chef existant (23505)', async () => {
            mockDb.query.mockRejectedValueOnce({ code: '23505', constraint: 'uq_one_active_leader_per_team' });
            await expect(teamRepository.addMemberToTeam('team-1', 'u1', team_enums_1.TeamMemberRole.LEADER))
                .rejects.toThrow(appErrors_1.BadRequestError);
        });
    });
});
//# sourceMappingURL=team.repositories.spec.js.map