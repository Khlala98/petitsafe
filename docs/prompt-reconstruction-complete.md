# RZPan'Da — Document de reconstruction complète

> Ce document décrit l'intégralité du projet **RZPan'Da** (anciennement PetitSafe) — un SaaS HACCP, traçabilité alimentaire et suivi enfants pour crèches, micro-crèches, MAM et assistantes maternelles. Il est dimensionné pour qu'un développeur ou une IA puisse recréer le produit à l'identique sans accès au code source.
>
> **Dernière mise à jour** : Phase 4 — Profils partagés avec PIN, droits d'accès, groupes d'âge, alertes lait, émargement nettoyage, annuaire équipe.
>
> **Domaine production** : https://rzpanda.fr (alias : https://rzpanda.vercel.app)

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
- **Multi-profil par structure** : oui (Phase 4 — un compte Supabase par structure, plusieurs profils professionnels qui se partagent l'appareil)

### Branding

- **Couleur primaire** : `#66bb6a` (vert doux)
- **Couleur secondaire** : `#4caf50`
- **Couleur accent** : `#F4A261` (orange)
- **Couleur danger** : `#E53E3E`
- **Couleur warning** : `#F39C12`
- **Fond** : `#FAFBFC`
- **Texte** : `#1A202C`
- **Nom bicolore** : `RZ` en vert + `Pan` en noir + `'` en vert + `Da` en noir
- **Logo** : panda SVG inline (visage zoomé + halo vert), composant `PandaIcon`
- **Font** : Inter (system fallback sans-serif)
- **Préfixe CSS Tailwind** : `rzpanda-*` (rzpanda-primary, rzpanda-secondary, etc.)

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
- **bcryptjs 3.x** + **@types/bcryptjs** (hachage PIN profils — import nommé `import { hash, compare } from "bcryptjs"`)

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

### package.json — dépendances complètes
```json
{
  "dependencies": {
    "@hookform/resolvers": "^3.9.1",
    "@prisma/client": "^5.22.0",
    "@react-pdf/renderer": "^4.1.5",
    "@supabase/ssr": "^0.5.2",
    "@supabase/supabase-js": "^2.47.10",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.383.0",
    "next": "14.2.21",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.54.2",
    "recharts": "^2.15.0",
    "sonner": "^1.7.1",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "bcryptjs": "^3.0.2",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@playwright/test": "^1.49.1",
    "@types/node": "^22.10.2",
    "@types/react": "^18.3.14",
    "@types/react-dom": "^18.3.5",
    "@vitest/ui": "^2.1.8",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "prisma": "^5.22.0",
    "tailwindcss": "^3.4.16",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
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
├── .env.local.example
├── .gitignore
├── next.config.js
├── next-env.d.ts
├── package.json
├── playwright.config.ts
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
│
├── prisma/
│   ├── schema.prisma              # Source unique de vérité DB
│   └── seed.ts                    # Données de seed
│
├── docs/
│   └── prompt-reconstruction-complete.md
│
└── src/
    ├── middleware.ts               # Auth middleware Next.js
    │
    ├── app/
    │   ├── layout.tsx              # Root layout (html, body, Toaster)
    │   ├── robots.ts               # robots.txt
    │   ├── sitemap.ts              # sitemap.xml
    │   │
    │   ├── (auth)/                 # Route group — authentification
    │   │   ├── login/page.tsx
    │   │   ├── register/page.tsx
    │   │   └── forgot-password/page.tsx
    │   │
    │   ├── (marketing)/            # Route group — site vitrine
    │   │   ├── layout.tsx
    │   │   └── page.tsx            # Landing page
    │   │
    │   ├── api/
    │   │   └── register/route.ts   # POST — création structure après signup
    │   │
    │   ├── dashboard/
    │   │   ├── layout.tsx          # ProfilProvider + SelectProfil + Sidebar + Topbar + BottomNav
    │   │   ├── page.tsx            # Redirection vers /dashboard/[structureId]
    │   │   ├── multi-structures/page.tsx
    │   │   │
    │   │   └── [structureId]/
    │   │       ├── page.tsx                    # Dashboard principal
    │   │       ├── temperatures/page.tsx       # Relevés frigo/congélateur/plats
    │   │       ├── biberonnerie/
    │   │       │   ├── page.tsx                # Liste biberons du jour
    │   │       │   └── nouveau/page.tsx        # Formulaire nouveau biberon
    │   │       ├── stock/page.tsx              # Réceptions + stocks consommables
    │   │       ├── nettoyage/page.tsx          # Plan nettoyage + émargement
    │   │       ├── enfants/
    │   │       │   ├── page.tsx                # Liste enfants
    │   │       │   ├── nouveau/page.tsx        # Ajout enfant
    │   │       │   └── [id]/
    │   │       │       ├── page.tsx            # Fiche enfant
    │   │       │       └── modifier/page.tsx   # Modification enfant
    │   │       ├── suivi/
    │   │       │   ├── page.tsx                # Suivi individuel du jour
    │   │       │   └── groupe/page.tsx         # Vue groupe (matrice activités)
    │   │       ├── transmissions/page.tsx      # Transmissions + annuaire équipe
    │   │       ├── protocoles/page.tsx         # Protocoles internes
    │   │       ├── exports/page.tsx            # Exports PDF DDPP/PMI
    │   │       └── parametres/page.tsx         # Paramètres structure + modules + seuils âge + profils
    │   │
    │   ├── portail/                # Portail parent via token
    │   │   ├── layout.tsx
    │   │   └── [token]/page.tsx
    │   │
    │   ├── portail-parents/        # Portail parent authentifié
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   └── signalements/page.tsx
    │   │
    │   └── actions/                # Server Actions (15 fichiers)
    │       ├── alertes.ts
    │       ├── biberons.ts
    │       ├── dashboard.ts
    │       ├── demo.ts
    │       ├── enfants.ts
    │       ├── exports.ts
    │       ├── nettoyage.ts
    │       ├── portail-parents.ts
    │       ├── profils.ts
    │       ├── protocoles.ts
    │       ├── stock.ts
    │       ├── structure.ts
    │       ├── suivi.ts
    │       ├── temperatures.ts
    │       └── transmissions.ts
    │
    ├── components/
    │   ├── layout/
    │   │   ├── sidebar.tsx             # Navigation desktop avec filtrage rôle/modules
    │   │   ├── topbar.tsx              # Header avec sélecteur structure + profil actif + cloche
    │   │   ├── bottom-nav.tsx          # Navigation mobile avec filtrage rôle/modules
    │   │   ├── notifications-bell.tsx  # Cloche alertes temps réel (polling 60s)
    │   │   └── select-profil.tsx       # Écran "Qui êtes-vous ?" + auto-création admin
    │   │
    │   ├── enfants/
    │   │   ├── enfant-form.tsx         # Formulaire enfant (allergies, contacts, régimes)
    │   │   └── import-csv-modal.tsx    # Import CSV enfants
    │   │
    │   ├── shared/
    │   │   ├── admin-guard.tsx         # Hook useAdminGuard + composant AdminGuard (redirect)
    │   │   ├── admin-only.tsx          # AdminOnly + OwnerOrAdmin (masquage conditionnel)
    │   │   ├── badge-allergie.tsx      # Badge allergie coloré par sévérité
    │   │   ├── badge-regime.tsx        # Badge régime alimentaire
    │   │   ├── bouton-action.tsx       # Bouton action réutilisable
    │   │   ├── logo-text.tsx           # "RZPan'Da" bicolore (RZ vert + Pan Da noir)
    │   │   ├── panda-icon.tsx          # Logo panda SVG inline
    │   │   └── pastille-statut.tsx     # Pastille de statut colorée
    │   │
    │   ├── pdf/
    │   │   ├── pdf-ddpp.tsx            # Composant React-PDF rapport DDPP
    │   │   ├── pdf-pmi.tsx             # Composant React-PDF rapport PMI
    │   │   ├── panda-icon.tsx          # Panda pour en-tête PDF
    │   │   └── pdf-styles.ts           # Styles React-PDF partagés
    │   │
    │   └── ui/
    │       └── accordion.tsx           # Composant accordéon UI
    │
    ├── hooks/
    │   ├── use-auth.ts                 # Hook auth Supabase + structures + switchStructure
    │   ├── use-profil.tsx              # ProfilProvider + useProfil (Phase 4)
    │   ├── use-modules.ts              # Hook isActif/modulesParCategorie
    │   └── use-realtime-subscription.ts # Hook Supabase Realtime
    │
    ├── lib/
    │   ├── utils.ts                    # cn() = clsx + twMerge
    │   ├── business-logic.ts           # Logique métier (température, biberon, DLC, âge, nettoyage)
    │   ├── constants.ts                # Seuils, couleurs, modules, types lait, régimes
    │   ├── permissions.ts              # verifierAdmin, verifierProprietaire, verifierAdminOuProprietaire
    │   │
    │   ├── supabase/
    │   │   ├── client.ts               # createClient() + lazy singleton Proxy
    │   │   ├── server.ts               # createServerSupabaseClient() (cookies)
    │   │   └── prisma.ts               # PrismaClient singleton global
    │   │
    │   ├── schemas/                    # Schémas Zod
    │   │   ├── index.ts
    │   │   ├── enfant.ts
    │   │   ├── biberon.ts
    │   │   ├── change.ts
    │   │   ├── repas.ts
    │   │   ├── sieste.ts
    │   │   ├── transmission.ts
    │   │   ├── nettoyage.ts
    │   │   ├── protocole.ts
    │   │   ├── stock.ts
    │   │   ├── temperatures.ts
    │   │   ├── signalement.ts
    │   │   ├── reception.ts
    │   │   ├── exports.ts
    │   │   └── demo.ts
    │   │
    │   └── data/
    │       ├── seed-data.ts                  # Données de seed
    │       ├── protocoles-templates.ts       # Modèles de protocoles
    │       └── taches-nettoyage-defaut.ts    # Tâches nettoyage par défaut
    │
    └── types/
        └── index.ts                    # ActionResult<T>, EnfantAvecAllergies, etc.
```

---

## 5. Schéma Prisma complet

```prisma
// RZPan'Da — Schéma Prisma complet
// Source unique de vérité pour tous les modèles de données

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ═══ ENUMS ═══

enum StructureType {
  CRECHE
  MICRO_CRECHE
  MAM
  ASS_MAT
}

enum Role {
  GESTIONNAIRE
  PROFESSIONNEL
  PARENT
}

enum Sexe {
  FILLE
  GARCON
}

enum Severite {
  LEGERE
  MODEREE
  SEVERE
}

enum TypeRepas {
  PETIT_DEJ
  DEJEUNER
  GOUTER
  DINER
}

enum Quantite {
  TOUT
  BIEN
  PEU
  RIEN
}

enum TypeChange {
  MOUILLEE
  SELLE
  LES_DEUX
}

enum QualiteSieste {
  CALME
  AGITE
  DIFFICILE
  REVEILS
}

enum TypeEquipement {
  REFRIGERATEUR
  CONGELATEUR
}

enum TypePlat {
  CHAUD
  FROID
}

enum StatutProduit {
  EN_STOCK
  UTILISE
  JETE
  RAPPELE
}

enum Frequence {
  APRES_UTILISATION
  QUOTIDIEN
  BIQUOTIDIEN
  HEBDO
  BIMENSUEL
  MENSUEL
}

enum TypeMouvement {
  ENTREE
  SORTIE
}

enum TypeTransmission {
  GENERAL
  ENFANT
  EQUIPE
}

enum TypeExport {
  DDPP
  PMI
  INTERNE
}

enum RoleProfil {
  ADMINISTRATEUR
  PROFESSIONNEL
}

enum CategorieStock {
  COUCHES
  ENTRETIEN
  LAIT
  COMPOTES
  AUTRE
}

enum TypeIncident {
  CHUTE
  MORSURE
  GRIFFURE
  PLEURS_PROLONGES
  FIEVRE
  AUTRE
}

enum GraviteIncident {
  MINEUR
  MODERE
  GRAVE
}

// ═══ MULTI-TENANT ═══

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
  modules_actifs   String[]      @default(["temperatures", "tracabilite", "nettoyage", "biberonnerie", "repas", "changes", "siestes", "transmissions", "stocks", "protocoles"])
  seuil_bebes_max  Int           @default(18)
  seuil_moyens_max Int           @default(30)
  created_at       DateTime      @default(now())

  users            UserStructure[]
  profils          Profil[]
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
  user_id      String
  structure_id String
  role         Role
  structure    Structure @relation(fields: [structure_id], references: [id], onDelete: Cascade)

  @@unique([user_id, structure_id])
  @@index([user_id])
  @@index([structure_id])
}

// ═══ PROFILS (système multi-profils par structure — Phase 4) ═══

model Profil {
  id             String     @id @default(uuid())
  structure_id   String
  prenom         String
  nom            String
  poste          String?
  role           RoleProfil @default(PROFESSIONNEL)
  telephone      String?
  email          String?
  certifications String?
  notes          String?
  pin            String?    // Mot de passe profil, hashé bcrypt — obligatoire à la création, PIN par défaut "0000"
  actif          Boolean    @default(true)
  created_at     DateTime   @default(now())
  updated_at     DateTime   @updatedAt

  structure      Structure  @relation(fields: [structure_id], references: [id], onDelete: Cascade)

  releves_temp           ReleveTemperature[]
  biberons               Biberon[]
  validations_nettoyage  ValidationNettoyage[]
  repas                  Repas[]
  changes                Change[]
  siestes                Sieste[]
  transmissions          Transmission[]
  incidents              Incident[]
  receptions             ReceptionMarchandise[]
  releves_plat           RelevePlat[]

  @@index([structure_id])
  @@index([structure_id, actif])
}

// ═══ ENFANTS ═══

model Enfant {
  id             String   @id @default(uuid())
  structure_id   String
  prenom         String
  nom            String
  date_naissance DateTime
  sexe           Sexe?
  groupe         String?
  groupe_force   Boolean  @default(false)
  photo_url      String?
  actif          Boolean  @default(true)
  date_entree    DateTime?
  regimes        String[] @default([])
  portail_token  String?  @unique

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

  enfant       Enfant @relation(fields: [enfant_id], references: [id], onDelete: Cascade)

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

  enfant                 Enfant @relation(fields: [enfant_id], references: [id], onDelete: Cascade)

  @@index([enfant_id])
}

// ═══ SUIVI QUOTIDIEN ═══

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
  profil_id            String?

  structure            Structure @relation(fields: [structure_id], references: [id], onDelete: Cascade)
  enfant               Enfant    @relation(fields: [enfant_id], references: [id], onDelete: Cascade)
  profil               Profil?   @relation(fields: [profil_id], references: [id], onDelete: SetNull)

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
  profil_id        String?

  structure        Structure @relation(fields: [structure_id], references: [id], onDelete: Cascade)
  enfant           Enfant    @relation(fields: [enfant_id], references: [id], onDelete: Cascade)
  profil           Profil?   @relation(fields: [profil_id], references: [id], onDelete: SetNull)

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
  profil_id        String?

  structure        Structure @relation(fields: [structure_id], references: [id], onDelete: Cascade)
  enfant           Enfant    @relation(fields: [enfant_id], references: [id], onDelete: Cascade)
  profil           Profil?   @relation(fields: [profil_id], references: [id], onDelete: SetNull)

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
  profil_id        String?

  structure        Structure @relation(fields: [structure_id], references: [id], onDelete: Cascade)
  enfant           Enfant    @relation(fields: [enfant_id], references: [id], onDelete: Cascade)
  profil           Profil?   @relation(fields: [profil_id], references: [id], onDelete: SetNull)

  @@index([structure_id, date])
  @@index([enfant_id, date])
}

// ═══ INCIDENTS ═══

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
  profil_id        String?

  structure        Structure @relation(fields: [structure_id], references: [id], onDelete: Cascade)
  enfant           Enfant    @relation(fields: [enfant_id], references: [id], onDelete: Cascade)
  profil           Profil?   @relation(fields: [profil_id], references: [id], onDelete: SetNull)

  @@index([structure_id, date])
  @@index([enfant_id, date])
}

// ═══ TEMPÉRATURES ═══

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
  profil_id         String?

  structure         Structure  @relation(fields: [structure_id], references: [id], onDelete: Cascade)
  equipement        Equipement @relation(fields: [equipement_id], references: [id], onDelete: Cascade)
  profil            Profil?    @relation(fields: [profil_id], references: [id], onDelete: SetNull)

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
  profil_id         String?

  structure         Structure @relation(fields: [structure_id], references: [id], onDelete: Cascade)
  profil            Profil?   @relation(fields: [profil_id], references: [id], onDelete: SetNull)

  @@index([structure_id, date])
}

// ═══ TRAÇABILITÉ ALIMENTAIRE ═══

model ReceptionMarchandise {
  id                   String        @id @default(uuid())
  structure_id         String
  date                 DateTime
  fournisseur          String
  nom_produit          String
  numero_lot           String
  dlc                  DateTime
  temperature_reception Float?
  emballage_conforme   Boolean       @default(true)
  photo_etiquette_url  String?
  photo_bon_livraison  String?
  conforme             Boolean       @default(true)
  motif_non_conformite String?
  statut               StatutProduit @default(EN_STOCK)
  motif_destruction    String?
  professionnel_id     String
  profil_id            String?

  structure            Structure @relation(fields: [structure_id], references: [id], onDelete: Cascade)
  profil               Profil?   @relation(fields: [profil_id], references: [id], onDelete: SetNull)

  @@index([structure_id, date])
  @@index([structure_id, dlc])
}

// ═══ NETTOYAGE ═══

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

  zone        ZoneNettoyage        @relation(fields: [zone_id], references: [id], onDelete: Cascade)
  validations ValidationNettoyage[]

  @@index([zone_id])
}

model ValidationNettoyage {
  id               String   @id @default(uuid())
  tache_id         String
  date             DateTime
  heure            DateTime
  professionnel_id String
  professionnel_nom String
  observations     String?
  profil_id        String?

  tache            TacheNettoyage @relation(fields: [tache_id], references: [id], onDelete: Cascade)
  profil           Profil?        @relation(fields: [profil_id], references: [id], onDelete: SetNull)

  @@index([tache_id, date])
}

// ═══ STOCKS ═══

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
  id       String        @id @default(uuid())
  stock_id String
  date     DateTime
  type_mouv TypeMouvement
  quantite Float
  motif    String?
  par      String

  stock    Stock @relation(fields: [stock_id], references: [id], onDelete: Cascade)

  @@index([stock_id])
}

// ═══ TRANSMISSIONS ═══

model Transmission {
  id           String           @id @default(uuid())
  structure_id String
  enfant_id    String?
  date         DateTime
  contenu      String
  auteur       String
  type_transm  TypeTransmission
  profil_id    String?

  structure    Structure @relation(fields: [structure_id], references: [id], onDelete: Cascade)
  enfant       Enfant?   @relation(fields: [enfant_id], references: [id], onDelete: SetNull)
  profil       Profil?   @relation(fields: [profil_id], references: [id], onDelete: SetNull)

  @@index([structure_id, date])
  @@index([enfant_id, date])
}

// ═══ PROTOCOLES ═══

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

// ═══ EXPORTS ═══

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

// ═══ DEMANDES DÉMO (site marketing) ═══

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

### Points clés du schéma

- **19 enums** : StructureType, Role, Sexe, Severite, TypeRepas, Quantite, TypeChange, QualiteSieste, TypeEquipement, TypePlat, StatutProduit, Frequence, TypeMouvement, TypeTransmission, TypeExport, **RoleProfil**, CategorieStock, TypeIncident, GraviteIncident
- **29 models** dont le model **Profil** (Phase 4) avec **champ `pin`** (hashé bcrypt, PIN par défaut `0000`)
- **Champ `profil_id` optionnel** sur toutes les tables d'action : Biberon, Repas, Change, Sieste, Incident, ReleveTemperature, RelevePlat, ReceptionMarchandise, ValidationNettoyage, Transmission
- **Relations `onDelete: SetNull`** pour profil_id (le profil peut être désactivé sans perdre l'historique)
- **Champs `seuil_bebes_max` et `seuil_moyens_max`** sur Structure (défauts : 18 et 30 mois)
- **Champ `groupe_force`** sur Enfant (forçage manuel du groupe)
- **Index composites** sur `[structure_id, date]` et `[enfant_id, date]` pour les performances

---

## 6. Configuration Tailwind

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rzpanda: {
          primary: "#66bb6a",
          secondary: "#4caf50",
          accent: "#F4A261",
          danger: "#E53E3E",
          warning: "#F39C12",
          fond: "#FAFBFC",
          texte: "#1A202C",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.05)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

## 7. Configuration Next.js

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

module.exports = nextConfig;
```

---

## 8. Authentification & middleware

### Middleware (`src/middleware.ts`)

```typescript
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const publicRoutes = ["/", "/blog", "/login", "/register", "/forgot-password", "/test"];
  const isPublicRoute = publicRoutes.includes(pathname)
    || pathname.startsWith("/blog/")
    || pathname.startsWith("/api/")
    || pathname.startsWith("/portail/");

  if (isPublicRoute) return supabaseResponse;

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

### Clients Supabase

**Client navigateur** (`src/lib/supabase/client.ts`) :
```typescript
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export function createClient(): SupabaseClient {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Lazy singleton Proxy pour Realtime et usage client-side
let _client: SupabaseClient | null = null;
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_client) _client = createClient();
    const value = (_client as any)[prop];
    return typeof value === "function" ? value.bind(_client) : value;
  },
});
```

**Client serveur** (`src/lib/supabase/server.ts`) :
```typescript
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Appelé depuis un Server Component — ignoré
          }
        },
      },
    }
  );
}
```

**Prisma singleton** (`src/lib/supabase/prisma.ts`) :
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

### Auth flow complet

1. **Inscription** (`/register`) — formulaire 3 étapes :
   - Étape 1 : Prénom, nom, email, mot de passe (min 6 chars)
   - Étape 2 : Type de structure (CRECHE, MICRO_CRECHE, MAM, ASS_MAT) + nom structure
   - Étape 3 : Choix modules (preset HACCP essentiel ou Solution complète, ou personnalisation)
   - Appel `supabase.auth.signUp()` avec `data: { prenom, nom }`
   - Puis `POST /api/register` pour créer `Structure` + `UserStructure` (role: GESTIONNAIRE)
   - Redirect vers `/login` avec message "Vérifiez votre email"

2. **API Register** (`POST /api/register`) :
   - Crée `Structure` avec type, nom, modules_actifs
   - Crée `UserStructure` liant user_id ↔ structure_id (role: GESTIONNAIRE)

3. **Login** (`/login`) :
   - `supabase.auth.signInWithPassword({ email, password })`
   - Gestion erreurs : "Invalid login" → "Email ou mot de passe incorrect", "Email not confirmed" → message confirmation
   - Redirect vers `?redirect=` ou `/dashboard`

4. **Middleware** : intercepte toutes les routes non publiques, redirige vers `/login?redirect=X` si pas authentifié

5. **Hook `useAuth`** : charge user + structures via Supabase query sur `UserStructure` join `Structure`, persiste `activeStructureId` dans localStorage

6. **Sélection profil + PIN** (Phase 4) :
   - `ProfilProvider` wrape le dashboard layout
   - Au premier login → `assurerProfilAdmin()` crée automatiquement un profil ADMINISTRATEUR avec prenom/nom du user Supabase et PIN par défaut `0000` (hashé bcrypt)
   - L'écran "Qui êtes-vous ?" s'affiche **TOUJOURS** (pas d'auto-skip, pas de restauration localStorage)
   - L'utilisateur clique sur son profil → champ mot de passe → `verifierProfilPin()` → accès dashboard
   - Profils existants sans PIN reçoivent automatiquement le PIN `0000` lors de la première tentative de vérification
   - Profil sélectionné persiste dans `localStorage("activeProfilId")` uniquement après vérification PIN réussie

---

## 9. Système de profils partagés avec PIN (Phase 4)

### Concept

Un seul compte Supabase par structure (email/mot de passe partagés). Chaque professionnel est représenté par un `Profil` dans la DB. Au login, l'écran "Qui êtes-vous ?" s'affiche **TOUJOURS** (même avec 1 seul profil — pas d'auto-skip). L'utilisateur sélectionne son profil puis saisit son **mot de passe profil** (champ `pin` hashé bcrypt).

### Sécurité PIN

- **Hachage** : `bcryptjs` avec import nommé `import { hash, compare } from "bcryptjs"` (⚠️ NE PAS utiliser `import bcrypt from "bcryptjs"` — l'import par défaut CJS casse les Server Actions Next.js)
- **PIN par défaut** : `0000` (attribué automatiquement à la création du profil admin et aux profils existants sans PIN)
- **PIN obligatoire** à la création d'un profil dans Paramètres → Équipe
- **PIN optionnel** lors de la modification (laisser vide = pas de changement)
- Le champ `pin` n'est **jamais renvoyé au client** — les fonctions `listerProfils` et `listerTousProfils` utilisent `select` pour exclure `pin`

### ProfilProvider (`src/hooks/use-profil.tsx`)

```typescript
"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { listerProfils } from "@/app/actions/profils";

