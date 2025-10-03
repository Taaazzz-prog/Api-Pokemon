let modal;
let titleEl;
let playerListEl;
let opponentListEl;
let logListEl;
let nextBtn;
let autoBtn;
let finishBtn;
let closeBtn;

let logEntries = [];
let currentIndex = 0;
let autoTimer = null;
let resolveModal;
let finalPlayer = [];
let finalOpponent = [];
let outcome = null;
let summaryInserted = false;

export function initBattleModal() {
  if (modal) {
    return;
  }
  modal = document.getElementById('battle-modal');
  if (!modal) {
    console.warn('Battle modal element not found.');
    return;
  }
  titleEl = modal.querySelector('#battle-modal-title');
  playerListEl = modal.querySelector('#battle-modal-player-team');
  opponentListEl = modal.querySelector('#battle-modal-opponent-team');
  logListEl = modal.querySelector('#battle-modal-log');
  nextBtn = modal.querySelector('#battle-modal-next');
  autoBtn = modal.querySelector('#battle-modal-auto');
  finishBtn = modal.querySelector('#battle-modal-finish');
  closeBtn = modal.querySelector('#battle-modal-close');

  nextBtn?.addEventListener('click', stepLog);
  autoBtn?.addEventListener('click', toggleAuto);
  finishBtn?.addEventListener('click', () => closeModal());
  closeBtn?.addEventListener('click', () => {
    if (!summaryInserted) {
      finalizeModal(true);
    }
    closeModal();
  });

  modal.addEventListener('click', event => {
    if (event.target === modal) {
      if (!summaryInserted) {
        finalizeModal(true);
      }
      closeModal();
    }
  });
}

export function showBattleModal({
  title,
  playerInitial = [],
  opponentInitial = [],
  playerFinal = [],
  opponentFinal = [],
  log = [],
  outcome: result = 'draw',
}) {
  if (!modal) {
    initBattleModal();
  }
  if (!modal) {
    return Promise.resolve();
  }

  titleEl.textContent = title ?? 'Combat';
  logEntries = Array.isArray(log) ? log : [];
  currentIndex = 0;
  finalPlayer = playerFinal;
  finalOpponent = opponentFinal;
  outcome = result;
  summaryInserted = false;
  stopAuto();

  renderModalTeam(playerListEl, playerInitial);
  renderModalTeam(opponentListEl, opponentInitial);
  if (logListEl) {
    logListEl.innerHTML = '';
  }

  nextBtn.disabled = logEntries.length === 0;
  autoBtn.disabled = logEntries.length === 0;
  autoBtn.textContent = 'Lecture auto';
  finishBtn.hidden = logEntries.length !== 0;
  closeBtn.textContent = logEntries.length === 0 ? 'Fermer' : 'Passer';

  modal.hidden = false;
  document.body.classList.add('modal-open');

  if (logEntries.length === 0) {
    finalizeModal();
  }

  return new Promise(resolve => {
    resolveModal = resolve;
  });
}

function applyFrame(frame) {
  renderModalTeam(playerListEl, frame.player ?? [], false);
  renderModalTeam(opponentListEl, frame.opponent ?? [], false);
}

function stepLog() {
  if (currentIndex >= logEntries.length) {
    finalizeModal();
    return;
  }

  const entry = logEntries[currentIndex];
  currentIndex += 1;

  if (entry && typeof entry === 'object' && entry.type === 'frame') {
    applyFrame(entry.payload);
  } else if (logListEl && typeof entry === 'string') {
    const li = document.createElement('li');
    li.textContent = entry;
    logListEl.appendChild(li);
    logListEl.scrollTo({ top: logListEl.scrollHeight, behavior: 'smooth' });
  }

  if (currentIndex >= logEntries.length) {
    finalizeModal();
  }
}

function finalizeModal(skipLog = false) {
  stopAuto();
  nextBtn.disabled = true;
  autoBtn.disabled = true;
  finishBtn.hidden = false;
  closeBtn.textContent = 'Fermer';
  if (!summaryInserted && logListEl && !skipLog && logEntries.length) {
    const summary = document.createElement('div');
    summary.className = 'battle-modal__summary';
    if (outcome === 'player') {
      summary.classList.add('is-player');
      summary.textContent = 'Victoire !';
    } else if (outcome === 'opponent') {
      summary.classList.add('is-opponent');
      summary.textContent = 'Defaite.';
    } else {
      summary.textContent = 'Match nul.';
    }
    logListEl.appendChild(summary);
    logListEl.scrollTo({ top: logListEl.scrollHeight, behavior: 'smooth' });
  }
  summaryInserted = true;
  renderModalTeam(playerListEl, finalPlayer, true);
  renderModalTeam(opponentListEl, finalOpponent, true);
}

function closeModal() {
  stopAuto();
  modal.hidden = true;
  document.body.classList.remove('modal-open');
  if (resolveModal) {
    const resolve = resolveModal;
    resolveModal = null;
    resolve();
  }
}

function toggleAuto() {
  if (autoTimer) {
    stopAuto();
    return;
  }
  if (currentIndex >= logEntries.length) {
    return;
  }
  autoBtn.textContent = 'Arreter';
  autoTimer = setInterval(() => {
    if (currentIndex >= logEntries.length) {
      finalizeModal();
      stopAuto();
    } else {
      stepLog();
    }
  }, 900);
}

function stopAuto() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
  if (autoBtn) {
    autoBtn.textContent = 'Lecture auto';
  }
}

function renderModalTeam(container, team = [], highlightFinal = false) {
  if (!container) {
    return;
  }
  container.innerHTML = '';
  team.forEach(pokemon => {
    const card = document.createElement('div');
    card.className = 'battle-modal__team-card';
    if ((pokemon.currentHP ?? pokemon.stats?.HP ?? 0) <= 0) {
      card.classList.add('is-fainted');
    }
    if (highlightFinal) {
      card.classList.add('is-final');
    }
    const img = document.createElement('img');
    img.src = pokemon.image;
    img.alt = pokemon.name;
    img.loading = 'lazy';

    const info = document.createElement('div');
    info.className = 'battle-modal__team-card-info';

    const name = document.createElement('p');
    name.className = 'battle-modal__team-name';
    name.textContent = pokemon.name ?? '???';

    const hpLine = document.createElement('span');
    hpLine.className = 'battle-modal__team-hp';
    const current = pokemon.currentHP ?? pokemon.stats?.HP ?? 0;
    const max = pokemon.maxHP ?? pokemon.stats?.HP ?? current;
    hpLine.textContent = `PV : ${current}/${max}`;

    const bar = document.createElement('div');
    bar.className = 'battle-modal__team-bar';
    const fill = document.createElement('div');
    fill.className = 'battle-modal__team-bar-fill';
    const ratio = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
    fill.style.width = `${Math.round(ratio * 100)}%`;
    bar.appendChild(fill);

    info.appendChild(name);
    info.appendChild(hpLine);
    info.appendChild(bar);

    card.appendChild(img);
    card.appendChild(info);
    container.appendChild(card);
  });
}
