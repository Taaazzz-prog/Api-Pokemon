export function renderEvolutionPanel(listElement, candidates, handlers = {}) {
  if (!listElement) {
    return;
  }

  listElement.innerHTML = '';

  if (!Array.isArray(candidates) || candidates.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-evolution';
    empty.textContent = 'Remportez un combat pour debloquer une evolution.';
    listElement.appendChild(empty);
    handlers.onEmpty?.();
    return;
  }

  candidates.forEach(candidate => {
    const card = document.createElement('article');
    card.className = 'evolution-card';

    const header = document.createElement('div');
    header.className = 'evolution-header';
    header.innerHTML = `<strong>${candidate.previousName}</strong> -> <strong>${candidate.nextName}</strong>`;

    const body = document.createElement('div');
    body.className = 'evolution-body';

    const imgCurrent = document.createElement('img');
    imgCurrent.src = candidate.previousImage;
    imgCurrent.alt = candidate.previousName;

    const imgNext = document.createElement('img');
    imgNext.src = candidate.nextImage;
    imgNext.alt = candidate.nextName;

    const arrow = document.createElement('span');
    arrow.className = 'evolution-arrow';
    arrow.textContent = '->';

    const stats = document.createElement('ul');
    stats.className = 'evolution-stats';
    Object.entries(candidate.statDiff).forEach(([stat, diff]) => {
      if (!Number.isFinite(diff) || diff === 0) {
        return;
      }
      const li = document.createElement('li');
      li.textContent = `${stat} ${diff > 0 ? '+' : ''}${diff}`;
      li.className = diff > 0 ? 'stat-up' : 'stat-down';
      stats.appendChild(li);
    });
    if (!stats.childElementCount) {
      const li = document.createElement('li');
      li.textContent = 'Stats inchangees';
      stats.appendChild(li);
    }

    body.appendChild(imgCurrent);
    body.appendChild(arrow);
    body.appendChild(imgNext);

    const buttons = document.createElement('div');
    buttons.className = 'evolution-actions';

    const acceptBtn = document.createElement('button');
    acceptBtn.className = 'btn btn-primary';
    acceptBtn.type = 'button';
    acceptBtn.textContent = 'Evoluer';
    acceptBtn.addEventListener('click', () => handlers.onAccept?.(candidate));

    const skipBtn = document.createElement('button');
    skipBtn.className = 'btn btn-tertiary';
    skipBtn.type = 'button';
    skipBtn.textContent = 'Plus tard';
    skipBtn.addEventListener('click', () => handlers.onSkip?.(candidate));

    buttons.appendChild(acceptBtn);
    buttons.appendChild(skipBtn);

    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(stats);
    card.appendChild(buttons);

    listElement.appendChild(card);
  });
}
