import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  tokenId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  private readonly jwtSecret: string;
  private readonly refreshSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;
  private readonly bcryptRounds: number;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET!;
    this.refreshSecret = process.env.JWT_REFRESH_SECRET!;
    this.accessTokenExpiry = process.env.JWT_EXPIRES_IN || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    this.bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

    if (!this.jwtSecret || !this.refreshSecret) {
      throw new Error('JWT secrets must be defined in environment variables');
    }
  }

  /**
   * Hash password with bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.bcryptRounds);
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate access and refresh tokens for user
   */
  generateTokens(user: User): AuthTokens {
    const tokenId = uuidv4();
    
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenId,
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.accessTokenExpiry as any,
      issuer: 'pokemon-tactics-arena',
      audience: 'pta-client',
    });

    const refreshToken = jwt.sign(
      { tokenId, userId: user.id },
      this.refreshSecret,
      {
        expiresIn: this.refreshTokenExpiry as any,
        issuer: 'pokemon-tactics-arena',
        audience: 'pta-client',
      }
    );

    // Convert expiry to seconds for client
    const expiresIn = this.parseExpiryToSeconds(this.accessTokenExpiry);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * Verify access token and return payload
   */
  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.jwtSecret, {
        issuer: 'pokemon-tactics-arena',
        audience: 'pta-client',
      }) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Verify refresh token and return payload
   */
  verifyRefreshToken(token: string): { tokenId: string; userId: string } {
    try {
      return jwt.verify(token, this.refreshSecret, {
        issuer: 'pokemon-tactics-arena',
        audience: 'pta-client',
      }) as { tokenId: string; userId: string };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Generate new access token from refresh token
   */
  async refreshAccessToken(
    refreshToken: string,
    getUserById: (id: string) => Promise<User | null>
  ): Promise<string> {
    const { userId } = this.verifyRefreshToken(refreshToken);
    
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const tokenId = uuidv4();
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenId,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.accessTokenExpiry as any,
      issuer: 'pokemon-tactics-arena',
      audience: 'pta-client',
    });
  }

  /**
   * Parse expiry string to seconds
   */
  private parseExpiryToSeconds(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // Default 15 minutes

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 60 * 60 * 24;
      default: return 900;
    }
  }
}

export const authService = new AuthService();