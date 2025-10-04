/**
 * Service de gestion des faiblesses et efficacités des types Pokémon
 */
export class WeaknessService {
  private typeChart: Record<string, Record<string, number>> = {
    Normal: {
      Rock: 0.5,
      Ghost: 0,
      Steel: 0.5
    },
    Fire: {
      Fire: 0.5,
      Water: 0.5,
      Grass: 2,
      Ice: 2,
      Bug: 2,
      Rock: 0.5,
      Dragon: 0.5,
      Steel: 2
    },
    Water: {
      Fire: 2,
      Water: 0.5,
      Grass: 0.5,
      Ground: 2,
      Rock: 2,
      Dragon: 0.5
    },
    Electric: {
      Water: 2,
      Electric: 0.5,
      Grass: 0.5,
      Ground: 0,
      Flying: 2,
      Dragon: 0.5
    },
    Grass: {
      Fire: 0.5,
      Water: 2,
      Grass: 0.5,
      Poison: 0.5,
      Flying: 0.5,
      Bug: 0.5,
      Rock: 2,
      Dragon: 0.5,
      Steel: 0.5
    },
    Ice: {
      Fire: 0.5,
      Water: 0.5,
      Grass: 2,
      Ice: 0.5,
      Ground: 2,
      Flying: 2,
      Dragon: 2,
      Steel: 0.5
    },
    Fighting: {
      Normal: 2,
      Ice: 2,
      Poison: 0.5,
      Flying: 0.5,
      Psychic: 0.5,
      Bug: 0.5,
      Rock: 2,
      Ghost: 0,
      Dark: 2,
      Steel: 2,
      Fairy: 0.5
    },
    Poison: {
      Grass: 2,
      Poison: 0.5,
      Ground: 0.5,
      Rock: 0.5,
      Ghost: 0.5,
      Steel: 0,
      Fairy: 2
    },
    Ground: {
      Fire: 2,
      Electric: 2,
      Grass: 0.5,
      Poison: 2,
      Flying: 0,
      Bug: 0.5,
      Rock: 2,
      Steel: 2
    },
    Flying: {
      Electric: 0.5,
      Grass: 2,
      Ice: 0.5,
      Fighting: 2,
      Bug: 2,
      Rock: 0.5,
      Steel: 0.5
    },
    Psychic: {
      Fighting: 2,
      Poison: 2,
      Psychic: 0.5,
      Dark: 0,
      Steel: 0.5
    },
    Bug: {
      Fire: 0.5,
      Grass: 2,
      Fighting: 0.5,
      Poison: 0.5,
      Flying: 0.5,
      Psychic: 2,
      Ghost: 0.5,
      Dark: 2,
      Steel: 0.5,
      Fairy: 0.5
    },
    Rock: {
      Fire: 2,
      Ice: 2,
      Fighting: 0.5,
      Ground: 0.5,
      Flying: 2,
      Bug: 2,
      Steel: 0.5
    },
    Ghost: {
      Normal: 0,
      Psychic: 2,
      Ghost: 2,
      Dark: 0.5
    },
    Dragon: {
      Dragon: 2,
      Steel: 0.5,
      Fairy: 0
    },
    Dark: {
      Fighting: 0.5,
      Psychic: 2,
      Ghost: 2,
      Dark: 0.5,
      Fairy: 0.5
    },
    Steel: {
      Fire: 0.5,
      Water: 0.5,
      Electric: 0.5,
      Ice: 2,
      Rock: 2,
      Steel: 0.5,
      Fairy: 2
    },
    Fairy: {
      Fire: 0.5,
      Fighting: 2,
      Poison: 0.5,
      Dragon: 2,
      Dark: 2,
      Steel: 0.5
    }
  };

  /**
   * Calcule l'efficacité d'un type d'attaque contre les types de défense
   */
  getEffectiveness(attackType: string, defenseTypes: string[]): number {
    let effectiveness = 1;

    for (const defenseType of defenseTypes) {
      const typeEffectiveness = this.typeChart[attackType]?.[defenseType] ?? 1;
      effectiveness *= typeEffectiveness;
    }

    return effectiveness;
  }

  /**
   * Obtient toutes les faiblesses d'un Pokémon
   */
  getWeaknesses(types: string[]): string[] {
    const weaknesses: string[] = [];

    for (const attackType of Object.keys(this.typeChart)) {
      const effectiveness = this.getEffectiveness(attackType, types);
      if (effectiveness > 1) {
        weaknesses.push(attackType);
      }
    }

    return weaknesses;
  }

  /**
   * Obtient toutes les résistances d'un Pokémon
   */
  getResistances(types: string[]): string[] {
    const resistances: string[] = [];

    for (const attackType of Object.keys(this.typeChart)) {
      const effectiveness = this.getEffectiveness(attackType, types);
      if (effectiveness < 1 && effectiveness > 0) {
        resistances.push(attackType);
      }
    }

    return resistances;
  }

  /**
   * Obtient toutes les immunités d'un Pokémon
   */
  getImmunities(types: string[]): string[] {
    const immunities: string[] = [];

    for (const attackType of Object.keys(this.typeChart)) {
      const effectiveness = this.getEffectiveness(attackType, types);
      if (effectiveness === 0) {
        immunities.push(attackType);
      }
    }

    return immunities;
  }

  /**
   * Vérifie si un type est efficace contre un autre
   */
  isEffective(attackType: string, defenseTypes: string[]): boolean {
    return this.getEffectiveness(attackType, defenseTypes) > 1;
  }

  /**
   * Vérifie si un type résiste à un autre
   */
  isResisted(attackType: string, defenseTypes: string[]): boolean {
    const effectiveness = this.getEffectiveness(attackType, defenseTypes);
    return effectiveness < 1 && effectiveness > 0;
  }

  /**
   * Vérifie si un type est immunisé contre un autre
   */
  isImmune(attackType: string, defenseTypes: string[]): boolean {
    return this.getEffectiveness(attackType, defenseTypes) === 0;
  }
}