"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const base_repository_1 = require("./base.repository");
const db_1 = require("../database/db");
class UserRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.user);
    }
    /**
     * Fetch a user by email, eager loading role parameters
     */
    async findByEmail(email) {
        return db_1.prisma.user.findFirst({
            where: { email, deletedAt: null },
            include: {
                role: true,
                preferences: true
            },
        });
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
exports.default = exports.userRepository;
