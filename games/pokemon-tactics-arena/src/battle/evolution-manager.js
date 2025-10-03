import { fetchPokemonById } from '../api/pokebuild.js';

function getEvolutionId(evolution) {
  if (!evolution) {
    return null;
  }
  return evolution.id ?? evolution.pokedexId ?? evolution.pokedexIdd ?? null;
}

export async function gatherEvolutionCandidates(team, progressState) {
  if (!Array.isArray(team)) {
    return [];
  }

  const evolvedIds = new Set(progressState?.evolvedIds ?? []);
  const candidates = [];

  for (let index = 0; index < team.length; index += 1) {
    const pokemon = team[index];
    if (!pokemon || !Array.isArray(pokemon.evolutions) || pokemon.evolutions.length === 0) {
      continue;
    }

    if (evolvedIds.has(pokemon.id)) {
      continue;
    }

    const nextEvolution = pokemon.evolutions[0];
    const evolutionId = getEvolutionId(nextEvolution);
    if (!evolutionId || evolvedIds.has(evolutionId)) {
      continue;
    }

    try {
      const evolvedData = await fetchPokemonById(evolutionId);
      candidates.push(buildCandidate(index, pokemon, evolvedData));
    } catch (error) {
      console.warn('Evolution impossible', error);
    }
  }

  return candidates;
}

function buildCandidate(index, current, evolved) {
  const diff = {};
  const stats = current.stats ?? {};
  const nextStats = evolved.stats ?? {};
  ['HP', 'attack', 'defense', 'special_attack', 'special_defense', 'speed'].forEach(stat => {
    const delta = (nextStats[stat] ?? 0) - (stats[stat] ?? 0);
    if (delta !== 0) {
      diff[stat] = delta;
    }
  });

  return {
    key: `${current.id}-${evolved.id}`,
    index,
    previousId: current.id,
    previousName: current.name,
    previousImage: current.image,
    nextId: evolved.id,
    nextName: evolved.name,
    nextImage: evolved.image,
    evolvedData: evolved,
    statDiff: diff,
  };
}

export function applyEvolution(team, candidate) {
  if (!candidate || !team[candidate.index]) {
    return null;
  }

  const target = team[candidate.index];
  const evolved = candidate.evolvedData;
  const previousName = target.name;

  Object.assign(target, {
    ...evolved,
    currentHP: evolved.stats?.HP ?? evolved.currentHP ?? target.currentHP ?? 0,
    maxHP: evolved.stats?.HP ?? evolved.currentHP ?? target.maxHP ?? 0,
  });

  return {
    previousId: candidate.previousId,
    newId: candidate.nextId,
    message: `${previousName} evolue en ${target.name} !`,
  };
}
