# Rapport d'intégrité – Pokemon Tactics Arena v2

**Date** : 6 octobre 2025  
**Statut** : ⚠️ En cours de stabilisation (socle back/front fonctionnel, modules avancés à livrer)

---

## Synthèse
- ✅ Backend TypeScript compile et expose les routes `/api` (roster, boutique, starter pack, statistiques arène, tournois de base, survie) basées sur Prisma.
- ✅ Migrations et seed Prisma créent les tables compatibles (`pokemon`, `user_roster`, `team_presets`, `tournaments`, `survival_runs`, etc.) et insèrent un jeu de données minimal (3 starters, shop de base, utilisateur `test@pokemon.com`).
- ✅ Frontend Vite compile. Les pages **Dashboard**, **Roster**, **Boutique** consomment exclusivement les API réelles. 
- ⚠️ Les écrans avancés (**Arena**, **Battle**, **Team Builder**, **Survival**, **Tournois**) sont placés en mode "fonctionnalité à venir" (pas d'API temps réel ni de simulation côté serveur).
- ⚠️ Aucun pipeline de tests e2e/CI. Pas de monitoring opérable (compose Traefik/Grafana toujours manquant).

---

## Backend
- Prisma `schema.prisma` aligné sur la base MySQL : `npx prisma validate` ✅
- `prisma/migrations/20241004_init/migration.sql` = export complet du schéma ; à appliquer avec `prisma migrate deploy`.
- `prisma/seed.ts` : crée types Pokémon, starters (1/4/7), items boutique (`starter_pack`, `credit_bundle_small`) et utilisateur de test.
- Routes Express :
  - `/api/roster` (listing + update nickname) → `rosterService`
  - `/api/shop` → `shopService` (Prisma + transactions)
  - `/api/starter-pack` → flag profil + starters
  - `/api/arena` → stats/rankings dérivés des profils (queue désactivée pour l’instant)
  - `/api/tournaments` → CRUD minimal (stockés en JSON)
  - `/api/survival` → start/end de run (stock JSON)
- Services hérités obsolètes supprimés (`tournament.service.ts`, `real*` côté front). Reste à implémenter la logique métier avancée (matchmaking, brackets dynamiques, récompenses).

## Frontend
- Contexte utilisateur : plus de mode "offline" ; refresh via `/auth/me` + starter pack piloté par l’API (`/starter-pack/status|apply`).
- Hooks `useGameServices` : roster/boutique utilisant `apiClient`.
- Pages :
  - Dashboard → stats réelles + bouton starter pack (si non reçu)
  - Roster → données Prisma (sprites, surnoms, pagination à implémenter)
  - Boutique → `/shop/catalog` + `/shop/purchase`
  - Écrans avancés → composant `FeaturePlaceholder` expliquant la roadmap
- Pages mockées supprimées (`ShopPage`, builder/combat sur données locales, services `pokemonGameService`, `realArenaService`, etc.).

---

## Actions prioritaires restantes
1. **Compléter la logique gameplay** : livrer l’arène (queue + combats), tournois (structuration des matches), survie (vagues/récompenses) et exposition temps réel. Les placeholders front devront alors consommer ces API.
2. **QA & Ops** : écrire des tests unitaires/API/E2E, simplifier `docker-compose.yml` (ou fournir Traefik/Grafana manquants), ajouter scripts d’initialisation (`npm run migrate`, `npm run seed`).
3. **Documentation** : synchroniser `PHASE4_CLEANUP_PROGRESS.md`, `INTEGRATION_SUCCESS.md`, et publier un guide de démarrage (migration + seed + comptes par défaut).

---

## Commandes utiles
```bash
# Depuis games/pokemon-tactics-arena-v2/backend
env DATABASE_URL="mysql://user:pass@localhost:3306/db" npx prisma migrate deploy
npx prisma db seed --preview-feature # ou npm run seed (à ajouter dans package.json)

# Lancer API (après `npm install`)
npm run build && npm run start
```

```bash
# Frontend (après npm install)
npm run build && npm run preview
```

```bash
# Migrations / diff
env DATABASE_URL=... npx prisma migrate status
env DATABASE_URL=... npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script
```

---

## État général
- **Données mock** : retirées (0%).
- **Fonctionnalités opérationnelles** : Auth, roster, starter pack, boutique, stats arène de base.
- **Fonctionnalités à livrer** : moteur de combat, matchmaking, tournois dynamiques, mode survie complet, monitoring. 
- **Tests & CI** : à construire (actuellement aucun scénario automatisé).
