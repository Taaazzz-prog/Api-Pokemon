const API_BASE = 'https://pokebuildapi.fr/api/v1';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Erreur API (${response.status}) ${path}: ${text}`);
  }

  return response.json();
}

export async function fetchBalancedTeam() {
  const data = await request('/random/team/suggest');
  const team = Array.isArray(data) && Array.isArray(data[0]) ? data[0] : data;
  return team.map(normalizePokemon);
}

export async function fetchRandomTeam() {
  const data = await request('/random/team');
  return data.map(normalizePokemon);
}

export async function fetchPokemonById(id) {
  const data = await request(`/pokemon/${id}`);
  return normalizePokemon(data);
}

export function normalizePokemon(raw) {
  return {
    id: raw.id ?? raw.pokedexId,
    name: raw.name,
    image: raw.image ?? raw.sprite,
    sprite: raw.sprite ?? raw.image,
    stats: { ...raw.stats },
    types: Array.isArray(raw.apiTypes) ? raw.apiTypes.map(type => ({ name: type.name, image: type.image })) : [],
    resistances: Array.isArray(raw.apiResistances) ? raw.apiResistances.map(resistance => ({
      name: resistance.name,
      damage_relation: resistance.damage_relation,
      damage_multiplier: resistance.damage_multiplier,
    })) : [],
    generation: raw.apiGeneration ?? null,
    evolutions: Array.isArray(raw.apiEvolutions) ? raw.apiEvolutions : [],
    preEvolution: raw.apiPreEvolution ?? null,
  };
}

export function takeFirstThree(team) {
  return team.slice(0, 3);
}
const evolutionPoolCache = new Map();

async function getEvolutionPool(unlockedGenerations = [1]) {
  const key = unlockedGenerations.slice().sort((a, b) => a - b).join('-');
  if (evolutionPoolCache.has(key)) {
    return evolutionPoolCache.get(key);
  }
  try {
    const responses = await Promise.all(
      unlockedGenerations.map(gen => request(`/pokemon/generation/${gen}`)),
    );
    const combined = [];
    responses.forEach(data => {
      data.forEach(entry => {
        combined.push(normalizePokemon(entry));
      });
    });
    const uniqueMap = new Map();
    combined.forEach(pokemon => {
      if (Array.isArray(pokemon.evolutions) && pokemon.evolutions.length > 0) {
        uniqueMap.set(pokemon.id ?? pokemon.name, pokemon);
      }
    });
    const pool = Array.from(uniqueMap.values());
    if (!pool.length) {
      throw new Error('Aucun Pokemon evolutif dans le pool.');
    }
    evolutionPoolCache.set(key, pool);
    return pool;
  } catch (error) {
    console.warn('Impossible de charger le pool evolutif, fallback random.', error);
    evolutionPoolCache.set(key, []);
    return [];
  }
}

function randomSample(array, size) {
  const clone = [...array];
  const result = [];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  for (let k = 0; k < Math.min(size, clone.length); k += 1) {
    result.push(clone[k]);
  }
  return result;
}

export async function fetchEvolutionReadyTeam(unlockedGenerations = [1]) {
  const pool = await getEvolutionPool(unlockedGenerations);
  if (pool.length === 0) {
    const fallback = await fetchRandomTeam();
    return fallback.filter(pokemon => Array.isArray(pokemon.evolutions) && pokemon.evolutions.length).slice(0, 3);
  }
  const selection = randomSample(pool, 3);
  return selection.length ? selection : randomSample(pool, Math.min(3, pool.length));
}
