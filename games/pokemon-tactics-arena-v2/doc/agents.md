# Roadmap Agents – Checklist détaillée

## Phase 0 – Préparation
- [x] Valider périmètre MVP (4 modes de jeu, boutique, 5 centres, progression).
- [x] Confirmer stack backend (Node.js + Express + Socket.io), frontend (Vite + Phaser 3), DB (MySQL 8.0+).
- [x] Configurer référentiel (mono repo avec workspaces : `/backend`, `/frontend`, `/packages/contracts`).
- [x] Mettre en place CI/CD minimal (ESLint, Prettier, tests, build automatique).
- [x] Définir conventions git (conventional commits), PR (templates), code style (Airbnb/Standard).

## Phase 1 – Backend Fondations
- [x] Créer service auth (JWT, sessions sécurisées, refresh tokens, rôles user/admin).
- [x] Implémenter schéma MySQL (users, user_profiles, pokemons, user_roster, team_presets, battles, survival_runs, tournaments, arena_queue, transactions, shop_items, events, achievements, user_achievements).
- [x] Configurer migrations DB (Prisma ou TypeORM avec versioning MySQL).
- [x] Importer catalogue Pokémon initial (script ETL depuis PokeBuild/PokeAPI : pokemon_ref, stats, types, rarity, evolutions).
- [x] Mettre en place journaux/monitoring (Winston pour logs, Prometheus pour métriques).
- [x] Implémenter système de rarité (common, uncommon, rare, epic, legendary) et drop rates pour starter pack.
- [x] Créer système de monnaies (PokeCredits, PokeGems) avec table transactions pour journalisation.
- [x] Créer package partagé `/packages/contracts` (types TypeScript, validation Zod).

## Phase 2 – Backend Gameplay
- [x] Exposer simulateur de combat au tour par tour (API POST /battles, calculs dégâts, types, statuts, IA, seed).
- [x] API Mode Libre (POST /modes/free/match, équipes prédéfinies, matchmaking IA, rewards XP/credits).
- [x] API Mode Survie (POST /modes/survival/start, /next, /abandon : gestion runs, vagues progressives, scoring, leaderboard).
- [x] API Mode Tournoi (POST /modes/tournament/start, /next : génération brackets, stages progression, récompenses finales).
- [x] API Mode Arène (POST /modes/arena/queue, /result : matchmaking PvP avec ELO, classement compétitif, historique).
- [x] API Boutique (GET /shop/catalog, POST /shop/purchase : filtrage par category/rarity, transactions validées, récompenses).
- [x] API Pack Starter (POST /roster/unlock : génération 3 cartes aléatoires, source='starter', drop rates configurables).
- [x] API Roster & Teams (GET /roster, POST /teams, DELETE /teams/{id}, POST /teams/{id}/lock).
- [x] Services Centres : Évolution (POST /evolution/trigger), Entraînement (POST /training/start), Personnalisation (POST /customization/apply).
- [ ] Gestion progression (système XP joueur, niveaux, déverrouillage progressif modes par niveau, milestones, achievements).
- [ ] API Achievements (GET /achievements, POST /achievements/claim : suivi progress, rewards).
- [ ] API Leaderboards (GET /leaderboards/{mode} : classements globaux, filtres par période).

## Phase 3 – Frontend Fondation
- [x] Installer Vite + Phaser 3 (moteur 2D pour cartes, combats tour par tour, animations).
- [x] Configurer Zustand ou Redux (store global : user, roster, teams, currencies, UI states).
- [x] Intégrer charte graphique (tokens CSS `themes.css`, palette néon/tactique, dark/light modes selon `data-theme`).
- [x] Créer système de thèmes (variables CSS, stockage préférence dans `user_profiles.settings.theme`).
- [x] Importer package contracts (types partagés, validation côté client avec Zod).
- [x] Implémenter navigation multi-scènes Phaser (hub, modes, boutique, centres, profil, paramètres).
- [x] Créer scène onboarding interactive (animation ouverture pack starter avec 3 cartes flip, appel POST /roster/unlock).
- [x] Implémenter système de notifications/toasts (coin inférieur droit, variants success/warning/error selon charte).
- [ ] Intégrer sprites Pokémon (CDN PokeBuild avec fallback local/placeholder, champ `image_url` depuis DB).
- [x] Créer composants UI réutilisables (boutons pill gradient, cartes Pokémon semi-opaque avec badges rarity, modales combat).
- [x] Migrer variables globales vers store central (remplacer `window.__pta*` par Zustand/Redux).

