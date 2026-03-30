# Club Africain — site officiel

Production-oriented stack: **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS 4**, **TypeScript**, **PostgreSQL** + **Prisma 7**, **NextAuth v5** (credentials + JWT), **next-intl** (FR / EN / AR, RTL pour l’arabe), **Pino** (logs), **Zod** (validation), **Jest** + **ESLint** + **Prettier**.

## Prérequis

- Node.js 20+ (recommandé 22)
- Docker (pour Postgres local) ou une URL PostgreSQL hébergée

## Configuration

1. Copier l’exemple d’environnement :

   ```bash
   cp .env.example .env
   ```

2. Générer un secret NextAuth (32+ caractères) :

   ```bash
   openssl rand -base64 32
   ```

3. Renseigner au minimum `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`, `AUTH_URL` (URL publique de l’app, ex. `http://localhost:3000` en dev).

## Base de données

Démarrer Postgres local :

```bash
docker compose up -d
```

Appliquer le schéma et charger les données de démo :

```bash
npm run db:push
npm run db:seed
```

Comptes seed (mot de passe admin surchargeable avec `SEED_ADMIN_PASSWORD`) :

- **Admin** : `admin@club-africain.tn` / `ChangeMeAdmin123!` (par défaut)
- **Fan** : `fan@example.com` / `Supporter123!`

## Développement

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) — redirection vers `/fr` via **next-intl**.

## Scripts utiles

| Script        | Description                |
| ------------- | -------------------------- |
| `npm run dev` | Serveur de développement   |
| `npm run build` | Build production         |
| `npm run lint` | ESLint                    |
| `npm run format` | Prettier (sources)      |
| `npm run test` | Tests Jest                |
| `npm run db:push` | `prisma db push`       |
| `npm run db:seed` | Seed                    |
| `npm run db:studio` | Prisma Studio         |

## Fonctionnalités principales

- **Club** : page histoire / palmarès / stade / timeline + JSON-LD `SportsOrganization`.
- **Équipes** : sports, catégories d’âge (schéma Prisma), fiche équipe (effectif, staff, matchs mock).
- **Boutique** : produits en base, panier (cookie `cart_session` + panier utilisateur), fusion du panier invité après connexion (`POST /api/cart/merge`), commande mock (`POST /api/checkout`) — prêt à brancher Stripe selon devise / pays.
- **Auth** : inscription (`POST /api/auth/register`), connexion NextAuth, rôles `USER` / `ADMIN`.
- **Admin** : `/[locale]/admin` (protégé côté serveur).
- **i18n** : `fr`, `en`, `ar` (RTL).
- **Sécurité** : validation Zod, rate limiting simple sur register / newsletter, en-têtes HTTP dans `next.config.ts`, mots de passe hashés (bcrypt), Prisma (protection SQL injection).
- **Continuité** : panier persistant (cookie + utilisateur), logs structurés (Pino) + table `AuditLog`.

## Git & dépôt distant

Initialisation locale (exemple) :

```bash
git init
git checkout -b dev
git remote add origin https://github.com/Amine-Chelly/club_africain.git
```

Conventions de commits : `feat:`, `fix:`, `refactor:` — branches `main` / `dev` / `feature-*`.

## Déploiement (Vercel)

- Variables : `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_SITE_URL`.
- Build : `npm run build` (le `postinstall` exécute `prisma generate`).
- Appliquer le schéma sur la base de production : `prisma migrate deploy` ou `db push` selon votre processus.

## Tests & CI

- **Jest** : `npm run test`
- Workflow GitHub Actions : `.github/workflows/ci.yml` (lint, test, build avec Postgres de service)

---

Club Africain — النادي الإفريقي · Depuis 1920
