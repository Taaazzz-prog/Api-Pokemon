# Spécifications Pages & UX

## 0. Authentification
- **Landing / Connexion**
  - Hero avec CTA “S inscrire / Se connecter”.
  - Formulaire email + mot de passe, lien mot de passe oublié, SSO optionnel.
  - Témoignages, capture d écran du jeu, call-to-action boutique.
- **Inscription**
  - Champs : email, pseudo, mot de passe, confirmation.
  - Consentements (CGU, newsletter).
- **Mot de passe oublié**
  - Input email, message de confirmation.
- **Reset**
  - Nouveau mot de passe, validation double.

## 1. Hub (après login)
- **Header** : avatar, pseudo, niveau, solde credits/gems, bouton boutique.
- **Sections** :
  1. Progression (niveau, XP, succès récents).
  2. Modes de jeu (Survie, Tournoi, Arène, Libre) – cartes avec illustration, status (débloqué/lock).
  3. Récap événements – liste cartes (image, date fin, CTA participer).
  4. Boutique express – top 3 offres du jour.
- **Footer** : liens support, conditions, patch notes.

## 2. Mode Libre
- **Choix équipe** :
  - Tabs : “Équilibrée”, “Évolutive”, “Mes presets”.
  - Affichage cartes Pokémon (stats, types, rareté).
- **Choix adversaire** : random ou sélection pool selon niveau.
- **Zone combat** : cartes alignées, log à droite, bouton lancer.
- **Résultat** : modal résumé, récompenses (XP, crédits).

## 3. Mode Survie
- **Roster sélection** : voir implémentation actuelle – grid Pokémon débloqués, tirage aléatoire, radio choix source.
- **Statut run** : affichage vague en cours, bonus actifs, log.
- **Intermission** : pop-in après victoire (boutique rapide, soin, évolutions).
- **Leaderboard** : bandeau latéral (top joueurs, meilleure vague).

## 4. Mode Tournoi
- **Brackets** : représentation 8 joueurs (quart → finale).
- **Résumé équipe** : cartes, stats, bouton modifier.
- **Historique run** : résultats précédents, récompenses.
- **Recompenses** : tableau paliers (quart, demi, finale).

## 5. Mode Arène (PvP)
- **Deck builder rapide** : drag & drop depuis roster, sauvegarde preset Arène.
- **Matchmaking** : affichage temps estimé, bouton annuler.
- **Classement** : top 100, classement personnel, historique du jour.
- **Récompenses saison** : progression division (+ coffres).

## 6. Team Builder / Gestion d équipe
- **Roster complet** : filtres (type, rareté, génération).
- **Slots** : positions 1-6, drag & drop, objets assignables.
- **Meta** : synergies, moyenne stats, type coverage.
- **Sauvegarde** : nom, contexte (libre, survie, tournoi, arène).

## 7. Boutique
- **Tabs** : Pokémon, Objets, Cosmétiques, Bundles.
- **Carte produit** : image, rareté, prix, stock, bouton acheter.
- **Détails** : popup avec stats, aperçu.
- **Monnaie** : affichage solde credits/gems et bouton acheter gemmes (paiement).

## 8. Centres spécialisés
- **Évolution** :
  - Liste Pokémon éligibles, conditions, bouton “Évoluer”.
  - Animation + progression XP bonus.
- **Entrainement** :
  - Sélection Pokémon, type d entraînement (stat ciblée, session longue).
  - Timer, coût, gains.
- **Personnalisation** :
  - Avatar, cadre, effets d entrée combat.
- **Progression** : dashboards, graphiques, records (survie, arène, tournoi, total).
- **Succès** : grille succès (icône, progression, récompense à récupérer).

## 9. Profil & Paramètres
- Modifier email, mot de passe, préférences (langue, audio, notifications).
- Gestion sécurité (2FA, sessions actives).

## 10. Page Événements
- Carrousel événements actuels, détails, récompenses, calendrier à venir.

## 11. Page Support / FAQ
- Liste questions fréquentes, ticket support, lien Discord.

## 12. Layout mobile
- Navigation inférieure (Hub, Modes, Boutique, Profil).
- Pages converties en onglets vertical.

---
Pour chaque page, se référer aux contrats de données (`domain-model.md`) et au backlog détaillé (`todo-complet.md`).
