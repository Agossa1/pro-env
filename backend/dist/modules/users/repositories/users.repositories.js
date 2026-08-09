"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRepository = void 0;
class UsersRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    async getUsers(filters) {
        try {
            // Basic query for now
            const query = `
        SELECT a.id, a.full_name as "fullName", a.email, a.phone, 
               a.role_id as "roleId", r.name as "roleName", r.code as "roleCode",
               a.territory_id as "territoryId", t.name as "territoryName",
               a.created_at as "createdAt",
               s.is_active as "isActive", s.is_verified as "isVerified"
        FROM auth a
        JOIN roles r ON a.role_id = r.id
        LEFT JOIN territories t ON a.territory_id = t.id
        LEFT JOIN account_status s ON a.id = s.auth_id
        ORDER BY a.created_at DESC
      `;
            const res = await this.db.query(query);
            return res.rows;
        }
        catch (error) {
            this.logger.error(`Erreur getUsers: ${error.message}`);
            throw error;
        }
    }
}
exports.UsersRepository = UsersRepository;
//# sourceMappingURL=users.repositories.js.map