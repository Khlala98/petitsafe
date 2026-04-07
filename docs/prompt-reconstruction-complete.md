# RZPan'Da — Document de reconstruction complète

> Ce document décrit l'intégralité du projet **RZPan'Da** (anciennement PetitSafe) — un SaaS HACCP, traçabilité alimentaire et suivi enfants pour crèches, micro-crèches, MAM et assistantes maternelles. Il est dimensionné pour qu'un développeur ou une IA puisse recréer le produit à l'identique sans accès au code source.

---

## 1. Identité produit

- **Nom commercial** : RZPan'Da
- **Slug technique / package** : `rzpanda`
- **Tagline** : « Gestion HACCP & Traçabilité Petite Enfance »
- **Cible** : crèches collectives, micro-crèches, MAM, assistantes maternelles (France)
- **Locale** : `fr_FR` exclusivement
- **Domaine fonctionnel** : conformité réglementaire HACCP/PMS, traçabilité alimentaire, suivi quotidien enfant, biberonnerie ANSES, gestion stocks/protocoles, exports DDPP/PMI
- **Multi-tenant** : oui (modèle `Structure` + `UserStructure` jointe à l'utilisateur Supabase)
- **Multi-structure par utilisateur** : oui (un user peut appartenir à plusieurs structures et basculer)

---

## 2. Stack technique exacte

### Runtime / framework
- **Next.js 14.2.21** (App Router, Server Actions, Server Components)
- **React 18.3.1**
- **TypeScript 5.7.2** (mode strict)
- **Node** 20+ recommandé

### Base de données / backend
- **PostgreSQL** via **Supabase** (Auth + Storage + Realtime + Postgres)
- **Prisma 5.22.0** (ORM, source unique du schéma DB)
- **@supabase/ssr 0.5.2** + **@supabase/supabase-js 2.47.10** (auth cookies + realtime client)

### UI / styling
- **Tailwind CSS 3.4.16** + **tailwindcss-animate 1.0.7**
- **lucide-react 0.383.0** (icônes)
- **sonner 1.7.1** (toasts)
- **class-variance-authority 0.7.1** + **clsx 2.1.1** + **tailwind-merge 2.6.0** (helper `cn`)
- Font : **Inter** (system fallback)

### Forms / validation
- **react-hook-form 7.54.2** + **@hookform/resolvers 3.9.1**
- **zod 3.24.1** (schémas Zod = source de vérité côté Server Action)

### Data viz / PDF
- **recharts 2.15.0** (graphiques relevés température)
- **@react-pdf/renderer 4.1.5** (génération PDF DDPP/PMI)

### Tests
- **vitest 2.1.8** + **@vitest/ui** (unitaires)
- **@playwright/test 1.49.1** (E2E)

### Tooling
- **prisma 5.22.0** (CLI)
- **tsx 4.19.2** (seed)
- **postcss 8.4.49** + **autoprefixer 10.4.20**

### Scripts npm
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "db:migrate": "prisma migrate dev",
  "db:seed": "tsx prisma/seed.ts",
  "db:studio": "prisma studio",
  "postinstall": "prisma generate"
}
```

---

## 3. Variables d'environnement

Fichier `.env.local` (ne JAMAIS commit) :

```env
# Supabase — projet
NEXT_PUBLIC_SUPABASE_URL=https://<project_ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # server-only, jamais exposé

# Prisma — connexion directe Postgres Supabase
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

# URL appli (utilisée par metadataBase Next + redirects mail)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`schema.prisma` utilise `url = env("DATABASE_URL")` (pooled) et `directUrl = env("DIRECT_URL")` (direct, pour migrations).

---

## 4. Arborescence projet

```
petitsafe/
├── prisma/
│   ├── schema.prisma                 # Source unique de vérité DB
│   ├── seed.ts                       # tsx prisma/seed.ts
│   └── migrations/                   # versionné
├── supabase/
│   └── rls-policies.sql              # à exécuter après prisma migrate
├── src/
│   ├── app/
│   │   ├── layout.tsx                # html lang=fr + Toaster sonner
│   │   ├── globals.css               # tailwind base
│   │   ├── (auth)/                   # group sans layout dashboard
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   ├── (marketing)/              # site vitrine
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx              # landing
│   │   ├── api/
│   │   │   └── register/route.ts     # POST création Structure + UserStructure
│   │   ├── dashboard/
│   │   │   ├── layout.tsx            # Sidebar + Topbar + BottomNav
│   │   │   ├── page.tsx              # redirige vers /dashboard/[firstStructure]
│   │   │   ├── multi-structures/page.tsx
│   │   │   └── [structureId]/
│   │   │       ├── page.tsx          # Dashboard accueil (KPI cards)
│   │   │       ├── enfants/{page,nouveau,[id]/{page,modifier}}.tsx
│   │   │       ├── biberonnerie/{page,nouveau}.tsx
│   │   │       ├── temperatures/page.tsx
│   │   │       ├── stock/page.tsx              # réceptions + stock + DLC
│   │   │       ├── nettoyage/page.tsx
│   │   │       ├── suivi/{page,groupe}.tsx     # repas/changes/siestes
│   │   │       ├── transmissions/page.tsx
│   │   │       ├── protocoles/page.tsx
│   │   │       ├── exports/page.tsx
│   │   │       └── parametres/page.tsx
│   │   ├── portail/[token]/page.tsx  # portail parents — accès par token enfant
│   │   ├── portail-parents/          # vue parent connecté
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── signalements/page.tsx
│   │   ├── actions/                  # 'use server' — Server Actions
│   │   │   ├── alertes.ts
│   │   │   ├── biberons.ts
│   │   │   ├── dashboard.ts          # getDashboardData()
│   │   │   ├── demo.ts
│   │   │   ├── enfants.ts
│   │   │   ├── exports.ts            # PDF DDPP/PMI
│   │   │   ├── nettoyage.ts
│   │   │   ├── portail-parents.ts
│   │   │   ├── protocoles.ts
│   │   │   ├── stock.ts              # réceptions + stock + mouvements
│   │   │   ├── structure.ts          # info struct + nettoyage données aberrantes + modules
│   │   │   ├── suivi.ts              # repas + changes + siestes
│   │   │   ├── temperatures.ts
│   │   │   └── transmissions.ts
│   │   ├── robots.ts
│   │   ├── sitemap.ts
│   │   └── test/page.tsx
│   ├── components/
│   │   ├── enfants/{enfant-form,import-csv-modal}.tsx
│   │   ├── layout/{sidebar,topbar,bottom-nav,notifications-bell}.tsx
│   │   ├── pdf/{panda-icon,pdf-ddpp,pdf-pmi,pdf-styles}.tsx
│   │   ├── shared/{logo-text,panda-icon,pastille-statut,badge-allergie,badge-regime,bouton-action}.tsx
│   │   └── ui/accordion.tsx
│   ├── hooks/
│   │   ├── use-auth.ts               # user + structures + activeStructureId (localStorage)
│   │   ├── use-modules.ts            # isActif(moduleId)
│   │   └── use-realtime-subscription.ts
│   ├── lib/
│   │   ├── business-logic.ts         # toutes les règles métier (température, biberon, DLC, âge, fréquences)
│   │   ├── constants.ts              # SEUILS, MODULES_DISPONIBLES, PRESETS, COULEURS
│   │   ├── utils.ts                  # cn()
│   │   ├── data/{seed-data,protocoles-templates,taches-nettoyage-defaut}.ts
│   │   ├── schemas/                  # Zod
│   │   │   ├── biberon.ts change.ts demo.ts enfant.ts exports.ts
│   │   │   ├── nettoyage.ts protocole.ts reception.ts repas.ts sieste.ts
│   │   │   ├── signalement.ts stock.ts temperatures.ts transmission.ts
│   │   │   └── index.ts
│   │   └── supabase/{client,server,prisma}.ts
│   ├── types/index.ts
│   └── middleware.ts                 # protection routes privées
├── public/
│   └── rzpanda-logo.svg              # favicon
├── __tests__/                        # vitest unit
├── e2e/                              # playwright
├── tailwind.config.ts
├── next.config.js
├── playwright.config.ts
├── vitest.config.ts
├── tsconfig.json
└── package.json
```

