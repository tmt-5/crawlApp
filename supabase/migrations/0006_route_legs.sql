-- Crawl: walking legs between stops, following the streets.
-- Each route_venues row holds the leg that arrives at it from the previous
-- stop (null on the first stop). Legs are computed once per curated route
-- with scripts/compute-route-legs.mjs and written as a data migration, so the
-- app never calls a routing service at runtime.

alter table route_venues add column if not exists leg_geometry jsonb;     -- GeoJSON LineString coordinates [[lng, lat], ...]
alter table route_venues add column if not exists leg_distance_m integer;
alter table route_venues add column if not exists leg_duration_s integer;
alter table route_venues add column if not exists leg_steps jsonb;        -- turn-by-turn steps, for directions later