export interface ProfilActif {
  id: string;
  structure_id: string;
  prenom: string;
  nom: string;
  poste: string | null;
  role: "ADMINISTRATEUR" | "PROFESSIONNEL";
  telephone: string | null;
  email: string | null;
  certifications: string | null;
  notes: string | null;
  actif: boolean;
}

interface ProfilContextType {
  profil: ProfilActif | null;
  profils: ProfilActif[];
  loading: boolean;
  selectProfil: (profil: ProfilActif) => void;
  clearProfil: () => void;
  refreshProfils: () => Promise<void>;
  isAdmin: boolean;
  needsSelection: boolean;
}

const STORAGE_KEY = "activeProfilId";

// Provider wrape le dashboard layout
export function ProfilProvider({ structureId, children }: { structureId: string | null; children: ReactNode }) {
  // loadProfils() : appelle listerProfils(structureId), trie par rôle puis prénom
  // ⚠️ TOUJOURS force setProfil(null) — pas de restauration localStorage, pas d'auto-skip
  //    → l'écran "Qui êtes-vous ?" + saisie PIN s'affiche à CHAQUE session
  // selectProfil(p) : appelé APRÈS vérification du PIN → setProfil + localStorage
  // clearProfil() : supprime localStorage + remet profil à null → réaffiche l'écran de sélection
  // isAdmin = profil?.role === "ADMINISTRATEUR"
  // needsSelection = !loading && profils.length > 0 && !profil
}

