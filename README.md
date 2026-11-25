# TP07-Backend – Authentification et autorisation avec JWT dans Node.js et Express.js

> LAB 7 – Module M10 « Développement Backend avec Java, Node.js et PHP » – Master IAIDDWM, semestre 2.

Le LAB 7 sécurise l'API des produits du LAB 6 : table `users`, hachage des mots de passe avec **bcrypt**, génération et vérification de **JWT** (access token d'une heure), contrôle d'accès basé sur les rôles **USER** et **ADMIN**, validation des données et gestion centralisée des erreurs.

> LAB 7 – Module M10 « Développement Backend avec Java, Node.js et PHP » – Master IAIDDWM, semestre 2.

## Lien avec le LAB 6 (TP06-Backend)

Ce dépôt est **indépendant** du dépôt du LAB 6 : il contient son propre code (y compris les routes produits et catégories reprises du LAB 6), son propre `package.json` et ses propres tests. Les deux projets communiquent uniquement par la **base MySQL `lab_product`** : le LAB 7 réutilise les tables `categories` et `products` du LAB 6 et y ajoute `users` et `login_logs`. Les deux serveurs utilisent le port défini dans `.env` (`PORT`) : ne lancez pas les deux en même temps sur le même port.

## Nouveautés par rapport au LAB 6

| Élément | Détail |
| --- | --- |
| Modules ES | `"type": "module"` dans `package.json` : tous les fichiers utilisent `import` / `export` (les fichiers du LAB 6 ont été convertis, sans changement de logique). |
| Dépendances ajoutées | `bcrypt`, `jsonwebtoken`, `cors` (`express-validator` et `dotenv` étaient déjà installés). |
| Base de données | Tables `users` et `login_logs` (script `sql/lab7_users.sql`) dans la base `lab_product` (MySQL 8.0). |
| Variables `.env` | `JWT_SECRET` et `JWT_EXPIRES_IN` en plus des variables du LAB 6. |

## Architecture mise à jour

```
product-api/
├─ index.js                      # point d'entrée (routes /api/auth, /api/products, /api/categories)
├─ postman/
│  └─ Product API - LAB7 Auth JWT.postman_collection.json
├─ sql/
│  ├─ create_database.sql, seed_data.sql             # base du LAB 6 (inchangés)
│  └─ lab7_users.sql                                 # LAB 7 : users + login_logs
└─ src/
   ├─ config/db.js               # pool mysql2 (paramètres lus dans .env)
   ├─ utils/password.js          # hashPassword / verifyPassword (bcrypt, 10 tours)
   ├─ controllers/authController.js   # register, login, getMe, refresh, deleteMe
   ├─ routes/authRoutes.js
   ├─ middleware/
   │  ├─ auth.js                 # authenticate (JWT) et authorize (rôles)
   │  └─ validators.js           # registerValidation, handleValidation
   └─ middlewares/               # repris du LAB 6 : validation.js, errorHandler.js (étendu à l'étape 16)
```

## Installation et lancement (LAB 7)

**Prérequis :** Node.js LTS, MySQL Server 8.0, MySQL Workbench.

1. Cloner le dépôt et installer les dépendances :

   ```bash
   git clone https://github.com/<votre-utilisateur>/TP07-Backend.git
   cd TP07-Backend
   npm install
   ```

2. Dans MySQL Workbench :
   - si la base `lab_product` du LAB 6 existe déjà (utilisateur `lab_user` inclus), exécuter uniquement `sql/lab7_users.sql` ;
   - sinon, créer l'utilisateur `lab_user` (voir le README du LAB 6), puis exécuter dans l'ordre `sql/create_database.sql`, `sql/seed_data.sql` et `sql/lab7_users.sql`.

3. Copier `.env.example` en `.env` et l'adapter (en particulier `JWT_SECRET`).

4. Démarrer le serveur :

   ```bash
   npm start
   ```

5. Créer un compte ADMIN pour les tests : s'inscrire via `POST /api/auth/register`, puis promouvoir le compte directement en SQL :

   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'admin@test.com';
   ```

## Endpoints d'authentification

Base : `http://localhost:3000/api`

| Méthode | Route | Accès | Description | Statuts |
| --- | --- | --- | --- | --- |
| POST | `/auth/register` | Public | Inscription (validation : username ≥ 3, email valide, mot de passe ≥ 6) | 201, 400, 409 |
| POST | `/auth/login` | Public | Connexion, renvoie `{ token, role }` | 200, 401 |
| GET | `/auth/me` | Token | Profil de l'utilisateur connecté (sans mot de passe) | 200, 401, 403, 404 |
| POST | `/auth/refresh` | Token | Exercice niveau 1 : génère un nouveau token | 200, 401, 403, 404 |
| DELETE | `/auth/me` | Token | Exercice niveau 2 : suppression du compte connecté | 204, 401, 403, 404 |

Le token se transmet dans l'en-tête `Authorization: Bearer <token>`. Un token absent donne `401`, un token invalide ou expiré donne `403`.

