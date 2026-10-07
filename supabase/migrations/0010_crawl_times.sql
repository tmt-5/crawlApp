-- Crawl: when a crawl started and ended, for the evening report.
--
-- The database stamps both itself when the status changes, so the app doesn't
-- need permission to write the columns and can't set them to something else.
-- Crawls from before this migration have no times; the report leaves the
-- duration out for those.

alter table groups add column if not exists started_at timestamptz;
alter table groups add column if not exists completed_at timestamptz;

create or replace function stamp_crawl_times() returns trigger
language plpgsql as $$
begin
  if new.status = 'active' and old.status = 'planning' and new.started_at is null then
    new.started_at := now();
  end if;
  if new.status = 'completed' and old.status <> 'completed' then
    new.completed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists groups_stamp_crawl_times on groups;
create trigger groups_stamp_crawl_times
  before update of status on groups
  for each row execute function stamp_crawl_times();
