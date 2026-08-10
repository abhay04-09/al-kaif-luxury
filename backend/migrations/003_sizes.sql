-- Per-product size options (shown as selectable buttons on the storefront)
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run

alter table products add column if not exists sizes jsonb not null default '[]';

-- USD pricing is no longer captured in the admin panel; keep the column but
-- stop requiring it so products can be saved with INR alone.
alter table products alter column price_usd drop not null;
alter table products alter column price_usd set default 0;
