@AGENTS.md

# Crawl

Appen er på norsk (bokmål). All UI-tekst og mikrocopy skrives på norsk, med konkrete eksempler som «Stopp 3 av 5», «9 min gange · Brunnenstr. → Invalidenstr.» og «Sam er 4 min bak». Ingen emoji og ingen utropstegn. Koden og kommentarer kan være på engelsk.

## Visuell stil og designprinsipper

### Designretning
Appen skal føles som en moderne, interaktiv byguide med uttrykket
til en analog trykksak. Kombiner varm papirestetikk, kompakt
redaksjonell typografi og funksjonelle detaljer fra kart og rutetabeller.

Uttrykket er lokalt, sosialt og uformelt, men strukturert og tydelig.
Tenk vintage byguide og øletikett — ikke generisk SaaS eller polert
premium-livsstil.

### Fargepalett
Bruk en begrenset, varm palett:

- Blekk / mørke flater: `#171511`
- Lys papirflate: `#F6ECD6`
- Varm krem / hovedbakgrunn: `#F3E8CF`
- Mørkere sand / seksjonsbakgrunn: `#DED0AE`
- Oker / handlingsaksent: `#F4A927`
- Rødoransje / redaksjonell aksent: `#E84B2C`
- Sekundær tekst: `#4F493F`

La krem- og sandtoner dominere. Bruk mørke flater til navigasjon,
primære handlingsfelt og avsluttende seksjoner. Oker fremhever
handlinger, piler og kartmarkører. Rødoransje brukes sparsomt til
seksjonsetiketter og korte fremhevinger.

Unngå kjølige gråtoner, store hvite flater og dekorative gradienter.

### Typografi
Bruk tre tydelige typografiske roller:

- **Archivo Narrow Bold:** kompakte, kondenserte overskrifter,
  fremhevede tall og stedsnavn. Hovedoverskrifter er ofte i versaler,
  med tett bokstavavstand og linjehøyde rundt 1.0.
- **Archivo:** brødtekst, korttitler og handlingsetiketter.
  Brødtekst skal være lettlest, med linjehøyde rundt 1.45.
- **Cousine Bold:** metadata, kategorier, status, små seksjonsetiketter
  og kartinformasjon. Bruk gjerne versaler og lett økt bokstavavstand.

Skap hierarki gjennom kontrasten mellom kondenserte overskrifter,
nøytral brødtekst og monospace-detaljer. Ikke bruk monospace til
lengre tekst eller versaler på all tekst.

### Layout
- Design mobile-first med en tydelig vertikal leserekkefølge.
- Bygg siden av sammenhengende seksjonsbånd i krem og sand.
- Bruk kompakte, venstrejusterte oppsett med tydelig informasjonsrangering.
- Hold relaterte opplysninger tett samlet; gi mer luft mellom seksjoner.
- Referansen bruker omtrent 18 px sidemarg på mobil og 12–16 px
  mellom elementer innenfor seksjoner.
- La hero-innhold, kart og utvalgte bilder være mer fremtredende
  enn sekundære lister og metadata.
- På større skjermer: behold den redaksjonelle strukturen og
  kontrollerte tekstbredden fremfor å strekke mobiloppsettet ukritisk.

### Former og komponenter
- Bruk rette hjørner som standard; ingen pilleformede knapper.
- Kort og paneler har tynne, tydelige mørke rammer, vanligvis 1 px.
- Skill innhold med linjer, rammer og bakgrunnsfarger fremfor skygger.
- Listekort skal føles som oppføringer i en rutetabell:
  liten illustrasjon eller kart til venstre, innhold i midten,
  tydelig handling til høyre.
- Primære knapper er mørke med lys tekst. Et avgrenset okergult
  felt med pil kan brukes som et gjennomgående handlingsmotiv.
- Sekundære knapper og felt har lys papirbakgrunn og mørk ramme.
- Kategorier og filtre er små, rektangulære etiketter.
  Valgt tilstand kan inverteres til mørk bakgrunn og lys tekst.
- Skjemafelt skal være enkle og rammede, ikke flytende eller
  overdrevent avrundede.

### Bilder, kart og ikoner
- Bruk varme, dempede bilder med rav-, oker- og bruntoner.
- Illustrasjoner kan hente uttrykk fra gamle bykart, tresnitt
  og trykte reiseguider.
- Kart skal følge papirpaletten, med dempede omgivelser og tydelig
  rute og stoppmarkører.
