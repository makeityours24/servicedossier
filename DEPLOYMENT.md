# Deploymentgids SalonDossier

Deze gids beschrijft de aanbevolen live setup voor `SalonDossier` als multi-tenant webapp voor meerdere salons.

## Aanbevolen productie-opzet

- Publieke website: `salondossier.com`
- Applicatiehosting: `Vercel`
- Database: `Neon PostgreSQL`
- Domeinbeheer: `STRATO`
- Publieke site:
  - `salondossier.com`
- Salonlogins:
  - centraal: `app.salondossier.com/login`
  - per salon via subdomein: `salonslug.salondossier.com/login`

## Architectuur

### Centrale platformomgeving

- `app.salondossier.com`
- gebruikt voor:
  - platform login
  - platform overzicht
  - salon onboarding

### Publieke website

- `salondossier.com`
- gebruikt voor:
  - productuitleg
  - prijzen
  - demo-aanvragen
  - startgids / handout

### Salonomgevingen

- `my-style.salondossier.com`
- `andere-salon.salondossier.com`

De middleware leest het subdomein uit en koppelt dat aan de juiste `salon.slug`.

## Productie environment variables

Vul in Vercel deze variabelen in:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
SESSION_SECRET="een-lang-uniek-geheim"
NEXT_PUBLIC_APP_URL="https://app.salondossier.com"
NEXT_PUBLIC_TENANT_MODE="subdomain"
NEXT_PUBLIC_BASE_DOMAIN="salondossier.com"
PASSWORD_RESET_URL_BASE="https://app.salondossier.com"
```

## Stap 1: database klaarzetten

1. Maak een Neon database aan.
2. Gebruik:
   - pooled URL voor `DATABASE_URL`
   - direct URL voor `DIRECT_URL`

## Stap 2: project naar GitHub

Push de code naar een private GitHub repository.

## Stap 3: Vercel project aanmaken

1. Importeer de GitHub repository in Vercel.
2. Voeg alle environment variables toe.
3. Deploy het project.

## Stap 4: database initialiseren

Na de eerste deploy of lokaal vanuit dezelfde codebase:

```bash
npx prisma db push
npm run db:seed
```

## Stap 5: domeinen instellen

### Centrale app

Koppel in Vercel:

- `salondossier.com`
- `www.salondossier.com`
- `app.salondossier.com`

### Wildcard voor salons

Koppel daarnaast:

- `*.salondossier.com`

Zo kunnen alle salons op een eigen subdomein uitkomen zonder per salon handmatig een aparte app op te zetten.

## Stap 6: DNS bij STRATO

In STRATO heb je uiteindelijk minimaal nodig:

- een record voor `salondossier.com`
- een record voor `www.salondossier.com`
- een record voor `app.salondossier.com`
- een wildcard record voor `*.salondossier.com`

Welke exacte recordwaarden je gebruikt, neem je over uit het Vercel domeinoverzicht zodra het domein in Vercel is toegevoegd.

## Stap 7: eerste salon live testen

Test daarna:

### Centrale login

- `https://app.salondossier.com/login`

### Salon login

- `https://my-style.salondossier.com/login`

Controleer:

- juiste salonbranding op login
- juiste tenant na login
- platformlogin blijft centraal werken
- gepauzeerde salons worden geweigerd

## Aanbevolen live werkwijze

### Platform admin

Platformbeheer logt in via:

- `https://app.salondossier.com/login`

### Salongebruikers

Salonmedewerkers loggen in via:

- eigen subdomein

Voorbeeld:

- `https://my-style.salondossier.com/login`

Dat is gebruiksvriendelijker dan steeds een saloncode invullen.

## Tijdelijke fallback

Als wildcard subdomeinen nog niet live zijn, kun je tijdelijk de query-login gebruiken:

- `https://app.salondossier.com/login?salon=my-style`

Daarmee kun je blijven testen totdat DNS volledig staat.

## Productiechecklist

- `NEXT_PUBLIC_TENANT_MODE` staat op `subdomain`
- `NEXT_PUBLIC_BASE_DOMAIN` klopt en wijst naar `salondossier.com`
- apexdomein toont de publieke website
- `app.salondossier.com` toont de app-login
- platformlogin werkt
- salonlogin werkt
- onboardinglink toont de juiste live URL
- gepauzeerde salons worden geblokkeerd
- database backup is ingericht
- sterke `SESSION_SECRET` gebruikt
