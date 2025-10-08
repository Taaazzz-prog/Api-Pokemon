# Phase 4 – Nettoyage des mocks (état 06/10/2025)

## Résumé
- ✅ Tous les services/plans mockés côté frontend supprimés. Les pages reposent soit sur les API Express, soit affichent un placeholder explicitant que la fonctionnalité arrive avec les prochains endpoints.
- ✅ Services backend critiques (`roster`, `shop`, `starter-pack`) réalignés sur Prisma et exposés via `/api`.
- ⚠️ Modules avancés (arène temps réel, tournois dynamiques, survie complète, moteur de combat) restent à implémenter. Les routes fournissent une réponse minimale et ne doivent pas être considérées comme finalisées.
- ⚠️ Le reporting historique (intégrity, succès phase 4) a été mis à jour pour refléter cet état intermédiaire.

## Frontend – État actuel
| Domaine | Statut | Détails |
| --- | --- | --- |
| Dashboard | ✅ | Consomme `/starter-pack` et `/arena/stats`, affiche placeholders roadmap |
| Roster | ✅ | Lecture + changement de surnom via API réelle |
| Boutique | ✅ | Catalogue + achat REST (pas d'ouverture de packs côté client) |
| Arène / Batailles / Survie / Tournois | 🚧 | Placeholder `FeaturePlaceholder` en attendant les endpoints correspondants |

## Backend – État actuel
- `prisma/schema.prisma` validé (`npx prisma validate`).
- Migration initiale `20241004_init` régénérée pour refléter exactement le schéma actuel.
- Seed crée types, starters (1/4/7), boutique minimale et utilisateur test.
- Routes opérationnelles : `/api/roster`, `/api/shop`, `/api/starter-pack`, `/api/arena` (stats/rankings), `/api/tournaments` (CRUD minimal), `/api/survival` (start/end), `/api/v2/pokemon`.
- Routes non encore rattachées : logique avancée arène/tournois/survie (matchmaking, brackets, récompenses temps réel).

## Prochaines étapes
1. Implémenter la logique gameplay manquante côté backend et remplacer les placeholders frontend par les appels API correspondants.
2. Ajouter une campagne de tests unitaires/API/E2E et un script de seed (npm run seed) afin de fiabiliser les environnements.
3. Documenter le démarrage complet (Docker compose simplifié, Traefik/monitoring) et maintenir `INTEGRITY_REPORT.md` à jour.
