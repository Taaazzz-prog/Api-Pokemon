import { XP_PER_LEVEL } from '../state/progression.js';

export function renderTeam(container, team) {
  if (!container) {
    return;
  }
  container.innerHTML = '';

  team.forEach(pokemon => {
    const card = document.createElement('article');
    card.className = 'pokemon-card';
    if (pokemon.currentHP !== undefined && pokemon.currentHP <= 0) {
      card.classList.add('is-fainted');
    }

    const img = document.createElement('img');
    img.src = pokemon.image;
    img.alt = pokemon.name;
    img.loading = 'lazy';

    const info = document.createElement('div');
    info.className = 'pokemon-info';

    const name = document.createElement('p');
    name.className = 'pokemon-name';
    name.textContent = pokemon.name;

    const types = document.createElement('div');
    types.className = 'type-list';
    (pokemon.types ?? []).forEach(type => {
      const badge = document.createElement('span');
      badge.className = 'type-badge';
      badge.textContent = type.name;
      types.appendChild(badge);
    });

    const hpLine = document.createElement('div');
    hpLine.className = 'stat-line';
    const current = pokemon.currentHP ?? pokemon.stats?.HP ?? 0;
    const max = pokemon.maxHP ?? pokemon.stats?.HP ?? current;
    hpLine.textContent = `PV : ${current}/${max}`;

    const hpBar = document.createElement('div');
    hpBar.className = 'hp-bar';
    const hpFill = document.createElement('div');
    hpFill.className = 'hp-bar-fill';
    const ratio = max > 0 ? Math.max(0, Math.round((current / max) * 100)) : 0;
    hpFill.style.width = `${ratio}%`;
    hpBar.appendChild(hpFill);

    info.appendChild(name);
    info.appendChild(types);
    info.appendChild(hpLine);
    info.appendChild(hpBar);

    card.appendChild(img);
    card.appendChild(info);
    container.appendChild(card);
  });
}

export function renderBattleResult(element, outcome, turns) {
  if (!element) {
    return;
  }
  element.className = 'battle-result';
  if (!outcome) {
    element.textContent = '';
    return;
  }

  const prefix = `Combat termine en ${turns} tour${turns > 1 ? 's' : ''}. `;
  if (outcome === 'player') {
    element.classList.add('is-player');
    element.textContent = `${prefix}Victoire de votre equipe !`;
  } else if (outcome === 'opponent') {
    element.classList.add('is-opponent');
    element.textContent = `${prefix}Defaite... L equipe adverse l emporte.`;
  } else {
    element.textContent = `${prefix}Match nul.`;
  }
}

export function renderLog(listElement, entries) {
  if (!listElement || !Array.isArray(entries) || entries.length === 0) {
    return;
  }
  const fragment = document.createDocumentFragment();
  entries.forEach(entry => {
    const li = document.createElement('li');
    li.textContent = entry;
    fragment.appendChild(li);
  });
  listElement.appendChild(fragment);
  listElement.scrollTo({ top: listElement.scrollHeight, behavior: 'smooth' });
}

export function resetLog(listElement) {
  if (!listElement) {
    return;
  }
  listElement.innerHTML = '';
}

export function renderProgress(container, state) {
  if (!container || !state) {
    return;
  }

  const levelEl = container.querySelector('[data-progress="level"]');
  const xpEl = container.querySelector('[data-progress="xp"]');
  const xpNextEl = container.querySelector('[data-progress="xpNext"]');
  const battlesEl = container.querySelector('[data-progress="battles"]');
  const victoriesEl = container.querySelector('[data-progress="victories"]');
  const defeatsEl = container.querySelector('[data-progress="defeats"]');
  const drawsEl = container.querySelector('[data-progress="draws"]');
  const streakEl = container.querySelector('[data-progress="streak"]');
  const bestStreakEl = container.querySelector('[data-progress="bestStreak"]');
  const evolutionsEl = container.querySelector('[data-progress="evolutions"]');
  const xpBarFill = container.querySelector('[data-progress="xpBar"]');
  const generationsEl = container.querySelector('[data-progress="generations"]');
  const modesEl = container.querySelector('[data-progress="modes"]');

  const level = state.level ?? 1;
  const xp = state.xp ?? 0;
  const baseXp = (level - 1) * XP_PER_LEVEL;
  const nextXp = level * XP_PER_LEVEL;
  const xpInLevel = Math.max(0, xp - baseXp);
  const xpForNext = Math.max(1, nextXp - baseXp);
  const xpRatio = Math.max(0, Math.min(1, xpInLevel / xpForNext));

  if (levelEl) levelEl.textContent = level;
  if (xpEl) xpEl.textContent = xpInLevel;
  if (xpNextEl) xpNextEl.textContent = xpForNext;
  if (xpBarFill) xpBarFill.style.width = `${Math.round(xpRatio * 100)}%`;
  if (battlesEl) battlesEl.textContent = state.battles ?? 0;
  if (victoriesEl) victoriesEl.textContent = state.victories ?? 0;
  if (defeatsEl) defeatsEl.textContent = state.defeats ?? 0;
  if (drawsEl) drawsEl.textContent = state.draws ?? 0;
  if (streakEl) streakEl.textContent = state.streak ?? 0;
  if (bestStreakEl) bestStreakEl.textContent = state.bestStreak ?? 0;
  if (evolutionsEl) evolutionsEl.textContent = state.evolutions ?? 0;
  if (generationsEl) {
    const gens = Array.isArray(state.unlockedGenerations) ? state.unlockedGenerations : [1];
    generationsEl.textContent = gens.map(gen => `Gen ${gen}`).join(', ');
  }
  if (modesEl) {
    const unlocked = state.unlockedModes ?? {};
    const list = [];
    if (unlocked.survival) list.push('Survie');
    if (unlocked.tournament) list.push('Tournoi');
    modesEl.textContent = list.length ? list.join(', ') : 'Aucun';
  }
}
