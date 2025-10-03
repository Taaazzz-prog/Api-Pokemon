# Pokemon Tactics Arena

Prototype de combat tactique au tour par tour reposant sur l API PokeBuild.

## Lancer le prototype

1. Depuis ce dossier :
   ```bash
   python -m http.server 8000
   ```
2. Ouvrir [http://localhost:8000/games/pokemon-tactics-arena/](http://localhost:8000/games/pokemon-tactics-arena/).

## Fonctionnalites
- Generation d une equipe equilibree pour le joueur (`GET /api/v1/random/team/suggest`).
- Bouton `Equipe evolutive` pour recruter des Pokemon garantis evolutifs (pool ajustee selon les generations debloquees).
- Generation d une equipe adverse aleatoire (`GET /api/v1/random/team`).
- Progression persistante : XP, niveau, meilleures series, evolutions (stockees dans `localStorage`).
- Milestones : debloquent nouvelles generations (niveaux 5, 10, 15) et modes (Survie niveau 12, Tournoi niveau 20).
- Centre d evolution : apres une victoire, les evolutions possibles sont proposees et peuvent etre acceptees ou ignorees (`GET /api/v1/pokemon/{id}`).
- Modes supplementaires :
  - **Survie** (lvl >= 12) : trois vagues successives, bonus XP en fin de run.
  - **Tournoi** (lvl >= 20) : trois manches (quart, demi, finale) avec bonus de champion.
- Simulation de combat : ordre par vitesse, degats inspires de la formule officielle, multiplicateurs de type (`apiResistances`), journal detaille.
- Anti-farming : XP reduite en cas de combats repetes contre la meme equipe.
- Boutons pour rafraichir les equipes, lancer un combat, reinitialiser le journal, reinitialiser la progression.

## Structure
````
pokemon-tactics-arena/
├── index.html             # Layout principal
├── styles/main.css        # Habillage visuel (progression, centre d evolution, toasts...)
├── src/
│   ├── api/pokebuild.js        # Appels a l API PokeBuild & pools evolutifs
│   ├── battle/battle-engine.js # Simulation de combat
│   ├── battle/evolution-manager.js # Evolution interactive
│   ├── battle/type-effectiveness.js # Multiplicateurs de type
│   ├── state/progression.js   # XP, niveaux, milestones, anti-farm
│   ├── ui/evolution-panel.js  # Centre d evolution
│   ├── ui/notifications.js    # Toasts
│   ├── ui/renderers.js        # Rendu DOM (progression, equipes...)
│   └── app.js                 # Logique principale + modes de jeu
```

## Prolongements possibles
- Ajouter un systeme de merites / boutique pour acheter des bonus.
- Introduire des capacites speciales et etats alters via de nouvelles routes API.
- Sauvegarder et partager des equipes via localStorage ou un backend dedie.
