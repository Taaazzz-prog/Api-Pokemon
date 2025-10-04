export function injectPokedexHeader(containerSelector = '#main-header-slot') {
  const target = document.querySelector(containerSelector);
  if (!target) {
    console.warn('Slot header Pokédex introuvable');
    return;
  }

  target.innerHTML = '<h1 class="text">Pokédex complet</h1><p class="text">Filtrez et trouvez n'importe quel Pokémon grâce à la recherche avancée.</p>';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => injectPokedexHeader());
} else {
  injectPokedexHeader();
}
