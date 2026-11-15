# Guide de déploiement et d’exploitation — UNITRACA

## 1. Architecture technique implémentée

- **Frontend** : React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, Motion (`prefers-reduced-motion` respecté).
- **Backend** : Express (`server.ts`, `src/server/api.ts`, `src/server/auth.ts`).
- **Base de données & Migrations** : SQLite (`better-sqlite3`, mode WAL) avec migrations versionnées dans `src/db/migrations.ts` et contenu initial conforme aux règles éditoriales dans `src/db/seed.ts`.
- **Sécurité** :
  - Hachage des mots de passe avec `crypto.scryptSync` + sel aléatoire et comparaison `crypto.timingSafeEqual`.
  - Sessions par jeton aléatoire haché SHA-256 stocké en base et cookie `HttpOnly; SameSite=Lax`.
  - Contrôle d’accès par rôle côté serveur (`member`, `editor`, `admin`).
  - Protection des ressources `member` et `restricted` directement dans les réponses API (le contenu complet n’est jamais livré au navigateur sans droit validé côté serveur).
  - Limitation de débit (rate limiting) sur les routes d’authentification et de formulaires.
  - Journal d’audit (`audit_logs`) et journal de consentements (`consent_logs`).

---

## 2. Variables d’environnement

Copiez `.env.example` vers `.env` en production sans jamais commiter `.env` :

- `APP_URL` : URL publique du portail (utilisée pour `/sitemap.xml` et `/robots.txt`).
- `SESSION_SECRET` : chaîne aléatoire d’au moins 32 à 64 caractères pour signer les jetons de session.
- `DATABASE_PATH` : chemin persistant vers le fichier SQLite (ex. `/var/data/unitraca.db`).
- `ADMIN_BOOTSTRAP_EMAIL` et `ADMIN_BOOTSTRAP_PASSWORD` : optionnels. S’ils sont définis lors du premier démarrage et qu’aucun administrateur n’existe encore, le compte administrateur principal est créé automatiquement. Sinon, la première visite sur `/admin` propose une initialisation unique verrouillée dès qu’un administrateur existe.

---

## 3. Commandes de build et de démarrage

```bash
npm install
npm run lint
npm run build
npm run start
```

En développement local :

```bash
npm run dev
```

Le serveur écoute sur le port `3000` (ou `process.env.PORT`).

---

## 4. Procédures d’administration éditoriale

### A. Publier un enseignement
1. Connectez-vous sur `/admin` avec un compte `admin` ou `editor`.
2. Ouvrez l’onglet **Enseignements**.
3. Renseignez le formulaire « Nouvel enseignement » (laissez en `draft` tant que les informations ne sont pas validées par UNITRACA).
4. Faites évoluer son statut selon le workflow : `draft` → `validation` → `published` (ou `archived` pour retirer du catalogue public).
5. Réglez le statut des inscriptions : `to_announce`, `open`, `full`, `finished` ou `cancelled`.

### B. Attribuer un accès restreint à un membre
1. Connectez-vous sur `/admin` avec un compte `admin`.
2. Ouvrez l’onglet **Accès restreints & Rôles**.
3. Sélectionnez le compte membre concerné et la ressource classée `restricted`, puis indiquez le motif de l’autorisation.
4. Cliquez sur **Accorder l’accès**. La ressource apparaît immédiatement dans l’Espace membre du bénéficiaire et devient consultable sur `/mediatheque/[slug]`.
5. L’accès peut être révoqué à tout moment depuis la liste des autorisations actives.

### C. Gérer les médias, crédits et demandes de retrait
1. Ouvrez l’onglet **Médiathèque & Droits** pour ajuster pour chaque ressource :
   - Le niveau d’accès (`public`, `member`, `restricted`),
   - Le statut d’autorisation (`pending_validation`, `authorized`, `restricted_rights`),
   - Le statut de publication (`draft`, `validation`, `published`, `archived`).
2. Consultez l’onglet **Rectifications & Journal** pour traiter les demandes envoyées depuis `/contact` (corrections ou demandes de retrait d’image/média). En cas de retrait demandé par un détenteur légitime, passez immédiatement la ressource concernée en `draft` ou `archived`.