export function useProfil() {
  return useContext(ProfilContext);
}
```

**Comportements clés** :
- `loadProfils()` : appelle `listerProfils(structureId)` (qui exclut le `pin` via `select`), trie par rôle puis prénom
- **Pas de restauration localStorage** : à chaque session, `profil` est remis à `null` → force la sélection + saisie PIN
- **Pas d'auto-skip** : même avec 1 seul profil, l'écran de sélection s'affiche
- `selectProfil(p)` : appelé uniquement après vérification PIN réussie
- `clearProfil()` : supprime localStorage + remet profil à null → réaffiche l'écran de sélection
- `isAdmin` : dérivé de `profil?.role === "ADMINISTRATEUR"`

### Écran "Qui êtes-vous ?" (`src/components/layout/select-profil.tsx`)

**Flux en 2 étapes** :

```typescript
export function SelectProfil({ structureId, userPrenom, userNom, children }: SelectProfilProps) {
  // État : selectedProfil, pin, pinError, verifying

  // 1. useEffect au mount :
  //    - Appelle assurerProfilAdmin(structureId, prenom, nom) pour auto-créer le premier profil admin (PIN 0000)
  //    - Appelle TOUJOURS refreshProfils() après l'init (même si aucun profil créé)
  //      ⚠️ Important : si on n'appelle refreshProfils que quand created=true,
  //         les profils existants ne se chargent jamais si le 1er fetch a échoué

  // 2. Si loading || initializing → spinner

  // 3. Si profil sélectionné et vérifié (profil && !needsSelection) → render children (le dashboard)

  // 4. Si un profil est cliqué (selectedProfil !== null) → ÉTAPE 2 : écran de saisie PIN
  //    - Avatar cercle coloré (grande taille) avec initiales
  //    - Nom complet + poste
  //    - Champ mot de passe (type="password", autoFocus, onKeyDown Enter)
  //    - Bouton "Valider" → appelle verifierProfilPin(selectedProfil.id, pin)
  //      → Si succès : selectProfil(selectedProfil) → accès dashboard
  //      → Si échec : affiche pinError (message d'erreur rouge)
  //    - Bouton "Changer de profil" → retour à l'étape 1

  // 5. Sinon → ÉTAPE 1 : écran de sélection
  //    - Titre "Qui êtes-vous ?"
  //    - Si profils.length === 0 : message "Aucun profil trouvé" + bouton "Recharger"
  //    - Grille 2 colonnes de boutons-profils
  //    - Chaque bouton : cercle coloré (8 couleurs rotatives) avec initiales, prénom, poste, badge "Admin"
  //    - Click → handleSelectProfil(p) → passe à l'étape 2
}
```

**Couleurs initiales** (rotation sur 8) :
```
bg-emerald-500, bg-blue-500, bg-purple-500, bg-amber-500,
bg-rose-500, bg-cyan-500, bg-indigo-500, bg-orange-500
```

**Labels poste** :
```
Directrice, Auxiliaire de puériculture, Éducatrice de jeunes enfants, Stagiaire, Agent, Autre
```

### Dashboard Layout avec ProfilProvider

```typescript
// src/app/dashboard/layout.tsx
export default function DashboardLayout({ children }) {
  const { user, prenom, structures, activeStructureId, activeStructure, modulesActifs, switchStructure, loading } = useAuth();

  // Redirige vers /login si pas authentifié
  // Spinner si loading

  const nom = user?.user_metadata?.nom || ...;

  return (
    <ProfilProvider structureId={activeStructureId}>
      <SelectProfil structureId={activeStructureId} userPrenom={prenom} userNom={nom}>
        <div className="flex h-screen bg-rzpanda-fond overflow-hidden">
          <Sidebar structureId={...} structureNom={...} prenom={...} modulesActifs={...} />
          <div className="flex flex-col flex-1 min-w-0">
            <Topbar structures={...} activeStructureId={...} onSwitchStructure={...} prenom={...} />
            <main className="flex-1 overflow-y-auto pb-20 md:pb-4 px-4 md:px-6 py-4">{children}</main>
          </div>
          <BottomNav structureId={...} modulesActifs={...} />
        </div>
      </SelectProfil>
    </ProfilProvider>
  );
}
```

---

## 10. Droits d'accès par rôle (Phase 4)

### Deux rôles profil

| Rôle | Description | Accès |
|------|-------------|-------|
| `ADMINISTRATEUR` | Directrice, gestionnaire | Tous les modules + paramètres, exports, stock, gestion profils |
| `PROFESSIONNEL` | Auxiliaire, EJE, stagiaire, agent | Modules quotidiens uniquement (températures, biberon, suivi, transmissions, nettoyage) |

### Composant `AdminOnly` (`src/components/shared/admin-only.tsx`)

```typescript
export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const { isAdmin } = useProfil();
  if (!isAdmin) return <>{fallback}</>;
  return <>{children}</>;
}

export function OwnerOrAdmin({ children, profilId, fallback = null }: OwnerOrAdminProps) {
  const { profil, isAdmin } = useProfil();
  if (isAdmin) return <>{children}</>;
  if (profil && profilId && profil.id === profilId) return <>{children}</>;
  return <>{fallback}</>;
}
```

### Hook `useAdminGuard` + composant `AdminGuard` (`src/components/shared/admin-guard.tsx`)

```typescript
export function useAdminGuard() {
  const { profil, isAdmin, loading } = useProfil();
  const params = useParams();
  const router = useRouter();
  const structureId = params.structureId as string;

  useEffect(() => {
    if (!loading && profil && !isAdmin) {
      router.replace(`/dashboard/${structureId}`);
    }
  }, [loading, profil, isAdmin, router, structureId]);

  return { isAdmin, loading: loading || !profil };
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAdminGuard();
  if (loading) return <Loader2 spinner />;
  if (!isAdmin) return null;
  return <>{children}</>;
}
```

### Vérifications server-side (`src/lib/permissions.ts`)

```typescript
import { prisma } from "@/lib/supabase/prisma";

