"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUsersController = void 0;
class GetUsersController {
    constructor(usersService) {
        this.usersService = usersService;
        this.execute = async (req, res, next) => {
            try {
                const filters = req.query;
                const users = await this.usersService.getUsers(filters);
                res.status(200).json({
                    success: true,
                    data: users
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.GetUsersController = GetUsersController;
//# sourceMappingURL=getUsers.controller.js.map