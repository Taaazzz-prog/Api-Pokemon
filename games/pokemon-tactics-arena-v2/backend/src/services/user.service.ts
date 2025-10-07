import { prisma } from '../database/connection';
import { authService, User, AuthTokens } from '../auth/auth.service';
import { logger } from '../utils/logger';

export interface RegisterData {
  email: string;
  password: string;
  username: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export class UserService {
  
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: data.email },
            { profile: { username: data.username } }
          ]
        }
      });

      if (existingUser) {
        throw new Error('Un utilisateur avec cet email ou nom d\'utilisateur existe déjà');
      }

      // Hash password
      const passwordHash = await authService.hashPassword(data.password);

      // Create user and profile in transaction
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: data.email,
            passwordHash,
            role: 'USER',
            isActive: true
          }
        });

        const profile = await tx.userProfile.create({
          data: {
            userId: user.id,
            username: data.username,
            level: 1,
            experience: 0,
            pokeCredits: 2500, // Starting credits
            pokeGems: 50,      // Starting gems
            settings: {},
            stats: {}
          }
        });

        return { user, profile };
      });

      const userForToken: User = {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role as 'user' | 'admin',
        createdAt: result.user.createdAt
      };

      // Generate tokens
      const tokens = authService.generateTokens(userForToken);

      logger.info('User registered successfully', { 
        userId: result.user.id, 
        email: data.email 
      });

      return {
        user: userForToken,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn
      };

    } catch (error: any) {
      logger.error('Registration failed', { error: error.message, email: data.email });
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResult> {
    try {
      // Find user with profile
      const user = await prisma.user.findUnique({
        where: { email: data.email },
        include: { profile: true }
      });

      if (!user || !user.isActive) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Verify password
      const isValidPassword = await authService.verifyPassword(data.password, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      const userForToken: User = {
        id: user.id,
        email: user.email,
        role: user.role as 'user' | 'admin',
        createdAt: user.createdAt
      };

      // Generate tokens
      const tokens = authService.generateTokens(userForToken);

      logger.info('User logged in successfully', { 
        userId: user.id, 
        email: data.email 
      });

      return {
        user: userForToken,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn
      };

    } catch (error: any) {
      logger.error('Login failed', { error: error.message, email: data.email });
      throw error;
    }
  }

  /**
   * Logout user (optional: implement token blacklisting)
   */
  async logout(userId: string): Promise<void> {
    try {
      // Update last activity or implement token blacklisting if needed
      logger.info('User logged out', { userId });
    } catch (error: any) {
      logger.error('Logout failed', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          roster: {
            include: {
              pokemon: true
            }
          },
          teamPresets: true
        }
      });

      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      return {
        id: user.id,
        email: user.email,
        username: user.profile?.username,
        level: user.profile?.level || 1,
        experience: user.profile?.experience || 0,
        pokeCredits: user.profile?.pokeCredits || 0,
        pokeGems: user.profile?.pokeGems || 0,
        hasReceivedStarterPack: user.profile?.hasReceivedStarterPack || false,
        avatar: user.profile?.avatar,
        stats: {
          totalBattles: user.profile?.totalBattles || 0,
          totalWins: user.profile?.totalWins || 0,
          winRate: user.profile?.winRate || 0
        },
        ownedPokemon: user.roster || [],
        teams: user.teamPresets || []
      };

    } catch (error: any) {
      logger.error('Get user profile failed', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: any): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
      });

      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Update profile
      const updatedProfile = await prisma.userProfile.update({
        where: { userId },
        data: {
          username: updates.username || user.profile?.username,
          avatar: updates.avatar || user.profile?.avatar,
          settings: updates.settings || user.profile?.settings || {},
          // Support pour les crédits et gemmes
          pokeCredits: updates.pokeCredits !== undefined ? updates.pokeCredits : user.profile?.pokeCredits,
          pokeGems: updates.pokeGems !== undefined ? updates.pokeGems : user.profile?.pokeGems,
          // Support pour le starter pack
          hasReceivedStarterPack: updates.hasReceivedStarterPack !== undefined ? updates.hasReceivedStarterPack : user.profile?.hasReceivedStarterPack,
        }
      });

      logger.info('User profile updated', { userId });

      return await this.getUserProfile(userId);

    } catch (error: any) {
      logger.error('Update profile failed', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Verify current password
      const isValidPassword = await authService.verifyPassword(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Mot de passe actuel incorrect');
      }

      // Hash new password
      const newPasswordHash = await authService.hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash }
      });

      logger.info('Password changed successfully', { userId });

    } catch (error: any) {
      logger.error('Change password failed', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(userId: string): Promise<AuthResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || !user.isActive) {
        throw new Error('Utilisateur non trouvé ou inactif');
      }

      const userForToken: User = {
        id: user.id,
        email: user.email,
        role: user.role as 'user' | 'admin',
        createdAt: user.createdAt
      };

      // Generate new tokens
      const tokens = authService.generateTokens(userForToken);

      return {
        user: userForToken,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn
      };

    } catch (error: any) {
      logger.error('Refresh token failed', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Request password reset (placeholder)
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      // TODO: Implement email sending logic
      logger.info('Password reset requested', { email });
    } catch (error: any) {
      logger.error('Password reset request failed', { error: error.message, email });
      throw error;
    }
  }

  /**
   * Reset password with token (placeholder)
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // TODO: Implement token verification and password reset
      logger.info('Password reset attempted', { token });
    } catch (error: any) {
      logger.error('Password reset failed', { error: error.message });
      throw error;
    }
  }
}

export const userService = new UserService();