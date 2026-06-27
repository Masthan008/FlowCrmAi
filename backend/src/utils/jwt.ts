import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface TokenClaims {
  id: string;
  email: string;
  role: string;
  permissions: string[];
}

export const JwtUtility = {
  /**
   * Generate an Access Token
   */
  generateAccessToken: (payload: TokenClaims): string => {
    return jwt.sign(payload, config.jwt.secret as jwt.Secret, {
      expiresIn: config.jwt.expiresIn as any,
    });
  },

  /**
   * Generate a Refresh Token
   */
  generateRefreshToken: (payload: { id: string }): string => {
    return jwt.sign(payload, config.jwt.refreshSecret as jwt.Secret, {
      expiresIn: config.jwt.refreshExpiresIn as any,
    });
  },

  /**
   * Verify an Access Token
   */
  verifyAccessToken: (token: string): TokenClaims => {
    return jwt.verify(token, config.jwt.secret as jwt.Secret) as TokenClaims;
  },

  /**
   * Verify a Refresh Token
   */
  verifyRefreshToken: (token: string): { id: string } => {
    return jwt.verify(token, config.jwt.refreshSecret as jwt.Secret) as { id: string };
  }
};
export default JwtUtility;
