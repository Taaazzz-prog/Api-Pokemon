class SearchHistoryManager {
  constructor() {
    this.storageKey = 'pokemon-search-history';
    this.maxEntries = 10;
    this.history = this.loadHistory();
    this.modal = null;
    this.listElement = null;
    this.countElement = null;
    this.emptyState = null;

    this.createModal();
    this.attachGlobalListeners();
    this.renderHistory();
  }

  attachGlobalListeners() {
    document.addEventListener('pokemonSearch', (event) => {
      if (event.detail) {
        this.addSearch(event.detail);
      }
    });

    document.querySelectorAll('#history-btn').forEach((button) => {
      button.addEventListener('click', () => this.showModal());
    });

    window.addEventListener('storage', (event) => {
      if (event.key === this.storageKey) {
        this.history = this.loadHistory();
        this.renderHistory();
      }
    });
  }

  createModal() {
    const existingModal = document.getElementById('search-history-modal');
    if (existingModal) {
      this.modal = existingModal;
      this.listElement = existingModal.querySelector('#history-list');
      this.countElement = existingModal.querySelector('#history-count');
      this.emptyState = existingModal.querySelector('.history-empty');
      this.bindModalEvents();
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'search-history-modal';
    modal.className = 'modal history-modal';
    modal.innerHTML = `
      <div class="modal-content history-content">
        <div class="modal-header">
          <h2>📚 Historique des recherches</h2>
          <button class="modal-close" aria-label="Fermer">&times;</button>
        </div>

        <div class="history-meta">
          <p id="history-count"></p>
          <div class="history-actions">
            <button class="btn btn-secondary clear-history">🗑️ Effacer</button>
            <button class="btn btn-primary export-history">📤 Exporter</button>
          </div>
        </div>

        <div class="history-list" id="history-list"></div>
        <div class="history-empty" hidden>
          <p>Aucune recherche enregistrée pour l'instant.</p>
          <p>Lance une recherche pour la retrouver ici. 🔍</p>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    this.modal = modal;
    this.listElement = modal.querySelector('#history-list');
    this.countElement = modal.querySelector('#history-count');
    this.emptyState = modal.querySelector('.history-empty');

    this.bindModalEvents();
  }

  bindModalEvents() {
    this.modal.querySelector('.modal-close').addEventListener('click', () => this.hideModal());
    this.modal.addEventListener('click', (event) => {
      if (event.target === this.modal) {
        this.hideModal();
      }
    });

    const clearBtn = this.modal.querySelector('.clear-history');
    const exportBtn = this.modal.querySelector('.export-history');

    clearBtn.addEventListener('click', () => this.clearHistory());
    exportBtn.addEventListener('click', () => this.exportHistory());
  }

  loadHistory() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn("Impossible de charger l'historique de recherche:", error);
      return [];
    }
  }

  saveHistory() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.history));
    } catch (error) {
      console.warn("Impossible d'enregistrer l'historique:", error);
    }
  }

  showModal() {
    if (!this.modal) {
      return;
    }

    this.renderHistory();
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  hideModal() {
    if (!this.modal) {
      return;
    }

    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  clearHistory() {
    if (!this.history.length) {
      return;
    }

    if (confirm("Supprimer tout l'historique de recherche ?")) {
      this.history = [];
      this.saveHistory();
      this.renderHistory();
    }
  }

  exportHistory() {
    if (!this.history.length) {
      alert('Rien à exporter pour le moment.');
      return;
    }

    const exportData = JSON.stringify(this.history, null, 2);

    if (navigator.clipboard) {
      navigator.clipboard.writeText(exportData).then(() => {
        alert('Historique copié dans le presse-papiers ✔️');
      }).catch(() => {
        this.downloadHistory(exportData);
      });
    } else {
      this.downloadHistory(exportData);
    }
  }

  downloadHistory(content) {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'historique-recherches.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  addSearch(rawEntry) {
    const entry = this.normalizeEntry(rawEntry);
    if (!entry) {
      return;
    }

    const lastEntry = this.history[0];
    if (lastEntry && this.areEntriesEquivalent(lastEntry, entry)) {
      return;
    }

    this.history = [entry, ...this.history].slice(0, this.maxEntries);
    this.saveHistory();
    this.renderHistory();
  }

  addToHistory(query, type = 'manuel') {
    if (typeof query === 'object' && query !== null) {
      this.addSearch(query);
      return;
    }

    this.addSearch({
      query,
      type,
      timestamp: new Date().toISOString()
    });
  }

  normalizeEntry(detail) {
    if (!detail) {
      return null;
    }

    const timestamp = detail.timestamp ? new Date(detail.timestamp) : new Date();
    const label = this.buildLabel(detail);

    return {
      label,
      query: detail.query || detail.term || null,
      type: detail.type || 'recherche',
      filters: detail.filters || null,
      generation: detail.generation || null,
      results: typeof detail.results === 'number' ? detail.results : null,
      createdAt: timestamp.toISOString()
    };
  }

  buildLabel(detail) {
    if (detail.query) {
      return detail.query;
    }
    if (detail.term) {
      return detail.term;
    }
    if (detail.filters) {
      const filters = Object.entries(detail.filters)
        .filter(([, value]) => value && value !== '')
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
        .join(' • ');
      return filters || 'Filtre avancé';
    }
    return 'Recherche';
  }

  areEntriesEquivalent(a, b) {
    return a.label === b.label && a.type === b.type && a.generation === b.generation;
  }

  renderHistory() {
    if (!this.listElement || !this.countElement) {
      return;
    }

    if (!this.history.length) {
      this.listElement.innerHTML = '';
      if (this.emptyState) {
        this.emptyState.hidden = false;
      }
      this.countElement.textContent = 'Aucune recherche enregistrée';
      return;
    }

    if (this.emptyState) {
      this.emptyState.hidden = true;
    }
    this.countElement.textContent = `${this.history.length} recherche${this.history.length > 1 ? 's' : ''}`;

    this.listElement.innerHTML = this.history.map((entry) => this.renderHistoryItem(entry)).join('');

    this.listElement.querySelectorAll('.history-item').forEach((item, index) => {
      item.querySelector('.history-restore')?.addEventListener('click', () => {
        this.restoreSearch(this.history[index]);
      });
    });
  }

  renderHistoryItem(entry) {
    const date = new Date(entry.createdAt);
    const resultsText = entry.results === null ? 'Résultats inconnus' : `${entry.results} résultat${entry.results > 1 ? 's' : ''}`;
    const generationText = entry.generation && entry.generation !== 'toutes'
      ? `Génération ${entry.generation}`
      : '';

    return `
      <article class="history-item">
        <header>
          <h3>${entry.label}</h3>
          <span class="history-type">${entry.type}</span>
        </header>
        <p class="history-meta-line">
          <span>${resultsText}</span>
          ${generationText ? `<span>${generationText}</span>` : ''}
          <span>${date.toLocaleString('fr-FR')}</span>
        </p>
        <footer>
          <button class="btn btn-tertiary history-restore">🔁 Relancer</button>
        </footer>
      </article>
    `;
  }

  restoreSearch(entry) {
    const event = new CustomEvent('restorePokemonSearch', {
      detail: entry
    });
    document.dispatchEvent(event);
    this.hideModal();
  }
}

window.SearchHistoryManager = SearchHistoryManager;

document.addEventListener('DOMContentLoaded', () => {
  if (!window.searchHistoryManager) {
    window.searchHistoryManager = new SearchHistoryManager();
  }
});
