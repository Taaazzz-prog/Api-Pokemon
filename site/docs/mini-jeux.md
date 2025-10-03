# Idees de Mini-Jeux Pokemon

Ce fichier recense des prototypes realisables en s appuyant exclusivement sur les routes confirmees dans `liste_route.md` et sur le schema JSON retourne par l API PokeBuild.

## Routes disponibles (synthese)
- `GET api/v1/pokemon` et `api/v1/pokemon/limit/{n}` : liste complete ou tronquee des Pokemon (stats, types, resistances, evolutions...).
- `GET api/v1/types` : catalogue des 18 types.
- `GET api/v1/pokemon/{id|nom}` et `api/v1/pokemon/{nom}/ability/{ability}` : fiche detaillee, avec variations de resistances selon la capacite.
- Filtres : `/pokemon/generation/{id}`, `/pokemon/type/{type}`, `/pokemon/types/{type1}/{type2}`, `/pokemon/type/(double-){weakness|resistance}`, `/pokemon/type/immunity/{type}`.
- `GET api/v1/random/team` et `api/v1/random/team/suggest` : equipes aleatoires (respectivement brutes ou equilibrees) renvoyees sous forme de liste de Pokemon complets.
- `POST api/v1/team/defensive-coverage` : evaluation des resistances globales d un tableau d IDs (format attendu : JSON array simple).
- `POST api/v1/team/suggestion` : propositions pour completer une equipe partielle (3 a 5 IDs).

Toutes les idees ci-dessous ont ete verifiees contre ces routes et sont donc realisables sans donnees additionnelles.

## Jeu 1 - Duel des Types
- **But** : choisir le Pokemon le plus resistant au type offensif pioche.
- **Routes** : `/pokemon/type/{type}`, `/pokemon/type/double-resistance/{type}`, `/pokemon/type/weakness/{type}` (fallback double si la liste est vide).
- **Donnees** : `apiTypes`, `apiResistances` (damage_multiplier, damage_relation).
- **Mecanique** : tirer un type, afficher trois Pokemon, noter selon la meilleure relation (twice_resistant > resistant > neutral > vulnerable).
- **Faisabilite** : OK.

## Jeu 2 - Course Vitesse
- **But** : cliquer le Pokemon au `speed` maximal avant expiration du timer.
- **Routes** : `/pokemon/limit/{n}` ou `/pokemon/type/{type}` pour varier le pool.
- **Donnees** : `stats.speed`, `image`.
- **Mecanique** : temps de reaction, niveaux plus durs avec plus de cartes ou un chrono plus court.
- **Faisabilite** : OK.

## Jeu 3 - Puzzle Evolution
- **But** : remettre dans l ordre une chaine evolutive.
- **Routes** : `/pokemon/{id}`, `/pokemon/generation/{gen}` pour tirer un groupe coherent.
- **Donnees** : `apiEvolutions`, `apiPreEvolution`, `image`.
- **Mecanique** : drag and drop ou selection sequentielle, bonus si ID correct.
- **Faisabilite** : OK.

## Jeu 4 - Quiz Multi Generations
- **But** : deviner la generation avec un minimum d indices.
- **Routes** : `/pokemon/{nom}`, `/pokemon/generation/{gen}`.
- **Donnees** : `apiGeneration`, `apiTypes`, `stats`, `sprite`.
- **Mecanique** : silhouettes -> types -> statistique cle, score inversement proportionnel au nombre d indices utilises.
- **Faisabilite** : OK.

## Jeu 5 - Chasse aux Sprites
- **But** : memory associant sprite et artwork officiel.
- **Routes** : `/pokemon/limit/{n}`, `/random/team`.
- **Donnees** : `sprite`, `image`, `name`.
- **Mecanique** : plateau de paires, compteur de 60 secondes.
- **Faisabilite** : OK.

