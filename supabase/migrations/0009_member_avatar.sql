-- Crawl: members.avatar now holds a profile picture instead of a role.
--
-- The value is '' (show initials), 'preset:<id>' (one of the drawn avatars) or
-- a small JPEG data URL (an uploaded photo, shrunk to 128 px in the app, about
-- 5-10 kB). Role ids from older rows are left alone; the app shows initials
-- for anything it doesn't recognise.

alter table members alter column avatar set default '';

-- Keep an uploaded photo from growing the row without bound.
alter table members drop constraint if exists members_avatar_length;
alter table members add constraint members_avatar_length
  check (char_length(avatar) <= 40000) not valid;

-- People enter their name and picture in the lobby and can change them there,
-- so a member row can now be updated: name and picture only, and only while
-- the group is still open. As with groups, there is no sign-in yet, so this
-- does not stop one visitor from renaming another.
drop policy if exists "members in open groups can be updated" on members;
create policy "members in open groups can be updated" on members
  for update to anon, authenticated
  using (
    exists (select 1 from groups where groups.id = group_id and groups.status <> 'completed')
  )
  with check (
    exists (select 1 from groups where groups.id = group_id and groups.status <> 'completed')
  );

revoke update on members from anon, authenticated;
grant update (name, avatar) on members to anon, authenticated;
