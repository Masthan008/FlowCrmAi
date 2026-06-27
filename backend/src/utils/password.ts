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
  },

  /**
   * Check password strength requirements:
   * - Must contain at least one uppercase letter
   * - Must contain at least one lowercase letter
   * - Must contain at least one number
   * - Must contain at least one special character (@$!%*?&_#)
   * - Must be at least 8 characters long
   */
  validatePasswordStrength: (password: string): boolean => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#])[A-Za-z\d@$!%*?&_#]{8,}$/;
    return regex.test(password);
  }
};
export default PasswordUtility;
