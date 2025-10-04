import { fetchPokemonById } from '../../api/pokebuild.js';

const STORAGE_KEY = 'pta-unlocked-roster';

const DEFAULT_ROSTER = [
  { id: 6, rarity: 'rare', generations: [1] },
  { id: 3, rarity: 'rare', generations: [1] },
  { id: 9, rarity: 'rare', generations: [1] },
  { id: 25, rarity: 'common', generations: [1] },
  { id: 38, rarity: 'uncommon', generations: [1] },
  { id: 149, rarity: 'rare', generations: [1] },
  { id: 196, rarity: 'uncommon', generations: [2] },
  { id: 212, rarity: 'uncommon', generations: [2] },
  { id: 257, rarity: 'uncommon', generations: [3] },
  { id: 282, rarity: 'uncommon', generations: [3] },
  { id: 445, rarity: 'rare', generations: [4] },
  { id: 448, rarity: 'rare', generations: [4] },
  { id: 658, rarity: 'rare', generations: [6] },
  { id: 706, rarity: 'uncommon', generations: [6] },
  { id: 809, rarity: 'rare', generations: [7] },
];

const POOL_MAP = new Map(DEFAULT_ROSTER.map(entry => [entry.id, entry]));

const RARITY_WEIGHTS = {
  common: 65,
  uncommon: 25,
  rare: 10,
};

function normalizeEntry(entry) {
  const base = POOL_MAP.get(entry?.id) ?? {};
  return {
    id: Number(entry?.id),
    rarity: entry?.rarity ?? base.rarity ?? 'common',
    generations: Array.isArray(entry?.generations) ? entry.generations : (base.generations ?? []),
    weight: entry?.weight ?? base.weight,
  };
}

function loadStoredRoster() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed
      .map(normalizeEntry)
      .filter(entry => Number.isInteger(entry.id));
  } catch (error) {
    console.warn('[PTA] Roster invalide, réinitialisation.', error);
    return null;
  }
}

function saveRoster(entries) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.map(normalizeEntry)));
}

export function isRosterInitialized() {
  const stored = loadStoredRoster();
  return Array.isArray(stored) && stored.length > 0;
}

function filterByGeneration(entries, progressState) {
  if (!progressState?.unlockedGenerations?.length) {
    return entries;
  }
  const unlocked = new Set(progressState.unlockedGenerations);
  return entries.filter(entry => {
    const gens = entry.generations ?? [];
    if (!gens.length) return true;
    return gens.some(gen => unlocked.has(gen));
  });
}

export function loadUnlockedRoster(progressState) {
  const stored = loadStoredRoster();
  if (!stored || !stored.length) {
    return [];
  }
  return filterByGeneration(stored, progressState);
}

export function getAvailablePool(progressState) {
  return filterByGeneration(DEFAULT_ROSTER, progressState);
}

function weightFor(entry) {
  const base = entry?.weight ?? RARITY_WEIGHTS[entry?.rarity] ?? 15;
  return Math.max(1, base);
}

function weightedSample(pool, count) {
  const source = pool.slice();
  const picked = [];
  while (picked.length < count && source.length) {
    const totalWeight = source.reduce((sum, entry) => sum + weightFor(entry), 0);
    let threshold = Math.random() * totalWeight;
    let index = 0;
    for (; index < source.length; index += 1) {
      threshold -= weightFor(source[index]);
      if (threshold <= 0) {
        break;
      }
    }
    const [entry] = source.splice(Math.min(index, source.length - 1), 1);
    picked.push(entry);
  }
  return picked;
}

export function sampleRosterIds(progressState, size = 3, { fromPool = false } = {}) {
  const base = fromPool ? getAvailablePool(progressState) : loadUnlockedRoster(progressState);
  if (!base.length) {
    return [];
  }
  return weightedSample(base, size).map(entry => entry.id);
}

export function unlockPokemon(ids, metadata = {}) {
  if (!Array.isArray(ids) || !ids.length) {
    return;
  }
  const current = loadStoredRoster() ?? [];
  const existingIds = new Set(current.map(entry => entry.id));
  const additions = [];

  ids.forEach((id, index) => {
    if (existingIds.has(id)) {
      return;
    }
    const base = POOL_MAP.get(id) ?? {};
    const rarity = Array.isArray(metadata.rarity)
      ? metadata.rarity[index] ?? base.rarity
      : metadata.rarity ?? base.rarity;
    additions.push(normalizeEntry({ id, rarity }));
  });

  if (!additions.length) {
    return;
  }

  const updated = [...current, ...additions];
  saveRoster(updated);
}

export async function fetchUnlockedRosterDetails(progressState) {
  const roster = loadUnlockedRoster(progressState);
  const details = [];
  for (const entry of roster) {
    try {
      const data = await fetchPokemonById(entry.id);
      details.push({ entry, pokemon: data });
    } catch (error) {
      console.warn('[PTA] Impossible de charger le Pokémon', entry.id, error);
    }
  }
  return details;
}

export async function buildRosterTeam(progressState, size = 3, preferredIds = []) {
  const roster = loadUnlockedRoster(progressState);
  if (!roster.length) {
    return [];
  }

  const pool = roster.slice();
  const selectedEntries = [];

  preferredIds.forEach(id => {
    const index = pool.findIndex(entry => entry.id === id);
    if (index !== -1 && selectedEntries.length < size) {
      selectedEntries.push(pool.splice(index, 1)[0]);
    }
  });

  if (selectedEntries.length < size) {
    const extra = weightedSample(pool, size - selectedEntries.length);
    selectedEntries.push(...extra);
  }

  const team = [];
  for (const entry of selectedEntries.slice(0, size)) {
    try {
      const pokemon = await fetchPokemonById(entry.id);
      team.push(pokemon);
    } catch (error) {
      console.warn('[PTA] Impossible de charger le Pokémon', entry.id, error);
    }
  }
  return team;
}

export function resetRoster(ids = []) {
  const entries = ids.map(id => normalizeEntry({ id }));
  saveRoster(entries);
}

export function getDefaultRosterPool() {
  return DEFAULT_ROSTER.slice();
}

export function unlockRandomPokemon(progressState, count = 1) {
  const unlockedIds = new Set(loadUnlockedRoster(progressState).map(entry => entry.id));
  const candidates = getAvailablePool(progressState).filter(entry => !unlockedIds.has(entry.id));
  if (!candidates.length) {
    return [];
  }
  const selected = weightedSample(candidates, count);
  unlockPokemon(selected.map(entry => entry.id), { rarity: selected.map(entry => entry.rarity) });
  return selected;
}
