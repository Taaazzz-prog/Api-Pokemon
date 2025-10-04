import { highlightActiveNav } from '../shared/navigation.js';
import { fetchUnlockedRosterDetails, sampleRosterIds } from './roster.js';
import { showToast } from '../../ui/notifications.js';

const MAX_TEAM_SIZE = 3;

function getProgressState() {
  if (typeof window === 'undefined') return null;
  const getter = window.__ptaGetProgressState;
  return typeof getter === 'function' ? getter() : null;
}

function syncSelection(selectedSet) {
  if (typeof window !== 'undefined') {
    window.__ptaSelectedRoster = Array.from(selectedSet);
  }
}

function renderRoster(details, selectedSet) {
  const container = document.getElementById('survival-roster');
  if (!container) {
    return;
  }
  container.innerHTML = '';

  if (!details.length) {
    const empty = document.createElement('p');
    empty.className = 'panel-description';
    empty.textContent = 'Aucun Pokémon débloqué pour le moment. Rendez-vous sur le hub pour obtenir votre première équipe.';
    container.appendChild(empty);
    return;
  }

  details.forEach(({ entry, pokemon }) => {
    const card = document.createElement('article');
    card.className = 'pokemon-card roster-card';
    card.dataset.id = String(entry.id);
    card.dataset.rarity = entry.rarity;

    if (pokemon?.image) {
      const img = document.createElement('img');
      img.src = pokemon.image;
      img.alt = pokemon.name;
      img.loading = 'lazy';
      card.appendChild(img);
    }

    const info = document.createElement('div');
    info.className = 'pokemon-info';

    const name = document.createElement('p');
    name.className = 'pokemon-name';
    name.textContent = pokemon?.name ?? `#${entry.id}`;
    info.appendChild(name);

    const rarity = document.createElement('span');
    rarity.className = `rarity-badge rarity-${entry.rarity ?? 'common'}`;
    rarity.textContent = entry.rarity ?? 'Common';
    info.appendChild(rarity);

    if (pokemon?.types?.length) {
      const types = document.createElement('div');
      types.className = 'type-list';
      pokemon.types.forEach(type => {
        const badge = document.createElement('span');
        badge.className = 'type-badge';
        badge.textContent = type.name;
        types.appendChild(badge);
      });
      info.appendChild(types);
    }

    card.appendChild(info);

    card.addEventListener('click', () => {
      const id = entry.id;
      if (selectedSet.has(id)) {
        selectedSet.delete(id);
      } else {
        if (selectedSet.size >= MAX_TEAM_SIZE) {
          showToast(`Vous ne pouvez sélectionner que ${MAX_TEAM_SIZE} Pokémon pour le run.`, 'warning');
          return;
        }
        selectedSet.add(id);
      }
      syncSelection(selectedSet);
      card.classList.toggle('is-selected', selectedSet.has(id));
    });

    card.classList.toggle('is-selected', selectedSet.has(entry.id));
    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  window.__ptaSurvivalPage = true;
  highlightActiveNav();

  const survivalCard = document.querySelector('[data-mode="survival"]');
  survivalCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const progressState = getProgressState();
  const selected = new Set(Array.isArray(window.__ptaSelectedRoster) ? window.__ptaSelectedRoster : []);

  let cachedDetails = null;
  let shuffleBtn;

  const loadRoster = () => {
    if (window.__ptaSurvivalTeamSource && window.__ptaSurvivalTeamSource !== 'roster') {
      const container = document.getElementById('survival-roster');
      if (container) container.innerHTML = '';
      if (shuffleBtn) shuffleBtn.disabled = true;
      return;
    }
    if (cachedDetails) {
      if (!cachedDetails.length) {
        const container = document.getElementById('survival-roster');
        if (container) {
          container.innerHTML = '';
          const empty = document.createElement('p');
          empty.className = 'panel-description';
          empty.textContent = 'Aucun Pokémon débloqué pour le moment. Rendez-vous sur le hub pour obtenir votre première équipe.';
          container.appendChild(empty);
        }
        if (shuffleBtn) shuffleBtn.disabled = true;
        return;
      }
      if (!selected.size) {
        sampleRosterIds(progressState, Math.min(MAX_TEAM_SIZE, cachedDetails.length)).forEach(id => selected.add(id));
        syncSelection(selected);
      }
      renderRoster(cachedDetails, selected);
      if (shuffleBtn) shuffleBtn.disabled = false;
      return;
    }

    fetchUnlockedRosterDetails(progressState).then(details => {
      cachedDetails = details;
      if (!details.length) {
        renderRoster([], selected);
        if (shuffleBtn) shuffleBtn.disabled = true;
        return;
      }
      if (!selected.size) {
        sampleRosterIds(progressState, Math.min(MAX_TEAM_SIZE, details.length)).forEach(id => selected.add(id));
        syncSelection(selected);
      }
      renderRoster(details, selected);
      if (shuffleBtn) shuffleBtn.disabled = false;
    });
  };

  shuffleBtn = document.getElementById('shuffle-roster');
  shuffleBtn?.addEventListener('click', () => {
    const progress = getProgressState();
    selected.clear();
    sampleRosterIds(progress, MAX_TEAM_SIZE).forEach(id => selected.add(id));
    syncSelection(selected);
    if (cachedDetails) {
      renderRoster(cachedDetails, selected);
    } else {
      loadRoster();
    }
  });

  const rosterPanel = document.getElementById('survival-roster-panel');
  const sourceRadios = document.querySelectorAll('input[name="survival-team-source"]');
  if (!window.__ptaSurvivalTeamSource) {
    window.__ptaSurvivalTeamSource = 'roster';
  }
  sourceRadios.forEach(radio => {
    radio.checked = radio.value === window.__ptaSurvivalTeamSource;
    radio.addEventListener('change', () => {
      window.__ptaSurvivalTeamSource = radio.value;
      if (radio.value === 'roster') {
        rosterPanel?.classList.remove('is-disabled');
        loadRoster();
      } else {
        rosterPanel?.classList.add('is-disabled');
        if (shuffleBtn) shuffleBtn.disabled = true;
      }
    });
  });

  loadRoster();

  document.addEventListener('pta-roster-updated', () => {
    cachedDetails = null;
    loadRoster();
  });

  console.info('[PTA] Page Survie prête. Sélectionnez les Pokémon de votre roster puis lancez le run.');
});
