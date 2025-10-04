# Conventional Commits

Ce projet utilise la spécification [Conventional Commits](https://www.conventionalcommits.org/) pour standardiser les messages de commit.

## Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Types

- **feat**: Une nouvelle fonctionnalité
- **fix**: Une correction de bug
- **docs**: Changements dans la documentation uniquement
- **style**: Changements qui n'affectent pas le sens du code (white-space, formatting, etc.)
- **refactor**: Un changement de code qui ne corrige ni bug ni ajoute de fonctionnalité
- **perf**: Un changement de code qui améliore les performances
- **test**: Ajout de tests manquants ou correction de tests existants
- **chore**: Changements dans le processus de build ou les outils auxiliaires

## Scopes

- **api**: Backend API
- **ui**: Interface utilisateur
- **db**: Base de données
- **auth**: Authentification
- **game**: Logique de jeu
- **shop**: Boutique
- **battle**: Système de combat

## Exemples

```bash
feat(api): add user authentication with JWT
fix(ui): correct button alignment in combat interface
docs: update API documentation for battle endpoints
style(ui): format combat scene components
refactor(game): simplify damage calculation logic
perf(db): optimize Pokemon queries with indexes
test(api): add unit tests for auth middleware
chore: update dependencies
```

## Breaking Changes

Pour les breaking changes, ajoutez `BREAKING CHANGE:` dans le footer ou `!` après le type/scope :

```bash
feat(api)!: change battle result payload structure
```

## Configuration automatique

Utilisez [Commitizen](https://github.com/commitizen/cz-cli) pour des commits guidés :

```bash
npm install -g commitizen
npm install -g cz-conventional-changelog
echo '{ "path": "cz-conventional-changelog" }' > ~/.czrc
```

Puis utilisez `git cz` au lieu de `git commit`.