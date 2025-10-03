/*
 * Gestionnaire de pagination pour le Pokédex
 * Ce fichier gère l'affichage paginé des Pokémons
 */

class PaginationManager {
  constructor(itemsPerPage = 24) {
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1;
    this.totalItems = 0;
    this.totalPages = 0;
    this.filteredItems = [];
    this.allItems = [];
  }

  // Initialiser avec tous les éléments
  init(items) {
    this.allItems = items;
    this.filteredItems = [...items];
    this.totalItems = this.filteredItems.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.currentPage = 1;
    this.createPaginationControls();
    this.displayCurrentPage();
  }

  // Mettre à jour avec des éléments filtrés
  updateWithFilteredItems(filteredItems) {
    this.filteredItems = filteredItems;
    this.totalItems = this.filteredItems.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.currentPage = 1;
    this.updatePaginationControls();
    this.displayCurrentPage();
  }

  // Créer les contrôles de pagination
  createPaginationControls() {
    const existingPagination = document.querySelector('.pagination-controls');
    if (existingPagination) {
      existingPagination.remove();
    }

    const paginationContainer = document.createElement('div');
    paginationContainer.classList.add('pagination-controls');
    
    // Info sur la page actuelle
    const pageInfo = document.createElement('div');
    pageInfo.classList.add('page-info');
    
    // Boutons de navigation
    const navButtons = document.createElement('div');
    navButtons.classList.add('pagination-buttons');
    
    // Bouton précédent
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '« Précédent';
    prevBtn.classList.add('pagination-btn', 'prev-btn');
    prevBtn.addEventListener('click', () => this.goToPreviousPage());
    
    // Numéros de page
    const pageNumbers = document.createElement('div');
    pageNumbers.classList.add('page-numbers');
    
    // Bouton suivant
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Suivant »';
    nextBtn.classList.add('pagination-btn', 'next-btn');
    nextBtn.addEventListener('click', () => this.goToNextPage());
    
    navButtons.appendChild(prevBtn);
    navButtons.appendChild(pageNumbers);
    navButtons.appendChild(nextBtn);
    
    paginationContainer.appendChild(pageInfo);
    paginationContainer.appendChild(navButtons);
    
    // Ajouter avant le container des Pokémons
    const pokemonContainer = document.getElementById('pokemon-container');
    pokemonContainer.parentNode.insertBefore(paginationContainer, pokemonContainer);
    
    this.paginationContainer = paginationContainer;
    this.pageInfo = pageInfo;
    this.pageNumbers = pageNumbers;
    this.prevBtn = prevBtn;
    this.nextBtn = nextBtn;
    
    this.updatePaginationControls();
  }

  // Mettre à jour les contrôles de pagination
  updatePaginationControls() {
    if (!this.paginationContainer) return;

    // Mettre à jour l'info de page
    const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    this.pageInfo.textContent = `${startItem}-${endItem} sur ${this.totalItems} Pokémon`;

    // Mettre à jour les boutons
    this.prevBtn.disabled = this.currentPage === 1;
    this.nextBtn.disabled = this.currentPage === this.totalPages;

    // Créer les numéros de page
    this.createPageNumbers();
  }

  // Créer les numéros de page
  createPageNumbers() {
    this.pageNumbers.innerHTML = '';
    
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    // Ajuster si on est proche de la fin
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Bouton première page
    if (startPage > 1) {
      this.createPageButton(1);
      if (startPage > 2) {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.classList.add('pagination-ellipsis');
        this.pageNumbers.appendChild(ellipsis);
      }
    }

    // Pages visibles
    for (let i = startPage; i <= endPage; i++) {
      this.createPageButton(i);
    }

    // Bouton dernière page
    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.classList.add('pagination-ellipsis');
        this.pageNumbers.appendChild(ellipsis);
      }
      this.createPageButton(this.totalPages);
    }
  }

  // Créer un bouton de page
  createPageButton(pageNumber) {
    const button = document.createElement('button');
    button.textContent = pageNumber;
    button.classList.add('pagination-btn', 'page-btn');
    
    if (pageNumber === this.currentPage) {
      button.classList.add('active');
    }
    
    button.addEventListener('click', () => this.goToPage(pageNumber));
    this.pageNumbers.appendChild(button);
  }

  // Aller à une page spécifique
  goToPage(pageNumber) {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.updatePaginationControls();
      this.displayCurrentPage();
      this.scrollToTop();
    }
  }

  // Page précédente
  goToPreviousPage() {
    this.goToPage(this.currentPage - 1);
  }

  // Page suivante
  goToNextPage() {
    this.goToPage(this.currentPage + 1);
  }

  // Afficher la page actuelle
  displayCurrentPage() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const currentPageItems = this.filteredItems.slice(startIndex, endIndex);
    
    // Émettre un événement pour que le gestionnaire de Pokémons affiche les éléments
    const event = new CustomEvent('paginationUpdate', {
      detail: { items: currentPageItems, startIndex, endIndex }
    });
    document.dispatchEvent(event);
  }

  // Faire défiler vers le haut
  scrollToTop() {
    const pokemonContainer = document.getElementById('pokemon-container');
    if (pokemonContainer) {
      pokemonContainer.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Obtenir les éléments de la page actuelle
  getCurrentPageItems() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredItems.slice(startIndex, endIndex);
  }
}

// Instance globale du gestionnaire de pagination
window.paginationManager = new PaginationManager(24);