---

## 5. Schéma Prisma complet

```prisma
generator client { provider = "prisma-client-js" }
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ─── ENUMS ───
enum StructureType   { CRECHE MICRO_CRECHE MAM ASS_MAT }
enum Role            { GESTIONNAIRE PROFESSIONNEL PARENT }
enum Sexe            { FILLE GARCON }
enum Severite        { LEGERE MODEREE SEVERE }
enum TypeRepas       { PETIT_DEJ DEJEUNER GOUTER DINER }
enum Quantite        { TOUT BIEN PEU RIEN }
enum TypeChange      { MOUILLEE SELLE LES_DEUX }
enum QualiteSieste   { CALME AGITE DIFFICILE REVEILS }
enum TypeEquipement  { REFRIGERATEUR CONGELATEUR }
enum TypePlat        { CHAUD FROID }
enum StatutProduit   { EN_STOCK UTILISE JETE RAPPELE }
enum Frequence       { APRES_UTILISATION QUOTIDIEN BIQUOTIDIEN HEBDO BIMENSUEL MENSUEL }
enum TypeMouvement   { ENTREE SORTIE }
enum TypeTransmission{ GENERAL ENFANT EQUIPE }
enum TypeExport      { DDPP PMI INTERNE }
enum CategorieStock  { COUCHES ENTRETIEN LAIT COMPOTES AUTRE }
enum TypeIncident    { CHUTE MORSURE GRIFFURE PLEURS_PROLONGES FIEVRE AUTRE }
enum GraviteIncident { MINEUR MODERE GRAVE }

// ─── MULTI-TENANT ───
model Structure {
  id               String        @id @default(uuid())
  nom              String
  type             StructureType
  adresse          String?
  code_postal      String?
  ville            String?
  telephone        String?
  email            String?
  capacite_accueil Int?
  numero_agrement  String?
  modules_actifs   String[]      @default(["temperatures","tracabilite","nettoyage","biberonnerie","repas","changes","siestes","transmissions","stocks","protocoles"])
  created_at       DateTime      @default(now())

  users            UserStructure[]
  enfants          Enfant[]
  equipements      Equipement[]
  zones_nettoyage  ZoneNettoyage[]
  stocks           Stock[]
  transmissions    Transmission[]
  protocoles       Protocole[]
  exports          ExportPDF[]
  demandes_demo    DemandeDemo[]
  biberons         Biberon[]
  repas            Repas[]
  changes          Change[]
  siestes          Sieste[]
  releves_temp     ReleveTemperature[]
  releves_plat     RelevePlat[]
  receptions       ReceptionMarchandise[]
  incidents        Incident[]
}

model UserStructure {
  id           String    @id @default(uuid())
  user_id      String    // = auth.users.id Supabase
  structure_id String
  role         Role
  structure    Structure @relation(fields: [structure_id], references: [id], onDelete: Cascade)

  @@unique([user_id, structure_id])
  @@index([user_id])
  @@index([structure_id])
}

// ─── ENFANTS ───
model Enfant {
  id             String   @id @default(uuid())
  structure_id   String
  prenom         String
  nom            String
  date_naissance DateTime
  sexe           Sexe?
  groupe         String?
  photo_url      String?
  actif          Boolean  @default(true)
  date_entree    DateTime?
  regimes        String[] @default([])
  portail_token  String?  @unique  // utilisé par /portail/[token]

  structure      Structure        @relation(fields: [structure_id], references: [id], onDelete: Cascade)
  allergies      AllergieEnfant[]
  contacts       ContactUrgence[]
  biberons       Biberon[]
  repas          Repas[]
  changes        Change[]
  siestes        Sieste[]
  transmissions  Transmission[]
  incidents      Incident[]

  @@index([structure_id])
  @@index([structure_id, actif])
}

model AllergieEnfant {
  id           String   @id @default(uuid())
  enfant_id    String
  allergene    String
  severite     Severite
  protocole    String?
  document_pai String?
  enfant       Enfant   @relation(fields: [enfant_id], references: [id], onDelete: Cascade)
  @@index([enfant_id])
}

model ContactUrgence {
  id                     String  @id @default(uuid())
  enfant_id              String
  nom                    String
  lien                   String
  telephone              String
  est_autorise_recuperer Boolean @default(true)
  ordre_priorite         Int     @default(1)
  enfant                 Enfant  @relation(fields: [enfant_id], references: [id], onDelete: Cascade)
  @@index([enfant_id])
}

// ─── SUIVI QUOTIDIEN ───
model Biberon {
  id                   String    @id @default(uuid())
  structure_id         String
  enfant_id            String
  date                 DateTime
  heure_preparation    DateTime
  type_lait            String
  nom_lait             String?
  numero_lot           String
  date_peremption_lait DateTime?
  date_ouverture_boite DateTime?
  nombre_dosettes      Int?
  quantite_preparee_ml Int
  heure_service        DateTime?
  quantite_bue_ml      Int?
  nettoyage_effectue   Boolean   @default(false)
  heure_nettoyage      DateTime?
  preparateur_nom      String
  conforme_anses       Boolean   @default(true)
  observations         String?
  professionnel_id     String

  structure Structure @relation(fields: [structure_id], references: [id], onDelete: Cascade)
  enfant    Enfant    @relation(fields: [enfant_id], references: [id], onDelete: Cascade)
  @@index([structure_id, date])
  @@index([enfant_id, date])
}

model Repas {
  id               String     @id @default(uuid())
  structure_id     String
  enfant_id        String
  date             DateTime
  type_repas       TypeRepas
  entree           String?
  entree_quantite  Quantite?
  plat             String?
  plat_quantite    Quantite?
  dessert          String?
  dessert_quantite Quantite?
  observations     String?
  professionnel_id String

  structure Structure @relation(fields: [structure_id], references: [id], onDelete: Cascade)
  enfant    Enfant    @relation(fields: [enfant_id], references: [id], onDelete: Cascade)
  @@index([structure_id, date])
  @@index([enfant_id, date])
}

model Change {
  id               String     @id @default(uuid())
  structure_id     String
  enfant_id        String
  date             DateTime
  heure            DateTime
  type_change      TypeChange
  observations     String?
  professionnel_id String

  structure Structure @relation(fields: [structure_id], references: [id], onDelete: Cascade)
  enfant    Enfant    @relation(fields: [enfant_id], references: [id], onDelete: Cascade)
  @@index([structure_id, date])
  @@index([enfant_id, date])
}

model Sieste {
  id               String         @id @default(uuid())
  structure_id     String
  enfant_id        String
  date             DateTime
  heure_debut      DateTime
  heure_fin        DateTime?
  duree_minutes    Int?
  qualite          QualiteSieste?
  professionnel_id String

  structure Structure @relation(fields: [structure_id], references: [id], onDelete: Cascade)
  enfant    Enfant    @relation(fields: [enfant_id], references: [id], onDelete: Cascade)
  @@index([structure_id, date])
  @@index([enfant_id, date])
}

// ─── INCIDENTS ───
model Incident {
  id               String          @id @default(uuid())
  structure_id     String
  enfant_id        String
  date             DateTime
  heure            DateTime
  type_incident    TypeIncident
  description      String
  gravite          GraviteIncident
  action_prise     String
  parents_prevenu  Boolean         @default(false)
  professionnel_id String

  structure Structure @relation(fields: [structure_id], references: [id], onDelete: Cascade)
  enfant    Enfant    @relation(fields: [enfant_id], references: [id], onDelete: Cascade)
  @@index([structure_id, date])
  @@index([enfant_id, date])
}

// ─── TEMPÉRATURES ───
model Equipement {
  id              String         @id @default(uuid())
  structure_id    String
  nom             String
  type            TypeEquipement
  temperature_max Float
  actif           Boolean        @default(true)
  structure       Structure           @relation(fields: [structure_id], references: [id], onDelete: Cascade)
  releves         ReleveTemperature[]
  @@index([structure_id])
}

model ReleveTemperature {
  id                String    @id @default(uuid())
  structure_id      String
  equipement_id     String
  date              DateTime
  heure             DateTime
  heure_modifiee    DateTime?
  temperature       Float
  conforme          Boolean
  action_corrective String?
  professionnel_id  String

  structure  Structure  @relation(fields: [structure_id], references: [id], onDelete: Cascade)
  equipement Equipement @relation(fields: [equipement_id], references: [id], onDelete: Cascade)
  @@index([structure_id, date])
  @@index([equipement_id, date])
}

model RelevePlat {
  id                String    @id @default(uuid())
  structure_id      String
  date              DateTime
  nom_plat          String
  type_plat         TypePlat  @default(CHAUD)
  temperature_avant Float
  heure_avant       DateTime
  temperature_apres Float
  heure_apres       DateTime
  conforme          Boolean
  action_corrective String?
  professionnel_id  String
  structure Structure @relation(fields: [structure_id], references: [id], onDelete: Cascade)
  @@index([structure_id, date])
}

// ─── TRAÇABILITÉ ALIMENTAIRE ───
model ReceptionMarchandise {
  id                    String        @id @default(uuid())
  structure_id          String
  date                  DateTime
  fournisseur           String
  nom_produit           String
  numero_lot            String
  dlc                   DateTime
  temperature_reception Float?
  emballage_conforme    Boolean       @default(true)
  photo_etiquette_url   String?
  photo_bon_livraison   String?
  conforme              Boolean       @default(true)
  motif_non_conformite  String?
  statut                StatutProduit @default(EN_STOCK)
  motif_destruction     String?
  professionnel_id      String
  structure Structure @relation(fields: [structure_id], references: [id], onDelete: Cascade)
  @@index([structure_id, date])
  @@index([structure_id, dlc])
}

// ─── NETTOYAGE ───
model ZoneNettoyage {
  id           String  @id @default(uuid())
  structure_id String
  nom          String
  couleur_code String?
  ordre        Int     @default(0)
  structure    Structure        @relation(fields: [structure_id], references: [id], onDelete: Cascade)
  taches       TacheNettoyage[]
  @@index([structure_id])
}

model TacheNettoyage {
  id          String    @id @default(uuid())
  zone_id     String
  nom         String
  frequence   Frequence
  methode     String
  produit     String?
  notes       String?
  actif       Boolean   @default(true)
  zone        ZoneNettoyage         @relation(fields: [zone_id], references: [id], onDelete: Cascade)
  validations ValidationNettoyage[]
  @@index([zone_id])
}

model ValidationNettoyage {
  id                String   @id @default(uuid())
  tache_id          String
  date              DateTime
  heure             DateTime
  professionnel_id  String
  professionnel_nom String
  observations      String?
  tache             TacheNettoyage @relation(fields: [tache_id], references: [id], onDelete: Cascade)
  @@index([tache_id, date])
}

// ─── STOCKS ───
model Stock {
  id           String         @id @default(uuid())
  structure_id String
  categorie    CategorieStock
  produit_nom  String
  quantite     Float
  unite        String
  seuil_alerte Float
  derniere_maj DateTime
  maj_par      String
  structure    Structure        @relation(fields: [structure_id], references: [id], onDelete: Cascade)
  mouvements   MouvementStock[]
  @@index([structure_id])
}

model MouvementStock {
  id        String        @id @default(uuid())
  stock_id  String
  date      DateTime
  type_mouv TypeMouvement
  quantite  Float
  motif     String?
  par       String
  stock     Stock @relation(fields: [stock_id], references: [id], onDelete: Cascade)
  @@index([stock_id])
}

// ─── TRANSMISSIONS ───
model Transmission {
  id           String           @id @default(uuid())
  structure_id String
  enfant_id    String?
  date         DateTime
  contenu      String
  auteur       String
  type_transm  TypeTransmission
  structure    Structure @relation(fields: [structure_id], references: [id], onDelete: Cascade)
  enfant       Enfant?   @relation(fields: [enfant_id], references: [id], onDelete: SetNull)
  @@index([structure_id, date])
  @@index([enfant_id, date])
}

// ─── PROTOCOLES ───
model Protocole {
  id               String   @id @default(uuid())
  structure_id     String
  titre            String
  categorie        String
  contenu_markdown String
  version          Int      @default(1)
  actif            Boolean  @default(true)
  cree_par         String
  date_creation    DateTime @default(now())
  structure        Structure @relation(fields: [structure_id], references: [id], onDelete: Cascade)
  @@index([structure_id])
}

// ─── EXPORTS ───
model ExportPDF {
  id            String     @id @default(uuid())
  structure_id  String
  type_export   TypeExport
  periode_debut DateTime
  periode_fin   DateTime
  genere_par    String
  url           String
  created_at    DateTime   @default(now())
  structure     Structure @relation(fields: [structure_id], references: [id], onDelete: Cascade)
  @@index([structure_id])
}

// ─── DEMANDES DÉMO ───
model DemandeDemo {
  id                String    @id @default(uuid())
  nom               String
  email             String
  telephone         String
  type_structure    String
  nombre_structures String
  date_demande      DateTime  @default(now())
  structure_id      String?
  structure         Structure? @relation(fields: [structure_id], references: [id], onDelete: SetNull)
}
```

