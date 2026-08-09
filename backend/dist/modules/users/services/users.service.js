"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
class UsersService {
    constructor(usersRepository, registerService, logger) {
        this.usersRepository = usersRepository;
        this.registerService = registerService;
        this.logger = logger;
    }
    async createUser(dto, creatorContext) {
        // La logique métier complète (RBAC, héritage, OTP, Email) 
        // est déjà encapsulée dans RegisterService
        return await this.registerService.registerUser(dto, creatorContext);
    }
    async getUsers(filters) {
        return await this.usersRepository.getUsers(filters);
    }
}
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map