export async function verifierAdmin(profilId: string): Promise<boolean> {
  const profil = await prisma.profil.findUnique({
    where: { id: profilId },
    select: { role: true, actif: true },
  });
  return profil?.actif === true && profil?.role === "ADMINISTRATEUR";
}

export async function verifierProprietaire(profilId: string, ressourceProfilId: string | null): Promise<boolean> {
  if (!ressourceProfilId) return false;
  return profilId === ressourceProfilId;
}

export async function verifierAdminOuProprietaire(profilId: string, ressourceProfilId: string | null): Promise<boolean> {
  if (await verifierAdmin(profilId)) return true;
  return verifierProprietaire(profilId, ressourceProfilId);
}
```

### Filtrage dans la Sidebar

La Sidebar filtre les items de menu selon `isAdmin` :

```typescript
const SECTIONS = [
  { title: "", items: [
    { label: "Tableau de bord", icon: LayoutDashboard, href: "", alwaysVisible: true },
  ]},
  { title: "HACCP & Traçabilité", items: [
    { label: "Températures", href: "/temperatures", moduleId: "temperatures" },
    { label: "Biberonnerie", href: "/biberonnerie", moduleId: "biberonnerie" },
    { label: "Réceptions & Stock", href: "/stock", adminOnly: true,
      condition: (isActif) => isActif("tracabilite") || isActif("stocks") },
    { label: "Nettoyage", href: "/nettoyage", moduleId: "nettoyage" },
  ]},
  { title: "Suivi Enfants", items: [
    { label: "Enfants", href: "/enfants", alwaysVisible: true },
    { label: "Suivi du jour", href: "/suivi",
      condition: (isActif) => isActif("repas") || isActif("changes") || isActif("siestes") },
    { label: "Transmissions", href: "/transmissions", moduleId: "transmissions" },
  ]},
  { title: "Gestion", items: [
    { label: "Protocoles", href: "/protocoles", moduleId: "protocoles" },
    { label: "Exports PDF", href: "/exports", alwaysVisible: true, adminOnly: true },
    { label: "Paramètres", href: "/parametres", alwaysVisible: true, adminOnly: true },
  ]},
];

// Logique de visibilité :
const isItemVisible = (item: MenuItem): boolean => {
  if (item.adminOnly && !isAdmin) return false;
  if (item.alwaysVisible) return true;
  if (item.condition) return item.condition(isActif);
  if (item.moduleId) return isActif(item.moduleId);
  return true;
};
```

### Items masqués pour PROFESSIONNEL
- Réceptions & Stock
- Exports PDF
- Paramètres

---

## 11. Topbar avec profil actif

```typescript
// src/components/layout/topbar.tsx
export function Topbar({ structures, activeStructureId, onSwitchStructure, prenom }: TopbarProps) {
  const { profil, clearProfil, profils } = useProfil();

  const displayPrenom = profil?.prenom || prenom;
  const displayInitiale = displayPrenom.charAt(0).toUpperCase();
  const displayPoste = profil?.poste || null;

  return (
    <header className="h-14 bg-white border-b ...">
      {/* Sélecteur structure (dropdown si multi-structures) */}
      <div className="flex items-center gap-3">
        {/* Cloche notifications */}
        <NotificationsBell structureId={activeStructureId} />

        {/* Bouton "Changer" de profil (toujours visible — PIN requis à chaque changement) */}
        <button onClick={clearProfil}>
          <RefreshCw size={14} /> Changer
        </button>

        {/* Avatar initiale + prénom + poste */}
        <div className="h-8 w-8 rounded-full bg-rzpanda-primary/10 ...">
          {displayInitiale}
        </div>
        <span>{displayPrenom}</span>
        {displayPoste && <span className="text-[10px]">{displayPoste}</span>}
      </div>
    </header>
  );
}
```

---

## 12. Système de modules

### Constantes (`src/lib/constants.ts`)

```typescript
export const MODULES_DISPONIBLES = {
  temperatures:  { label: "Températures",   icon: "Thermometer",     categorie: "haccp",   description: "Relevés frigo, congélateur, plats" },
  tracabilite:   { label: "Traçabilité",    icon: "Package",         categorie: "haccp",   description: "Réceptions, lots, DLC, fournisseurs" },
  nettoyage:     { label: "Nettoyage",      icon: "Sparkles",        categorie: "haccp",   description: "Plan de nettoyage, validations" },
  biberonnerie:  { label: "Biberonnerie",   icon: "Baby",            categorie: "haccp",   description: "Préparation, timer ANSES, traçabilité lait" },
  repas:         { label: "Repas",          icon: "UtensilsCrossed", categorie: "suivi",   description: "Suivi repas enfants" },
  changes:       { label: "Changes",        icon: "Baby",            categorie: "suivi",   description: "Suivi changes" },
  siestes:       { label: "Siestes",        icon: "Moon",            categorie: "suivi",   description: "Suivi siestes" },
  transmissions: { label: "Transmissions",  icon: "MessageSquare",   categorie: "suivi",   description: "Notes et transmissions" },
  stocks:        { label: "Stocks",         icon: "Boxes",           categorie: "gestion", description: "Gestion des stocks consommables" },
  protocoles:    { label: "Protocoles",     icon: "FileText",        categorie: "gestion", description: "Documents et protocoles internes" },
} as const;

export type ModuleId = keyof typeof MODULES_DISPONIBLES;
export type CategorieModule = "haccp" | "suivi" | "gestion";

export const PRESETS_MODULES = {
  haccp_essentiel: ["temperatures", "tracabilite", "nettoyage", "biberonnerie"],
  complet: ["temperatures", "tracabilite", "nettoyage", "biberonnerie", "repas", "changes", "siestes", "transmissions", "stocks", "protocoles"],
} as const;
```

### Hook `useModules` (`src/hooks/use-modules.ts`)

```typescript
export function useModules(modulesActifs: string[]) {
  const isActif = (moduleId: ModuleId): boolean => isModuleActif(modulesActifs, moduleId);
  const modulesParCategorie = useMemo(() => getModulesParCategorie(modulesActifs), [modulesActifs]);
  return { isActif, modulesParCategorie };
}
```

---

## 13. Constantes & seuils réglementaires

```typescript
// src/lib/constants.ts

export const SEUILS_TEMPERATURE = {
  frigo_min: 0,
  frigo_max: 4,
  frigo_warning: 5,
  congel_max: -18,
  congel_warning: -15,
  plat_chaud_min: 63,
  plat_froid_max: 3,
  frigo_plage_min: -10,    // plage physiquement plausible
  frigo_plage_max: 15,
  congel_plage_min: -30,
  congel_plage_max: 0,
} as const;

export const DELAI_BIBERON_MINUTES = 60;           // max ANSES
export const DELAI_BIBERON_ATTENTION_MINUTES = 45;  // alerte orange
export const DELAI_BOITE_LAIT_JOURS = 30;          // durée max boîte ouverte
export const DLC_ALERTE_JOURS = 2;                 // alerte DLC

export const COULEURS = {
  primaire: "#66bb6a",
  secondaire: "#4caf50",
  accent: "#F4A261",
  danger: "#E53E3E",
  warning: "#F39C12",
  fond: "#FAFBFC",
  texte: "#1A202C",
} as const;

export const TYPES_STRUCTURE = {
  CRECHE: "Crèche collective",
  MICRO_CRECHE: "Micro-crèche",
  MAM: "MAM",
  ASS_MAT: "Assistante maternelle",
} as const;

export const GROUPES_ENFANTS = ["Bébés", "Moyens", "Grands"] as const;

export const TYPES_LAIT = [
  "1er âge", "2ème âge", "Maternel", "Croissance", "Spécial HA-AR",
] as const;

export const QUANTITES_BIBERON_ML = [90, 120, 150, 180, 210, 240] as const;

export const REGIMES_ALIMENTAIRES = [
  "Sans porc", "Végétarien", "Sans gluten", "Sans lactose",
  "Halal", "Casher", "Bio uniquement",
] as const;
```

---

## 14. Logique métier (`src/lib/business-logic.ts`)

### Conformité température

```typescript
export function getConformiteTemperature(temperature: number, type: "REFRIGERATEUR" | "CONGELATEUR"): StatutConformite {
  // RÉFRIGÉRATEUR : 0–4°C = conforme, ≤5°C = attention, sinon = alerte
  // CONGÉLATEUR : ≤-18°C = conforme, ≤-15°C = attention, sinon = alerte
}

export function validerPlageTemperature(temperature: number, type: "REFRIGERATEUR" | "CONGELATEUR"): string | null {
  // Réfrigérateur : -10°C à 15°C plausible
  // Congélateur : -30°C à 0°C plausible
  // Retourne message d'erreur si hors plage, null sinon
}

export function getConformitePlat(temperatureApres: number, typePlat: "CHAUD" | "FROID"): "conforme" | "alerte" {
  // CHAUD : ≥ 63°C conforme
  // FROID : ≤ 3°C conforme
}
```

### Statut biberon

```typescript
export function getStatutBiberon(heurePreparation: Date, maintenant: Date): StatutBiberon {
  // < 45 min → "ok"
  // 45–60 min → "attention"
  // > 60 min → "alerte"
}

export function isBoiteLaitExpiree(dateOuverture: Date, maintenant: Date): boolean {
  // > 30 jours → true
}
```

### Alertes DLC

```typescript
export function getAlerteDLC(dlc: Date, maintenant: Date): AlerteDLC {
  // DLC dépassée → "critique"
  // DLC = aujourd'hui → "alerte"
  // DLC ≤ J+2 → "warning"
  // Sinon → null
}

export function getAlerteDLCDetail(dlc: Date, prenomEnfant: string, maintenant: Date): AlerteDLCDetail {
  // < 0 jours → "Le lait de X est périmé — NE PAS UTILISER" (critique)
  // 0 jours → "Le lait de X expire AUJOURD'HUI" (alerte)
  // 1 jour → "Le lait de X expire DEMAIN" (alerte)
  // 2 jours → "Le lait de X expire dans 2 jours — pensez à demander aux parents d'en ramener" (warning)
  // 3 jours → idem (warning)
  // > 3 jours → null
}
```

### Calcul d'âge et groupes (Phase 4)

```typescript
export function calculerAge(dateNaissance: Date, maintenant: Date): string {
  // < 1 mois → "X jours"
  // < 2 ans → "X mois"
  // 2–6 ans → "X ans et Y mois"
  // > 6 ans → "X ans"
}