Migrations existantes (ordre chronologique) :
1. `inittype` — schéma initial
2. `add_modules_actifs` — modules dynamiques par structure
3. `add_type_plat` — distinction CHAUD/FROID sur RelevePlat
4. `add_regimes_alimentaires` — array `regimes` sur Enfant
5. `add_portail_token` — token unique enfant pour portail parents
6. `add_incidents` — modèle Incident

---

## 6. Authentification & autorisation

### Authentification
- **Supabase Auth** (`@supabase/ssr`), email/password, sans OAuth.
- Inscription en 3 étapes (`/register`) :
  1. Infos perso (prénom, nom, email, password ≥ 6 chars) → stockés dans `auth.users.user_metadata.{prenom,nom}`
  2. Type de structure + nom
  3. Choix des modules (preset HACCP essentiel / Solution complète / personnalisé)
- Création atomique :
  - `supabase.auth.signUp({ email, password, options: { data: { prenom, nom } } })`
  - puis `POST /api/register` → crée `Structure` + `UserStructure(role=GESTIONNAIRE)`
- Login (`/login`), Forgot password (`/forgot-password`).
- Email de confirmation Supabase requis avant connexion.

### Hook `useAuth()` (`src/hooks/use-auth.ts`)
Retourne `{ user, prenom, structures, activeStructureId, activeStructure, activeRole, modulesActifs, switchStructure, loading }`.
- Charge les `UserStructure` via Supabase (PostgREST), filtre par `user_id`.
- `activeStructureId` persisté en `localStorage["activeStructureId"]`.
- `prenom` extrait dans l'ordre : `user_metadata.prenom` → `full_name` (1er mot) → `name` → préfixe email.

