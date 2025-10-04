# packages/contracts

Module partagé destiné à exposer les types et schémas communs entre le frontend et le backend.

## Objectifs
- Éviter les divergences de structure (`UserProfile`, `BattleResult`, `ShopItem`, etc.).
- Fournir des validations runtime (Zod/Yup) et des types TypeScript utilisés partout.
- Exporter la documentation OpenAPI/JSON Schema lorsque l API évolue.

## Structure proposée
```
packages/contracts/
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── user.ts
│   │   ├── pokemon.ts
│   │   ├── battle.ts
│   │   ├── shop.ts
│   │   └── achievements.ts
│   └── schemas/
│       ├── user.ts
│       ├── battle.ts
│       └── ...
├── package.json
└── tsconfig.json
```

## Contenu minimum
- Interfaces décrites dans `docs/domain-model.md` (UserSummary, RosterEntry, TeamPreset, Reward, ShopItem, Achievement…).
- Schemas de validation (Zod) pour les payloads API.
- Exports JSON Schema (via `zod-to-json-schema`) pour générer l OpenAPI du backend.

## Usage
- **Frontend** : importer `@pta/contracts` pour typer services API, stores et composants.
- **Backend** : réutiliser les mêmes types pour DTO/réponses (Nest/Express).
- **CI** : vérifier qu aucune modification breaking n est introduite sans bump de version (semantic-release).

> Ce dossier est un squelette ; ajouter package.json, scripts (`build`, `lint`), publication npm ou workspace.
