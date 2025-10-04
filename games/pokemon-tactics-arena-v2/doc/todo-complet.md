# TODO Complet – Refonte Pokemon Tactics Arena

## Phase 0 – Préparation & Architecture
1. **Cadrage fonctionnel**
   - Valider le périmètre MVP (modes Libre, Survie, Tournoi, Boutique, Arène) et les fonctionnalités différées.
   - Définir les KPIs (rétention, progression moyenne, temps de run, taux d achat).
2. **Architecture technique**
   - Choisir l empilement final :
     - Frontend SPA (ex. React + Vite) ou modularisation ES6 actuelle.
     - Backend (Node/Express ou Nest) et bases de données (PostgreSQL + Redis).
   - Rédiger les conventions de nommage, structure de repo mono ou multi.
3. **Environnements & CI/CD**
   - Configurer Docker Compose (web, api, db, cache).
   - Mettre en place la pipeline (lint, tests, build, déploiement staging).
4. **Sécurité & conformité**
   - Définir la stratégie d authentification (JWT + refresh, OAuth optionnel).
   - Rédiger la politique RGPD (stockage des données utilisateurs).

## Phase 1 – Backend Fondations
1. **Schéma de données**
   - Implémenter les tables décrites dans `domain-model.md` (users, pokemons, rosters, battles, inventory, purchases, achievements, events, leaderboards).
   - Ajouter les index/contraintes (unicité email, FK cascade).
2. **Services de base**
   - Authentification (inscription, connexion, refresh, reset password).
   - Gestion profil (avatar, pseudo, paramètres).
   - Catalogue Pokémon (import initial depuis PokeBuild + enrichissement custom).
3. **Progression & économie**
   - Service XP/niveaux + table milestones.
   - Service monnaie (PokeCredits, PokeGems) + ledger transactions.
4. **Gestion des rosters et équipes**
   - API pour obtenir roster débloqué, tirer un pack, verrouiller une équipe, sauvegarder un preset.
5. **Logs & monitoring**
   - Centraliser logs (Winston/ELK), métriques (Prometheus/Grafana), alertes.

## Phase 2 – Backend Gameplay
1. **Simulateur de combat service**
   - Exposer une API pour simuler un match (entrées : équipes, règles; sorties : log, résultat, stats).
   - Gérer seeds pour replays.
2. **Mode Libre API**
   - Génération d adversaires, enregistrement des résultats, récompenses XP.
3. **Mode Survie API**
   - Générateur de vagues, sauvegarde du run (pause, abandon), récompenses paliers, drop de cartes.
4. **Mode Tournoi API**
   - Brackets, matchmacking IA/joueurs, phases, récompenses.
5. **Mode Arène (PvP asynchrone)**
   - Soumission d équipe, sélection d adversaires, calcul de classement Elo.
6. **Boutique & monnaies réelles**
   - Catalogue rotatif, achats (PokeCredits/PokeGems), intégration paiement (Stripe) – sandbox.
7. **Centres spécialisés**
   - Évolution (consommation de ressources), entrainement (temps ou ressources), personnalisation, progression, succès.
8. **Événements & LiveOps**
   - Modèle d événement, taches planifiées (cron), récompenses, notifications.

## Phase 3 – Frontend Fondations
1. **Refonte UI/UX**
   - Design system (couleurs, composants, typographie, icônes).
   - Layout responsive (desktop, tablette, mobile).
2. **Routage & état global**
   - Installer Router (SPA) ou renforcer modules ES existants.
   - État global (Redux/RTK, Zustand ou service maison) synchronisé avec l API.
3. **Services utilitaires**
   - Client API (fetch wrappers, interceptors auth, gestion erreurs).
   - Gestion localStorage (cache roster, préférences) synchronisée avec backend.
4. **Authentification UI**
   - Écrans Inscription, Connexion, Reset, rappel 2FA (optionnel).
   - Garde de routes (PrivateRoute) et redirections.

## Phase 4 – Frontend Pages & Modules
1. **Accueil / Hub**
   - Widget progression, news, accès modes, CTA boutique.
   - Onboarding pack (intégrer API réellement).
2. **Mode Libre**
   - Sélecteur équipe, adversaire, match UI, logs.
3. **Mode Survie**
   - Gestion roster, intermission, boutique rapide, scoreboard en temps réel.
4. **Mode Tournoi**
   - Bracket interactif, historique runs, récompenses.
5. **Mode Arène**
   - Deck builder rapide, matchmaking, classement.
6. **Boutique**
   - Catégories (Pokémon, objets, cosmétiques), panier, paiement.
7. **Centres (Entrainement, Évolution, Personnalisation, Progression, Succès)**
   - Interfaces dédiées selon spécifications `pages-spec.md`.
8. **Profil & Paramètres**
   - Avatar, pseudo, préférences UI, liaison compte (email, réseaux, 2FA).

## Phase 5 – QA & Release
1. **Tests**
   - Unitaires (backend, frontend), intégration (API), e2e (Playwright/Cypress).
   - Tests de charge (k6) pour simulateur, Survie, Tournoi.
2. **Optimisation**
   - Perf frontend (code splitting, lazy loading, caching).
   - Lissage balance gameplay (tables bonus, drop rates, XP curve).
3. **Sécurité**
   - Audit (OWASP Top 10), durcissement headers, rate limiting.
4. **Déploiement**
   - Environnements staging/prod, migrations DB automatiques, rollback.
5. **Documentation & support**
   - Guides utilisateur, FAQ, support en jeu.
6. **Lancement**
   - Beta fermée, collecte feedback, ajustements, lancement public.

---
**Remarque** : Chaque phase dépend des artefacts décrits dans `domain-model.md` (contrat de données/API) et `pages-spec.md` (spécifications UI par page).