### Middleware (`src/middleware.ts`)
- Routes publiques : `/`, `/blog/*`, `/login`, `/register`, `/forgot-password`, `/test`, `/api/*`, `/portail/*`
- Sinon : redirection `/login?redirect=<pathname>` si user absent.
- Matcher exclut `_next/static`, `_next/image`, `favicon`, fichiers images.

### Rôles
- `GESTIONNAIRE` — droits complets sur sa structure (incl. delete, paramètres, exports)
- `PROFESSIONNEL` — saisies (insert/update) sur la plupart des modules, pas de delete, pas de paramètres
- `PARENT` — lecture seule des données de SES enfants (pas implémenté en prod, prévu via portail)

### RLS Supabase (`supabase/rls-policies.sql`)
**Toutes** les tables métier sont en `ENABLE ROW LEVEL SECURITY`. Deux fonctions helper SQL :
```sql
CREATE FUNCTION user_belongs_to_structure(p_structure_id uuid) RETURNS boolean
  AS $$ SELECT EXISTS (SELECT 1 FROM "UserStructure"
        WHERE user_id = auth.uid()::text AND structure_id = p_structure_id::text); $$
  LANGUAGE sql SECURITY DEFINER STABLE;

CREATE FUNCTION user_has_role_in_structure(p_structure_id uuid, p_roles text[]) RETURNS boolean
  AS $$ SELECT EXISTS (SELECT 1 FROM "UserStructure"
        WHERE user_id = auth.uid()::text AND structure_id = p_structure_id::text
          AND role::text = ANY(p_roles)); $$
  LANGUAGE sql SECURITY DEFINER STABLE;
```

Pattern de policies :
- **SELECT** : `user_belongs_to_structure(structure_id)`
- **INSERT/UPDATE** : `user_has_role_in_structure(structure_id, ARRAY['GESTIONNAIRE','PROFESSIONNEL'])`
- **DELETE** : `user_has_role_in_structure(structure_id, ARRAY['GESTIONNAIRE'])` (sauf exceptions ci-dessous)
- **ZoneNettoyage / TacheNettoyage / Protocole** : INSERT/UPDATE/DELETE = GESTIONNAIRE seul
- **ExportPDF** : INSERT = GESTIONNAIRE
- Tables jointes (AllergieEnfant, ContactUrgence, TacheNettoyage, ValidationNettoyage, MouvementStock) : check via `EXISTS (SELECT FROM parent ...)`
- **DemandeDemo** : INSERT public (`true`), SELECT par GESTIONNAIRE de la structure liée
- Script idempotent : `DROP POLICY IF EXISTS` boucle avant recréation

