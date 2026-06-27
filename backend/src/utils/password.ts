import bcrypt from 'bcrypt';

export const PasswordUtility = {
  /**
   * Hash a plain text password
   * @param password Plain password string
   * @returns Hashed string
   */
  hashPassword: async (password: string): Promise<string> => {
    const saltRounds = 12; // Secure strength
    return bcrypt.hash(password, saltRounds);
  },

  /**
   * Verify password string against a hash
   * @param password Plain password
   * @param hash Database hash
   * @returns boolean
   */
  verifyPassword: async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
  }
};
