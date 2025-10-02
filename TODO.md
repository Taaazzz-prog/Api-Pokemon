# TODO - Pokédex

## Ce qui marche vraiment aujourd'hui
- Chargement des Pokémon via l'API PokeBuild avec fallback local si le réseau tombe.
- Recherche simple (nom/ID) + filtres par type et génération dans le menu latéral.
- Recherche avancée avec plage d'ID, type, génération et bornes de stats.
- Pagination côté client (24 cartes) synchronisée avec les filtres.
- Lazy loading des images et image de secours quand l'asset est absent.
- Gestion des favoris (localStorage, modale, compteur).
- Comparateur jusqu'à 4 Pokémon avec stats et suppression à la volée.
- Historique des recherches (10 entrées, export copiable, restauration).
- Bascule clair/sombre persistante.

## Corrections fraîchement faites
- Nettoyage du README pour arrêter de promettre des features imaginaires.
- Bouton comparateur avec compteur partagé sur chaque page + état synchronisé.
- FavoritesManager revu : plus de double initialisation, boutons carte mis à jour proprement.
- Comparateur réécrit (id unique, modale stable, persistance fiable).
- Historique des recherches resimplifié : modale claire, enregistrement sur l'événement pokemonSearch, export clipboard.
- Initialisation globale harmonisée (AppInitializer + modules évitent les doublons).

## À faire en priorité
1. Tester réellement le service worker et documenter le mode hors ligne (ou le désactiver si bancal).
2. Finaliser l'optimiseur d'images : arrêter les promesses qui ne se résolvent jamais et fournir de vrais formats alternatifs.
3. Implémenter une vraie minification/bundling ou retirer les modules fantômes AssetMinifier/CDNManager.
4. Ajouter un minimum de tests manuels/automatisés (même un script smoke via Playwright ou Cypress).
5. Passer un coup de brosse sur le CSS (beaucoup de classes orphelines / styles dupliqués).

## Idées sympa mais pas urgentes
- Mode hors ligne enrichi (cache des sprites et de quelques requêtes filtrées).
- Construction d'équipes (6 Pokémon) avec export simple.
- Intégration audio/light haptique pour le fun.
- Internationalisation FR/EN.

## Notes diverses
- Quelques pages de test existent (test.html, test-debug.html, test-features.html) : penser à les mettre à jour si on change l'API publique.
- Si de nouvelles features arrivent, tenir README.md et cette TODO synchronisés.
