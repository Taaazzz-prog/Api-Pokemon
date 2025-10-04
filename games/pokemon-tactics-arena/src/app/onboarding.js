import { isRosterInitialized, sampleRosterIds, unlockPokemon, getAvailablePool } from './survival/roster.js';
import { showToast } from '../ui/notifications.js';
import { fetchPokemonById } from '../api/pokebuild.js';

const PACK_SIZE = 3;

function createOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'onboarding-overlay';

  const dialog = document.createElement('div');
  dialog.className = 'onboarding-dialog';
  const title = document.createElement('h2');
  title.textContent = 'Bienvenue dans Pokemon Tactics Arena';
  const intro = document.createElement('p');
  intro.className = 'onboarding-intro';
  intro.textContent = "Recevez vos premières cartes Pokémon pour constituer votre équipe. Sélectionnez-les, validez et partez à l'assaut de vos premiers combats.";

  const packContainer = document.createElement('div');
  packContainer.className = 'onboarding-pack';
  packContainer.id = 'onboarding-pack';

  const actions = document.createElement('div');
  actions.className = 'onboarding-actions';
  const rerollBtn = document.createElement('button');
  rerollBtn.type = 'button';
  rerollBtn.className = 'btn btn-secondary';
  rerollBtn.id = 'onboarding-reroll';
  rerollBtn.disabled = true;
  rerollBtn.textContent = 'Re-tirer';
  const confirmBtn = document.createElement('button');
  confirmBtn.type = 'button';
  confirmBtn.className = 'btn btn-primary';
  confirmBtn.id = 'onboarding-confirm';
  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Valider mon équipe';
  actions.appendChild(rerollBtn);
  actions.appendChild(confirmBtn);

  const footer = document.createElement('div');
  footer.className = 'onboarding-footer';
  const getPackBtn = document.createElement('button');
  getPackBtn.type = 'button';
  getPackBtn.className = 'btn';
  getPackBtn.id = 'onboarding-get-pack';
  getPackBtn.textContent = 'Votre équipe';
  footer.appendChild(getPackBtn);

  dialog.appendChild(title);
  dialog.appendChild(intro);
  dialog.appendChild(packContainer);
  dialog.appendChild(actions);
  dialog.appendChild(footer);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  document.body.classList.add('modal-open');
  return overlay;
}

function createPackCard(pokemon) {
  const card = document.createElement('article');
  card.className = 'pokemon-card pack-card';

  const img = document.createElement('img');
  img.src = pokemon.image;
  img.alt = pokemon.name;
  img.loading = 'lazy';
  card.appendChild(img);

  const info = document.createElement('div');
  info.className = 'pokemon-info';

  const name = document.createElement('p');
  name.className = 'pokemon-name';
  name.textContent = pokemon.name;
  info.appendChild(name);

  if (Array.isArray(pokemon.types)) {
    const typeList = document.createElement('div');
    typeList.className = 'type-list';
    pokemon.types.forEach(type => {
      const badge = document.createElement('span');
      badge.className = 'type-badge';
      badge.textContent = type.name;
      typeList.appendChild(badge);
    });
    info.appendChild(typeList);
  }

  card.appendChild(info);
  return card;
}

async function loadPack(ids) {
  const packContainer = document.getElementById('onboarding-pack');
  if (!packContainer) return [];
  packContainer.innerHTML = '';
  const cards = [];
  for (const id of ids) {
    try {
      const pokemon = await fetchPokemonById(id);
      cards.push(pokemon);
      packContainer.appendChild(createPackCard(pokemon));
    } catch (error) {
      console.warn('[PTA] Impossible de charger le Pokémon', id, error);
    }
  }
  return cards;
}

function closeOverlay(overlay) {
  overlay.remove();
  document.body.classList.remove('modal-open');
}

export function initOnboarding(getProgressState) {
  if (typeof window === 'undefined') return;
  if (isRosterInitialized()) {
    return;
  }

  const progressState = typeof getProgressState === 'function' ? getProgressState() : null;
  const availablePool = getAvailablePool(progressState ?? { unlockedGenerations: [1] });
  if (!availablePool.length) {
    return;
  }

  const overlay = createOverlay();
  const getPackBtn = overlay.querySelector('#onboarding-get-pack');
  const rerollBtn = overlay.querySelector('#onboarding-reroll');
  const confirmBtn = overlay.querySelector('#onboarding-confirm');
  let currentPackIds = [];
  let isGenerating = false;

  const generatePack = async () => {
    if (isGenerating) return;
    isGenerating = true;
    getPackBtn.disabled = true;
    rerollBtn.disabled = true;
    confirmBtn.disabled = true;
    currentPackIds = sampleRosterIds(progressState, PACK_SIZE, { fromPool: true });
    const cards = await loadPack(currentPackIds);
    if (cards.length) {
      rerollBtn.disabled = false;
      confirmBtn.disabled = false;
    } else {
      showToast('Impossible de générer votre pack. Réessayez.', 'error');
      getPackBtn.disabled = false;
    }
    isGenerating = false;
  };

  getPackBtn.addEventListener('click', generatePack);
  rerollBtn.addEventListener('click', generatePack);

  confirmBtn.addEventListener('click', () => {
    if (!currentPackIds.length) {
      showToast('Choisissez d'abord vos cartes.', 'warning');
      return;
    }
    unlockPokemon(currentPackIds);
    window.__ptaSelectedRoster = currentPackIds.slice();
    showToast('Votre équipe est prête !', 'success');
    closeOverlay(overlay);
    window.location.reload();
  });
}