- Bruk enkle strekikoner og retningspiler med konsekvent strektykkelse.
- Eventuell tekstur skal være subtil og primært ligge i bilder eller
  illustrasjoner, ikke redusere lesbarheten i UI-et.

### Tone og mikrocopy
Skriv kort, direkte og vennlig. Språket skal føles som tips fra en
lokalkjent venn, ikke som markedsføring fra en plattform.

Bruk konkrete handlinger og korte etiketter. Personlighet kan komme
gjennom små redaksjonelle overskrifter, men navigasjon og viktig
informasjon skal alltid være entydig.

### Produksjonskrav
Bevar estetikken uten å kopiere referansens minste tekststørrelser
ukritisk. Prioriter lesbarhet, god kontrast og store nok trykkflater.

- Sikt mot minst 44 × 44 px for berøringsmål.
- Bruk tydelige fokus-, valgt- og feiltilstander.
- Ikke kommuniser status med farge alene.
- Bruk delte designtokens og gjenbrukbare komponenter for konsistens.

### Unngå
Glassmorfisme, myke flytende kort, store hjørneradier, diffuse
skygger, neonfarger, overdreven animasjon og generiske dashboard-mønstre.

Ved tvil: velg det enklere, flatere og mer trykksak-lignende
alternativet — men aldri på bekostning av brukervennlighet.

## Kartet (kjerneskjermen)
Web er hovedplattformen. `components/CrawlMap.web.tsx` bruker **MapLibre GL JS** (v5 — v6 krever `import.meta`, som Metro ikke håndterer) med OpenFreeMap-vektorfliser og vår egen minimale lyse stil i `lib/mapStyle.ts`. Stilen følger papirpaletten: krem bakgrunn, lys papirfarge på veier, dempede sand- og grønntoner på parker og vann, få stedsnavn. Attribusjon er påkrevd: en tynn 9px stripe på halvgjennomsiktig krem. Native (`components/CrawlMap.tsx`, react-native-maps) tar de samme propsene fra `components/CrawlMap.types.ts` og tegner stopp og etapper, men har ingen live posisjoner ennå.

Etappene følger gatene: `route_venues.leg_geometry` (pluss distanse, varighet og tur-for-tur i `leg_steps`) beregnes på forhånd per kuratert rute med `node scripts/compute-route-legs.mjs`, som skriver en SQL-datamigrasjon. Kjør skriptet på nytt etter at stoppene i en rute er endret. Appen kaller aldri en rutetjeneste mens den kjører. Etapper uten geometri faller tilbake til en rett linje.

Etapper, én feature per etappe (etappen som kommer til et stopp):
- Kantlinje under hver etappe: blekk `#171511`, bredde 9, opacity .18, runde ender
- Gåtte etapper: blekk, bredde 5, opacity .5
- Nåværende etappe (den gruppa går neste): rødoransje `#E84B2C`, bredde 5, heltrukket. I rutevisning er alle etapper nåværende.
- Kommende etapper: rødoransje, bredde 5, prikket

Stopp-pins er DOM-markører. De er kvadratiske eller runde, har 2px blekkramme uten skygge, tall i Archivo Narrow Bold og et berøringsmål på 44px:
- ferdig: blekkfyll, lys `✓`, 30px
- nåværende: okerfyll, blekktall, 40px, 3px blekkramme
- kommende: papirfyll, blekktall, 30px

Status skal ikke vises med farge alene: ferdig har hake, nåværende er størst og har tykkere ramme, kommende har bare tall.

Nåværende stopp (eller et trykket stopp) får en etikett: papirflate `#F6ECD6`, 1px blekkramme, Cousine Bold 11px versaler, maks 140px med ellipsis.

Folk som deler posisjonen sin (Supabase Realtime Presence, ingenting lagres) vises som 32px sirkler med profilbildet eller avataren sin, ellers initialer i Archivo Bold. Med initialer har andre blekkfyll og lys tekst, du har okerfyll og blekktekst, begge med 2px papirkant. Med bilde har andre papirkant og du okerkant.

Kontroller: stablede kvadratiske okerknapper øverst til høyre med 1px blekkramme, minst 44px — zoom inn, zoom ut, vis hele ruta, «Vis meg» når du deler posisjon og nederst en pin-knapp som starter og stopper posisjonsdeling (på: tykkere ramme og hake i hjørnet, feil: kryss). Rotasjon og pitch er av. Kart inne i en side som scroller bruker `mode="embedded"` (to fingre / ctrl+scroll for å flytte). Kart i fullskjerm tar alle gester.

