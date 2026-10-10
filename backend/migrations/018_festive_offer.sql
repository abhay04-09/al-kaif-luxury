-- The Navratri festive offer: a discount by basket size, on traditional pieces.
--
-- The percentage and the gifts are stored on the order, not recalculated from
-- the settings later. The shop can change the tiers mid-season, and an order
-- taken on Tuesday must still add up on Friday.
--
-- Run this once in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run

-- discount_inr already exists on orders. These two do not.
alter table orders add column if not exists festive_tier text;
alter table orders add column if not exists gift_count integer not null default 0;

-- A parked checkout has to remember the offer it was quoted, or a payment
-- recovered by the webhook would be priced without the discount the client saw.
alter table pending_checkouts add column if not exists discount_inr numeric(10,2) not null default 0;
alter table pending_checkouts add column if not exists festive_tier text;
alter table pending_checkouts add column if not exists gift_count integer not null default 0;

-- The offer itself, so the shop can switch it on and off and edit the tiers
-- from the panel.
--
--   enabled   nothing is discounted while this is false
--   keyword   a piece is in the offer when its name or description says this
--   tiers     minINR is the lowest basket that earns that row, gifts is how
--             many free gifts to pack with it
--
-- Deliberately off on arrival: switching a 55% discount on is the shop's
-- decision to make, not a side effect of running a migration.
insert into settings (key, value)
values ('festive', '{
  "enabled": false,
  "title": "Navratri Festive Season Sale",
  "subtitle": "Offers on all traditional products",
  "keyword": "traditional",
  "tiers": [
    { "minINR": 0,    "percent": 20, "gifts": 0 },
    { "minINR": 1001, "percent": 25, "gifts": 1 },
    { "minINR": 2001, "percent": 30, "gifts": 1 },
    { "minINR": 3000, "percent": 40, "gifts": 2 },
    { "minINR": 5000, "percent": 55, "gifts": 3 }
  ]
}'::jsonb)
on conflict (key) do nothing;