## Phase 4 – Pages & UX
- [x] Hub principal (dashboard progression GET /profile, accès rapides modes débloqués, événements GET /events).
- [ ] Mode Libre (sélecteur équipe, lancement POST /modes/free/match, écran résultats avec rewards).
- [ ] Mode Survie (sélection roster 6 Pokémon, POST /modes/survival/start, combat vagues, intermissions upgrades, POST /next, scoreboard GET /leaderboards/survival).
- [ ] Mode Tournoi (visualisation brackets interactifs, POST /modes/tournament/start, combat élimination directe, podium récompenses).
- [x] Mode Arène (team builder drag&drop, POST /modes/arena/queue, affichage ELO/rang, POST /result, historique GET /battles).
- [x] Boutique (catalogue GET /shop/catalog filtrable, affichage cartes avec price_currency/amount, panier, POST /shop/purchase, confirmation transactions).
- [ ] Centre Évolution (liste Pokémon évoluables depuis GET /roster, affichage conditions depuis `evolutions` JSON, POST /evolution/trigger avec animation).
- [ ] Centre Entraînement (sélection Pokémon, POST /training/start, progression XP/stats visuelle avec barres animées).
- [ ] Centre Personnalisation (customisation avatar, profil, skins, POST /customization/apply, prévisualisation temps réel).
- [ ] Centre Progression (dashboard GET /progression/summary : stats, records, graphiques, milestones).
- [ ] Centre Succès (grille GET /achievements, filtres par statut locked/in_progress/completed, POST /achievements/claim).
- [ ] Profil & Paramètres (PATCH /profile : sécurité, préférences UI/audio, sélecteur thèmes, locale, accessibilité).
- [ ] Écran Combat (interface tour par tour, barre HP animée, sélection attaques, log combats depuis `payload.log`, animations dégâts/soins).

## Phase 5 – QA & Release
- [ ] Tests unitaires backend (Jest/Vitest : logique combat, calculs dégâts, drop rates, progression XP, transactions).
- [ ] Tests intégration API (endpoints modes, boutique POST /shop/purchase, centres, validation contracts Zod).
- [ ] Tests frontend (Vitest pour logique UI/stores, Playwright pour e2e scénarios complets).
- [ ] Scénarios e2e critiques (register → onboarding starter → combat libre → achat boutique → évolution → achievement claim).
- [ ] Tests de charge (simulateur POST /battles 100+ simultanés, mode survie concurrence, tournois multiples).
- [ ] Audit sécurité (OWASP Top 10, rate limiting API, validation inputs stricte, protection anti-cheat, JWT expiration).
- [ ] Tests accessibilité (contraste 4.5:1 tokens, navigation clavier, lecteurs écran, mode daltonien).
- [ ] Tests migrations DB MySQL (rollback safe, seed data cohérentes, index optimisés).
- [ ] CI/CD production (environnements staging/prod séparés MySQL, déploiement automatique, rollback rapide).
- [ ] Documentation complète (wiki utilisateur, FAQ, tutoriels vidéo, Swagger/OpenAPI pour API).
- [ ] Bêta fermée (50-100 testeurs ciblés) → collecte feedback structuré → corrections prioritaires → lancement public.

## Phase 6 – Post-MVP (évolutions futures)
- [ ] PvP temps réel (WebSockets pour combat synchrone, lobby matchmaking instantané, gestion latence).
- [ ] Système Guildes/Clans (tables guilds, guild_members, événements coopératifs, partage ressources).
- [ ] Contenus saisonniers (table events avec type='seasonal', pass de combat, récompenses exclusives).
- [ ] Système de quêtes avancé (tables quests, quest_progress, storyline, chaînes quêtes).
- [ ] Mode Spectateur (observer combats en direct via WebSockets, chat spectateur).
- [ ] Système de replay (enregistrement battles payload, revue avec contrôles, partage communauté).
- [ ] Thèmes premium boutique (shop_items category='cosmetic', theme-ember/aurora, particules, sons custom).
- [ ] Extension mobile native (PWA optimisée ou React Native avec sync MySQL cloud).
- [ ] Intégration réseaux sociaux (partage achievements, classements publics, OAuth Discord/Twitter).
- [ ] Mode hors ligne (sauvegarde locale IndexedDB, synchronisation auto reconnexion).
- [ ] Statistiques avancées (analytics détaillées, meta-game trends depuis battles payload, recommendations IA).
- [ ] Système coaching IA (suggestions stratégiques, analyse équipe via ML, tips personnalisés).
- [ ] Événements communautaires (défis globaux, votes joueurs, contenu généré utilisateurs).
- [ ] Mode Photo (capture Pokémon/équipes, filtres, partage social).
- [ ] Support multilingue complet (i18n, traductions communautaires via user_profiles.locale).
- [ ] Soft-delete généralisé (deleted_at sur toutes tables, archivage données RGPD).

> **Note importante** : Cette checklist est vivante et évolutive. Chaque agent coche les cases au fur et à mesure de l'avancement. Pour plus de détails, se référer aux documents `SPECIFICATION.md`, `ARCHITECTURE.md`, `DOMAIN_MODEL.md`, `API_DOCS.md`, et `STYLE_GUIDE.md`.