# Connexion Prisma / MySQL – guide de référence

Ce projet tourne autour d’un serveur MySQL exposé en local (port **3307**) et
des services Prisma utilisés par le backend Node. Le but de ce guide est de
décrire une routine fiable pour :

1. lancer/contrôler MySQL,
2. exécuter les migrations/seed Prisma,
3. manipuler la base depuis l’hôte **ou** directement dans les conteneurs.

---

## 1. Variables d’environnement

| Emplacement | Contenu utile |
|-------------|---------------|
| `.env` (racine du repo) | `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD` utilisés par Docker |
| `backend/.env` | `DATABASE_URL=mysql://pokemon_user:pokemon_pass_dev@127.0.0.1:3307/pokemon_tactics_arena` (pour usage local) |
| Conteneur backend | `DATABASE_URL=mysql://pokemon_user:pokemon_pass_dev@pokemon-mysql:3306/pokemon_tactics_arena` |

> **Nota** : si vous utilisez un mot de passe différent, pensez à aligner ces
> fichiers _et_ les variables de Docker Compose.

---

## 2. Lancement des services Docker

```bash
# À la racine du projet
docker compose up -d

# Vérifier que MySQL est healthy
docker ps --filter "name=pokemon-mysql"
```

MySQL écoute sur `localhost:3307`. Pour vérifier rapidement :
```bash
docker exec -it pokemon-mysql mysql   -h 127.0.0.1 -P 3306   -u ${MYSQL_USER} -p${MYSQL_PASSWORD}   ${MYSQL_DATABASE} -e "SELECT 'OK';"
```

---

## 3. Migrations Prisma

Vous pouvez travailler **depuis l’hôte** ou **depuis le conteneur backend**.

### a. Depuis l’hôte (recommandé)
```bash
cd games/pokemon-tactics-arena-v2/backend
set DATABASE_URL=mysql://pokemon_user:pokemon_pass_dev@127.0.0.1:3307/pokemon_tactics_arena
npx prisma migrate deploy
npx prisma db seed    # si besoin de repeupler
```

> Sous PowerShell :
> ```powershell
> $env:DATABASE_URL = "mysql://pokemon_user:pokemon_pass_dev@127.0.0.1:3307/pokemon_tactics_arena"
> npx prisma migrate deploy
> ```

### b. Depuis le conteneur backend
Utile si l’hôte rencontre des problèmes de pare-feu ou de DNS.
```bash
docker exec -it pokemon-backend sh -c "cd backend && npx prisma migrate deploy"
docker exec -it pokemon-backend sh -c "cd backend && npx prisma db seed"
```

Les migrations actuellement fournies :
- `20241004_init` : schéma principal (users, pokemon, roster, shop, etc.).
- `20241005_gameplay_tables` : tables gameplay (`arena_matches`,
  `tournament_participants`, `tournament_matches`).

---

## 4. Seed et données de test

Le seed Prisma installe :
- 4 types (Grass, Poison, Fire, Water) et les starters 1/4/7,
- deux articles de boutique (`starter_pack`, `credit_bundle_small`),
- un utilisateur `test@pokemon.com` (mdp `test123`) et son roster,
- aucun match/tournoi par défaut (ils sont créés via les routes API).

Commandes :
```bash
cd games/pokemon-tactics-arena-v2/backend
npx prisma db seed
```

---

## 5. Scripts SQL (optionnels)

Pour importer un fichier `.sql` depuis l’hôte :
```bash
Get-Content backup.sql | docker exec -i pokemon-mysql   mysql -u root -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE}
```

Pour créer un dump :
```bash
docker exec pokemon-mysql mysqldump   -u root -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE} > backup.sql
```

---

## 6. Résumé des connexions utiles

| Scénario | URL / Commande |
|----------|----------------|
| Prisma (hôte) | `mysql://pokemon_user:pokemon_pass_dev@127.0.0.1:3307/pokemon_tactics_arena` |
| Prisma (backend conteneur) | `mysql://pokemon_user:pokemon_pass_dev@pokemon-mysql:3306/pokemon_tactics_arena` |
| MySQL CLI (hôte via docker exec) | `mysql -h 127.0.0.1 -P 3306 -u pokemon_user -ppokemon_pass_dev` (lancé dans le conteneur) |
| Seed | `npx prisma db seed` |
| Migration | `npx prisma migrate deploy` |
| Logs backend | `docker logs -f pokemon-backend` |

---

## 7. Dépannage rapide

| Problème | Cause probable | Correctif |
|----------|----------------|-----------|
| `P1000 Authentication failed` depuis l’hôte | mauvais mot de passe / port | vérifier le `.env`, utiliser 127.0.0.1:3307 |
| Prisma `P3006` (migrations) | migrations non appliquées | `npx prisma migrate deploy` |
| `Unknown database` | base non créée | relancer compose ou `docker exec mysql` pour créer la base |
| Seed échoue (`table not found`) | migrations non déployées avant seed | `npx prisma migrate deploy` puis `npx prisma db seed` |

---

En suivant ce guide vous pouvez travailler indifféremment depuis l’hôte ou
les conteneurs. N’hésitez pas à ajouter vos propres scripts (`npm run
migrate`, `npm run seed`) pour automatiser ces commandes.