export function calculerAgeMois(dateNaissance: Date, maintenant: Date): number {
  // Retourne l'âge en mois révolus
}

export function calculerGroupeAuto(
  dateNaissance: Date,
  seuilBebesMax: number,    // défaut 18 mois
  seuilMoyensMax: number,   // défaut 30 mois
  maintenant: Date
): string {
  const ageMois = calculerAgeMois(dateNaissance, maintenant);
  if (ageMois < seuilBebesMax) return "Bébés";
  if (ageMois < seuilMoyensMax) return "Moyens";
  return "Grands";
}

export function joursAvantBascule(
  dateNaissance: Date,
  seuilBebesMax: number,
  seuilMoyensMax: number,
  maintenant: Date
): { prochainGroupe: string; jours: number } | null {
  // Calcule le nombre de jours avant la prochaine bascule de groupe
  // Retourne null si déjà dans "Grands"
  // Utilisé pour afficher "Bascule Moyens dans X jours" sur le dashboard
}
```

### Filtrage tâches nettoyage par fréquence

```typescript
export function getTachesJour<T extends TacheNettoyageMinimal>(taches: T[], date: Date): T[] {
  // APRES_UTILISATION : toujours
  // QUOTIDIEN : toujours
  // BIQUOTIDIEN : toujours (matin + après-midi)
  // HEBDO : le lundi (getDay() === 1)
  // BIMENSUEL : les 1er et 15 du mois
  // MENSUEL : le 1er du mois
}
```

---

## 15. Types utilitaires (`src/types/index.ts`)

```typescript
/** Résultat standard d'une Server Action */
export type ActionResult<T = undefined> = {
  success: true;
  data?: T;
} | {
  success: false;
  error: string;
};

/** Enfant avec ses allergies */
export interface EnfantAvecAllergies {
  id: string;
  prenom: string;
  nom: string;
  date_naissance: Date;
  sexe?: "FILLE" | "GARCON" | null;
  groupe?: string | null;
  photo_url?: string | null;
  actif: boolean;
  allergies: {
    id: string;
    allergene: string;
    severite: "LEGERE" | "MODEREE" | "SEVERE";
    protocole?: string | null;
    document_pai?: string | null;
  }[];
}

export interface ContactUrgenceData {
  id: string;
  nom: string;
  lien: string;
  telephone: string;
  est_autorise_recuperer: boolean;
  ordre_priorite: number;
}

export interface StructureResume {
  id: string;
  nom: string;
  type: "CRECHE" | "MICRO_CRECHE" | "MAM" | "ASS_MAT";
}

export type RoleUtilisateur = "GESTIONNAIRE" | "PROFESSIONNEL" | "PARENT";
```

---

## 16. Server Actions — Signatures complètes

### `actions/alertes.ts` — Alertes

```typescript
export interface AlerteItem {
  id: string;
  type: "dlc_depassee" | "dlc_proche" | "biberon_attente" | "lait_dlc";
  niveau: "rouge" | "orange";
  titre: string;
  detail: string;
  href: string;
}

export async function getAlertes(structureId: string):
  Promise<{ success: true; data: AlerteItem[] } | { success: false; error: string }>
```

**Logique getAlertes** :
1. Récupère en parallèle (`Promise.all`) :
   - `receptionsExpirees` : ReceptionMarchandise avec DLC < aujourd'hui et statut EN_STOCK
   - `receptionsProches` : ReceptionMarchandise avec DLC dans les 3 prochains jours
   - `biberonsEnAttente` : Biberon avec `quantite_bue_ml = null` et préparés depuis > 30 min
   - `biberonsAvecDLC` : Biberons récents (7 jours) avec `date_peremption_lait` renseignée
2. Construit les alertes :
   - DLC dépassée → niveau "rouge", type "dlc_depassee", lien vers `/stock`
   - DLC proche → niveau "orange", type "dlc_proche", lien vers `/stock`
   - Biberon en attente → niveau "orange", type "biberon_attente", lien vers `/biberonnerie`
   - Lait DLC → un seul alert par enfant (le biberon le plus récent), niveaux selon jours restants :
     - < 0 : rouge, "périmé — NE PAS UTILISER"
     - 0 : rouge, "expire AUJOURD'HUI"
     - 1 : rouge, "expire DEMAIN"
     - 2-3 : orange, "expire dans X jours"

### `actions/profils.ts` — Profils avec PIN (Phase 4)

⚠️ **Import bcryptjs** : `import { hash, compare } from "bcryptjs"` (import nommé obligatoire — l'import par défaut casse les Server Actions)

```typescript
export async function listerProfils(structureId: string): Promise<ActionResult>
// Retourne les profils actifs, triés par rôle puis prénom
// ⚠️ Utilise `select` pour EXCLURE le champ `pin` — ne jamais envoyer le hash au client

export async function listerTousProfils(structureId: string): Promise<ActionResult>
// Retourne TOUS les profils (actifs et inactifs), admin-only
// ⚠️ Exclut aussi `pin` via `select`

export async function obtenirProfil(profilId: string): Promise<ActionResult>

export async function creerProfil(data: {
  structure_id: string;
  prenom: string;
  nom: string;
  poste?: string;
  role?: RoleProfil;        // défaut PROFESSIONNEL
  telephone?: string;
  email?: string;
  certifications?: string;
  notes?: string;
  pin?: string;             // Obligatoire — hashé bcrypt avant stockage
}): Promise<ActionResult>
// Valide prenom + nom + pin obligatoires, hash(pin, 10) avant insert

export async function modifierProfil(profilId: string, data: Partial<{
  prenom: string;
  nom: string;
  poste: string;
  role: RoleProfil;
  telephone: string;
  email: string;
  certifications: string;
  notes: string;
  pin: string;              // Optionnel — si fourni, hashé avant update
}>): Promise<ActionResult>

export async function desactiverProfil(profilId: string): Promise<ActionResult>
// Guard : refuse de désactiver le dernier ADMINISTRATEUR

export async function verifierProfilPin(profilId: string, pin: string): Promise<ActionResult>
// 1. Récupère profil.pin depuis la DB
// 2. Si pin est null → attribue hash("0000", 10) au profil, vérifie avec "0000"
//    (migration automatique des profils existants sans PIN)
// 3. Si pin existe → compare(pin, profil.pin) via bcrypt
// 4. Retourne success ou error avec message

export async function assurerProfilAdmin(structureId: string, prenom: string, nom: string):
  Promise<ActionResult<{ created: boolean; data?: Profil }>>
// Vérifie si un profil existe déjà (count > 0) ; sinon crée un admin avec pin = hash("0000", 10)
```

### `actions/biberons.ts` — Biberonnerie

```typescript
export async function creerBiberon(data: {
  structure_id: string;
  enfant_id: string;
  type_lait: string;
  nom_lait?: string;
  numero_lot: string;
  date_peremption_lait?: string;
  date_ouverture_boite?: string;
  nombre_dosettes?: number;
  quantite_preparee_ml: number;
  preparateur_nom: string;
  professionnel_id: string;
  profil_id?: string;
  observations?: string;
}): Promise<ActionResult>

export async function marquerServi(biberonId: string, quantiteBueMl?: number): Promise<ActionResult>

export async function marquerNettoye(biberonId: string): Promise<ActionResult>

export async function getBiberonsDuJour(structureId: string): Promise<ActionResult>
```

### `actions/dashboard.ts` — Tableau de bord

```typescript
export interface DashboardData {
  enfantsCount: number;
  nettoyage: { fait: number; total: number; pct: number };
  prochainesDlc: Array<{ nom_produit: string; dlc: Date; joursRestants: number }>;
  alertesLait: Array<{ prenom: string; message: string; niveau: string }>;
  biberonsEnAttente: number;
  temperatures: { conformes: number; total: number };
  activiteRecente: Array<{ type: string; heure: Date; detail: string }>;
}

export async function getDashboardData(structureId: string, modulesActifs: string[]):
  Promise<{ success: true; data: DashboardData } | { success: false; error: string }>
```

### `actions/enfants.ts` — Enfants

```typescript
export async function creerEnfant(structureId: string, data: z.infer<typeof enfantSchema>): Promise<ActionResult>
export async function modifierEnfant(enfantId: string, structureId: string, data: z.infer<typeof enfantSchema>): Promise<ActionResult>
export async function archiverEnfant(enfantId: string, structureId: string, profilId?: string): Promise<ActionResult>
export async function supprimerEnfant(enfantId: string, structureId: string, profilId?: string): Promise<ActionResult>
export async function getEnfants(structureId: string): Promise<ActionResult>
export async function getEnfant(enfantId: string, structureId: string): Promise<ActionResult>
export async function importerEnfants(structureId: string, rows: ImportRow[]): Promise<ActionResult<{ imported: number; failed: number; results: ... }>>
export async function checkDoublons(structureId: string, enfants: { prenom: string; nom: string }[]): Promise<ActionResult<DoublonEntry[]>>
```

### `actions/temperatures.ts` — Températures

```typescript
// Équipements
export async function getEquipements(structureId: string): Promise<ActionResult>
export async function creerEquipement(data: { structure_id: string; nom: string; type: "REFRIGERATEUR" | "CONGELATEUR"; temperature_max: number }): Promise<ActionResult>
export async function supprimerEquipement(equipementId: string, profilId?: string): Promise<ActionResult>

// Relevés enceintes
export async function getReleves(structureId: string, date: string): Promise<ActionResult>
export async function creerReleve(data: {
  structure_id: string;
  equipement_id: string;
  temperature: number;
  conforme: boolean;
  action_corrective?: string;
  professionnel_id: string;
  profil_id?: string;
  heure?: string;
  plage_confirmee?: boolean;
}): Promise<ActionResult>
export async function supprimerReleve(releveId: string, profilId?: string): Promise<ActionResult>

// Relevés plats témoins
export async function getRelevesPlat(structureId: string, date: string): Promise<ActionResult>
export async function creerRelevePlat(data: {
  structure_id: string;
  nom_plat: string;
  type_plat: "CHAUD" | "FROID";
  temperature_avant: number;
  heure_avant: string;
  temperature_apres: number;
  heure_apres: string;
  conforme: boolean;
  action_corrective?: string;
  professionnel_id: string;
  profil_id?: string;
}): Promise<ActionResult>

