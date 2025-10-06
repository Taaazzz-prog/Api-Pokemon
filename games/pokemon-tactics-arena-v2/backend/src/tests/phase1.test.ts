import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { authService } from '../auth/auth.service';
import { rarityService } from '../services/rarity.service';
import { PokemonRarity } from '@prisma/client';

describe('Phase 1 - Backend Fondations', () => {
  describe('Auth Service', () => {
    it('should hash and verify passwords', async () => {
      const password = 'testPassword123';
      const hash = await authService.hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      
      const isValid = await authService.verifyPassword(password, hash);
      expect(isValid).toBe(true);
      
      const isInvalid = await authService.verifyPassword('wrongPassword', hash);
      expect(isInvalid).toBe(false);
    });

    it('should generate and verify JWT tokens', () => {
      const user = {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'user' as const,
        createdAt: new Date(),
      };

      const tokens = authService.generateTokens(user);
      
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(tokens.expiresIn).toBeGreaterThan(0);

      const payload = authService.verifyAccessToken(tokens.accessToken);
      expect(payload.userId).toBe(user.id);
      expect(payload.email).toBe(user.email);
      expect(payload.role).toBe(user.role);
    });
  });

  describe('Rarity Service', () => {
    it('should generate valid rarities with proper drop rates', () => {
      const rarities = [];
      for (let i = 0; i < 1000; i++) {
        const rarity = rarityService.generateRarity('starter');
        rarities.push(rarity);
      }

      // Check that all rarities are valid
      const validRarities = Object.values(PokemonRarity);
      rarities.forEach(rarity => {
        expect(validRarities).toContain(rarity);
      });

      // Check rough distribution (should favor common)
      const counts = {
        [PokemonRarity.COMMON]: 0,
        [PokemonRarity.UNCOMMON]: 0,
        [PokemonRarity.RARE]: 0,
        [PokemonRarity.EPIC]: 0,
        [PokemonRarity.LEGENDARY]: 0,
      };

      rarities.forEach(rarity => {
        counts[rarity]++;
      });

      // Common should be most frequent
      expect(counts[PokemonRarity.COMMON]).toBeGreaterThan(counts[PokemonRarity.LEGENDARY]);
      expect(counts[PokemonRarity.UNCOMMON]).toBeGreaterThan(counts[PokemonRarity.EPIC]);
    });

    it('should generate starter pack with guaranteed uncommon', () => {
      const starterPack = rarityService.generateStarterPack();
      
      expect(starterPack).toHaveLength(3);
      expect(starterPack).toContain(PokemonRarity.UNCOMMON);
    });

    it('should calculate rarity multipliers correctly', () => {
      expect(rarityService.getRarityMultiplier(PokemonRarity.COMMON)).toBe(1.0);
      expect(rarityService.getRarityMultiplier(PokemonRarity.UNCOMMON)).toBe(1.2);
      expect(rarityService.getRarityMultiplier(PokemonRarity.RARE)).toBe(1.5);
      expect(rarityService.getRarityMultiplier(PokemonRarity.EPIC)).toBe(2.0);
      expect(rarityService.getRarityMultiplier(PokemonRarity.LEGENDARY)).toBe(3.0);
    });

    it('should provide rarity display information', () => {
      const commonInfo = rarityService.getRarityInfo(PokemonRarity.COMMON);
      expect(commonInfo.name).toBe('Common');
      expect(commonInfo.color).toBe('#6B7280');
      expect(commonInfo.emoji).toBe('⚪');

      const legendaryInfo = rarityService.getRarityInfo(PokemonRarity.LEGENDARY);
      expect(legendaryInfo.name).toBe('Legendary');
      expect(legendaryInfo.color).toBe('#F59E0B');
      expect(legendaryInfo.emoji).toBe('🟡');
    });
  });

  describe('Package Contracts', () => {
    it('should export all required types and constants', () => {
      // This test validates that the contracts package structure is correct
      expect(typeof require('@pta/contracts')).toBe('object');
      
      // Check constants exist
      const { CONSTANTS } = require('@pta/contracts');
      expect(CONSTANTS.MAX_TEAM_SIZE).toBe(6);
      expect(CONSTANTS.MIN_TEAM_SIZE).toBe(1);
      expect(CONSTANTS.STARTER_CREDITS).toBe(1000);
      expect(CONSTANTS.STARTER_GEMS).toBe(50);
    });
  });
});

// Helper function to run tests
export async function runPhase1Tests(): Promise<boolean> {
  try {
    console.log('🧪 Running Phase 1 validation tests...');
    
    // Test auth service
    const authTest = new authService.constructor();
    const testHash = await authTest.hashPassword('test123');
    const isValid = await authTest.verifyPassword('test123', testHash);
    
    if (!isValid) {
      throw new Error('Auth service password verification failed');
    }

    // Test rarity service
    const rarity = rarityService.generateRarity('starter');
    const validRarities = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'];
    
    if (!validRarities.includes(rarity)) {
      throw new Error('Rarity service generated invalid rarity');
    }

    // Test starter pack
    const starterPack = rarityService.generateStarterPack();
    
    if (starterPack.length !== 3) {
      throw new Error('Starter pack should contain exactly 3 Pokemon');
    }

    console.log('✅ Phase 1 tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Phase 1 tests failed:', error);
    return false;
  }
}
