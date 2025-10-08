# Intégration des données – état 06/10/2025

La phase de nettoyage a supprimé toutes les dépendances mock. Le projet fonctionne désormais sur :

- **Backend Prisma** (migrations + seed) fournissant les tables `pokemon`, `user_roster`, `team_presets`, `tournaments`, `survival_runs`, `shop_items`, `transactions`, etc.
- **Endpoints REST** : roster, boutique, starter pack, statistiques d’arène, tournois et survie (versions minimales).
- **Frontend** : Dashboard, roster et boutique consomment les API réelles ; les écrans avancés affichent un message "en cours" en attendant leurs endpoints.

## Ce qui a changé depuis la première intégration
- Les fichiers statiques (`realPokemonData.ts`, `pokemonGameService.ts`, `realArenaService.ts`, etc.) ont été supprimés. Les données proviennent désormais exclusivement du backend.
- Les pages qui n’ont pas encore de support API (combat temps réel, tournois complets, survie avancée) affichent un `FeaturePlaceholder` pour indiquer la roadmap.
- Le starter pack est géré par `/api/starter-pack/info|apply` et répercute les starters côté Prisma.

## Données actuellement semées
Le seed installe :
- 3 Pokémon de départ (Bulbizarre, Salamèche, Carapuce) avec leurs types et sprites PokeAPI.
- Un utilisateur de test `test@pokemon.com` (mot de passe `test123`).
- Deux entrées de boutique (`starter_pack`, `credit_bundle_small`).

## À venir
- Implémentation complète des services arène/tournoi/survie (matchmaking, brackets, récompenses, logique combat).
- Migration de masse du Pokédex (via script d’import PokeAPI) si nécessaire.
- Tests automatisés et pipeline CI.