À exécuter après `prisma migrate` : `psql $DIRECT_URL -f supabase/rls-policies.sql`

---

## 7. Modules — règles métier

Source unique : `src/lib/constants.ts` + `src/lib/business-logic.ts`. **Aucune valeur réglementaire hardcodée hors de ces fichiers.**

### 7.1 Constantes réglementaires (`constants.ts`)

```ts
SEUILS_TEMPERATURE = {
  frigo_min: 0,           // °C — conforme
  frigo_max: 4,
  frigo_warning: 5,       // ≤ warning = "attention", > warning = "alerte"
  congel_max: -18,        // ≤ -18 = conforme
  congel_warning: -15,    // ≤ -15 = "attention"
  plat_chaud_min: 63,     // T° service ≥ 63°C (HACCP)
  plat_froid_max: 3,      // T° service ≤ 3°C
  // Plages physiquement plausibles (validation saisie)
  frigo_plage_min: -10, frigo_plage_max: 15,
  congel_plage_min: -30, congel_plage_max: 0,
}
DELAI_BIBERON_MINUTES = 60         // ANSES : limite stricte
DELAI_BIBERON_ATTENTION_MINUTES = 45
DELAI_BOITE_LAIT_JOURS = 30
DLC_ALERTE_JOURS = 2
```

### 7.2 Modules disponibles

```ts
MODULES_DISPONIBLES = {
  temperatures:  { categorie: "haccp",   icon: Thermometer,     desc: "Relevés frigo, congélateur, plats" },
  tracabilite:   { categorie: "haccp",   icon: Package,         desc: "Réceptions, lots, DLC, fournisseurs" },
  nettoyage:     { categorie: "haccp",   icon: Sparkles,        desc: "Plan de nettoyage, validations" },
  biberonnerie:  { categorie: "haccp",   icon: Baby,            desc: "Préparation, timer ANSES, traçabilité lait" },
  repas:         { categorie: "suivi",   icon: UtensilsCrossed, desc: "Suivi repas enfants" },
  changes:       { categorie: "suivi",   icon: Baby,            desc: "Suivi changes" },
  siestes:       { categorie: "suivi",   icon: Moon,            desc: "Suivi siestes" },
  transmissions: { categorie: "suivi",   icon: MessageSquare,   desc: "Notes et transmissions" },
  stocks:        { categorie: "gestion", icon: Boxes,           desc: "Gestion des stocks consommables" },
  protocoles:    { categorie: "gestion", icon: FileText,        desc: "Documents et protocoles internes" },
}

PRESETS_MODULES = {
  haccp_essentiel: ["temperatures","tracabilite","nettoyage","biberonnerie"],
  complet: [...all 10],
}
```

Les modules actifs sont stockés sur `Structure.modules_actifs` (string[]). UI/sidebar/bottom-nav filtrent dynamiquement via `useModules(modulesActifs).isActif(id)`.

### 7.3 Règles métier (`business-logic.ts`)

```ts
// Conformité température enceinte froide
getConformiteTemperature(t, type) :
  REFRIGERATEUR : [0, 4] = conforme | ≤5 = attention | sinon alerte
  CONGELATEUR   : ≤ -18 = conforme | ≤ -15 = attention | sinon alerte

// Validation plage physiquement plausible (sinon refus côté form)
validerPlageTemperature(t, type) :
  REFRIGERATEUR : t ∈ [-10, 15]
  CONGELATEUR   : t ∈ [-30, 0]

// Conformité plat témoin
getConformitePlat(t_apres, type) :
  CHAUD : t ≥ 63 = conforme
  FROID : t ≤ 3  = conforme

// Statut biberon depuis préparation
getStatutBiberon(heure_prep, now) :
  diff > 60 min → "alerte"
  diff > 45 min → "attention"
  sinon         → "ok"

// Boîte lait expirée
isBoiteLaitExpiree(date_ouverture, now) : (now - date_ouverture) > 30 jours

// Alerte DLC produit
getAlerteDLC(dlc, now) :
  dlc < aujourd'hui  → "critique"
  dlc = aujourd'hui  → "alerte"
  dlc ≤ J+2          → "warning"
  sinon              → null

// Âge enfant lisible
calculerAge(naissance, now) :
  < 30 jours  → "X jour(s)"
  < 24 mois   → "X mois"
  2-6 ans     → "X ans et Y mois" (Y omis si 0)
  ≥ 6 ans     → "X ans"

// Tâches de nettoyage du jour
getTachesJour(taches, date) :
  filtre actif=false
  APRES_UTILISATION / QUOTIDIEN / BIQUOTIDIEN → toujours
  HEBDO → lundi (getDay()===1)
  BIMENSUEL → 1er ou 15
  MENSUEL → 1er
```

### 7.4 Comportements UI par module

**Températures** (`/dashboard/[id]/temperatures`)
- Liste équipements (frigos, congélateurs) avec ajout/suppression (Trash2 icon, role=GESTIONNAIRE)
- Pour chaque équipement : graph recharts derniers 30 jours, liste relevés, ajout relevé inline
- Saisie relevé : validation `validerPlageTemperature` côté Server Action ; refusé si hors plage
- Pastille statut conforme/attention/alerte (`PastilleStatut` component)
- Bouton supprimer relevé individuel (admin)
- Equipement supprimé → cascade sur ses relevés

**Biberonnerie** (`/biberonnerie`, `/biberonnerie/nouveau`)
- Liste biberons en cours (préparé non servi) + historique du jour
- Timer ANSES temps réel : `getStatutBiberon`. Pastille verte/orange/rouge, Math.round((now-prep)/60000) min
- Saisie : enfant, type lait, lot obligatoire, dosettes optionnel, qty préparée ml, préparateur (auto = prénom user)
- Si `nom_lait + date_ouverture_boite` saisis et boîte > 30j → bloque la saisie
- Conforme ANSES : auto à false si temps de service > 60 min après prep

