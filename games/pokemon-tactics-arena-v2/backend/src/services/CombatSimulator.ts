import { 
  CombatPokemon, 
  BattleAction, 
  BattleSummary, 
  BattleState, 
  BattleLog,
  BattleRewards,
  BattleWinner 
} from '@pta/contracts';
import { WeaknessService } from './WeaknessService';
import { logger } from '../utils/logger';

export class CombatSimulator {
  private weaknessService = new WeaknessService();

  /**
   * Calcule les dégâts d'une attaque
   */
  calculateDamage(
    attacker: CombatPokemon,
    defender: CombatPokemon,
    move: string,
    isCritical: boolean = false
  ): number {
    // Base power des mouvements (simplifié)
    const movePower: Record<string, number> = {
      'Tackle': 40,
      'Scratch': 40,
      'Ember': 40,
      'Water Gun': 40,
      'Vine Whip': 45,
      'Thunder Shock': 40,
      'Peck': 35,
      'Quick Attack': 40,
      'Body Slam': 85,
      'Flamethrower': 90,
      'Surf': 90,
      'Thunderbolt': 90,
      'Psychic': 90,
      'Earthquake': 100,
      'Hyper Beam': 150
    };

    const basePower = movePower[move] || 50;
    const attack = attacker.pokemon.stats.attack;
    const defense = defender.pokemon.stats.defense;
    const level = attacker.level;

    // Formule de dégâts simplifiée de Pokémon
    let damage = Math.floor(
      ((((2 * level / 5 + 2) * basePower * attack / defense) / 50) + 2)
    );

    // Critique
    if (isCritical) {
      damage = Math.floor(damage * 1.5);
    }

    // Efficacité des types
    const effectiveness = this.weaknessService.getEffectiveness(
      this.getMoveType(move),
      defender.pokemon.types
    );
    damage = Math.floor(damage * effectiveness);

    // STAB (Same Type Attack Bonus)
    if (attacker.pokemon.types.includes(this.getMoveType(move))) {
      damage = Math.floor(damage * 1.5);
    }

    // Variation aléatoire (85-100%)
    const randomFactor = (Math.random() * 0.15 + 0.85);
    damage = Math.floor(damage * randomFactor);

    return Math.max(1, damage);
  }

  /**
   * Détermine le type d'une attaque
   */
  private getMoveType(move: string): string {
    const moveTypes: Record<string, string> = {
      'Tackle': 'Normal',
      'Scratch': 'Normal',
      'Body Slam': 'Normal',
      'Quick Attack': 'Normal',
      'Hyper Beam': 'Normal',
      'Ember': 'Fire',
      'Flamethrower': 'Fire',
      'Water Gun': 'Water',
      'Surf': 'Water',
      'Vine Whip': 'Grass',
      'Thunder Shock': 'Electric',
      'Thunderbolt': 'Electric',
      'Peck': 'Flying',
      'Psychic': 'Psychic',
      'Earthquake': 'Ground'
    };

    return moveTypes[move] || 'Normal';
  }

  /**
   * Vérifie si une attaque est critique
   */
  isCriticalHit(attacker: CombatPokemon): boolean {
    // 6.25% de chance de base
    const criticalChance = 0.0625;
    return Math.random() < criticalChance;
  }

  /**
   * Applique les dégâts et gère les KO
   */
  applyDamage(pokemon: CombatPokemon, damage: number): boolean {
    pokemon.currentHp = Math.max(0, pokemon.currentHp - damage);
    return pokemon.currentHp === 0; // KO
  }

  /**
   * Gère les effets de statut
   */
  applyStatusEffects(pokemon: CombatPokemon): number {
    let damage = 0;

    if (pokemon.status && pokemon.statusTurns && pokemon.statusTurns > 0) {
      switch (pokemon.status) {
        case 'burn':
          damage = Math.floor(pokemon.maxHp / 16); // 6.25% des HP max
          break;
        case 'poison':
          damage = Math.floor(pokemon.maxHp / 8); // 12.5% des HP max
          break;
      }

      pokemon.statusTurns--;
      if (pokemon.statusTurns <= 0) {
        pokemon.status = undefined;
        pokemon.statusTurns = undefined;
      }
    }

    return damage;
  }

  /**
   * Détermine l'ordre des actions selon la vitesse
   */
  determineActionOrder(
    player1: CombatPokemon,
    player2: CombatPokemon,
    action1: BattleAction,
    action2: BattleAction
  ): [BattleAction, BattleAction] {
    // Priorité des actions
    const getPriority = (action: BattleAction, pokemon: CombatPokemon): number => {
      if (action.type === 'item') return 6;
      if (action.type === 'switch') return 5;
      if (action.type === 'flee') return 4;
      
      // Pour les attaques, on utilise la vitesse
      if (action.move === 'Quick Attack') return 1;
      return 0;
    };

    const priority1 = getPriority(action1, player1);
    const priority2 = getPriority(action2, player2);

    if (priority1 > priority2) {
      return [action1, action2];
    } else if (priority2 > priority1) {
      return [action2, action1];
    } else {
      // Même priorité, on compare la vitesse
      if (player1.pokemon.stats.speed >= player2.pokemon.stats.speed) {
        return [action1, action2];
      } else {
        return [action2, action1];
      }
    }
  }

