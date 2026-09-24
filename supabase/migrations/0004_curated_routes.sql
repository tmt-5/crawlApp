-- Crawl: routes are now defined up front instead of built per group.
-- A route is an ordered list of venues in a city. For now every route is
-- curated (edited here / in the Supabase dashboard). kind = 'community' and
-- created_by are reserved for user-made routes later.
-- Groups pick one route; the crawl reads its stops from route_venues.

create table if not exists routes (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  slug text not null,
  name text not null,
  tagline text,
  description text,
  neighborhood text,
  kind text not null default 'curated' check (kind in ('curated', 'community')),
  created_by uuid,
  is_published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (city, slug)
);

create index if not exists routes_city_idx on routes (city, sort_order);

create table if not exists route_venues (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references routes (id) on delete cascade,
  venue_id uuid not null references venues (id) on delete restrict,
  order_index integer not null,
  note text,
  -- Deferred so stops can be reordered inside one transaction.
  constraint route_venues_route_order_key unique (route_id, order_index) deferrable initially deferred
);

create index if not exists route_venues_route_id_idx on route_venues (route_id);
create index if not exists route_venues_venue_id_idx on route_venues (venue_id);

alter table routes disable row level security;
alter table route_venues disable row level security;

alter table groups add column if not exists route_id uuid references routes (id) on delete set null;

-- Per-group routes are gone.
drop table if exists route_stops;

-- Remove the fictional placeholder venues from 0001/0003.
delete from venues
where city = 'Oslo'
  and name in ('Rustne Kroken', 'Havnelageret', 'Lille Vinkel', 'Bakgården');

-- Real Oslo venues. Coordinates from OpenStreetMap (Nominatim).
-- Opening hours, ratings and images are left empty until verified.
insert into venues (city, name, tagline, description, fun_fact, category, address, latitude, longitude) values
  ('Oslo', 'Schouskjelleren Mikrobryggeri',
    'Mikrobryggeri i hvelvkjeller.',
    'Eget øl brygget på stedet, servert under murhvelv i kjelleren på det gamle bryggeriområdet.',
    'Ligger i kjelleren på Schous bryggeri, som brygget øl her fra 1870-årene.',
    'bryggeri', 'Trondheimsveien 2, Oslo', 59.91836, 10.76021),
  ('Oslo', 'Territoriet',
    'Vinbar med lang liste på glass.',
    'Liten, travel vinbar på Markveien. Stort utvalg vin på glass og kunnskapsrike folk bak baren.',
    null,
    'vinbar', 'Markveien 58, Oslo', 59.91893, 10.75749),
  ('Oslo', 'Parkteatret',
    'Konsertscene og bar ved Olaf Ryes plass.',
    'Bar og konsertlokale i en gammel kinosal. Ofte konsert eller DJ utover kvelden.',
    'Lokalet åpnet som kino tidlig på 1900-tallet.',
    'bar', 'Olaf Ryes plass 11, Oslo', 59.92349, 10.75836),
  ('Oslo', 'Grünerløkka Brygghus',
    'Brewpub midt på Thorvald Meyers gate.',
    'Brygger eget øl og serverer mat. Godt sted å prøve husets øl på fat.',
    null,
    'bryggeri', 'Thorvald Meyers gate 30B, Oslo', 59.92500, 10.75936),
  ('Oslo', 'Bar Boca',
    'Liten cocktailbar i 50-tallsstil.',
    'Trang og lavmælt bar med retro interiør. Kom tidlig hvis dere er mange.',
    null,
    'cocktailbar', 'Thorvald Meyers gate 30, Oslo', 59.92520, 10.75936),
  ('Oslo', 'Kulturhuset',
    'Flere etasjer med bar, bordtennis og shuffleboard.',
    'Stort og uformelt lokale ved Youngstorget. Plass til hele gjengen og spill på flere av etasjene.',
    null,
    'bar', 'Youngs gate 6, Oslo', 59.91458, 10.75076),
  ('Oslo', 'Himkok',
    'Cocktailbar med eget destilleri.',
    'Cocktails laget med egne destillater og nordiske råvarer. Bakgården har en enklere bar med tappekraner.',
    'Har flere ganger vært på listen over verdens 50 beste barer.',
    'cocktailbar', 'Storgata 27, Oslo', 59.91427, 10.75152),
  ('Oslo', 'Torggata Botaniske',
    'Cocktailbar full av planter.',
    'Cocktails med urter og ingredienser fra egne planter, i et lokale som ligner et drivhus.',
    null,
    'cocktailbar', 'Torggata 17B, Oslo', 59.91609, 10.75216),
  ('Oslo', 'Crowbar & Bryggeri',
    'Bryggeri og ølbar i Torggata.',
    'Eget bryggeri i samme bygg og mange kraner. Mat fra kjøkkenet oppe.',
    null,
    'bryggeri', 'Torggata 32, Oslo', 59.91718, 10.75341),
  ('Oslo', 'Café Sara',
    'Rolig ølpub på hjørnet.',
    'Uformell pub med stort ølutvalg og mat. Grei avslutning før man går videre.',
    null,
    'pub', 'Hausmanns gate 29, Oslo', 59.91759, 10.75417)
on conflict (city, name) do update set
  tagline = excluded.tagline,
  description = excluded.description,
  fun_fact = excluded.fun_fact,
  category = excluded.category,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude;

insert into routes (city, slug, name, tagline, description, neighborhood, sort_order) values
  ('Oslo', 'loekka-paa-langs', 'Løkka på langs',
    'Fra bryggerikjelleren til Thorvald Meyers gate.',
    'Starter i hvelvkjelleren ved Schous plass og går nordover gjennom Grünerløkka. Øl, vin og en cocktail til slutt.',
    'Grünerløkka', 1),
  ('Oslo', 'torggata-runden', 'Torggata-runden',
    'Youngstorget og Torggata, alt innen noen minutter.',
    'Korte avstander mellom stoppene. Blanding av cocktailbarer og ølsteder rundt Youngstorget og opp Torggata.',
    'Sentrum', 2)
on conflict (city, slug) do update set
  name = excluded.name,
  tagline = excluded.tagline,
  description = excluded.description,
  neighborhood = excluded.neighborhood,
  sort_order = excluded.sort_order;

-- Rewrite the stops for the seeded routes so this file can be re-run.
delete from route_venues
where route_id in (select id from routes where city = 'Oslo' and slug in ('loekka-paa-langs', 'torggata-runden'));

insert into route_venues (route_id, venue_id, order_index, note)
select r.id, v.id, s.order_index, s.note
from (values
  ('loekka-paa-langs', 'Schouskjelleren Mikrobryggeri', 0, 'Spør hva som er brygget sist.'),
  ('loekka-paa-langs', 'Territoriet', 1, null),
  ('loekka-paa-langs', 'Parkteatret', 2, 'Sjekk om det er konsert samme kveld.'),
  ('loekka-paa-langs', 'Grünerløkka Brygghus', 3, null),
  ('loekka-paa-langs', 'Bar Boca', 4, null),
  ('torggata-runden', 'Kulturhuset', 0, null),
  ('torggata-runden', 'Himkok', 1, 'Bakgården er raskere hvis det er kø inne.'),
  ('torggata-runden', 'Torggata Botaniske', 2, null),
  ('torggata-runden', 'Crowbar & Bryggeri', 3, null),
  ('torggata-runden', 'Café Sara', 4, null)
) as s (slug, venue_name, order_index, note)
join routes r on r.city = 'Oslo' and r.slug = s.slug
join venues v on v.city = 'Oslo' and v.name = s.venue_name;