**Réceptions & Stock** (`/stock`)
- Onglets : Réceptions / Stock courant / Mouvements
- Réception : fournisseur, nom_produit, num_lot, dlc, temperature_reception (warning si > 4°C produit froid), emballage_conforme, photo_etiquette
- Liste réceptions triée par DLC asc, badge DLC selon `getAlerteDLC`
- Statut produit : EN_STOCK → UTILISE / JETE / RAPPELE (motif obligatoire si JETE/RAPPELE)
- Bouton supprimer réception (Trash2, GESTIONNAIRE)
- Stock : produit_nom, catégorie (COUCHES/ENTRETIEN/LAIT/COMPOTES/AUTRE), quantité, unité, seuil_alerte
- Mouvements ENTREE/SORTIE recalculent quantité
- Bouton supprimer produit (Trash2)

**Nettoyage** (`/nettoyage`)
- Plan de nettoyage : zones (cuisine, change, dortoir...) → tâches → fréquences
- Liste tâches du jour (`getTachesJour`)
- Validation tâche : enregistre date+heure+pro+nom_pro+observations dans ValidationNettoyage
- Seed par défaut depuis `lib/data/taches-nettoyage-defaut.ts`
- KPI dashboard : `fait/total — pct%` + barre couleur (vert >80%, orange ≥50%, rouge sinon)

**Suivi** (`/suivi` quotidien individuel + `/suivi/groupe` vue collective)
- Saisie repas (entrée/plat/dessert + qté TOUT/BIEN/PEU/RIEN), changes, siestes
- Vue groupe : tableau enfants × actions du jour pour saisie rapide

**Transmissions** (`/transmissions`)
- 3 types : GENERAL (struct), ENFANT (lié à un enfant), EQUIPE (interne)
- Affichage feed inversé chronologique du jour, filtres par type/enfant

**Protocoles** (`/protocoles`)
- Documents markdown internes (PAI, urgences, gestes, etc.)
- Templates par défaut depuis `lib/data/protocoles-templates.ts`
- Versionning : champ `version` Int @default(1)
- CRUD : GESTIONNAIRE seul

**Exports** (`/exports`)
- Génération PDF DDPP / PMI sur période choisie via `@react-pdf/renderer`
- Composants `pdf-ddpp.tsx`, `pdf-pmi.tsx`, styles communs `pdf-styles.ts`
- Sauvegarde URL dans ExportPDF (Supabase Storage), historique listable

**Enfants** (`/enfants`, `/enfants/nouveau`, `/enfants/[id]`, `/enfants/[id]/modifier`)
- CRUD enfant avec champs : prenom, nom, date_naissance, sexe, groupe, photo, regimes[], date_entree
- Sous-collections : AllergieEnfant (allergène, sévérité, protocole, doc PAI), ContactUrgence (nom, lien, tel, autorisé récup, ordre)
- Affichage : photo + prénom + âge calculé (`calculerAge`) + groupe
- Badges allergie/régime sur fiche
- Import CSV (modal) — `components/enfants/import-csv-modal.tsx`
- Token portail parents : génération via bouton "Copier le lien", URL `/portail/[token]`, regénération possible

**Paramètres** (`/parametres`)
- Section "Informations de la structure" : nom, type, adresse, code_postal, ville, telephone, email, numero_agrement
- Section "Modules actifs" : checkboxes par catégorie + presets, sauvegarde via `updateModulesActifs`
- Bouton "Nettoyer les données aberrantes" (GESTIONNAIRE) → `nettoyerDonneesAberrantes`

### 7.5 Action `nettoyerDonneesAberrantes` (`actions/structure.ts`)
Supprime en batch :
- ReleveTemperature : `temperature > 100 OR temperature < -50`
- Equipement : nom détecté gibberish (cascade : supprime aussi ses ReleveTemperature)
- Stock : `quantite > 10000` OU produit_nom gibberish
- ReceptionMarchandise : nom_produit gibberish

Heuristique gibberish (`isGibberishNom`) :
- length < 3 → gibberish
- contient autre chose que [lettres/espaces/accents/tirets/apostrophes] → ignore (probable produit légitime)
- aucune voyelle → gibberish
- "z" accolé à une autre consonne (sauf h, y, z) → gibberish (capture "dz", "zv", "zd", "zf"...)
  - Faux positifs évités : `zz` (pizza), `zy` (crazy), `zh` (Zhang)

---

## 8. Dashboard accueil (`/dashboard/[structureId]/page.tsx`)

Charge `getDashboardData(structureId, modulesActifs)` (`actions/dashboard.ts`) qui retourne :
```ts
{
  enfantsCount: number,
  nettoyage: { fait, total, pct } | null,
  prochainesDlc: { id, nom_produit, joursRestants }[],  // 5 max
  biberonsEnAttente: { count, plusAncienPrep: Date | null },
  temperatures: { relevesAujourdhui, dernier: { temperature, equipement, heure, conforme } | null },
  activiteRecente: { module, heure, description }[]      // 10 derniers événements
}
```

UI :
- En-tête `Bonjour {prenom} 👋` + date longue FR (`toLocaleDateString fr-FR weekday/day/month/year`)
- Grid responsive `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` de cards KPI :
  - Enfants inscrits (toujours)
  - Nettoyage du jour (si module actif) — pastille + barre de progression
  - Prochaines DLC (si tracabilite OU stocks) — liste 5 produits avec pastille colorée
  - Biberons en attente (si biberonnerie) — count + temps depuis plus ancien
  - Températures du jour (si temperatures) — count + dernier relevé
- Bloc "Activité récente" (10 derniers événements modules)
- Realtime : `useRealtimeSubscription` sur `ReleveTemperature`, `Biberon`, `ReceptionMarchandise`, `ValidationNettoyage` → refetch auto

---

## 9. Design system

### 9.1 Identité visuelle

**Nom bicolore** — composant `<LogoText />` (`components/shared/logo-text.tsx`) :
```tsx
<span className="text-rzpanda-primary">RZ</span>
<span className={textClassName}>Pan</span>
<span className="text-rzpanda-primary">'</span>
<span className={textClassName}>Da</span>
```
- "RZ" et "'" en vert primaire `#66bb6a`
- "Pan" et "Da" en gris foncé (par défaut `text-gray-800`, override possible pour fond sombre)
- Aucune couleur globale sur le wrapper

