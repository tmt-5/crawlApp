-- Crawl: venues become a per-city library; each group builds its own
-- ordered route by picking venues into route_stops.

alter table venues drop column if exists order_index;
alter table venues add column if not exists tagline text;
alter table venues add column if not exists fun_fact text;
alter table venues add column if not exists image_url text;
alter table venues add column if not exists category text;
alter table venues add column if not exists opening_hours_note text;
alter table venues add column if not exists address text;
alter table venues add column if not exists latitude numeric;
alter table venues add column if not exists longitude numeric;
alter table venues add column if not exists google_rating numeric;
alter table venues add column if not exists last_verified_at date;

drop index if exists venues_city_order_idx;
create index if not exists venues_city_idx on venues (city);

create table if not exists route_stops (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups (id) on delete cascade,
  venue_id uuid not null references venues (id) on delete cascade,
  order_index integer not null default 0
);

create index if not exists route_stops_group_id_idx on route_stops (group_id);
create index if not exists route_stops_venue_id_idx on route_stops (venue_id);

alter table route_stops disable row level security;

-- Fill in the new detail fields for the existing Oslo seed venues
-- (placeholder values — swap for real data later).
update venues set
  tagline = 'Ditt nye nabolagsvannhull.',
  category = 'pub',
  opening_hours_note = 'Åpent til 01:00 fre/lør',
  address = 'Thorvald Meyers gate 12, Oslo',
  latitude = 59.9226,
  longitude = 10.7597,
  google_rating = 4.3,
  fun_fact = 'Kalt "Rustne" etter skiltet som rustet fast over inngangen på 90-tallet.',
  image_url = 'https://images.unsplash.com/photo-1546622891-02c72c1537b6',
  last_verified_at = '2026-01-15'
where city = 'Oslo' and name = 'Rustne Kroken';

update venues set
  tagline = 'Industribar med DJ og utsikt til sjøen.',
  category = 'bar',
  opening_hours_note = 'Åpent til 02:00 fre/lør',
  address = 'Schweigaards gate 34, Oslo',
  latitude = 59.9086,
  longitude = 10.7645,
  google_rating = 4.5,
  fun_fact = 'Bygningen var opprinnelig et lager for tørrfisk på 1930-tallet.',
  image_url = 'https://images.unsplash.com/photo-1514933651103-005eec06c04b',
  last_verified_at = '2026-01-15'
where city = 'Oslo' and name = 'Havnelageret';

update venues set
  tagline = 'Vin og viskende samtaler i bakgaten.',
  category = 'vinbar',
  opening_hours_note = 'Åpent til 00:00 tors-lør',
  address = 'Skovveien 8, Oslo',
  latitude = 59.9184,
  longitude = 10.7145,
  google_rating = 4.6,
  fun_fact = 'Vinkjelleren under lokalet skal være over 100 år gammel.',
  image_url = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3',
  last_verified_at = '2026-01-15'
where city = 'Oslo' and name = 'Lille Vinkel';

update venues set
  tagline = 'Langbord, latter og lokal stemning.',
  category = 'bar',
  opening_hours_note = 'Åpent til 02:00 fre/lør',
  address = 'Markveien 57, Oslo',
  latitude = 59.9236,
  longitude = 10.7538,
  google_rating = 4.4,
  fun_fact = 'Langbordene er bygget av gjenbrukt trevirke fra en nedlagt fabrikk i Oslo.',
  image_url = 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34',
  last_verified_at = '2026-01-15'
where city = 'Oslo' and name = 'Bakgården';