  /**
   * Simule un tour de combat
   */
  simulateTurn(
    attacker: CombatPokemon,
    defender: CombatPokemon,
    action: BattleAction
  ): BattleLog[] {
    const logs: BattleLog[] = [];
    const turn = Date.now();

    if (action.type === 'attack' && action.move) {
      const isCritical = this.isCriticalHit(attacker);
      const damage = this.calculateDamage(attacker, defender, action.move, isCritical);
      const effectiveness = this.weaknessService.getEffectiveness(
        this.getMoveType(action.move),
        defender.pokemon.types
      );

      const isKO = this.applyDamage(defender, damage);

      logs.push({
        turn: 1,
        action: `${attacker.pokemon.name} utilise ${action.move}`,
        damage,
        effectiveness,
        critical: isCritical,
        timestamp: new Date()
      });

      if (effectiveness > 1) {
        logs.push({
          turn: 1,
          action: "C'est super efficace !",
          timestamp: new Date()
        });
      } else if (effectiveness < 1) {
        logs.push({
          turn: 1,
          action: "Ce n'est pas très efficace...",
          timestamp: new Date()
        });
      }

      if (isCritical) {
        logs.push({
          turn: 1,
          action: "Coup critique !",
          timestamp: new Date()
        });
      }

      if (isKO) {
        logs.push({
          turn: 1,
          action: `${defender.pokemon.name} est K.O. !`,
          timestamp: new Date()
        });
      }
    }

    // Effets de statut
    const statusDamage = this.applyStatusEffects(attacker);
    if (statusDamage > 0) {
      logs.push({
        turn: 1,
        action: `${attacker.pokemon.name} subit les effets de ${attacker.status}`,
        damage: statusDamage,
        timestamp: new Date()
      });
    }

    return logs;
  }

  /**
   * Détermine le gagnant d'un combat
   */
  determineWinner(team1: CombatPokemon[], team2: CombatPokemon[]): 'player1' | 'player2' | 'draw' {
    const team1Alive = team1.filter(p => p.currentHp > 0).length;
    const team2Alive = team2.filter(p => p.currentHp > 0).length;

    if (team1Alive === 0 && team2Alive === 0) return 'draw';
    if (team1Alive === 0) return 'player2';
    if (team2Alive === 0) return 'player1';
    
    // Combat en cours
    return 'draw';
  }

  /**
   * Calcule les récompenses d'un combat
   */
  calculateRewards(
    winner: 'player1' | 'player2' | 'draw',
    mode: 'free' | 'survival' | 'arena',
    difficulty: number = 1
  ): { credits: number; gems: number; xp: number; items?: string[] } {
    const baseRewards = {
      free: { credits: 50, gems: 2, xp: 100 },
      survival: { credits: 75, gems: 3, xp: 150 },
      arena: { credits: 100, gems: 5, xp: 200 }
    };

    const base = baseRewards[mode];
    const multiplier = winner === 'draw' ? 0.5 : (winner === 'player1' ? 1 : 0.3);

    return {
      credits: Math.floor(base.credits * multiplier * difficulty),
      gems: Math.floor(base.gems * multiplier * difficulty),
      xp: Math.floor(base.xp * multiplier * difficulty),
      items: winner === 'player1' && Math.random() < 0.1 ? ['Potion'] : undefined
    };
  }

  /**
   * Génère un résumé de bataille complet
   */
  generateBattleSummary(
    team1: CombatPokemon[],
    team2: CombatPokemon[],
    logs: BattleLog[],
    winner: 'player1' | 'player2' | 'draw',
    rewards: any
  ): BattleSummary {
    return {
      winner,
      duration: logs.length > 0 ? 
        logs[logs.length - 1].timestamp.getTime() - logs[0].timestamp.getTime() : 0,
      turns: Math.max(...logs.map(l => l.turn), 0),
      totalDamageDealt: logs.reduce((sum, log) => sum + (log.damage || 0), 0),
      criticalHits: logs.filter(log => log.critical).length,
      rewards,
      logs,
      finalState: {
        team1: team1.map(p => ({ name: p.pokemon.name, hp: p.currentHp, maxHp: p.maxHp })),
        team2: team2.map(p => ({ name: p.pokemon.name, hp: p.currentHp, maxHp: p.maxHp }))
      }
    };
  }
}