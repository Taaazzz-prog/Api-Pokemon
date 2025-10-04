import { z } from 'zod';

// Base schemas
export const UserRoleSchema = z.enum(['USER', 'ADMIN']);
export const PokemonRaritySchema = z.enum(['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']);
export const GameModeSchema = z.enum(['FREE', 'SURVIVAL', 'TOURNAMENT', 'ARENA']);
export const BattleResultSchema = z.enum(['WIN', 'LOSS', 'DRAW']);
export const CurrencySchema = z.enum(['POKE_CREDITS', 'POKE_GEMS']);
export const TransactionTypeSchema = z.enum(['CREDIT', 'DEBIT']);

// Auth schemas
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string(),
});

// User schemas
export const UserProfileUpdateSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/).optional(),
  avatar: z.string().url().optional(),
  settings: z.record(z.any()).optional(),
});

// Pokemon schemas
export const PokemonStatsSchema = z.object({
  hp: z.number().int().min(1).max(999),
  attack: z.number().int().min(1).max(999),
  defense: z.number().int().min(1).max(999),
  specialAttack: z.number().int().min(1).max(999),
  specialDefense: z.number().int().min(1).max(999),
  speed: z.number().int().min(1).max(999),
});

export const PokemonMoveSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  power: z.number().int().min(0).max(999),
  accuracy: z.number().int().min(0).max(100),
  pp: z.number().int().min(1).max(99),
  category: z.enum(['physical', 'special', 'status']),
  description: z.string().optional(),
});

// Team schemas
export const TeamMemberDataSchema = z.object({
  pokemonId: z.string().uuid(),
  nickname: z.string().max(20).optional(),
  level: z.number().int().min(1).max(100),
  stats: PokemonStatsSchema,
  moves: z.array(PokemonMoveSchema).max(4),
  position: z.number().int().min(1).max(6),
});

export const TeamCompositionSchema = z.object({
  members: z.array(TeamMemberDataSchema).min(1).max(6),
});

export const TeamPresetCreateSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  gameMode: GameModeSchema,
  memberIds: z.array(z.string().uuid()).min(1).max(6),
});

export const TeamPresetUpdateSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(200).optional(),
  isActive: z.boolean().optional(),
  memberIds: z.array(z.string().uuid()).min(1).max(6).optional(),
});

// Battle schemas
export const BattleStartSchema = z.object({
  gameMode: GameModeSchema,
  teamId: z.string().uuid().optional(),
  opponentType: z.enum(['AI', 'PLAYER']).optional(),
});

export const BattleActionSchema = z.object({
  battleId: z.string().uuid(),
  action: z.enum(['attack', 'switch', 'item', 'forfeit']),
  moveId: z.string().optional(),
  targetPosition: z.number().int().min(1).max(6).optional(),
  switchToPosition: z.number().int().min(1).max(6).optional(),
  itemId: z.string().optional(),
});

// Shop schemas
export const ShopPurchaseSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99).optional().default(1),
});

export const ShopFilterSchema = z.object({
  category: z.enum(['POKEMON', 'ITEMS', 'COSMETICS', 'BUNDLES']).optional(),
  rarity: PokemonRaritySchema.optional(),
  currency: CurrencySchema.optional(),
  minPrice: z.number().int().min(0).optional(),
  maxPrice: z.number().int().min(0).optional(),
  search: z.string().max(50).optional(),
});

// Currency schemas
export const CurrencyTransactionSchema = z.object({
  currency: CurrencySchema,
  amount: z.number().int().min(1),
  source: z.string().min(1).max(50),
  metadata: z.record(z.any()).optional(),
});

// Roster schemas
export const RosterUnlockSchema = z.object({
  source: z.enum(['starter', 'shop', 'reward', 'event']),
  packType: z.enum(['starter', 'premium', 'event']).optional(),
  metadata: z.record(z.any()).optional(),
});

export const RosterUpdateSchema = z.object({
  nickname: z.string().max(20).optional(),
  isLocked: z.boolean().optional(),
});

// Survival mode schemas
export const SurvivalStartSchema = z.object({
  teamMembers: z.array(z.string().uuid()).length(6),
});

export const SurvivalActionSchema = z.object({
  runId: z.string().uuid(),
  action: z.enum(['next_wave', 'abandon', 'upgrade_pokemon', 'heal_team']),
  pokemonId: z.string().uuid().optional(),
  upgradeType: z.string().optional(),
});

// Tournament schemas
export const TournamentJoinSchema = z.object({
  teamId: z.string().uuid(),
});

// Arena schemas
export const ArenaQueueSchema = z.object({
  teamId: z.string().uuid(),
});

// Achievement schemas
export const AchievementClaimSchema = z.object({
  achievementId: z.string().uuid(),
});

// Pagination schemas
export const PaginationSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Response schemas
export const SuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.any(),
  message: z.string().optional(),
});

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.any().optional(),
});

export const PaginatedResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

// API Response types
export type SuccessResponse<T = any> = z.infer<typeof SuccessResponseSchema> & { data: T };
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type PaginatedResponse<T = any> = z.infer<typeof PaginatedResponseSchema> & { data: T[] };

// Validation helper
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

export function validateSchemaAsync<T>(schema: z.ZodSchema<T>, data: unknown): Promise<T> {
  return schema.parseAsync(data);
}