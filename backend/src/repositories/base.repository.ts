export class BaseRepository<T> {
  protected model: any;

  constructor(model: any) {
    this.model = model;
  }

  /**
   * Find a record by its UUID primary key (ignoring soft-deleted records)
   */
  async findById(id: string): Promise<T | null> {
    return this.model.findFirst({
      where: { id, deletedAt: null },
    });
  }

  /**
   * Find all records matching a filter (ignoring soft-deleted records)
   */
  async findMany(where: any = {}, orderBy: any = {}): Promise<T[]> {
    return this.model.findMany({
      where: { ...where, deletedAt: null },
      orderBy,
    });
  }

  /**
   * Create a new record
   */
  async create(data: any): Promise<T> {
    return this.model.create({ data });
  }

  /**
   * Update an existing record
   */
  async update(id: string, data: any): Promise<T> {
    return this.model.update({
      where: { id },
      data,
    });
  }

  /**
   * Hard delete a record from the database
   */
  async delete(id: string): Promise<T> {
    return this.model.delete({
      where: { id },
    });
  }

  /**
   * Soft delete a record by setting the deletedAt and deletedBy fields
   */
  async softDelete(id: string, deletedBy: string | null = null): Promise<T> {
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
  async restore(id: string): Promise<T> {
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
  async paginate(
    where: any = {},
    page: number = 1,
    limit: number = 10,
    orderBy: any = {}
  ): Promise<{ items: T[]; totalItems: number; totalPages: number; page: number; limit: number }> {
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
export default BaseRepository;
