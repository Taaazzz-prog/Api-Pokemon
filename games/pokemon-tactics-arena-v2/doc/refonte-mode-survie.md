# Refonte Pokemon Tactics Arena — Vision Produit

## Objectifs prioritaires
- Transformer le mode Survie en run infini à difficulté croissante.
- Offrir au joueur un véritable contrôle de son escouade via un éditeur d'équipe persistant.
- Introduire une économie de jeu (monnaie, boutique, récompenses par paliers) pour soutenir la rejouabilité.
- Réorganiser l'interface autour de plusieurs pages/modes dédiés afin de préparer de futures fonctionnalités (tournoi, boutique, hub, etc.).

## Mode Survie 2.0 — règles de jeu
- **Accès** : reste déverrouillé au niveau 12.
- **Structure d'un run** :
  - Vagues infinies jusqu'à défaite, montée de difficulté inspirée d'une courbe logarithmique (buff stats + meilleures équipes).
  - Après chaque vague remportée : phase d'intermission pour soigner, évoluer, acheter des bonus ou ajuster l'équipe.
  - Tous les 5 paliers, récompense majeure (cristaux, Pokémon rare, skin) + sauvegarde de progression dans un leaderboard local.
- **Gestion des équipes adverses** :
  - Génération initiale basée sur 'fetchRandomTeam'; à partir de la vague 5, utiliser un pool pondéré ('fetchBalancedTeam', équipes évolutives, légendaires rares).
  - Buff dynamique : multiplicateur appliqué aux HP/Attaque/Défense selon la vague.
- **Récompenses** :
  - Monnaie fictive (nom provisoire : 'PokeCredits') gagnée à chaque vague.
  - Bonus additionnels aux paliers 5/10/15…
  - XP de progression classique maintenue mais plafonnée pour éviter le farm rapide.
- **Meta progression** :
  - Meilleure vague atteinte conservée ('survival.bestWave').
  - Historique des runs avec date, équipe utilisée, récompenses collectées.

## Équipes personnalisées
- **Roster** :
  - Catalogue personnel alimenté par les récompenses (loot, boutique, succès).
  - Enregistrement local (localStorage) dans un premier temps, prévu pour être migré vers un backend.
- **Éditeur** :
  - Page dédiée permettant de sélectionner 3 à 6 Pokémon, verrouiller un slot, appliquer objets/consommables.
  - Validation sur la base de ressources disponibles (monnaie, Pokémon possédés).
  - Export/import JSON local pour partager des builds.
- **Intégration modes** :
  - Le joueur choisit entre son équipe personnalisée ou une équipe générée.
  - Survie utilise systématiquement l'équipe personnalisée (avec possibilité de draft en cours de run).

## Économie & Boutique
- **Monnaies** :
  - 'PokeCredits' (gagnée in-game) ; 'PokeGems' (premium, optionnelle).
- **Boutique** :
  - Onglets : Pokémon rares, consommables (potions, boost stats), cosmétiques.
  - Stock rotatif quotidien ; rareté influençant le prix.
  - Utilisation initiale uniquement avec 'PokeCredits' (pas de transaction réelle pour la première version).
- **Inventaire** :
  - Gestion simple (liste d'objets/Pokémon possédés) ; structure JSON prévue pour extension.

## Architecture Front — multi-pages
- **Hub principal** : vue centrale regroupant progression, accès aux modes (Libre, Tournoi, Survie, Boutique, Équipe), messages.
- **Page Survie** : interface dédiée au run (statut vague, journal, intermission, boutique in-run).
- **Page Tournoi** : bracket détaillé, historique des titres, récompenses spécifiques.
- **Page Gestion d'équipe** : éditeur, inventaire, import/export.
- **Page Boutique** : achats de Pokémon/objets/cosmétiques (hors-run).

### Répartition technique
- 'app/' : nouveaux fichiers HTML par page.
- 'src/' segmenté en modules : 'core/' (API, progression, état global, économie), 'modes/' (survie, tournoi, libre), 'ui/' (renderers spécifiques, composants partagés, routeur léger si SPA).
- Chargement via ES Modules ; introduction d'un fichier 'bootstrap.js' par page pour instancier les modules nécessaires.

## Étapes de livraison (versionnement interne)
1. **Design & docs** (en cours) : valider règles Survie, économie, structure UI.
2. **Scaffolding multi-pages** : générer les squelettes HTML + navigation de base + routeur léger.
3. **Prototype Survie 2.0** : implémenter la nouvelle boucle (vagues illimitées, scoreboard local, paliers de récompense).
4. **Éditeur d'équipe** : stockage local, UI simple, intégration Survie.
5. **Économie MVP** : PokeCredits, boutique simplifiée, inventaire.
6. **Refonte Tournoi & autres modes** : alignement sur la nouvelle architecture.
7. **Backend / sync (optionnel)** : préparer API (mock) pour comptes, achats premium, leaderboards en ligne.

## Questions ouvertes / hypothèses
- Gestion des légendaires : loot aléatoire ou achat boutique ?
- Interop avec progression existante (XP, niveaux) : conserver ou recalculer ?
- Besoin futur de multijoueur / classement en ligne ?
- Que faire des modes existants (Libre) : rester sur la même page ou migrer vers le hub ?

---
Ce document sert de référence initiale pour la refonte. Les sections seront détaillées au fil des sprints (scénarios UX, wireframes, spéc techniques).
