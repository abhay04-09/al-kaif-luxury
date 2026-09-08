-- The record of a cancellation.
--
-- An order could already be set to "Cancelled", which restocked the pieces and
-- told the courier to stand down, but nothing was written down: not when, not
-- by whom, not why, and — for an order that had already been paid — not whether
-- the money ever went back. A client asking "I cancelled last week, where is my
-- refund?" could not be answered from the panel.
--
-- Run this once in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run

alter table orders add column if not exists cancelled_at timestamptz;
alter table orders add column if not exists cancellation_reason text;
-- 'customer' or 'admin'. Who pressed the button matters when a client disputes it.
alter table orders add column if not exists cancelled_by text;
-- null while nothing is owed; 'Due' once a paid order is cancelled; 'Refunded'
-- when the shop has sent the money back.
alter table orders add column if not exists refund_status text;

-- The cancelled list is read on its own, and it is the one view that must stay
-- quick as the order book grows.
create index if not exists orders_cancelled_at_idx
  on orders (cancelled_at desc)
  where cancelled_at is not null;
