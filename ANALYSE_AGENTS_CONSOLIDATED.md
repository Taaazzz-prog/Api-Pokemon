# Rapport consolide d'analyse - agents.md

_Mise a jour du 6 octobre 2025 pour refléter l'etat reel du depot._

---

## Fichiers sources audites

- `games/pokemon-tactics-arena-v2/agents.md`
- `games/pokemon-tactics-arena-v2/doc/agents.md`

Le present rapport conserve les informations valides des deux fichiers et corrige les ecarts constates lors de l'audit du code et de l'infrastructure.

---

## Synthese par phase

| Phase | Intention initiale | Etat observe | Points a corriger en priorite |
| ----- | ------------------ | ------------ | ----------------------------- |
| Phase 0 - Infrastructure | Docker, Traefik, MySQL, Redis, CI | **Partiel.** Docker compose reference des services manquants (dossiers `./monitoring/*`, reseau `traefik` externe). Les builds backend/front fonctionnent mais l'API expose uniquement un message statique. CI presente mais non verifiee. | Fournir les fichiers Traefik/monitoring, revoir la configuration compose et valider un cycle build/test complet. |
| Phase 1 - Backend foundation | Auth, Prisma, logging | **Incomplet.** AuthService existe mais `server.ts` n'enregistre aucune route, la migration Prisma bundlee ne cree que trois tables, la seed ne correspond pas au schema. | Brancher `routes/api.ts`, reviser migrations/seed pour etre utilisables, ajouter tests reels. |
| Phase 2 - Backend gameplay | Combat simulator, services shop/roster/arena | **Partiel.** Logique metier presente mais depend de tables inexistantes et de donnees in-memory (shopItems). | Relier les services a la base revisee et ajouter des tests. |
| Phase 3 - Frontend foundation | React, Router, Query, Tailwind | **Present.** L'app tourne avec Vite mais s'appuie sur des services `real*` qui manipulent `localStorage` et simulent les reponses. | Remplacer les services simulés par des appels API et supprimer les placeholders. |
| Phase 4 - UX & modes | Pages multiples, centres specifiques, animations | **60 %** environ. Plusieurs pages existent, mais les centres (evolution, progression, succes, etc.) et les modes Survie/Tournoi restent incomplets, sans integration backend. | Completer les pages manquantes et lier aux API reelles. |
| Phases 5-7 - Qualite & live | Tests, monitoring, live ops | **Non commence.** Aucun test e2e ni dossier monitoring exploitable. | Definir la strategie QA et fournir les assets manquants. |

Score revise: **45/100** (contre 75 annonce). Le socle est present mais non operationnel en production.

---

## Etat de la base de donnees

- Fichier fourni: `complete_database_structure.sql` (514 lignes) au niveau racine.
- Le script cree bien 15 tables et ajoute vues/triggers, mais **ne correspond pas** au schema Prisma actuel:
  - Colonnes et enums differentes (`national_id` vs `pokemon_id`, valeurs ENUM en minuscules).
  - Index JSON (`INDEX idx_types (CAST(types AS CHAR(255) ARRAY))`) invalides en MySQL 8.
  - Triggers `update_profile_after_battle` utilisent `total_battles` et `total_victories` sans tenir compte de la logique Prisma.
  - Les tables `shop_items`, `events`, `user_achievements` ne sont referencees par aucun code backend.
- Recommendation: soit adapter le schema Prisma au script complet, soit convertir ce script en migrations Prisma coherentes. Dans l'etat, l'execution dans Docker echouera.

---

## Backend (Node/Express)

- `backend/src/server.ts` (lignes 58-77) monte uniquement une route `/api/v1` statique. Les routes detaillees (`backend/src/routes/api.ts`) ne sont jamais referencees.
- La migration Prisma `backend/prisma/migrations/20241004_init/migration.sql` s'interrompt ligne 58 sur `-- Add remaining tables`. Les autres tables ne sont pas creees.
- `backend/prisma/seed.ts` utilise une cle composite `userId_pokedexId_nickname` qui n'existe pas dans le schema (`@@unique([userId, pokemonId])`). La seed echoue.
- Plusieurs services (shop, roster, arena, tournament) supposent des tables et donnees inexistantes.

**Actions immediates**
1. Brancher `routes/api.ts` dans `server.ts` et verifier chaque endpoint.
2. Regenerer les migrations Prisma a partir du schema reel ou synchroniser le schema avec `complete_database_structure.sql`.
3. Corriger la seed et ajouter des tests automatises (vitest) pour Auth et Services.

---

## Frontend (React/Vite)

- Les services dits "reels" (`frontend/src/services/realUserService.ts`, `realShopService.ts`, `pokemonGameService.ts`) s'appuient sur `localStorage` et sur des listes statiques (`realPokemonData.ts` ne couvre que 23 Pokemon).
- Les pages `BattlePage.tsx`, `TeamBuilderPage.tsx`, `ShopPageReal.tsx` chargent des images via `/api/placeholder/...` en cas d'erreur: il reste donc des placeholders.
- Aucun flux n'appelle l'API backend en production (pas de configuration TanStack Query vers l'API).

**Actions immediates**
1. Rebrancher les services vers les routes Express une fois corrigees.
2. Replacer les placeholders par des URLs reelles (CDN ou assets locaux complets).
3. Ajouter des tests de rendu et d'integration basiques.

---

## Docker & infrastructure

- `docker-compose.yml` reference:
  - un reseau externe `traefik` non fourni;
  - des volumes `./monitoring/prometheus.yml` et `./monitoring/grafana/*` absents du repo;
  - le backend depend de migrations Prisma incomplètes => container en echec;
  - le frontend est build NGiNX mais ouvre un port 80 tandis que Traefik attend le reseau externe.
- Consequence: `docker-compose up` echoue ou demarre des services inutilisables.

**Actions immediates**
1. Ajouter les fichiers Traefik/Prometheus/Grafana attendus ou retirer ces services du compose pour l'instant.
2. Valider localement `docker compose build && docker compose up` apres correction de la BDD et de l'API.
3. Documenter le processus de seed/migration.

---

## Donnees mock et placeholders

- Backend: `shop.service.ts` construit un tableau `shopItems` in-memory. Aucun chargement depuis la base existante.
- Frontend: `realUserService` simule login/register et genere des tokens type `real-jwt-token-...`.
- Les pages utilisent `/api/placeholder/...` comme fallback d'images.

=> Les mocks persistent et doivent etre remplaces par de vraies donnees/API avant toute mise en production.

---

## Plan d'actions prioritaire (ordre recommande)

1. **Remettre le backend en etat fonctionnel**
   - Brancher les routes, corriger migrations et seed, connecter Prisma a MySQL.
2. **Nettoyer les services frontend**
   - Remplacer les acces localStorage par des appels API, supprimer placeholders.
3. **Stabiliser Docker**
   - Simplifier la stack (MySQL + backend + frontend) puis reintroduire Traefik/monitoring une fois pret.
4. **Etendre la couverture fonctionnelle**
   - Completer Phase 4 (centres, modes) et lancer Phase 5 (tests, QA).

---

Pour toute mise a jour future, veiller a synchroniser le schema de base de donnees, les seeds et les services afin de garantir une source de verite unique.