// Historique
export async function getRelevesHistorique(structureId: string, equipementId: string, jours: number): Promise<ActionResult>
```

### `actions/nettoyage.ts` — Nettoyage & émargement

```typescript
// Zones & tâches
export async function getZonesAvecTaches(structureId: string): Promise<ActionResult>
export async function initialiserZonesDefaut(structureId: string): Promise<ActionResult>
export async function creerZone(structureId: string, data: { nom: string; couleur_code?: string }): Promise<ActionResult>
export async function supprimerZone(zoneId: string, structureId: string, profilId?: string): Promise<ActionResult>
export async function creerTache(data: { zone_id: string; nom: string; frequence: string; methode: string; produit?: string; notes?: string }): Promise<ActionResult>
export async function supprimerTache(tacheId: string, profilId?: string): Promise<ActionResult>

// Validations (émargement)
export async function validerTache(data: {
  tache_id: string;
  professionnel_id: string;
  professionnel_nom: string;
  profil_id?: string;
  observations?: string;
}): Promise<ActionResult>
export async function annulerValidation(validationId: string, profilId?: string): Promise<ActionResult>
// Admin-only : vérifie le rôle avant annulation
export async function getValidationsDuJour(structureId: string, date?: string): Promise<ActionResult>

// Historique & KPI
export async function getHistoriqueNettoyage(structureId: string, mois: number, annee: number): Promise<ActionResult>
export async function getNettoyageKpi(structureId: string): Promise<ActionResult<{ fait: number; total: number; pct: number }>>
```

### `actions/stock.ts` — Réceptions & stocks

```typescript
// Réceptions marchandise
export async function getReceptions(structureId: string): Promise<ActionResult>
export async function creerReception(data: {
  structure_id: string;
  nom_produit: string;
  fournisseur: string;
  numero_lot: string;
  dlc: string;
  temperature_reception?: number;
  emballage_conforme: boolean;
  conforme: boolean;
  motif_non_conformite?: string;
  professionnel_id: string;
  profil_id?: string;
}): Promise<ActionResult>
export async function marquerProduit(receptionId: string, statut: "UTILISE" | "JETE", motif?: string): Promise<ActionResult>
export async function supprimerReception(receptionId: string): Promise<ActionResult>
export async function getFournisseurs(structureId: string): Promise<ActionResult>

// Stocks consommables
export async function getStocks(structureId: string): Promise<ActionResult>
export async function creerStock(data: {
  structure_id: string;
  categorie: string;
  produit_nom: string;
  quantite: number;
  unite: string;
  seuil_alerte: number;
  maj_par: string;
}): Promise<ActionResult>
export async function ajusterStock(stockId: string, delta: number, par: string): Promise<ActionResult>
export async function supprimerStock(stockId: string): Promise<ActionResult>

// Modules
export async function updateModulesActifs(structureId: string, modules: string[]): Promise<ActionResult>
```

### `actions/suivi.ts` — Suivi du jour

```typescript
// Repas
export async function enregistrerRepas(data: {
  structure_id: string;
  enfant_id: string;
  type_repas: string;          // PETIT_DEJ | DEJEUNER | GOUTER | DINER
  entree?: string;
  entree_quantite?: string;    // TOUT | BIEN | PEU | RIEN
  plat?: string;
  plat_quantite?: string;
  dessert?: string;
  dessert_quantite?: string;
  observations?: string;
  professionnel_id: string;
  profil_id?: string;
}): Promise<ActionResult>

// Changes
export async function enregistrerChange(data: {
  structure_id: string;
  enfant_id: string;
  type_change: string;         // MOUILLEE | SELLE | LES_DEUX
  observations?: string;
  professionnel_id: string;
  profil_id?: string;
}): Promise<ActionResult>

// Siestes
export async function debuterSieste(data: {
  structure_id: string;
  enfant_id: string;
  professionnel_id: string;
  profil_id?: string;
}): Promise<ActionResult>
export async function finirSieste(data: { sieste_id: string; qualite?: string }): Promise<ActionResult>
export async function getSiesteEnCours(structureId: string, enfantId: string): Promise<ActionResult>

// Transmissions
export async function enregistrerTransmission(data: {
  structure_id: string;
  enfant_id?: string;
  contenu: string;
  type_transm: string;         // GENERAL | ENFANT | EQUIPE
  auteur: string;
  profil_id?: string;
}): Promise<ActionResult>

// Incidents
export async function enregistrerIncident(data: {
  structure_id: string;
  enfant_id: string;
  type_incident: string;       // CHUTE | MORSURE | GRIFFURE | PLEURS_PROLONGES | FIEVRE | AUTRE
  description: string;
  gravite: string;             // MINEUR | MODERE | GRAVE
  action_prise: string;
  parents_prevenu: boolean;
  heure: string;
  professionnel_id: string;
  profil_id?: string;
}): Promise<ActionResult>

// Timeline & synthèse
export async function getHistoriqueDuJour(structureId: string, enfantId: string): Promise<ActionResult<TimelineItem[]>>
export async function getSuiviDuJour(structureId: string): Promise<ActionResult<Record<string, CountData>>>
```

### `actions/transmissions.ts` — Transmissions

```typescript
export async function getTransmissionsDuJour(structureId: string, date?: string): Promise<ActionResult>
export async function creerTransmission(data: {
  structure_id: string;
  enfant_id?: string;
  contenu: string;
  type_transm: string;
  auteur: string;
  profil_id?: string;
}): Promise<ActionResult>
export async function getTransmissionsEnfant(structureId: string, enfantId: string, limit?: number): Promise<ActionResult>
```

### `actions/exports.ts` — Exports PDF

```typescript
export interface ExportDDPPData {
  structure: { nom: string; type: string; adresse: string; ... };
  periode: { debut: string; fin: string };
  dateGeneration: string;
  releves: Array<{ equipement: string; date: Date; temperature: number; conforme: boolean; ... }>;
  plats: Array<{ nom_plat: string; ... }>;
  receptions: Array<{ nom_produit: string; fournisseur: string; numero_lot: string; dlc: Date; ... }>;
  nettoyage: Array<{ zone: string; tache: string; validations: Array<{ date: Date; par: string; }> }>;
  biberons: Array<{ ... }>;
  alertesDlc: Array<{ ... }>;
  produitsJetes: Array<{ ... }>;
}

export interface ExportPMIData {
  structure: { ... };
  periode: { debut: string; fin: string };
  dateGeneration: string;
  biberons: Array<{ ... }>;
  repas: Array<{ ... }>;
  siestes: Array<{ ... }>;
  transmissions: Array<{ ... }>;
  protocoles: Array<{ ... }>;
}

export async function getExportDDPPData(structureId: string, debut: string, fin: string): Promise<ActionResult<ExportDDPPData>>
export async function getExportPMIData(structureId: string, debut: string, fin: string): Promise<ActionResult<ExportPMIData>>
export async function sauvegarderExport(data: {
  structure_id: string;
  type_export: "DDPP" | "PMI" | "INTERNE";
  periode_debut: string;
  periode_fin: string;
  genere_par: string;
  url: string;
}): Promise<ActionResult<{ id: string }>>
export async function getHistoriqueExports(structureId: string): Promise<ActionResult<ExportHistoryEntry[]>>
```

### `actions/protocoles.ts` — Protocoles

```typescript
export async function getProtocoles(structureId: string): Promise<ActionResult>
export async function getProtocole(protocoleId: string, structureId: string): Promise<ActionResult>
export async function creerProtocole(structureId: string, data: {
  titre: string;
  categorie: string;
  contenu_markdown: string;
}, userId: string): Promise<ActionResult>
export async function modifierProtocole(protocoleId: string, structureId: string, data: {
  titre: string;
  categorie: string;
  contenu_markdown: string;
}): Promise<ActionResult>
export async function archiverProtocole(protocoleId: string, structureId: string): Promise<ActionResult>
export async function importerModelesProtocoles(structureId: string): Promise<ActionResult>
```

### `actions/portail-parents.ts` — Portail parents

```typescript
export interface TimelineEntry { heure: string; icone: string; type: string; description: string }
export interface EnfantPortail { id: string; prenom: string; nom: string; date_naissance: Date; photo_url: string | null; groupe: string | null; allergies: ... }

export async function getEnfantsParent(userId: string): Promise<ActionResult<{ enfants: EnfantPortail[]; structureNom: string; structureId: string }>>
export async function getTimelineEnfant(structureId: string, enfantId: string, dateStr: string): Promise<ActionResult<TimelineEntry[]>>
export async function creerSignalementAbsence(data: { structure_id: string; enfant_id: string; date: string; motif: string; commentaire?: string; auteur: string }): Promise<ActionResult>
export async function creerSignalementApport(data: { structure_id: string; enfant_id: string; date: string; description: string; auteur: string }): Promise<ActionResult>
export async function genererTokenPortail(enfantId: string, structureId: string): Promise<ActionResult<{ token: string }>>
export async function regenererTokenPortail(enfantId: string, structureId: string): Promise<ActionResult<{ token: string }>>
export async function getEnfantByToken(token: string): Promise<ActionResult<{ enfant: EnfantPortail; structureNom: string; structureId: string }>>
export async function getMultiStructuresKpi(userId: string): Promise<ActionResult<{ structures: [...] }>>
```

### `actions/structure.ts` — Structure & paramètres

```typescript
export async function getStructureInfo(structureId: string): Promise<ActionResult>
export async function getSeuilsAge(structureId: string): Promise<ActionResult>
export async function updateSeuilsAge(structureId: string, seuilBebesMax: number, seuilMoyensMax: number): Promise<ActionResult>
export async function updateStructureInfo(structureId: string, data: {
  nom: string;
  adresse?: string | null;
  code_postal?: string | null;
  ville?: string | null;
  telephone?: string | null;
  email?: string | null;
}): Promise<ActionResult>
export async function nettoyerDonneesAberrantes(structureId: string):
  Promise<ActionResult<{ relevesSupprimes: number; equipementsSupprimes: number; stocksSupprimes: number; receptionsSupprimees: number }>>
