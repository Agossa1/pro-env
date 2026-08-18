"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToggleUserActiveService = void 0;
class ToggleUserActiveService {
    constructor(authRepository) {
        this.authRepository = authRepository;
    }
    async execute(userId) {
        const isActive = await this.authRepository.toggleUserActive(userId);
        return isActive;
    }
}
exports.ToggleUserActiveService = ToggleUserActiveService;
//# sourceMappingURL=toggleUserActive.service.js.map