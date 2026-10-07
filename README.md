# Crawl

Ferdig planlagte barruter i Oslo. Velg en rute, samle gjengen med en kode og
følg ruten stopp for stopp på kartet.

Appen er bygget med Expo (React Native) og kjører først og fremst på web.
Data ligger i Supabase, og kartet bruker MapLibre med fliser fra OpenFreeMap.

## Kom i gang

Du trenger Node 20 eller nyere og et Supabase-prosjekt.

```bash
npm install
```

```bash
cp .env.example .env
```

Fyll inn URL og anon-nøkkel fra Supabase-prosjektet i `.env`. Kjør deretter
SQL-filene i `supabase/migrations` i rekkefølge mot databasen, for eksempel i
SQL-editoren i Supabase.

```bash
npm run web
```

## Flyten

Hjem → rute → lobby (navn og frivillig profilbilde) → crawl → kveldsrapport.

- Lobbyen oppretter gruppen med en gang og viser koden som deles med gjengen.
- Andre blir med via lenke eller kode, også etter at crawlen er i gang.
- Posisjoner deles direkte mellom deltakerne mens crawlen pågår. Ingenting
  lagres.
- Kveldsrapporten kårer vinnersted og strengeste dommer ut fra karakterene, og
  kan deles som plakatbilde eller lenke.

## Ruter og kart

Rutene er kuratert i databasen. Gangveien mellom stoppene regnes ut på forhånd
og lagres, så appen aldri kaller en rutetjeneste mens den kjører. Kjør dette
etter at stoppene i en rute er endret:

```bash
node scripts/compute-route-legs.mjs
```

Skriptet skriver en SQL-fil som må kjøres mot databasen.

## Publisering

`vercel.json` bygger web-versjonen med `npx expo export -p web` og sender alle
adresser til `index.html`, slik at lenker rett inn til en gruppe fungerer.
`EXPO_PUBLIC_SUPABASE_URL` og `EXPO_PUBLIC_SUPABASE_ANON_KEY` må settes som
miljøvariabler der appen bygges.

## Sikkerhet

Appen har ingen innlogging ennå. Anon-nøkkelen følger med i nettsiden, og
`0008_row_level_security.sql` begrenser den til det appen trenger: lese ruter
og steder, opprette grupper og medlemmer, og lagre innsjekker. Ingenting kan
slettes med den. Uten innlogging kan likevel alle som har nøkkelen lese
gruppene og flytte en gruppe videre på ruten.

## Rettigheter

Koden, tekstene og illustrasjonene tilhører Trym Torhaug. Ingen lisens er gitt
for videre bruk. Kartdata: OpenFreeMap, OpenMapTiles og OpenStreetMap.
