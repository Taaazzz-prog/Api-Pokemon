const STORAGE_KEY = 'pta-progress';
export const XP_PER_LEVEL = 300;

export const MILESTONES = [
  {
    level: 5,
    unlocks: { generations: [2] },
    message: 'Nouvelle generation disponible : Gen 2 !',
  },
  {
    level: 10,
    unlocks: { generations: [3] },
    message: 'Nouvelle generation disponible : Gen 3 !',
  },
  {
    level: 12,
    unlocks: { modes: ['survival'] },
    message: 'Mode Survie debloque !',
  },
  {
    level: 15,
    unlocks: { generations: [4] },
    message: 'Nouvelle generation disponible : Gen 4 !',
  },
  {
    level: 20,
    unlocks: { modes: ['tournament'] },
    message: 'Mode Tournoi debloque !',
  },
];

const DEFAULT_STATE = {
  battles: 0,
  victories: 0,
  defeats: 0,
  draws: 0,
  streak: 0,
  bestStreak: 0,
  xp: 0,
  level: 1,
  evolutions: 0,
  evolvedIds: [],
  unlockedGenerations: [1],
  unlockedModes: {
    survival: false,
    tournament: false,
  },
  merits: 0,
  lastOpponentSignature: null,
  repeatFightCount: 0,
};