**Logo panda** — composant `<PandaIcon size={64} />` (`components/shared/panda-icon.tsx`)
- SVG inline (pas de fichier statique), viewBox `60 50 280 230` (cadrage zoomé visage)
- Halo vert (`#66bb6a` opacity 0.15 + 0.25)
- Tête blanche, 2 oreilles noires, 2 taches noires autour des yeux, yeux noirs avec reflets blancs, museau noir, bouche, joues roses, 4 pattes
- Petite feuille verte au sommet (mascotte)
- Favicon : `/rzpanda-logo.svg`

### 9.2 Palette couleurs (Tailwind `rzpanda.*`)

```ts
rzpanda: {
  primary:   "#66bb6a",  // vert doux Material Green 400
  secondary: "#4caf50",  // vert Material Green 500
  accent:    "#F4A261",  // orange chaud
  danger:    "#E53E3E",  // rouge alerte
  warning:   "#F39C12",  // orange warning
  fond:      "#FAFBFC",  // fond appli (off-white)
  texte:     "#1A202C",  // texte principal
}
```

Usage Tailwind : `bg-rzpanda-primary`, `text-rzpanda-primary`, `border-rzpanda-primary`, etc. Plus alpha : `bg-rzpanda-primary/10`, `bg-rzpanda-primary/90` (hover).

Palette shadcn complémentaire (HSL vars) présente pour future compat ui kit.

### 9.3 Typographie & rayons
- Font : `Inter, system-ui, sans-serif`
- Border-radius : `rounded-xl` (12px) standard pour boutons/inputs/cards, `rounded-lg` pour petits éléments
- Inputs/boutons : hauteur fixe `h-12` (formulaires), `h-10`/`h-9`/`h-7` pour boutons compacts

### 9.4 Composants UI réutilisables
- `<PastilleStatut status="conforme|attention|alerte" />` — petit cercle coloré
- `<BadgeAllergie />`, `<BadgeRegime />`
- `<BoutonAction />` — pattern bouton primaire
- `Toaster` Sonner (top-right, richColors, duration 4000ms) dans root layout

### 9.5 Layout & responsive

**Desktop ≥ md (768px)** :
- `<Sidebar />` à gauche (240px, collapsible 72px)
  - Logo PandaIcon + LogoText
  - Bloc "Structure" : nom de la structure active
  - Sections : (Tableau de bord) / HACCP & Traçabilité / Suivi Enfants / Gestion
  - Items filtrés par module actif via `useModules`
  - Footer : prénom + bouton Déconnexion (rouge au hover)
- `<Topbar />` en haut : sélecteur structure (si plusieurs), notifications-bell
- Contenu : `flex-1 overflow-y-auto px-6 py-4`

**Mobile < md** :
- `<BottomNav />` fixe en bas, h-16, 5 items max :
  - Dashboard + jusqu'à 3 modules HACCP actifs (Températures, Biberon, Nettoyage, Stock dans cet ordre de priorité)
  - Bouton "Plus" → bottom sheet avec items secondaires (Enfants, Suivi, Transmissions, Protocoles, Exports, Paramètres, Déconnexion)
- Sidebar masqué (`hidden md:flex`)
- Padding bottom du main : `pb-20 md:pb-4`

**Breakpoints utilisés** : `sm:` (640), `md:` (768), `lg:` (1024)

---

## 10. Server Actions (résumé)

Toutes dans `src/app/actions/`, marquées `"use server"`. Pattern de retour :
```ts
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }
```

Validation entrée par schémas Zod (`lib/schemas/*`) avant `prisma.*`. Pas d'erreurs Prisma exposées au client (catch → message générique).

| Fichier | Fonctions principales |
|---|---|
| `dashboard.ts` | `getDashboardData(structureId, modules)` |
| `enfants.ts` | `listEnfants`, `getEnfant`, `createEnfant`, `updateEnfant`, `deleteEnfant`, `regenerateToken`, `importCsv` |
| `temperatures.ts` | `listEquipements`, `createEquipement`, `deleteEquipement`, `listReleves`, `createReleve`, `deleteReleve`, `createRelevePlat` |
| `biberons.ts` | `listBiberons`, `createBiberon`, `marquerServi`, `deleteBiberon` |
| `stock.ts` | `listReceptions`, `createReception`, `updateStatutReception`, `deleteReception`, `listStocks`, `createStock`, `mouvementStock`, `deleteStock` |
| `nettoyage.ts` | `listZones`, `createZone`, `listTaches`, `createTache`, `validerTache`, seed default tâches |
| `suivi.ts` | `listRepasJour`, `createRepas`, `listChangesJour`, `createChange`, `listSiestesJour`, `createSieste`, vues groupe |
| `transmissions.ts` | `listTransmissions`, `createTransmission`, `deleteTransmission` |
| `protocoles.ts` | `listProtocoles`, `getProtocole`, `createProtocole`, `updateProtocole`, `archiveProtocole` |
| `exports.ts` | `genererExportDDPP(periode)`, `genererExportPMI(periode)`, `listExports` |
| `structure.ts` | `getStructureInfo`, `updateStructureInfo`, `updateModulesActifs`, `nettoyerDonneesAberrantes` |
| `alertes.ts` | calcul alertes globales (DLC, biberons, températures non conformes) pour notifications-bell |
| `demo.ts` | `enregistrerDemandeDemo` (publique, formulaire marketing) |
| `portail-parents.ts` | `getEnfantParToken(token)`, `listSignalementsParToken` |

Toutes les actions vérifient implicitement que `structure_id` correspond à une structure du user via les RLS Supabase. Côté Prisma (server), Prisma utilise une connexion `service_role` qui bypass RLS — c'est pourquoi les actions DOIVENT vérifier l'appartenance à la structure manuellement avant tout query (en pratique : récupérer `auth.uid()` via `createServerSupabaseClient()` et comparer).

---

## 11. Schémas Zod (`src/lib/schemas/`)

Un fichier par modèle : `biberon.ts`, `change.ts`, `enfant.ts`, `nettoyage.ts`, `protocole.ts`, `reception.ts`, `repas.ts`, `sieste.ts`, `stock.ts`, `temperatures.ts`, `transmission.ts`, `signalement.ts`, `demo.ts`, `exports.ts`. Re-exportés par `index.ts`.

Convention : un schéma `XxxCreateSchema` (insertion) et `XxxUpdateSchema` (PATCH partial). Les bornes physiquement plausibles (température, qty bib) référencent `SEUILS_TEMPERATURE` de `constants.ts` (jamais hardcodé).

---

