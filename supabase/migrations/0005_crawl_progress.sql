-- Crawl: the group's position on the route lives in the database, so leaving
-- and reopening the crawl resumes at the right stop. The whole group shares
-- one position; it only ever moves forward.

alter table groups add column if not exists current_stop_index integer not null default 0;

-- Rating is optional. A check-in without ratings still records that the
-- member was at the stop.
alter table checkins alter column rating_beer drop not null;
alter table checkins alter column rating_atmosphere drop not null;
alter table checkins alter column rating_overall drop not null;

-- One check-in per member per stop. Keep the newest if duplicates exist.
delete from checkins a
using checkins b
where a.group_id = b.group_id
  and a.venue_id = b.venue_id
  and a.member_id = b.member_id
  and (a.created_at, a.id) < (b.created_at, b.id);

create unique index if not exists checkins_group_venue_member_key
  on checkins (group_id, venue_id, member_id);
