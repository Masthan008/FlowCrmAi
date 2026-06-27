"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    /**
     * Find a record by its UUID primary key (ignoring soft-deleted records)
     */
    async findById(id) {
        return this.model.findFirst({
            where: { id, deletedAt: null },
        });
    }
    /**
     * Find all records matching a filter (ignoring soft-deleted records)
     */
    async findMany(where = {}, orderBy = {}) {
        return this.model.findMany({
            where: { ...where, deletedAt: null },
            orderBy,
        });
    }
    /**
     * Create a new record
     */
    async create(data) {
        return this.model.create({ data });
    }
    /**
     * Update an existing record
     */
    async update(id, data) {
        return this.model.update({
            where: { id },
            data,
        });
    }
    /**
     * Hard delete a record from the database
     */
    async delete(id) {
        return this.model.delete({
            where: { id },
        });
    }
    /**
     * Soft delete a record by setting the deletedAt and deletedBy fields
     */
    async softDelete(id, deletedBy = null) {
        return this.model.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedBy,
            },
        });
    }
    /**
     * Restore a soft-deleted record
     */
    async restore(id) {
        return this.model.update({
            where: { id },
            data: {
                deletedAt: null,
                deletedBy: null,
            },
        });
    }
    /**
     * Paginate query results cleanly
     */
    async paginate(where = {}, page = 1, limit = 10, orderBy = {}) {
        const skip = (page - 1) * limit;
        const cleanWhere = { ...where, deletedAt: null };
        const [items, totalItems] = await Promise.all([
            this.model.findMany({
                where: cleanWhere,
                skip,
                take: limit,
                orderBy,
            }),
            this.model.count({
                where: cleanWhere,
            }),
        ]);
        const totalPages = Math.ceil(totalItems / limit);
        return {
            items,
            totalItems,
            totalPages,
            page,
            limit,
        };
    }
}
exports.BaseRepository = BaseRepository;
exports.default = BaseRepository;
