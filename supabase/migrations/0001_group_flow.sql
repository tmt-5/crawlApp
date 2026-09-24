-- Crawl: groups, members, venues, checkins
-- No Row Level Security yet — added once auth requirements are known.

create extension if not exists pgcrypto;

create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  status text not null default 'planning' check (status in ('planning', 'active', 'completed')),
  created_at timestamptz not null default now()
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups (id) on delete cascade,
  name text not null,
  avatar text not null,
  joined_at timestamptz not null default now()
);

create table if not exists venues (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  name text not null,
  description text,
  order_index integer not null default 0,
  unique (city, name)
);

create table if not exists checkins (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups (id) on delete cascade,
  venue_id uuid not null references venues (id) on delete cascade,
  member_id uuid not null references members (id) on delete cascade,
  rating_beer integer not null check (rating_beer between 0 and 10),
  rating_atmosphere integer not null check (rating_atmosphere between 0 and 10),
  rating_overall integer not null check (rating_overall between 0 and 10),
  created_at timestamptz not null default now()
);

create index if not exists members_group_id_idx on members (group_id);
create index if not exists checkins_group_id_idx on checkins (group_id);
create index if not exists checkins_venue_id_idx on checkins (venue_id);
create index if not exists venues_city_order_idx on venues (city, order_index);

-- New Supabase projects enable RLS by default on new tables. We're not ready for
-- policies yet, so disable it explicitly instead of relying on the (older) default.
alter table groups disable row level security;
alter table members disable row level security;
alter table venues disable row level security;
alter table checkins disable row level security;

-- Seed venues for Oslo (placeholder names/descriptions — swap for real data later).
insert into venues (city, name, description, order_index) values
  ('Oslo', 'Rustne Kroken', 'Uformell nabolagspub med god ølmeny og lave priser.', 1),
  ('Oslo', 'Havnelageret', 'Rå industribar nær sjøkanten, DJ i helgene.', 2),
  ('Oslo', 'Lille Vinkel', 'Koselig vinbar i en bakgate, godt for en rolig prat.', 3),
  ('Oslo', 'Bakgården', 'Skjult bakgårdsbar med langbord og god stemning.', 4)
on conflict (city, name) do nothing;
