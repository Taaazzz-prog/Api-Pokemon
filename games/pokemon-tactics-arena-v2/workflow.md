# Pokemon Tactics Arena v2 – Plan de Travail

## État actuel (06/10/2025)
- Backend rebuild opérationnel (`npm run build`) après réintégration de `pokemon-v2` et réalignement des services `roster`, `currency`, `shop` avec Prisma (TeamPreset/TeamMember, transactions).
- Migrations Prisma incomplètes : `20241004_init` s’arrête au milieu ; seed non fonctionnel (clé composite erronée).
- Routes API Express opérationnelles : roster, boutique, starter pack, statistiques arène (combats IA rapides), tournois et survie basiques. Les fonctionnalités temps réel/restants viendront compléter ce socle.
- Frontend build Vite OK (Rollup réinstallé). Les pages critiques (dashboard, roster, boutique) s’appuient désormais uniquement sur les API réelles ; les écrans avancés affichent un message en attendant la mise à disposition des endpoints correspondants.
- Docker compose de référence appelle Traefik/monitoring inexistant ; stack complète non testée.
- Documentation historique (`INTEGRITY_REPORT.md`, etc.) surestime l’avancement (mocks encore présents).

## À faire en priorité
1. **Backend**
   - compléter migrations Prisma ou convertir `complete_database_structure.sql` en migrations cohérentes ; corriger la seed.
   - brancher toutes les routes dans `server.ts`, supprimer la duplication PrismaClient dans les services.
   - valider les services remaniés (roster/shop/currency) par des tests unitaires (Vitest).
2. **Frontend**
   - finaliser builder/combat (page Battle) une fois la simulation backend livrée ; ajouter tests d’intégration (starter pack, arène, survie, boutique).
   - optimiser le bundle (code splitting) et préparer des tests UI automatisés.
   - poursuivre l’amélioration UX (classements temps réel, feedbacks visuels).
3. **Intégration**
   - écrire tests bout-en-bout (auth → starter pack → roster → shop) et tests API.
   - simplifier Docker compose (MySQL + backend + frontend) avant de réintroduire Traefik/monitoring.
   - maintenir `INTEGRITY_REPORT.md` / `PHASE4_CLEANUP_PROGRESS.md` en phase avec l'état réel.

## Suivi long terme
- Refactor complet des services Arena/Tournoi/Survie pour matcher le modèle Prisma actuel (ou adapter le modèle).
- Générer et documenter les contrats API (`packages/contracts`).
- Revoir `deploy.sh` (scripts `prisma:migrate:deploy`, `data:import` inexistants).
- Installer une stratégie QA (tests automatiques, coverage, pipeline CI) et une stack monitoring réelle.