Crawl-skjermen (Figma: «nextStop» og «currentStop»): kartet ligger øverst, stoppanelet under, skilt av en 2px blekklinje. Øverst til venstre på kartet står en billett med «Stopp 2 av 5», kontrollene ligger øverst til høyre og en liten «N»-etikett nederst til venstre. Panelet viser «Du er på» med stedsnavnet, en oker «Fullfør crawl»-knapp (bare på siste stopp; ellers går gruppa videre fra panelet), gruppeavatarer og invitasjonskoden som et lite stempel (trykk for å dele; folk kan bli med mens crawlen pågår). En «Vis mer» / «Skjul»-fane midt på skillelinja åpner panelet: kartet krymper til en stripe på 110px, og panelet viser historie, fun fact, vurdering og et «Neste stopp»-kort med gange, distanse og «Dra videre», med «Tilbake til …» under for å angre et feiltrykk. Panelet lukkes når gruppa går videre til neste stopp.

Billetten, kartkontrollene og oker handlingsknapper har en flat, forskjøvet blekkskygge (3px, `hardShadow` i `lib/theme.ts`). Ellers er alt flatt.

## Gruppeflyten
Rute → `/group-lobby` → `/crawl`. Lobbyen er én skjerm («samleGjengen» i Figma): åpnet med `routeId` oppretter den gruppa med en gang, så koden vises umiddelbart som stempel (`components/CodeStamp.tsx`, trykk for å dele). Øverst står «Navn og bilde» (`components/ProfileField.tsx`): en rund knapp for profilbildet ved siden av navnefeltet. Du blir med i gruppa idet navnet er skrevet inn, og kan endre navn og bilde der etterpå. Under står hvem som er klare, et frivillig gruppenavn (gruppa heter som ruta til noen gir den et eget navn) og «Start crawl». `/join-group` har det samme navnefeltet over invitasjonskoden og sender folk til lobbyen, eller rett til `/crawl` hvis crawlen er i gang.

## Kveldsrapporten
`/report?groupId=…` åpnes når crawlen fullføres, og er en vanlig side alle med lenken kan lese. Alt regnes ut fra `checkins` i `lib/report.ts` (`buildReport` er ren og tar gruppe, rute, medlemmer og check-ins): et stopp rangeres på snittet av «Overall», eller snittet av de to andre hvis ingen ga overall. Skjermen viser fakta (stopp, gange fra etappene, varighet, dommere), kveldens vinner, karakterboka, kåringer (beste drikke, beste stemning, kveldens krangel, bunnplassering, strengeste og snilleste dommer) og «Dine karakterer», som bare vises på enheten som ga dem. En kåring vises bare når det er noe å kåre mellom: minst to stopp eller to dommere.

Varigheten kommer fra `groups.started_at` og `completed_at`, som databasen stempler selv med en trigger når statusen endres (`0010_crawl_times.sql`).

Deling: `lib/reportPoster.web.ts` tegner en stående plakat (1080 × 1620) rett på et canvas når siden åpnes, og `lib/reportShare.ts` sender den til delingsarket på mobil (lagre bilde, send til venner) eller laster den ned på desktop. «Del lenke» deler eller kopierer adressen til rapporten. Native har ingen plakat ennå og deler tekst. Forsiden lenker til rapporten i et døgn etter at crawlen er ferdig.

## Profil
Det finnes ingen egen profilskjerm og ingen roller. Bare navn er obligatorisk. Profilbildet er frivillig: den runde knappen viser et pluss og åpner et lite panel med «Last opp eget bilde» (`lib/profilePhoto.ts` beskjærer bildet kvadratisk og krymper det til 128px JPEG) og fem tegnede avatarer fra `assets/avatars`. Uten bilde vises initialene. Verdien ligger i `members.avatar` som `""`, `preset:<id>` eller en data-URL, se `lib/avatars.ts`. `components/Avatar.tsx` tegner alle tre variantene.

## Tokens og delte komponenter
Farger og fonter ligger i `tailwind.config.js` (klasser) og `lib/theme.ts` (kart, DOM-markører, inline-stiler). Hold dem like. Seksjonsbånd, etiketter, knapper, felt og topplinje ligger i `components/ui.tsx`. Ikonene er eksportert fra Figma til `assets/icons` og brukes gjennom `components/Icon.tsx`.
