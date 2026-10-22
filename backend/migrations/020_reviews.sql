-- What clients say about a piece.
--
-- Only a signed-in client may write one, and only one per piece, so the rating
-- on a product is a count of people rather than a count of attempts. A review
-- appears the moment it is written; the shop can hide it, pin it or delete it
-- afterwards.
--
--   rating      one to five stars, the only part a client must give
--   body        their words, optional
--   hidden      off the shop, still in the panel — reversible
--   pinned      shown first on that piece
--   verified    this client has an order containing this piece
--
-- Run this once in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run

create table if not exists reviews (
  id text primary key,
  product_id text not null references products(id) on delete cascade,
  -- Losing the account should not silently rewrite history, but a review with
  -- nobody behind it cannot be trusted either, so it goes with the account.
  user_id uuid not null references users(id) on delete cascade,
  author_name text not null,
  rating smallint not null check (rating between 1 and 5),
  body text,
  hidden boolean not null default false,
  pinned boolean not null default false,
  verified_purchase boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- One review per client per piece. A second attempt edits the first.
  unique (product_id, user_id)
);

-- The shop page asks for one piece's reviews, pinned first, newest after.
create index if not exists reviews_product_idx
  on reviews (product_id, pinned desc, created_at desc);

-- Reviews are read by the storefront through the Worker's service key, never
-- straight from a browser, so nothing here is readable with the public key.
alter table reviews enable row level security;
