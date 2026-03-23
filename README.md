# SalonDossier

Professionele Next.js-webapplicatie voor `SalonDossier` om klanten en behandelingen te registreren, lokaal te testen en online als website te publiceren.

## Functies

- Medewerkerslogin
- Dashboard met kerncijfers
- Klantenlijst met snelle zoekfunctie
- Nieuwe klant toevoegen
- Klantgegevens bewerken
- Nieuwe behandeling registreren
- Behandelgeschiedenis per klant bekijken
- Filteren op datum en medewerker
- Afdrukweergave voor klantgeschiedenis
- CSV-export van behandeldata
- Prisma schema en voorbeeld seed-data

## Technische stack

- Next.js (App Router)
- React
- Prisma ORM
- PostgreSQL
- TypeScript

## Projectstructuur

```text
.
|-- app
|   |-- (dashboard)
|   |   |-- dashboard
|   |   `-- klanten
|   |-- api
|   |-- login
|   |-- globals.css
|   |-- layout.tsx
|   `-- page.tsx
|-- components
|-- lib
|-- prisma
|   |-- schema.prisma
|   `-- seed.ts
|-- middleware.ts
|-- package.json
`-- README.md
```

## Lokale installatie

1. Installeer dependencies:

```bash
npm install
```

2. Maak een `.env` bestand op basis van `.env.example`:

```bash
cp .env.example .env
```

3. Vul in `.env` je PostgreSQL connectiegegevens in.

Voorbeeld:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/salondossier?schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/salondossier?schema=public"
SESSION_SECRET="een-lang-uniek-geheim"
NEXT_PUBLIC_APP_URL="http://127.0.0.1:3000"
NEXT_PUBLIC_TENANT_MODE="query"
NEXT_PUBLIC_BASE_DOMAIN=""
```

4. Initialiseer de database en genereer Prisma Client:

```bash
npx prisma generate
npm run db:push
```

5. Vul voorbeelddata:

```bash
npm run db:seed
```

6. Start de ontwikkelserver:

```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000)

## Voorbeeldlogin

- E-mailadres: `admin@salonluna.nl`
- Wachtwoord: `Welkom123!`

## Tenant-login en subdomeinen

De app ondersteunt twee loginmodi voor salons:

### 1. Lokale of centrale login via query

Gebruik in `.env`:

```env
NEXT_PUBLIC_APP_URL="http://127.0.0.1:3000"
NEXT_PUBLIC_TENANT_MODE="query"
NEXT_PUBLIC_BASE_DOMAIN=""
```

Voorbeeld:

- Centrale login: `http://127.0.0.1:3000/login`
- Salonlogin: `http://127.0.0.1:3000/login?salon=jouw-salon`

### 2. Live login via subdomeinen

Gebruik in `.env` of in productie:

```env
NEXT_PUBLIC_APP_URL="https://app.jouwdomein.nl"
NEXT_PUBLIC_TENANT_MODE="subdomain"
NEXT_PUBLIC_BASE_DOMAIN="jouwdomein.nl"
```

Dan worden loginlinks automatisch opgebouwd als:

- `https://jouw-salon.jouwdomein.nl/login`
- `https://andere-salon.jouwdomein.nl/login`

De middleware herkent een salonsubdomein automatisch en toont direct de juiste saloncontext op de loginpagina.

## Online publiceren als website

Aanbevolen stack:

- Hosting: Vercel
- Database: PostgreSQL
- ORM: Prisma

### Stappen voor deployment

1. Push dit project naar GitHub.
2. Maak een PostgreSQL database aan, bijvoorbeeld bij Prisma Postgres, Neon of Supabase.
3. Importeer het GitHub-project in Vercel.
4. Voeg in Vercel deze environment variables toe:

```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
SESSION_SECRET=een-lang-uniek-geheim
NEXT_PUBLIC_APP_URL=https://app.jouwdomein.nl
NEXT_PUBLIC_TENANT_MODE=subdomain
NEXT_PUBLIC_BASE_DOMAIN=jouwdomein.nl
```

5. Laat Vercel builden en deployen.
6. Voer daarna eenmalig database setup uit:

```bash
npx prisma db push
npm run db:seed
```

Daarna is de applicatie via een publieke URL bereikbaar en kan de klant er overal bij.

Voor de volledige live setup met centrale app, salonsubdomeinen en STRATO DNS:

- Zie [DEPLOYMENT.md](/Users/hasandeniz/Documents/New%20project/DEPLOYMENT.md)

## Database

De applicatie gebruikt PostgreSQL:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/salondossier?schema=public"
```

## Opmerkingen

- De interface is volledig in het Nederlands.
- Voor de eerste versie wordt een eenvoudige sessiecookie gebruikt.
- Wachtwoorden worden in deze demo gehasht met SHA-256. Voor productie is `bcrypt` of `argon2` aan te raden.
- Deze versie is voorbereid voor online hosting met PostgreSQL in plaats van SQLite.
- Voor multi-tenant live gebruik is een subdomein-setup via Vercel + STRATO de aanbevolen route.

## Extra beveiliging

Deze versie bevat nu ook een eerste beveiligingslaag in de app zelf:

- security headers via middleware
- database-backed rate limiting op loginpogingen
- audit logging voor gevoelige acties zoals login, wachtwoordwijziging en verwijderen

Na schemawijzigingen hiervoor moet je opnieuw uitvoeren:

```bash
npx prisma db push
npx prisma generate
```
