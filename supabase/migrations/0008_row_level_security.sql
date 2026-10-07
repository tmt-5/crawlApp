-- Crawl: turn on Row Level Security.
--
-- The app has no sign-in yet, so everyone uses the public anon key that ships
-- in the web bundle. Until now that key could read, change and delete
-- everything. These policies limit it to what the app actually does:
--
--   routes, route_venues, venues   read only (edited in the dashboard, which
--                                  uses the service role and bypasses RLS)
--   groups                         read, create, and update three columns
--   members                        read and create
--   checkins                       read, create and update (ratings upsert)
--
-- Nothing can be deleted with the anon key.
--
-- What this does NOT do: without sign-in there is no way to tell one visitor
-- from another, so anyone with the key can still read every group and move
-- any group's crawl forward. Closing that needs auth (e.g. Supabase anonymous
-- sign-in) and policies tied to auth.uid().

alter table routes enable row level security;
alter table route_venues enable row level security;
alter table venues enable row level security;
alter table groups enable row level security;
alter table members enable row level security;
alter table checkins enable row level security;

-- Curated content: read only.
drop policy if exists "routes are readable" on routes;
create policy "routes are readable" on routes
  for select to anon, authenticated using (true);

drop policy if exists "route stops are readable" on route_venues;
create policy "route stops are readable" on route_venues
  for select to anon, authenticated using (true);

drop policy if exists "venues are readable" on venues;
create policy "venues are readable" on venues
  for select to anon, authenticated using (true);

-- Groups: anyone can look one up (by id or invite code) and create one.
drop policy if exists "groups are readable" on groups;
create policy "groups are readable" on groups
  for select to anon, authenticated using (true);

drop policy if exists "groups can be created" on groups;
create policy "groups can be created" on groups
  for insert to anon, authenticated
  with check (status = 'planning' and current_stop_index = 0);

-- A finished crawl stays finished.
drop policy if exists "open groups can be updated" on groups;
create policy "open groups can be updated" on groups
  for update to anon, authenticated
  using (status <> 'completed')
  with check (true);

-- Only the name, the status and the position on the route can change. The
-- invite code, the route and the city are fixed once the group exists.
revoke update on groups from anon, authenticated;
grant update (name, status, current_stop_index) on groups to anon, authenticated;

-- Members: join a group that is still open, and see who is in it.
drop policy if exists "members are readable" on members;
create policy "members are readable" on members
  for select to anon, authenticated using (true);

drop policy if exists "members can join open groups" on members;
create policy "members can join open groups" on members
  for insert to anon, authenticated
  with check (
    exists (select 1 from groups where groups.id = group_id and groups.status <> 'completed')
  );

-- Check-ins: saved with an upsert, so both insert and update are needed. A
-- check-in must belong to a member of the group it is filed under.
drop policy if exists "checkins are readable" on checkins;
create policy "checkins are readable" on checkins
  for select to anon, authenticated using (true);

drop policy if exists "members can check in" on checkins;
create policy "members can check in" on checkins
  for insert to anon, authenticated
  with check (
    exists (select 1 from members where members.id = member_id and members.group_id = checkins.group_id)
  );

drop policy if exists "checkins can be updated" on checkins;
create policy "checkins can be updated" on checkins
  for update to anon, authenticated
  using (true)
  with check (
    exists (select 1 from members where members.id = member_id and members.group_id = checkins.group_id)
  );

-- No delete policies, and no delete privilege either.
revoke delete, truncate on routes, route_venues, venues, groups, members, checkins
  from anon, authenticated;

-- Keep free-text fields to a sane size. "not valid" applies the limit to new
-- and changed rows without failing on anything already stored.
alter table groups drop constraint if exists groups_name_length;
alter table groups add constraint groups_name_length
  check (char_length(name) between 1 and 80) not valid;

alter table members drop constraint if exists members_name_length;
alter table members add constraint members_name_length
  check (char_length(name) between 1 and 60) not valid;
