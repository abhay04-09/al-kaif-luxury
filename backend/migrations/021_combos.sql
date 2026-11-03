-- Combos: "any 4 earrings for 899".
--
-- The shop decides, from the panel and without a developer:
--   pieces       how many pieces the client picks
--   price_inr    what the whole combo costs
--   categories   which categories (or sub-categories) the client picks from
--   product_ids  individual pieces that are also on offer, whatever their category
--
-- A client may pick from anything in `categories` plus anything in `product_ids`.
-- The price is fixed by the shop; the server prices every combo itself, so a
-- browser cannot name its own.
--
-- Run this once in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run

create table if not exists combos (
  id text primary key,
  name text not null,
  description text,
  -- Optional. Without one the storefront shows a piece from the combo's range.
  image text,
  pieces smallint not null check (pieces between 1 and 20),
  price_inr integer not null check (price_inr > 0),
  categories text[] not null default '{}',
  product_ids text[] not null default '{}',
  active boolean not null default true,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists combos_active_idx on combos (active, sort, created_at desc);

-- Read by the storefront through the Worker's service key, never straight from a
-- browser, so nothing here is readable or writable with the public key.
alter table combos enable row level security;
