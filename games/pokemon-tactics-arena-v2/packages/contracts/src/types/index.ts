// Base types
export type UserRole = 'USER' | 'ADMIN';
export type PokemonRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type GameMode = 'FREE' | 'SURVIVAL' | 'TOURNAMENT' | 'ARENA';
export type BattleResult = 'WIN' | 'LOSS' | 'DRAW';
export type Currency = 'POKE_CREDITS' | 'POKE_GEMS';
export type TransactionType = 'CREDIT' | 'DEBIT';

// Battle types
export type BattleWinner = 'player1' | 'player2' | 'draw';
export type BattleActionType = 'attack' | 'switch' | 'item' | 'flee';
export type StatusCondition = 'poison' | 'burn' | 'freeze' | 'paralysis' | 'sleep';

export interface BattleAction {
  type: BattleActionType;
  pokemon?: number; // index dans l'équipe
  move?: string;
  target?: number;
  item?: string;
}

export interface BattleLog {
  turn: number;
  action: string;
  damage?: number;
  effectiveness?: number;
  critical?: boolean;
  status?: string;
  timestamp: Date;
}

export interface BattleState {
  turn: number;
  phase: 'setup' | 'battle' | 'ended';
  currentPlayer: 'player1' | 'player2';
  team1: CombatPokemon[];
  team2: CombatPokemon[];
  logs: BattleLog[];
}

export interface CombatPokemon extends RosterEntry {
  currentHp: number;
  maxHp: number;
  status?: StatusCondition;
  statusTurns?: number;
}

export interface BattleRewards {
  credits: number;
  gems: number;
  xp: number;
  items?: string[];
}

export interface BattleSummary {
  winner: BattleWinner;
  duration: number;
  turns: number;
  totalDamageDealt: number;
  criticalHits: number;
  rewards: BattleRewards;
  logs: BattleLog[];
  finalState: {
    team1: Array<{ name: string; hp: number; maxHp: number }>;
    team2: Array<{ name: string; hp: number; maxHp: number }>;
  };
}

// User types
export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  username: string;
  avatar: string | null;
  level: number;
  experience: number;
  totalBattles: number;
  totalWins: number;
  winRate: number;
  pokeCredits: number;
  pokeGems: number;
  settings: Record<string, any>;
  stats: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSummary {
  id: string;
  username: string;
  avatar: string | null;
  level: number;
  experience: number;
  totalBattles: number;
  totalWins: number;
  winRate: number;
  pokeCredits: number;
  pokeGems: number;
}

// Pokemon types
export interface Pokemon {
  id: string;
  pokemonId: number;
  name: string;
  types: string[];
  stats: PokemonStats;
  rarity: PokemonRarity;
  generation: number;
  imageUrl: string | null;
  evolutions: string[];
  moves: PokemonMove[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface PokemonMove {
  id: string;
  name: string;
  type: string;
  power: number;
  accuracy: number;
  pp: number;
  category: 'physical' | 'special' | 'status';
  description?: string;
}

export interface RosterEntry {
  id: string;
  userId: string;
  pokemonId: string;
  pokemon: Pokemon;
  nickname: string | null;
  level: number;
  experience: number;
  customStats: PokemonStats | null;
  obtainedFrom: string;
  obtainedAt: Date;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Team types
export interface TeamPreset {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  gameMode: GameMode;
  members: TeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  teamPresetId: string;
  userRosterId: string;
  pokemonId: string;
  position: number;
  pokemon: Pokemon;
  rosterEntry: RosterEntry;
  createdAt: Date;
}

// Battle types
export interface Battle {
  id: string;
  userId: string;
  gameMode: GameMode;
  opponentType: 'AI' | 'PLAYER';
  opponentId: string | null;
  playerTeam: TeamComposition;
  opponentTeam: TeamComposition;
  result: BattleResult;
  playerScore: number;
  opponentScore: number;
  duration: number;
  payload: BattlePayload;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
}

export interface TeamComposition {
  members: TeamMemberData[];
}

export interface TeamMemberData {
  pokemonId: string;
  nickname?: string;
  level: number;
  stats: PokemonStats;
  moves: PokemonMove[];
  position: number;
}

export interface BattlePayload {
  log: BattleLogEntry[];
  rewards?: Reward[];
  metadata?: Record<string, any>;
}

export interface BattleLogEntry {
  turn: number;
  action: string;
  actor: string;
  target?: string;
  damage?: number;
  effect?: string;
  message: string;
}

// Reward types
export interface Reward {
  type: 'currency' | 'pokemon' | 'item' | 'experience';
  currency?: Currency;
  amount?: number;
  pokemonId?: string;
  itemId?: string;
  metadata?: Record<string, any>;
}

// Shop types
export interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  category: 'POKEMON' | 'ITEMS' | 'COSMETICS' | 'BUNDLES';
  itemType: string;
  rarity: PokemonRarity | null;
  priceCurrency: Currency;
  priceAmount: number;
  isAvailable: boolean;
  stockLimit: number | null;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction types
export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  currency: Currency;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  source: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

// Achievement types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'BATTLE' | 'COLLECTION' | 'PROGRESSION' | 'SPECIAL';
  type: 'COUNTER' | 'MILESTONE' | 'UNLOCK';
  requirements: Record<string, any>;
  rewards: Reward[];
  isHidden: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement: Achievement;
  progress: Record<string, any>;
  isCompleted: boolean;
  isClaimed: boolean;
  completedAt: Date | null;
  claimedAt: Date | null;
  createdAt: Date;
}

// Game mode specific types
export interface SurvivalRun {
  id: string;
  userId: string;
  initialTeam: TeamComposition;
  currentWave: number;
  maxWave: number;
  score: number;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  rewards: Reward[];
  payload: Record<string, any>;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
}

export interface Tournament {
  id: string;
  userId: string;
  name: string;
  format: 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'ROUND_ROBIN';
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  currentRound: number;
  maxRounds: number;
  participants: string[];
  brackets: Record<string, any>;
  rewards: Reward[];
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

export interface ArenaQueue {
  id: string;
  userId: string;
  team: TeamComposition;
  eloRating: number;
  rank: string;
  queuedAt: Date;
  matchedAt: Date | null;
  status: 'WAITING' | 'MATCHED' | 'CANCELLED';
}

// Event types
export interface Event {
  id: string;
  name: string;
  description: string | null;
  type: 'SEASONAL' | 'DAILY' | 'WEEKLY' | 'SPECIAL';
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  rewards: Reward[];
  requirements: Record<string, any>;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}