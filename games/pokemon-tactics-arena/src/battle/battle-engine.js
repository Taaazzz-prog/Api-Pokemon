import { getTypeMultiplier } from './type-effectiveness.js';

const BASE_POWER = 60;
const BATTLE_LEVEL = 50;
const MAX_TURNS = 100;

export function simulateBattle(playerTeamRaw, opponentTeamRaw) {
  const player = playerTeamRaw.map(pokemon => createBattlePokemon(pokemon, 'player'));
  const opponent = opponentTeamRaw.map(pokemon => createBattlePokemon(pokemon, 'opponent'));
  const log = [];
  let turn = 1;

  while (hasLivingPokemon(player) && hasLivingPokemon(opponent) && turn <= MAX_TURNS) {
    log.push(`Tour ${turn}`);

    const turnOrder = [...player, ...opponent]
      .filter(pokemon => pokemon.currentHP > 0)
      .sort((a, b) => {
        if (b.stats.speed !== a.stats.speed) {
          return b.stats.speed - a.stats.speed;
        }
        return a.side === 'player' ? -1 : 1;
      });

    for (const attacker of turnOrder) {
      if (attacker.currentHP <= 0) {
        continue;
      }

      const defenderTeam = attacker.side === 'player' ? opponent : player;
      const defender = defenderTeam.find(pokemon => pokemon.currentHP > 0);
      if (!defender) {
        break;
      }

      const attackResult = performAttack(attacker, defender);
      log.push(formatAttackLog(attacker, defender, attackResult));
      pushFrame(log, player, opponent);

      if (defender.currentHP <= 0) {
        log.push(`${defender.name} est K.O.`);
      }

      if (!hasLivingPokemon(defenderTeam)) {
        break;
      }
    }

    turn += 1;
  }

  const playerAlive = hasLivingPokemon(player);
  const opponentAlive = hasLivingPokemon(opponent);

  let outcome = 'draw';
  if (playerAlive && !opponentAlive) {
    outcome = 'player';
  } else if (!playerAlive && opponentAlive) {
    outcome = 'opponent';
  }

  if (turn > MAX_TURNS) {
    log.push('Le combat atteint la limite de tours et se termine en match nul.');
    outcome = 'draw';
  }

  pushFrame(log, player, opponent);

  return {
    outcome,
    turns: Math.min(turn - 1, MAX_TURNS),
    log,
    player,
    opponent,
  };
}

function createBattlePokemon(pokemon, side) {
  return {
    side,
    id: pokemon.id,
    name: pokemon.name,
    image: pokemon.image,
    stats: { ...pokemon.stats },
    types: pokemon.types ?? [],
    resistances: pokemon.resistances ?? [],
    evolutions: Array.isArray(pokemon.evolutions) ? [...pokemon.evolutions] : [],
    currentHP: pokemon.stats?.HP ?? 0,
    maxHP: pokemon.stats?.HP ?? 0,
  };
}

function hasLivingPokemon(team) {
  return team.some(pokemon => pokemon.currentHP > 0);
}

function performAttack(attacker, defender) {
  const attackChoice = chooseAttack(attacker, defender);
  const attackStat = attackChoice.category === 'physical'
    ? attacker.stats.attack
    : attacker.stats.special_attack;
  const defenseStat = attackChoice.category === 'physical'
    ? defender.stats.defense
    : defender.stats.special_defense;

  const baseDamage = (((2 * BATTLE_LEVEL + 10) / 250) * (attackStat / Math.max(1, defenseStat)) * BASE_POWER) + 2;
  const damage = Math.max(1, Math.floor(baseDamage * attackChoice.multiplier));
  defender.currentHP = Math.max(0, defender.currentHP - damage);

  return {
    damage,
    attackType: attackChoice.typeName,
    category: attackChoice.category,
    multiplier: attackChoice.multiplier,
  };
}

function chooseAttack(attacker, defender) {
  const categories = [
    { key: 'physical', attackStat: attacker.stats.attack, defenseStat: defender.stats.defense },
    { key: 'special', attackStat: attacker.stats.special_attack, defenseStat: defender.stats.special_defense },
  ];

  const types = attacker.types?.length ? attacker.types : [{ name: 'Normal' }];
  let best = {
    typeName: types[0].name,
    category: categories[0].key,
    multiplier: getTypeMultiplier(types[0].name, defender) * stabBonus(attacker, types[0].name),
    potential: categories[0].attackStat,
  };

  for (const type of types) {
    for (const category of categories) {
      const typeMultiplier = getTypeMultiplier(type.name, defender);
      const totalMultiplier = typeMultiplier * stabBonus(attacker, type.name);
      const potential = category.attackStat * totalMultiplier;

      if (potential > best.potential) {
        best = {
          typeName: type.name,
          category: category.key,
          multiplier: totalMultiplier,
          potential,
        };
      }
    }
  }

  return best;
}

function stabBonus(attacker, typeName) {
  return attacker.types?.some(type => normalize(type.name) === normalize(typeName)) ? 1.2 : 1;
}

function normalize(value) {
  return (value ?? '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function formatAttackLog(attacker, defender, result) {
  const lines = [];
  lines.push(`${attacker.name} attaque ${defender.name} (type ${result.attackType}, ${result.category === 'physical' ? 'physique' : 'special'}) et inflige ${result.damage} degats.`);

  if (result.multiplier > 2.5) {
    lines.push("C'est ultra efficace !");
  } else if (result.multiplier > 1.1) {
    lines.push("C'est tres efficace !");
  } else if (result.multiplier === 0) {
    lines.push("Cela n'a aucun effet...");
  } else if (result.multiplier < 0.9) {
    lines.push("Ce n'est pas tres efficace...");
  }

  lines.push(`PV restants de ${defender.name} : ${defender.currentHP}/${defender.maxHP}`);
  return lines.join(' ');
}

function pushFrame(log, player, opponent) {
  log.push({
    type: 'frame',
    payload: {
      player: player.map(cloneFrame),
      opponent: opponent.map(cloneFrame),
    },
  });
}

function cloneFrame(pokemon) {
  return {
    id: pokemon.id,
    name: pokemon.name,
    image: pokemon.image,
    currentHP: pokemon.currentHP,
    maxHP: pokemon.maxHP ?? pokemon.stats?.HP ?? pokemon.currentHP ?? 0,
    stats: { ...pokemon.stats },
  };
}
