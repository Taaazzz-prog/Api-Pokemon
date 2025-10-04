# Evolutions du jeu

## Mode Survie actuel
- Déblocage au niveau 12 depuis la page principale (bouton Commencer une fois le mode accessible).
- L'équipe du joueur est la dernière équipe générée (équilibrée ou évolutive) et reste figée pendant le run.
- Trois vagues successives générées via fetchRandomTeam(), avec soin complet après chaque victoire.
- Défaite à la moindre manche perdue et retour immédiat au mode libre ; réussite des trois manches accorde un bonus fixe de 150 XP.
- Pas de suivi dédié (records, récompenses spécifiques, boutique) en dehors des toasts et de l'XP.

## Limites identifiées
- Trois vagues transforment le mode survie en défi court plutôt qu'en run illimité axé sur la progression.
- Aucun éditeur d'équipe : le joueur ne contrôle pas sa composition, ce qui réduit la rejouabilité.
- Architecture mono-page (index.html) rendant difficile l'ajout de nouveaux écrans, de menus ou d'options avancées.
- Absence totale d'économie (monnaie, boutique, inventaire), de sorte que les récompenses restent purement en XP.

## Vision cible
- Refonte structurelle : passer à une architecture multi-pages ou SPA modulable.
  - Page hub principale : sélection des modes, vue d'ensemble de la progression, accès à la boutique.
  - Page dédiée Survie : compteur de vagues, commandes spécifiques, classement.
  - Page dédiée Tournoi : présentation du bracket, historique des runs et récompenses.
  - Page Gestion d'équipe : création ou édition d'équipes persistantes, consultation du roster débloqué.
- Survie étendue :
  - Vagues illimitées avec montée progressive de difficulté (stats renforcées, équipes plus rares).
  - Tracking de performance (meilleure vague atteinte, leaderboard local ou en ligne).
  - Récompenses par paliers (toutes les X vagues) et phase d'intermission pour évolutions ou achats.
- Équipes personnalisées :
  - Système de roster où le joueur collecte et conserve des Pokémon (loot, boutique, succès de run).
  - Éditeur permettant de composer et sauvegarder différentes équipes, utilisées dans tous les modes.
- Économie et boutique :
  - Introduction d'une monnaie fictive (gagnée en jeu) et, si désiré, d'une monnaie premium.
  - Boutique pour acheter Pokémon rares, consommables, skins ou boosts XP.
  - Gestion d'inventaire et de rareté, avec anti-triche si monnaie réelle.
- Infrastructure :
  - Modularisation du code JS (import dynamique ou framework) pour charger uniquement les modules nécessaires.
  - Préparation d'un backend (ou mocks) pour comptes, progression cloud, transactions.
  - Mise en place d'un routeur front (si SPA) ou d'un build system multi-pages.

## Feuille de route recommandée
1. Game design détaillé : définir règles du survival infini, économies, boucles de récompense, courbes de difficulté.
2. Architecture front : choisir entre multi-pages classique (HTML séparés) ou framework SPA, puis isoler les modules communs (API, combats, progression).
3. Prototype Survie 2.0 : implémenter la nouvelle boucle (vagues illimitées, scoreboard, paliers de récompense) sans économie pour valider le gameplay.
4. Création d'équipe : développer l'éditeur d'équipe persistant (stockage local dans un premier temps), connecter Survie et Tournoi sur ces équipes.
5. Économie fictive et boutique : ajouter monnaie gagnée en jeu, boutique simple permettant d'acheter Pokémon ou boosters, inventaire basique.
6. Extension globale : appliquer la nouvelle structure aux tournois et modes futurs, enrichir l'UX (navigation, transitions, toasts communs) et préparer l'ajout d'une monnaie premium le cas échéant.
7. Infrastructure serveur (optionnel) : si besoin de comptes multi-appareils ou d'achats réels, prévoir un backend sécurisé avec persistance et protections anti-triche.
