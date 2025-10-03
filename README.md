# Pokémon Workspace

Ce dépôt est désormais organisé en deux espaces distincts :

| Dossier | Contenu |
| --- | --- |
| `site/` | Application Pokédex existante (fichiers d’origine déplacés tels quels). Lancez le serveur statique depuis ce dossier pour conserver les chemins relatifs. |
| `games/pokemon-tactics-arena/` | Prototype du jeu « Pokémon Tactics Arena » construit à partir des spécifications `docs/POKEMON-TACTICS-ARENA.md`. |

## Démarrer

### Pokédex (site)
```bash
cd site
python -m http.server 8000
# ou tout autre serveur statique
```

### Pokémon Tactics Arena
```bash
cd games/pokemon-tactics-arena
python -m http.server 8000
# puis rendez-vous sur /games/pokemon-tactics-arena/
```
- Bouton `Equipe evolutive` pour garantir des Pokémon evolutifs.
- Panneau de progression et centre d'evolution interactif.

## Documentation
- `site/docs/` : documents historiques du Pokédex (structure, roadmap, etc.).
- `site/docs/mini-jeux.md` : idées de mini-jeux validées avec les routes disponibles.
- `docs/POKEMON-TACTICS-ARENA.md` : cahier des charges utilisé pour implémenter le nouveau jeu.

## Tests
Les tests Node existants pour le Pokédex fonctionnent toujours :
```bash
cd site
node tests/run-tests.js
```
