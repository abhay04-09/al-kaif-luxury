-- Archived products stay in the database but disappear from the storefront.
-- Run this in the Supabase SQL Editor.

alter table products add column if not exists archived boolean not null default false;
alter table products add column if not exists archived_at timestamptz;

-- The storefront always filters on this, so it is worth an index.
create index if not exists products_archived_idx on products (archived);
