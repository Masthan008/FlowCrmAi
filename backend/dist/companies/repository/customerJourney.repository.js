"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerJourneyRepository = exports.CustomerJourneyRepository = void 0;
const base_repository_1 = require("../../repositories/base.repository");
const db_1 = require("../../database/db");
class CustomerJourneyRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.companyCustomerJourney);
    }
    async findByCompanyId(companyId) {
        return db_1.prisma.companyCustomerJourney.findMany({
            where: { companyId, deletedAt: null },
            orderBy: { eventDate: 'asc' },
        });
    }
    async findByType(companyId, type) {
        return db_1.prisma.companyCustomerJourney.findMany({
            where: { companyId, type, deletedAt: null },
            orderBy: { eventDate: 'desc' },
        });
    }
}
exports.CustomerJourneyRepository = CustomerJourneyRepository;
exports.customerJourneyRepository = new CustomerJourneyRepository();