```

### `actions/demo.ts` — Demandes démo

```typescript
export async function creerDemandeDemo(formData: {
  nom: string;
  email: string;
  telephone: string;
  type_structure: string;
  nombre_structures: string;
}): Promise<ActionResult>
```

---

## 17. Modules détaillés

### 17.1 Tableau de bord

**Page** : `src/app/dashboard/[structureId]/page.tsx`

Le dashboard affiche les KPI du jour, adaptés aux modules actifs :
- Nombre d'enfants actifs
- Nettoyage du jour : fait/total (%), barre de progression colorée
- Prochaines DLC (3 jours) : liste produits avec jours restants
- Alertes lait péremption (Phase 4) : liste enfants avec message coloré
- Biberons en attente (non servis)
- Températures : conformes/total du jour
- Activité récente : timeline des dernières actions
- Alertes bascule groupe (Phase 4) : "Bascule Moyens dans X jours" si < 30 jours

### 17.2 Températures

**Page** : `src/app/dashboard/[structureId]/temperatures/page.tsx`

- Liste des équipements (réfrigérateurs, congélateurs) avec dernier relevé
- Ajout/suppression équipement (admin)
- Saisie relevé : température, calcul auto de conformité, action corrective si non conforme
- Validation plage physique (ex: -10 à 15°C pour frigo)
- Historique avec graphique Recharts (ligne température + seuils)
- Relevés plats témoins : avant/après service, type CHAUD (≥63°C) ou FROID (≤3°C)

### 17.3 Biberonnerie

**Pages** : `src/app/dashboard/[structureId]/biberonnerie/page.tsx` et `nouveau/page.tsx`

- Liste biberons du jour avec statut temps réel :
  - 0-45 min → vert "ok"
  - 45-60 min → orange "attention"
  - > 60 min → rouge "alerte"
- Formulaire nouveau biberon :
  - Sélection enfant (avec allergies affichées)
  - **Protection PLV** : si enfant allergique aux protéines de lait de vache, bloque les types "1er âge", "2ème âge", "Croissance" → autorise uniquement "Maternel" et "Spécial HA-AR"
  - Type lait, nom, numéro de lot, DLC lait, date ouverture boîte
  - Nombre dosettes, quantité préparée (ml) — boutons rapides 90/120/150/180/210/240
  - Préparateur = profil actif
  - profil_id automatiquement injecté
- Actions : marquer servi (+ quantité bue), marquer nettoyé
- Conformité ANSES : pas de micro-ondes, max 37°C, boîte 30 jours max

### 17.4 Réceptions & Stock

**Page** : `src/app/dashboard/[structureId]/stock/page.tsx` (admin-only)

**Onglet Réceptions** :
- Enregistrement réception marchandise : produit, fournisseur, lot, DLC, température, emballage, conformité
- Liste avec statut DLC coloré (vert ok, orange proche, rouge dépassé)
- Actions : marquer utilisé, jeter (avec motif), supprimer
- Autocomplete fournisseurs (basé sur historique)

**Onglet Stocks consommables** :
- Catégories : COUCHES, ENTRETIEN, LAIT, COMPOTES, AUTRE
- Seuil d'alerte par produit (badge rouge si quantité < seuil)
- Ajustement +/- avec motif et historique mouvements

### 17.5 Nettoyage & émargement (Phase 4)

**Page** : `src/app/dashboard/[structureId]/nettoyage/page.tsx`

- Zones de nettoyage : cuisine, salle de change, espace jeu, etc. (couleur code)
- Tâches par zone : nom, fréquence, méthode, produit, notes
- Initialisation zones par défaut (`initialiserZonesDefaut`)
- **Émargement** (Phase 4) :
  - Bouton "Valider" par tâche → enregistre professionnel_id, professionnel_nom, profil_id, heure, observations
  - Affichage validation : cercle coloré avec initiales (2 lettres du nom), horodatage
  - **Annulation** : admin-only (`annulerValidation`)
- **Fréquences** :
  - APRES_UTILISATION : affichée tous les jours
  - QUOTIDIEN : 1x/jour
  - BIQUOTIDIEN : 2x/jour (matin + après-midi)
  - HEBDO : le lundi
  - BIMENSUEL : le 1er et 15
  - MENSUEL : le 1er
- **Historique mensuel** : calendrier avec jours colorés
  - 100% fait → vert
  - ≥50% fait → orange
  - <50% fait → rouge
- **KPI dashboard** : `getNettoyageKpi()` → { fait, total, pct }
- **Export PDF DDPP** : inclut l'historique nettoyage avec signatures

### 17.6 Enfants

**Pages** : `src/app/dashboard/[structureId]/enfants/`

- Liste des enfants actifs/archivés avec :
  - Avatar initiale colorée
  - Prénom, nom, âge calculé (calculerAge)
  - Groupe affiché : auto-calculé ou "(forcé)" si `groupe_force = true`
  - Badges allergies (colorés par sévérité) et régimes
- Formulaire enfant (create/edit) :
  - Prénom, nom, date naissance, sexe, date d'entrée
  - Groupe : auto-calculé OU forcé manuellement (`groupe_force = true`)
  - Photo URL, régimes (multi-select prédéfini)
  - Allergies : allergène, sévérité (LEGERE/MODEREE/SEVERE), protocole, document PAI
  - Contacts d'urgence : nom, lien, téléphone, autorisé à récupérer, ordre priorité
- Import CSV : modal avec détection doublons
- Actions : archiver (soft delete actif=false), supprimer (hard delete)

### 17.7 Suivi du jour

**Pages** : `src/app/dashboard/[structureId]/suivi/`

**Suivi individuel** (`page.tsx`) :
- Sélection enfant dans la structure
- Formulaires selon modules actifs :
  - **Repas** : type (PETIT_DEJ/DEJEUNER/GOUTER/DINER), 3 plats (entrée/plat/dessert) avec quantité (TOUT/BIEN/PEU/RIEN), observations
  - **Change** : type (MOUILLEE/SELLE/LES_DEUX) — interface 1 tap
  - **Sieste** : toggle début/fin avec timer (minutes écoulées)
  - **Transmission** : type (GENERAL/ENFANT/EQUIPE), texte, ciblage optionnel enfant/équipe
  - **Incident** : type, gravité, description, action prise, parents prévenus (checkbox), heure
- **Timeline** : verticale chronologique avec icônes emoji, couleurs par type :
  - Bleu = biberon
  - Orange = repas
  - Vert = change
  - Violet = sieste
  - Gris = transmission
  - Rouge = incident

**Vue groupe** (`groupe/page.tsx`) :
- Filtre par groupe : "Tous", "Bébés", "Moyens", "Grands"
- Matrice : lignes = enfants, colonnes = modules actifs (biberon, repas, change, sieste, transmission)
- Chaque cellule = compteur d'activités du jour
- Lien vers suivi individuel

### 17.8 Transmissions & annuaire équipe (Phase 4)

**Page** : `src/app/dashboard/[structureId]/transmissions/page.tsx`

**Onglet Transmissions** :
- Filtres par type : GENERAL (bleu), ENFANT (violet), EQUIPE (orange)
- Timeline avec : auteur, heure, badge type coloré, message
- Pour type EQUIPE : peut cibler un membre spécifique (@mention)
- FAB (Floating Action Button) pour nouveau

**Onglet Annuaire** (Phase 4) :
- Barre de recherche
- Grille de membres de l'équipe :
  - Avatar cercle coloré avec initiales
  - Prénom, nom, poste
  - Icône téléphone
  - Badge "Admin" si ADMINISTRATEUR
- Click → modal détail :
  - Infos complètes : téléphone, email
  - Certifications (si renseignées)
  - Notes (modifiable par admin uniquement — icône crayon)
  - Bouton "Envoyer une transmission à X" → ouvre le formulaire pré-rempli type EQUIPE
- Les notes sont sauvées via `modifierProfil(profilId, { notes })`

### 17.9 Protocoles

**Page** : `src/app/dashboard/[structureId]/protocoles/page.tsx`

- Liste des protocoles actifs par catégorie
- Contenu en Markdown (`contenu_markdown`)
- CRUD : créer, modifier, archiver
- Import de modèles prédéfinis (`importerModelesProtocoles`)
- Versionning (champ `version`)

### 17.10 Exports PDF

**Page** : `src/app/dashboard/[structureId]/exports/page.tsx` (admin-only)

**Export DDPP** :
- Sélection période (date début/fin)
- Contenu : relevés température, plats témoins, réceptions marchandise, nettoyage avec émargement, biberons, alertes DLC, produits jetés
- Composant React-PDF : `pdf-ddpp.tsx`

**Export PMI** :
- Sélection période
- Contenu : biberons, repas, siestes, transmissions, protocoles
- Composant React-PDF : `pdf-pmi.tsx`

**Historique** : liste des exports générés avec date, type, période, lien

### 17.11 Portail parents

**Deux modes d'accès** :

1. **Par token** (`/portail/[token]`) :
   - Lien unique généré par la structure, partageable sans compte
   - Affiche la timeline du jour de l'enfant
   - `genererTokenPortail()` / `regenererTokenPortail()`

2. **Authentifié** (`/portail-parents/`) :
   - Parent connecté (role PARENT dans UserStructure)
   - Voit ses enfants, timeline, peut signaler absence ou apport
   - `getEnfantsParent()`, `creerSignalementAbsence()`, `creerSignalementApport()`

### 17.12 Paramètres

**Page** : `src/app/dashboard/[structureId]/parametres/page.tsx` (admin-only)

- **Informations structure** : nom, adresse, code postal, ville, téléphone, email
- **Modules actifs** : activation/désactivation individuelle des 10 modules
- **Seuils groupes d'âge** (Phase 4) : `seuil_bebes_max` (défaut 18 mois), `seuil_moyens_max` (défaut 30 mois)
- **Gestion profils** (Phase 4) : créer, modifier, désactiver des profils professionnels
  - **Champ "Mot de passe profil"** dans le formulaire d'ajout (obligatoire) et modification (optionnel — "Laisser vide pour ne pas changer")
  - L'admin peut réinitialiser le mot de passe de n'importe quel profil
- **Nettoyage données** : `nettoyerDonneesAberrantes()` pour purger relevés/équipements/stocks orphelins

---

## 18. Bascule automatique groupes d'âge (Phase 4)

### Principe

Chaque enfant est classé dans un groupe (Bébés, Moyens, Grands) selon son âge en mois comparé aux seuils de la structure.

### Seuils configurables

| Paramètre | Défaut | Signification |
|-----------|--------|---------------|
| `seuil_bebes_max` | 18 | Âge max (mois) pour rester dans "Bébés" |
| `seuil_moyens_max` | 30 | Âge max (mois) pour rester dans "Moyens" |

### Fonctions

```typescript
// Calcul automatique du groupe
calculerGroupeAuto(dateNaissance, seuilBebesMax, seuilMoyensMax) → "Bébés" | "Moyens" | "Grands"

// Jours avant prochaine bascule
joursAvantBascule(dateNaissance, seuilBebesMax, seuilMoyensMax) → { prochainGroupe, jours } | null

