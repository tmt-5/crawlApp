-- Crawl: track which city/route a group has committed to.

alter table groups add column if not exists city text;