## Protection des routes produits

| Méthode | Route | Rôle requis |
| --- | --- | --- |
| GET | `/products`, `/products/search`, `/products/:id` | Tout utilisateur authentifié (USER ou ADMIN) |
| POST | `/products`, `/products/with-category` | ADMIN |
| PUT | `/products/:id` | ADMIN |
| DELETE | `/products/:id` | ADMIN |

Un utilisateur sans le rôle requis reçoit `403 Forbidden: insufficient permissions`. Les routes `/categories` ne sont pas protégées par le LAB 7.

## Déroulement du lab 7, étape par étape

- **Étapes 1 à 4 – Théorie :** objectifs et prérequis, authentification vs autorisation, anatomie d'un JWT (header, payload, signature), authentification stateless (access token d'une heure ; le refresh token est traité par l'exercice niveau 1).
- **Étape 5 – Initialisation :** création de `src/middleware`, `src/controllers`, `src/routes`, `src/config`, installation de `express mysql2 bcrypt jsonwebtoken express-validator cors dotenv`, vérification de `"type": "module"`.
- **Étape 6 – Base de données :** table `users` (rôle `ENUM('USER','ADMIN')`) et pool `mysql2/promise` dans `src/config/db.js`.
- **Étape 7 – Bcrypt :** `src/utils/password.js` avec `hashPassword` et `verifyPassword` (10 tours de salage).
- **Étapes 8 à 10 – Endpoints :** `register`, `login` (JWT signé avec `{ id, role }`, expiration `1h`) et `getMe`.
- **Étapes 11 et 12 – Middlewares :** `authenticate` (vérification du JWT, `req.user`) et `authorize(...roles)` (RBAC).
- **Étape 13 – Validation :** `registerValidation` et `handleValidation` (`express-validator`).
- **Étape 14 – Routes d'authentification :** `src/routes/authRoutes.js` monté sur `/api/auth`.
- **Étape 15 – Protection des produits :** `authenticate` sur `/api/products`, `authorize('ADMIN')` sur l'écriture.
- **Étape 16 – Erreurs :** le gestionnaire global renvoie `401` (`JsonWebTokenError`), `409` (`ER_DUP_ENTRY`) ; le comportement du LAB 6 (404 / 400) est conservé pour les erreurs métier.
- **Étape 17 – Bonnes pratiques :** variables d'environnement (`.env` exclu de Git), requêtes préparées. HTTPS, restriction CORS et `express-rate-limit` sont les mesures recommandées pour la production.
- **Étapes 18 et 19 – Tests :** scénario Postman et commandes cURL (voir ci-dessous).
- **Étape 20 – Comparaison avec Spring Security (LAB 4) :** mêmes concepts (authentification, autorisation), mais Express oblige à écrire les middlewares à la main.
- **Étape 21 – Exercices et conclusion :** niveaux 1 à 3 ci-dessous ; transition vers le LAB 8 (Laravel, `Auth::guard('api')`).

### Exercices de l'étape 21

| Niveau | Énoncé | Réalisation |
| --- | --- | --- |
| 1 | Ajouter un endpoint `POST /api/auth/refresh` pour générer un nouveau token | `refresh` dans `authController.js` (route protégée par `authenticate`) |
| 2 | Implémenter la suppression d'un compte utilisateur (`DELETE /api/auth/me`) | `deleteMe` dans `authController.js`, réponse `204` |
| 3 | Ajouter un log d'activité pour chaque tentative de login échouée | Insertion dans la table `login_logs` (email, adresse IP, date) pour chaque échec (email inconnu ou mot de passe incorrect) |

Consulter les échecs :

```sql
SELECT * FROM login_logs ORDER BY created_at DESC;
```

## Tests du LAB 7

**Scénario (étape 18)** : inscription (201) → connexion (copier le `token`) → `GET /api/auth/me` avec `Authorization: Bearer [token]` → création d'un produit avec un compte USER (403) → création avec un compte ADMIN (201).

**cURL (étape 19)** :

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"123456"}'

# Accès protégé
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <VOTRE_TOKEN>"
```

**Collection Postman** : importer `postman/Product API - LAB7 Auth JWT.postman_collection.json` et lancer le Runner dans l'ordre. Elle contient 21 requêtes et 29 assertions (authentification, autorisation USER et ADMIN, exercices 1 à 3). Le compte admin (`admin@test.com` / `123456`, modifiables dans les variables de la collection) doit être promu en SQL avant le dossier 3 (voir Installation, point 5).

| Requêtes | Assertions | Échecs |
| --- | --- | --- |
| 21 | 29 | 0 |

> Ces résultats ont été obtenus avec Newman sur une base MariaDB 10.11 compatible MySQL ; relancez le Runner sur votre MySQL 8.0 pour les confirmer.

---

**Auteur :** Luchianhi – Master IAIDDWM, M10 Développement Backend.
