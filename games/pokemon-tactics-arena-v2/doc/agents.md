# Roadmap Agents – Checklist détaillée

## Phase 0 – Préparation
- [ ] Valider périmètre MVP (modes clés, boutique, progression).
- [ ] Choisir stack backend (Node/Nest ?), frontend (React/Vite ?), DB (Postgres + Redis).
- [ ] Configurer référentiel (mono repo avec workspaces).
- [ ] Mettre en place CI/CD minimal (lint/test/build).
- [ ] Définir conventions git, PR, code style.

## Phase 1 – Backend Fondations
- [ ] Créer service auth (, , , ).
- [ ] Implémenter tables root taaazzz, , , , , , , , .
- [ ] Importer catalogue Pokémon initial (script ETL depuis PokeBuild).
- [ ] Mettre en place journaux/monitoring (Winston + Prometheus).

## Phase 2 – Backend Gameplay
- [ ] Exposer simulateur de combat ().
- [ ] API Mode Libre ().
- [ ] API Mode Survie (, , ).
- [ ] API Mode Tournoi (, , ).
- [ ] API Mode Arène (, , ).
- [ ] API Boutique (, ).
- [ ] Services centres (évolution, entrainement, personnalisation).
- [ ] Gestion progression (XP, milestones, achievements).

## Phase 3 – Frontend Fondation
- [ ] Installer framework SPA (React + Router) ou renforcer architecture ES.
- [ ] Mettre en place store global ( pour types).
- [ ] Intégrer charte graphique (, thèmes).
- [ ] Implémenter navigation multi-pages (hub, survie, tournoi, arène, boutique, centres).
- [ ] Intégrer onboarding pack (API réelle).

## Phase 4 – Pages & UX
- [ ] Hub complet (progression, modes, événements).
- [ ] Mode Libre (sélecteur équipe, adversaire, combat).
- [ ] Mode Survie (roster, intermission, scoreboard, boutique rapide).
- [ ] Mode Tournoi (brackets, historique, récompenses).
- [ ] Mode Arène (builder, matchmaking, classement).
- [ ] Boutique (catalogue, panier, paiement).
- [ ] Centres (évolution, entrainement, personnalisation, progression, succès).
- [ ] Profil & paramètres (sécurité, préférences, thèmes).

## Phase 5 – QA & Release
- [ ] Tests unitaires/intégration backend.
- [ ] Tests frontend (Storybook, Cypress/Playwright).
- [ ] Scénarios e2e (auth, run survie, achat boutique).
- [ ] Tests de charge (simulateur, Survie, Tournoi).
- [ ] Audit sécurité (OWASP Top 10).
- [ ] CI/CD complet (staging, prod, rollback).
- [ ] Documentation utilisateur + support.
- [ ] Bêta fermée → corrections → lancement public.

## Phase 6 – Post-MVP (optionnel)
- [ ] PvP temps réel ou Guildes.
- [ ] Contenus saisonniers, passe de combat.
- [ ] Extension mobile native.

> Cette checklist est vivante : chaque agent coche les cases à mesure, et renvoie aux documents , , , .