function cloneDefault() {
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function hasStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function saveProgress(state) {
  if (!hasStorage()) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadProgress() {
  if (!hasStorage()) {
    return cloneDefault();
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = cloneDefault();
    saveProgress(initial);
    return initial;
  }
  try {
    const parsed = JSON.parse(raw);
    const state = {
      ...cloneDefault(),
      ...parsed,
      evolvedIds: Array.isArray(parsed.evolvedIds) ? parsed.evolvedIds : [],
      unlockedGenerations: Array.isArray(parsed.unlockedGenerations) && parsed.unlockedGenerations.length
        ? Array.from(new Set(parsed.unlockedGenerations)).sort((a, b) => a - b)
        : [1],
      unlockedModes: {
        ...cloneDefault().unlockedModes,
        ...(parsed.unlockedModes ?? {}),
      },
      repeatFightCount: Number.isFinite(parsed.repeatFightCount) ? parsed.repeatFightCount : 0,
    };
    
    // Recalculer et appliquer tous les paliers manqués
    const correctedState = recalculateMilestones(state);
    if (JSON.stringify(state) !== JSON.stringify(correctedState)) {
      console.log('Paliers manqués détectés, mise à jour automatique...');
      saveProgress(correctedState);
    }
    
    return correctedState;
  } catch (error) {
    console.warn('Progression invalide, reinitialisation.', error);
    const initial = cloneDefault();
    saveProgress(initial);
    return initial;
  }
}

export function recordBattle(state, outcome, turns = 0, context = {}) {
  const events = [];
  const next = {
    ...state,
    battles: state.battles + 1,
  };

  const opponentSignature = context.opponentSignature ?? null;
  if (opponentSignature && opponentSignature === state.lastOpponentSignature) {
    next.repeatFightCount = (state.repeatFightCount ?? 1) + 1;
  } else {
    next.repeatFightCount = 1;
  }
  next.lastOpponentSignature = opponentSignature;

  let xpGain = 0;
  switch (outcome) {
    case 'player':
      next.victories += 1;
      next.streak = state.streak + 1;
      next.bestStreak = Math.max(next.bestStreak, next.streak);
      xpGain += 120;
      break;
    case 'opponent':
      next.defeats += 1;
      next.streak = 0;
      xpGain += 40;
      break;
    default:
      next.draws += 1;
      next.streak = 0;
      xpGain += 60;
      break;
  }

  if (turns > 0 && outcome === 'player') {
    xpGain += Math.max(0, 40 - Math.min(turns, 40));
  }

  if (context.mode === 'survival') {
    xpGain += 30;
  } else if (context.mode === 'tournament') {
    xpGain += 50;
  }

  if (next.repeatFightCount > 1) {
    xpGain = Math.floor(xpGain / next.repeatFightCount);
    if (xpGain > 0) {
      events.push('XP reduite (combat repete).');
    }
  }

  xpGain = Math.max(10, xpGain);
  next.xp += xpGain;
  const previousLevel = state.level;
  next.level = Math.max(1, Math.floor(next.xp / XP_PER_LEVEL) + 1);

  if (next.level > previousLevel) {
    events.push(`Niveau ${next.level} atteint !`);
  }

  applyMilestones(state, next, events);
  saveProgress(next);
  return { state: next, events };
}

export function recordEvolution(state, details) {
  const events = [];
  const { previousId, newId } = details;
  const evolvedSet = new Set(state.evolvedIds ?? []);
  if (previousId) evolvedSet.add(previousId);
  if (newId) evolvedSet.add(newId);

  const next = {
    ...state,
    evolutions: state.evolutions + 1,
    evolvedIds: Array.from(evolvedSet),
    xp: state.xp + 75,
  };

  const previousLevel = state.level;
  next.level = Math.max(1, Math.floor(next.xp / XP_PER_LEVEL) + 1);
  if (next.level > previousLevel) {
    events.push(`Niveau ${next.level} atteint !`);
  }
  applyMilestones(state, next, events);
  saveProgress(next);
  return { state: next, events };
}

export function resetProgress() {
  const fresh = cloneDefault();
  saveProgress(fresh);
  return fresh;
}

function applyMilestones(previousState, nextState, events) {
  const unlockedGenerations = new Set(nextState.unlockedGenerations ?? [1]);
  const unlockedModes = {
    ...cloneDefault().unlockedModes,
    ...(nextState.unlockedModes ?? {}),
  };

  MILESTONES.forEach(milestone => {
    if (previousState.level >= milestone.level || nextState.level < milestone.level) {
      return;
    }

    if (Array.isArray(milestone.unlocks?.generations)) {
      milestone.unlocks.generations.forEach(gen => unlockedGenerations.add(gen));
      events.push(milestone.message ?? `Generation ${milestone.unlocks.generations.join(', ')} debloquee !`);
    }

    if (Array.isArray(milestone.unlocks?.modes)) {
      milestone.unlocks.modes.forEach(mode => {
        unlockedModes[mode] = true;
        events.push(milestone.message ?? `Mode ${mode} debloque !`);
      });
    }
  });

  nextState.unlockedGenerations = Array.from(unlockedGenerations).sort((a, b) => a - b);
  nextState.unlockedModes = unlockedModes;
}

export function grantBonusXP(state, amount, message) {
  if (!Number.isFinite(amount) || amount === 0) {
    return { state, events: [] };
  }
  const events = [];
  if (message) {
    events.push(message);
  }
  const next = {
    ...state,
    xp: state.xp + amount,
  };
  const previousLevel = state.level;
  next.level = Math.max(1, Math.floor(next.xp / XP_PER_LEVEL) + 1);
  if (next.level > previousLevel) {
    events.push(`Niveau ${next.level} atteint !`);
  }
  applyMilestones(state, next, events);
  saveProgress(next);
  return { state: next, events };
}

// Fonction pour recalculer tous les paliers basés sur le niveau actuel
function recalculateMilestones(state) {
  const currentLevel = state.level ?? 1;
  const unlockedGenerations = new Set([1]); // Toujours commencer avec Gen 1
  const unlockedModes = {
    survival: false,
    tournament: false,
  };

  // Appliquer tous les paliers jusqu'au niveau actuel
  MILESTONES.forEach(milestone => {
    if (currentLevel >= milestone.level) {
      if (Array.isArray(milestone.unlocks?.generations)) {
        milestone.unlocks.generations.forEach(gen => unlockedGenerations.add(gen));
      }
      if (Array.isArray(milestone.unlocks?.modes)) {
        milestone.unlocks.modes.forEach(mode => {
          unlockedModes[mode] = true;
        });
      }
    }
  });

  return {
    ...state,
    unlockedGenerations: Array.from(unlockedGenerations).sort((a, b) => a - b),
    unlockedModes: unlockedModes,
  };
}
