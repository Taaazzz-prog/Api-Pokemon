Liste des routes disponibles :

PachirisuFantominusCarapuce
Pour récupérer la liste de tous les Pokémon (attention, il y en a 898 !) :
api/v1/pokemon

ChenipanNoctali
Si vous préférez récupérer un nombre limité de Pokémon :
api/v1/pokemon/limit/100 => cette route vous emmènera sur la liste des 100 premiers Pokémon

PoisonFeuPsy
Pour récupérer la liste de tous les types de Pokémon :
api/v1/types

Grillepattes
Pour récupérer un Pokémon selon son Id :
api/v1/pokemon/850 => cette route vous emmènera sur la fiche de Grillepattes, qui a l'id 850

Gruikui
Pour récupérer un Pokémon selon son nom :
api/v1/pokemon/Gruikui => cette route vous emmènera sur la fiche de Gruikui

SmogogoSol
Pour récupérer un seul Pokémon avec ses résistances modifiées par une capacité :
api/v1/pokemon/Smogogo/ability/Levitation => cette route vous emmènera sur la fiche de Smogogo avec sa résistance au sol modifiée par léviation

Pointez votre souris ici pour voir les capacités renseignables.

SkittyDelcattyTénéfix
Pour récupérer tous les Pokémon d'une certaine génération :
api/v1/pokemon/generation/3 => cette route vous emmènera sur la liste de tous les Pokémon de la génération 3

CarapucePsykokwakAkwakwak
Pour récupérer tous les Pokémon d'un certain type :
api/v1/pokemon/type/Eau => cette route vous emmènera sur la liste de tous les Pokémon de type Eau

Castorno
Pour récupérer tous les Pokémon de 2 certains types :
api/v1/pokemon/types/Eau/Normal => cette route vous emmènera sur la liste de tous les Pokemon qui ont le type Eau et le type Normal

FérosingeColossinge
Pour récupérer tous les Pokémon qui présentent une faiblesse à un certain type :
api/v1/pokemon/type/weakness/Fée => cette route vous emmènera sur la liste de tous les Pokémon qui présentent une faiblesse au type Fée

ParasForetress
Pour récupérer tous les Pokémon qui présentent une double faiblesse à un certain type :
api/v1/pokemon/type/double-weakness/Feu => cette route vous emmènera sur la liste de tous les Pokémon qui présentent une double faiblesse au type Feu

MagnétiPingoléon
Pour récupérer tous les Pokémon qui présentent une résistance à un certain type :
api/v1/pokemon/type/resistance/Dragon => cette route vous emmènera sur la liste de tous les Pokémon qui présentent une résistance au type Dragon

LokhlassHeatran
Pour récupérer tous les Pokémon qui présentent une double résistance à un certain type :
api/v1/pokemon/type/double-resistance/Glace => cette route vous emmènera sur la liste de tous les Pokémon qui présentent une double résistance au type Glace

RoucoolGoinfrexCoudlangue
Pour récupérer tous les Pokémon qui sont immunisés contre un certain type :
api/v1/pokemon/type/immunity/Spectre => cette route vous emmènera sur la liste de tous les Pokémon qui sont immunisés contre le type Spectre

Vous pouvez aussi tester notre générateur de couverture défensive et notre suggestion automatique de Pokemon ci-dessous ! :
RoucoolGoinfrexCoudlangue
Pour obtenir un résumé des résistances et faiblesses de votre équipe :
api/v1/team/defensive-coverage => envoyez en POST sur cette route l'id (numéro identifiant national) de chaque Pokémon dans un tableau

RoucoolGoinfrexCoudlangue
Pour obtenir une suggestion de Pokémon qui complète votre équipe selon ses résistances:
api/v1/team/suggestion => envoyez en POST sur cette route l'id (numéro identifiant national) de chaque Pokémon dans un tableau

Si vous avez du mal à choisir, le hasard le fera pour vous ! :
CoudlangueRoucoolCoudlangue
Pour obtenir une équipe aléatoire:
api/v1/random/team => cette route génère une liste de 6 Pokémon aléatoires

PsyCoudlanguePoison
Pour obtenir une équipe aléatoire aux resistances équilibrées:
api/v1/random/team/suggest => cette route génère une liste de 3 Pokémon aléatoires puis la complète avec 3 autres Pokémon pour obtenir une équipe aux résistances équilibrées