## 12. Realtime

Hook `useRealtimeSubscription(table, structureId | null, { onInsert, onUpdate, onDelete })` (`src/hooks/use-realtime-subscription.ts`) :
- Crée un channel Supabase Realtime sur la table filtrée par `structure_id=eq.<id>`
- Si `structureId` est `null`, ne souscrit pas (utile pour modules désactivés)
- Cleanup au unmount

Tables abonnées sur le dashboard accueil : `ReleveTemperature`, `Biberon`, `ReceptionMarchandise`, `ValidationNettoyage`.

---

## 13. SEO / metadata

Root layout (`src/app/layout.tsx`) :
```ts
metadata = {
  title: { default: "RZPan'Da — Gestion HACCP & Traçabilité Petite Enfance",
           template: "%s | RZPan'Da" },
  description: "RZPan'Da : le SaaS de gestion HACCP, PMS et traçabilité alimentaire pour les crèches, micro-crèches, MAM et assistantes maternelles en France.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: { ..., locale: "fr_FR", type: "website" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  icons: { icon: "/rzpanda-logo.svg" },
}
```

`html lang="fr"`, `body` avec `bg-rzpanda-fond antialiased`. `<Toaster />` Sonner monté ici.

`src/app/robots.ts` et `src/app/sitemap.ts` exposent métadonnées Next standard.

---

## 14. Site marketing (`src/app/(marketing)/`)

- Layout dédié sans sidebar dashboard
- Landing page (`page.tsx`) : hero avec PandaIcon + LogoText, sections features, presets tarifaires, formulaire demande démo
- Formulaire démo → action serveur `enregistrerDemandeDemo` → DemandeDemo (RLS public en INSERT)

---

## 15. Portail parents

### Mode 1 : par token (sans login)
- `/portail/[token]` — accessible publiquement (route exclue middleware)
- Récupère `Enfant` via `portail_token` unique, affiche :
  - Suivi du jour (repas, changes, siestes)
  - Transmissions liées
  - Photos
- Génération token : bouton sur fiche enfant côté pro (`enfants/[id]`), URL copiable, regénération possible

### Mode 2 : parent connecté
- `/portail-parents/page.tsx` — liste enfants liés au compte
- `/portail-parents/signalements/page.tsx` — formulaire de signalement (ex : absence, allergie nouvelle)
- Layout dédié `(portail-parents/layout.tsx)`

---

## 16. Tests

### Vitest (unitaires)
- Cibles : `lib/business-logic.ts` (toutes les fonctions de seuils + calcul âge + tâches du jour), `lib/schemas/*` (validation Zod)
- Config : `vitest.config.ts`
- Run : `npm test` (CI), `npm run test:watch` (dev), `npm run test:ui`

### Playwright (E2E)
- Cibles : flow inscription complet, login, dashboard chargement, ajout relevé température, validation tâche nettoyage
- Config : `playwright.config.ts`
- Run : `npm run test:e2e`

---

## 17. Workflow setup d'un nouveau projet (recréation)

```bash
# 1. Init Next.js
npx create-next-app@14.2.21 rzpanda --typescript --tailwind --app --src-dir --no-eslint
cd rzpanda

# 2. Dépendances
npm i @prisma/client @supabase/ssr @supabase/supabase-js \
  @hookform/resolvers react-hook-form zod \
  lucide-react sonner clsx tailwind-merge class-variance-authority tailwindcss-animate \
  recharts @react-pdf/renderer
npm i -D prisma tsx vitest @vitest/ui @playwright/test

# 3. Init Prisma + copier schema.prisma (section 5)
npx prisma init
# … coller schema.prisma …
npx prisma migrate dev --name inittype

# 4. Créer projet Supabase, copier .env.local
# 5. Appliquer RLS
psql $DIRECT_URL -f supabase/rls-policies.sql

# 6. Copier code source (sections 4 + 8 + 9 + 10)
# 7. Seed (optionnel)
npm run db:seed

# 8. Dev
npm run dev
```

Étapes critiques :
1. Le composant `<LogoText />` doit colorer "RZ" et "'" en vert primaire — sans couleur globale sur le wrapper
2. `<PandaIcon />` viewBox `60 50 280 230` (cadrage zoomé)
3. `Structure.modules_actifs` est un `String[]` PostgreSQL avec un default contenant les 10 modules
4. Toutes les valeurs réglementaires viennent de `constants.ts` — JAMAIS hardcodées dans les composants
5. RLS doit être activé sur **toutes** les tables et utiliser les fonctions helper `user_belongs_to_structure` / `user_has_role_in_structure`
6. Le middleware exclut `/portail/*` (accès parents par token) et `/api/*`
7. La navigation desktop/mobile filtre dynamiquement les items selon `modulesActifs` — un module désactivé n'apparaît PAS dans la nav
8. `prenom` est extrait avec fallbacks multiples (`user_metadata.prenom` → `full_name` → `name` → préfixe email)

---

## 18. Conventions de code

- TypeScript strict, pas de `any` non justifié
- Server Actions : retour `{ success: true; data }` | `{ success: false; error }`
- Pas de logique métier dans les composants — toujours dans `lib/business-logic.ts` ou Server Actions
- Imports Lucide nommés depuis `lucide-react`
- `cn(...)` (clsx + tailwind-merge) pour les classes conditionnelles
- Naming Prisma : `snake_case` pour les colonnes, `PascalCase` pour les modèles, `camelCase` pour le client TS (généré auto)
- Fichiers React : `kebab-case.tsx` (sauf composants `PascalCase` exportés nommés)
- Pas d'emojis dans le code, sauf 1 emoji discret dans les UI françaises (👋, ✓) par convention produit
- Toasts via `toast.success(msg)` / `toast.error(msg)` (Sonner), jamais `alert()`

---

## 19. Notes finales

- Ce produit est franco-français : tous les libellés UI, mails, exports sont en français. La date est toujours formatée en `fr-FR`.
- Les exports DDPP/PMI sont les livrables réglementaires attendus par les services de contrôle (DDPP = Direction Départementale de Protection des Populations, PMI = Protection Maternelle et Infantile).
- Le nom bicolore "RZPan'Da" et le panda mascotte sont l'identité de marque centrale — toute reconstruction doit les préserver à l'identique.
- L'ancien nom était "PetitSafe" — il ne doit plus apparaître nulle part dans le code ou les libellés.