## Jeu 6 - Defi des Statistiques Secretes
- **But** : retrouver une stat masquee a partir des autres valeurs.
- **Routes** : `/pokemon/limit/{n}`.
- **Donnees** : `stats` complet.
- **Mecanique** : proposer trois fourchettes ou demander la valeur exacte, combos si reussites consecutives.
- **Faisabilite** : OK.

## Jeu 7 - Coach Defensif
- **But** : optimiser la couverture d une equipe en exploitant les routes `team`.
- **Routes** : `POST /team/defensive-coverage`, `POST /team/suggestion`.
- **Donnees** : champ `result` (balanced, vulnerable, etc.) et Pokemon suggeres (objets complets).
- **Mecanique** : le joueur selectionne 3 Pokemon, visualise le radar de resistances, accepte/refuse les suggestions jusqu a obtenir un statut balanced.
- **Faisabilite** : OK (format JSON array teste et valide).

## Jeu 8 - Draft de Couverture
- **But** : construire une escouade equilibree avec un nombre limite de rerolls.
- **Routes** : `GET /random/team/suggest` (6 Pokemon equilibres), `POST /team/defensive-coverage` pour verifier les rerolls, `GET /random/team` pour les remplacements.
- **Donnees** : Pokemon complets dans la reponse et evaluation defensive en temps reel.
- **Mecanique** : partir de l equipe equilibree, autoriser X echanges; score selon le nombre d essais necessaires pour rester balanced.
- **Faisabilite** : OK (route observee : liste imbriquee contenant 6 Pokemon complets).

## Jeu 9 - Radar des Faiblesses
- **But** : choisir le Pokemon qui comble la faiblesse d un duo impose.
- **Routes** : `POST /team/defensive-coverage` pour mesurer la faiblesse, `POST /team/suggestion` pour obtenir la meilleure option, `/pokemon/type/{type}` pour alimenter la liste de candidats.
- **Donnees** : suggestions et evaluation defensive.
- **Mecanique** : deux Pokemon imposes, selection d un troisieme, comparaison avec la suggestion officielle, bonus si concordance.
- **Faisabilite** : OK.

## Jeu 10 - Laboratoire des Capacites
- **But** : comprendre l impact d une capacite speciale sur les resistances.
- **Routes** : `GET /pokemon/{nom}` (baseline) et `GET /pokemon/{nom}/ability/{ability}` (variation).
- **Donnees** : `apiResistances`, `resistanceModifyingAbilitiesForApi`.
- **Mecanique** : afficher avant/apres, demander au joueur de predire la variation (ex : Smogogo avec Levitation supprime la faiblesse Sol).
- **Faisabilite** : OK (route ability testee, donnees conformes).

## Jeu 11 - Duel Tactique
- **But** : organiser un mini combat tour par tour entre deux Pokemon selectionnes.
- **Routes** : `/random/team` (tirage de Pokemon), `/pokemon/{id}` pour detailler les resistances, `/pokemon/{nom}/ability/{ability}` pour variantes.
- **Donnees** : `stats` (attack, defense, special_attack, special_defense, speed, HP), `apiTypes`, `apiResistances`.
- **Mecanique** : ordre base sur la vitesse, calcul de degats simplifie incluant multiplicateur de type, log detaille du combat.
- **Faisabilite** : OK.

### Idees ecartees
- **Atelier de Moveset** : infaisable sans liste des capacites disponibles.

### Notes techniques
- Les routes `/pokemon/type/weakness/{type}` peuvent renvoyer une liste vide pour certains types : fallback conseille sur `/pokemon/type/double-weakness/{type}` ou `/pokemon/type/immunity/{type}`.
- Les routes `team` n acceptent que des tableaux JSON simples (`[1,4,7]`).
- `random/team/suggest` renvoie une liste contenant elle-meme 6 Pokemon : decompresser `data[0]`.
- Les reponses de `team/suggestion` et `random/team*` contiennent deja toutes les donnees utiles (stats, types, resistances).
