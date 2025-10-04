# Charte graphique – Pokemon Tactics Arena

## 1. Vision
Univers néon/tactique : contrastes forts, accents bleus et dorés, lisibilité parfaite en mode sombre comme en mode clair.

## 2. Palette de couleurs
| Token | Dark (défaut) | Light | Usage |
|-------|---------------|-------|-------|
| `--color-bg` | #0f172a | #f1f5f9 | Fond principal |
| `--color-panel` | #111c36 | #ffffff | Cartes/panneaux |
| `--color-border` | rgba(148,163,184,0.2) | rgba(15,23,42,0.08) | Bordures légères |
| `--color-text` | #e2e8f0 | #1e293b | Texte principal |
| `--color-muted` | #94a3b8 | #475569 | Texte secondaire |
| `--color-accent` | #38bdf8 | #2563eb | CTA, liens |
| `--color-success` | #4ade80 | #16a34a | Succès, soins |
| `--color-danger` | #f87171 | #dc2626 | Erreurs, dégâts |
| `--color-warning` | #facc15 | #f59e0b | Avertissements |
| `--color-rare` | #3b82f6 | #1d4ed8 | Badges rareté |

Accents secondaires : violet #818cf8 (tournois), turquoise #22d3ee (logs), doré #fbbf24 (récompenses).

## 3. Typographie
- Famille : Segoe UI, system sans-serif.
- Titres : H1 32–36px, H2 24px, H3 18px, uppercase pour les modules modes/success.
- Corps : 15–16px, légendes 13px.
- Poids : 700 pour H1/H2, 600 CTA, 400 texte.

## 4. Grille & espacements
- Conteneur max 1100px, padding latéral 1.5rem (mobile 1rem).
- Grilles : `repeat(auto-fit, minmax(260px, 1fr))`, gap 2rem.
- Panneaux : padding 24px desktop / 16px mobile.
- Rythme vertical : sections espacées de 2.5rem.

## 5. Composants clés
- **Boutons** : pill, gradient (#38bdf8 → #818cf8), hover translateY(-2px), focus outline accent.
- **Cartes Pokémon** : fond semi-opaque, border douce, badges type et rareté.
- **Modale combat** : overlay opaque (#0a1020), bord lumineux bleu, log contrasté (#0a0e1a).
- **Toasts** : coin inférieur droit, couleur selon variante (`success`, `warning`, `error`).

## 6. Thèmes & tokens
Variables définies dans `styles/themes.css` :
- `:root` : thème sombre par défaut (actuel).
- `[data-theme="light"]` : overrides clairs.
- `[data-theme="neo"]` : placeholder pour prochain thème premium (palette magenta/vert).

Pour appliquer un thème : ajouter `data-theme="light"` (ou autre) sur `<body>` ou le conteneur racine. Stocker le thème choisi dans `user_profiles.settings.theme` pour personnalisation/boutique.

## 7. Motion & feedback
- Transitions 120–200ms (ease-out).
- Survol : translation légère + ombre colorée.
- Animations modales : fade-in + scale 1.03.
- Barre de progression : gradient animé.

## 8. Accessibilité
- Contraste minimum 4.5:1 (vérifier tokens).
- Focus visibles sur tous éléments interactifs.
- Prévoir option “mode daltonien” (tokens alternatifs) et “réduction animations”.

## 9. Assets & icônes
- Illustrations modes : vector (SVG) + fallback PNG.
- Sprites Pokémon : CDN PokeBuild, fallback local/placeholder.
- Icônes UI : pack Lucide ou personnalisé (24px).

## 10. Roadmap thèmes
- Thèmes achetables (`theme-ember`, `theme-aurora`, etc.) : définir un set complet de variables, backgrounds, particules, sons.
- Catalogue boutique (`shop_items`, catégorie `cosmetic`) pour débloquer/acheter.

Toute nouvelle page doit appliquer ces tokens (via `main.css` + `themes.css`). Toute variation (événements, skins) doit rester cohérente avec cette charte.
