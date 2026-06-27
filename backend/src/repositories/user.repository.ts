import { BaseRepository } from './base.repository';
import { prisma } from '../database/db';

export class UserRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.user);
  }

  /**
   * Fetch a user by email, eager loading role parameters
   */
  async findByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: { 
        role: true,
        preferences: true
      },
    });
  }
}
export const userRepository = new UserRepository();
export default userRepository;
