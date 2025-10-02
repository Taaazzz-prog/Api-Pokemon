/* 
 * Gestionnaire de menu mobile hamburger
 * Ce fichier gère l'affichage et le comportement du menu mobile
 */

class MobileMenuManager {
  constructor() {
    this.isOpen = false;
    this.createMobileMenu();
    this.setupEventListeners();
  }

  createMobileMenu() {
    // Créer le bouton hamburger
    const hamburgerBtn = document.createElement('button');
    hamburgerBtn.classList.add('hamburger-btn');
    hamburgerBtn.innerHTML = `
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    `;
    hamburgerBtn.setAttribute('aria-label', 'Menu de navigation');
    hamburgerBtn.setAttribute('aria-expanded', 'false');

    // Créer l'overlay pour fermer le menu
    const overlay = document.createElement('div');
    overlay.classList.add('mobile-menu-overlay');

    // Ajouter le bouton au début du body
    document.body.insertBefore(hamburgerBtn, document.body.firstChild);
    document.body.appendChild(overlay);

    this.hamburgerBtn = hamburgerBtn;
    this.overlay = overlay;
  }

  setupEventListeners() {
    // Événement pour ouvrir/fermer le menu
    this.hamburgerBtn.addEventListener('click', () => {
      this.toggleMenu();
    });

    // Fermer le menu en cliquant sur l'overlay
    this.overlay.addEventListener('click', () => {
      this.closeMenu();
    });

    // Fermer le menu avec la touche Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeMenu();
      }
    });

    // Fermer le menu lors du redimensionnement vers desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.isOpen) {
        this.closeMenu();
      }
    });
  }

  toggleMenu() {
    if (this.isOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    this.isOpen = true;
    document.body.classList.add('mobile-menu-open');
    this.hamburgerBtn.classList.add('active');
    this.hamburgerBtn.setAttribute('aria-expanded', 'true');
    
    // Empêcher le scroll du body
    document.body.style.overflow = 'hidden';
  }

  closeMenu() {
    this.isOpen = false;
    document.body.classList.remove('mobile-menu-open');
    this.hamburgerBtn.classList.remove('active');
    this.hamburgerBtn.setAttribute('aria-expanded', 'false');
    
    // Rétablir le scroll du body
    document.body.style.overflow = '';
  }
}

// Initialiser le menu mobile seulement sur mobile
document.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth <= 768) {
    new MobileMenuManager();
  }
});