// Groupe effectif (forcé > calculé)
// getGroupeEffectif = groupe_force ? enfant.groupe : calculerGroupeAuto(...)
```

### Forçage manuel

Le champ `Enfant.groupe_force` (boolean) permet de forcer un groupe :
- Si `true` → le champ `groupe` est utilisé tel quel (ex: garder un enfant dans "Bébés" plus longtemps)
- Si `false` → le groupe est recalculé automatiquement à chaque affichage
- Affichage : "(forcé)" à côté du nom du groupe si forcé

### Alerte bascule dashboard

Sur le dashboard, si un enfant est à moins de 30 jours d'une bascule de groupe :
- Affiche "Bascule Moyens dans X jours" ou "Bascule Grands dans X jours"

---

## 19. Alertes lait péremption (Phase 4)

### Sources d'alertes

Le système vérifie le champ `date_peremption_lait` des biberons récents (7 derniers jours). Un seul alert par enfant (le biberon le plus récent).

### Niveaux d'alerte

| Jours restants | Couleur | Niveau | Message |
|---------------|---------|--------|---------|
| < 0 (expiré) | Rouge | `rouge` | "Le lait de X est périmé — NE PAS UTILISER" |
| 0 (aujourd'hui) | Rouge | `rouge` | "Le lait de X expire AUJOURD'HUI" |
| 1 (demain) | Rouge | `rouge` | "Le lait de X expire DEMAIN" |
| 2 | Orange | `orange` | "Le lait de X expire dans 2 jours — pensez à demander aux parents d'en ramener" |
| 3 | Orange | `orange` | "Le lait de X expire dans 3 jours — pensez à demander aux parents d'en ramener" |
| > 3 | — | Pas d'alerte | — |

### Points d'affichage

1. **Cloche notifications** (Topbar) : polling 60s, badge compteur, dropdown groupé Critique/À surveiller
2. **Page biberonnerie** : alertes en haut de la liste
3. **Dashboard** : section "Alertes lait" avec messages colorés

---

## 20. Émargement nettoyage (Phase 4)

### Principe

Chaque validation de tâche de nettoyage enregistre qui a validé, quand, et affiche les initiales dans un cercle coloré.

### Données enregistrées (ValidationNettoyage)

| Champ | Type | Description |
|-------|------|-------------|
| `tache_id` | String | Tâche validée |
| `date` | DateTime | Date du jour |
| `heure` | DateTime | Heure exacte de validation |
| `professionnel_id` | String | ID du professionnel |
| `professionnel_nom` | String | Nom complet (pour affichage) |
| `profil_id` | String? | Référence au Profil (Phase 4) |
| `observations` | String? | Remarques |

### Affichage

- Cercle coloré avec les 2 premières lettres du nom (initiales)
- Horodatage "HH:MM"
- Nom complet au hover
- Annulation : bouton visible uniquement pour les administrateurs

### Export DDPP

L'export PDF DDPP inclut la section nettoyage avec :
- Zone, tâche, fréquence
- Pour chaque validation : nom du professionnel, heure, observations

---

## 21. Annuaire équipe dans Transmissions (Phase 4)

### Architecture

La page Transmissions possède 2 onglets :
1. **Transmissions** : timeline des messages du jour
2. **Annuaire** : répertoire de l'équipe

### Fonctionnalités annuaire

- **Recherche** : filtre temps réel sur prénom/nom/poste
- **Grille** : cartes avec avatar coloré, initiales, prénom, nom, poste, badge admin
- **Modal détail** :
  - Téléphone (avec lien `tel:`)
  - Email (avec lien `mailto:`)
  - Certifications
  - Notes (éditable par admin uniquement)
  - Bouton "Envoyer une transmission à [Prénom]"
- **Action transmission ciblée** : ouvre le formulaire de transmission pré-rempli avec type EQUIPE

---

## 22. Cloche notifications (`notifications-bell.tsx`)

```typescript
export function NotificationsBell({ structureId }: { structureId: string }) {
  // Appelle getAlertes(structureId) toutes les 60 secondes
  // Affiche badge avec compteur (rouge si alertes critiques, orange sinon)
  // 99+ si > 99 alertes
  // Dropdown groupé :
  //   - Section "Critique (N)" sur fond rouge pâle
  //   - Section "À surveiller (N)" sur fond orange pâle
  //   - Chaque alerte : icône + titre + détail, lien vers page concernée
  //   - Si aucune alerte : "Aucune alerte active — Tout est sous contrôle"
}
```

**Icônes par type** :
- `dlc_depassee` → AlertOctagon (rouge)
- `dlc_proche` → AlertTriangle (orange)
- `biberon_attente` / `lait_dlc` → Clock (orange)

---

## 23. Composants branding

### PandaIcon (`src/components/shared/panda-icon.tsx`)

Logo panda SVG inline (pas de fichier statique) :
- ViewBox zoomée sur le visage (60 50 280 230)
- Halo vert double (#66bb6a, opacité 0.15 et 0.25)
- Oreilles noires + intérieur rose (FFB6C1)
- Visage blanc avec yeux noirs, nez, bouche
- Joues roses transparentes
- Petite feuille verte sur la tête (accent nature)
- Props : `size` (défaut 64), `className`

### LogoText (`src/components/shared/logo-text.tsx`)

Affichage "RZPan'Da" en bicolore :
```html
<span class="text-rzpanda-primary">RZ</span>
<span class="text-gray-800">Pan</span>
<span class="text-rzpanda-primary">'</span>
<span class="text-gray-800">Da</span>
```

Props : `textClassName` (défaut "text-gray-800"), `className`

---

## 24. Navigation mobile (`bottom-nav.tsx`)

- Barre fixe en bas (visible `md:hidden` uniquement)
- Items principaux : Dashboard + jusqu'à 3 modules HACCP actifs
- Bouton "Plus" → overlay slide-up avec tous les items restants :
  - Enfants, Suivi, Transmissions, Protocoles
  - Exports (admin-only), Paramètres (admin-only)
  - Déconnexion
- Filtrage identique à la Sidebar : `isAdmin` + `isActif`

---

## 25. Hook `useAuth` (`src/hooks/use-auth.ts`)

```typescript
export function useAuth() {
  // 1. supabase.auth.getUser() → user
  // 2. Query Supabase : UserStructure join Structure → structures[]
  // 3. activeStructureId depuis localStorage ou structures[0]
  // 4. Écoute auth state changes via onAuthStateChange
  // 5. Extraction prénom : user_metadata.prenom || full_name.split()[0] || email.split("@")[0]

  return {
    user,
    prenom,
    structures,
    activeStructureId,
    activeStructure,
    activeRole,
    modulesActifs,       // activeStructure.structure.modules_actifs
    switchStructure,     // change activeStructureId + localStorage
    loading,
  };
}
```

---

## 26. Déploiement Vercel

### Prérequis
1. Projet Supabase créé avec Auth, Postgres, Storage activés
2. Prisma migrations appliquées : `npx prisma migrate deploy`
3. Variables d'environnement configurées dans Vercel Dashboard

### Variables Vercel

| Variable | Environnement | Description |
|----------|--------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | All | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Clé publique Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | Clé service Supabase (server-only) |
| `DATABASE_URL` | All | Connection string PostgreSQL (pooled) |
| `DIRECT_URL` | All | Connection string PostgreSQL (direct) |
| `NEXT_PUBLIC_APP_URL` | Production | URL de production (https://rzpanda.fr ou https://rzpanda.vercel.app) |

### Build settings
- **Framework Preset** : Next.js
- **Build Command** : `npm run build` (qui exécute `prisma generate` via postinstall)
- **Output Directory** : `.next`
- **Install Command** : `npm install` (déclenche postinstall → prisma generate)

### Configuration Supabase
- **Auth** : activer Email/Password provider
- **Email templates** : personnaliser confirmation email avec branding RZPan'Da
- **RLS (Row Level Security)** : les données sont accédées via Prisma côté serveur (Server Actions), pas directement depuis le client. Les Server Actions vérifient l'auth via Supabase et filtrent par structure_id.
- **Storage** : bucket pour photos enfants et documents PAI (si activé)

### Domaine personnalisé
- **Domaine principal** : `rzpanda.fr`
- **Alias Vercel** : `rzpanda.vercel.app`, `petitsafe-3qmv.vercel.app`

### Post-déploiement
1. Appliquer les migrations : `npx prisma migrate deploy` (ou `npx prisma db push`)
2. ⚠️ **Mettre à jour les variables `DATABASE_URL` et `DIRECT_URL` sur Vercel** si le mot de passe DB a changé (erreur `prisma:error P1000` sinon)
3. Optionnel : `npx tsx prisma/seed.ts` pour données de démonstration
4. Créer un premier compte via `/register`
5. Le profil admin est automatiquement créé au premier login avec **PIN par défaut `0000`** (Phase 4)
6. Changer le PIN par défaut dans Paramètres → Équipe

---

## 27. Récapitulatif des phases

### Phase 1 — Fondations
- Stack technique, auth Supabase, multi-tenant Structure/UserStructure
- Module températures (équipements, relevés, conformité)
- Dashboard basique

### Phase 2 — HACCP complet
- Traçabilité alimentaire (réceptions, lots, DLC)
- Biberonnerie ANSES (préparation, timer, nettoyage)
- Plan de nettoyage (zones, tâches, validations, fréquences)
- Stocks consommables
- Exports PDF DDPP/PMI

### Phase 3 — Suivi enfants
- Gestion enfants (CRUD, allergies, contacts, régimes, import CSV)
- Suivi du jour (repas, changes, siestes, incidents)
- Transmissions (GENERAL, ENFANT, EQUIPE)
- Vue groupe (matrice activités)
- Portail parents (token + authentifié)
- Protocoles internes

### Phase 4 — Profils partagés & droits (actuelle)
- **Système multi-profils avec PIN** : model Profil (champ `pin` hashé bcrypt), ProfilProvider, écran "Qui êtes-vous ?" **TOUJOURS affiché** (pas d'auto-skip), saisie mot de passe après sélection profil, auto-création admin avec PIN `0000`, migration auto des profils existants sans PIN
- **Sécurité bcryptjs** : import nommé `import { hash, compare } from "bcryptjs"` (⚠️ l'import par défaut casse les Server Actions), `listerProfils` exclut le `pin` du retour via `select`, `verifierProfilPin()` pour validation côté serveur
- **Gestion PIN dans Paramètres → Équipe** : champ "Mot de passe profil" obligatoire à la création, optionnel en édition, réinitialisation par admin
- **Droits d'accès** : enum RoleProfil (ADMINISTRATEUR/PROFESSIONNEL), AdminOnly, OwnerOrAdmin, AdminGuard, useAdminGuard, verifierAdmin server-side, filtrage Sidebar/BottomNav
- **Bascule groupes d'âge** : seuils configurables sur Structure, calculerGroupeAuto, joursAvantBascule, forçage manuel (groupe_force), alerte dashboard
- **Alertes lait péremption** : date_peremption_lait sur Biberon, getAlertes (lait_dlc), niveaux 3j→expiré, affichage cloche/biberonnerie/dashboard
- **Émargement nettoyage** : initiales cercle coloré, horodatage, profil_id sur ValidationNettoyage, annulation admin-only, export PDF DDPP
- **Annuaire équipe** : onglet dans Transmissions, recherche, fiches profils, notes admin, transmission ciblée
- **profil_id ajouté** sur toutes les tables d'action (Biberon, Repas, Change, Sieste, Incident, ReleveTemperature, RelevePlat, ReceptionMarchandise, Transmission)
- **Domaine production** : rzpanda.fr
