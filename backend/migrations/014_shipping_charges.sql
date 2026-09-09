-- Shipping, charged rather than absorbed.
--
-- Every order until now was priced as goods alone and shown "Complimentary"
-- delivery, while the courier still charged the maison forty to seventy rupees
-- a parcel — roughly a tenth of a five-hundred rupee sale, straight off margin.
--
-- What was charged has to be stored on the order, not recalculated later: a
-- courier's rate changes, and an invoice from March must still add up in
-- September.
--
-- Run this once in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run

alter table orders add column if not exists shipping_inr numeric(10,2) not null default 0;
alter table orders add column if not exists cod_fee_inr numeric(10,2) not null default 0;

-- Anything the shop must be able to change without a deploy.
create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- The shipping rules. Set here so the shop can change them from the panel.
--   liveRates    ask the courier what this parcel costs to that pin code
--   flatINR      what to charge when the courier will not answer in time
--   codFeeINR    added to cash-on-delivery orders
--   freeAboveINR carts at or over this ship free; 0 turns that off
--   markupINR    added to every live quote, for packaging and handling
insert into settings (key, value)
values ('shipping', '{
  "liveRates": true,
  "flatINR": 79,
  "codFeeINR": 0,
  "freeAboveINR": 0,
  "markupINR": 0
}'::jsonb)
on conflict (key) do nothing;

-- A parked checkout has to remember what the client was quoted. Re-asking the
-- courier when the webhook recovers an order could return a different number
-- than the one the client actually paid.
alter table pending_checkouts add column if not exists shipping_inr numeric(10,2) not null default 0;
alter table pending_checkouts add column if not exists cod_fee_inr numeric(10,2) not null default 0;
