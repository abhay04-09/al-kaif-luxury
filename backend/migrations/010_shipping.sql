-- Where a parcel is, once it has left the atelier.
--
-- The order knew what was bought and where it was going, but nothing about the
-- journey — so "where is my order?" could only be answered by logging into the
-- courier's own panel and searching by hand.
--
-- Run this once in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run

alter table orders add column if not exists shipmozo_order_id text;
alter table orders add column if not exists awb_number text;
alter table orders add column if not exists courier_name text;
alter table orders add column if not exists tracking_status text;
alter table orders add column if not exists tracking_updated_at timestamptz;
alter table orders add column if not exists shipped_at timestamptz;

-- Tracking is looked up by AWB when a courier reports movement.
create index if not exists orders_awb_number_idx
  on orders (awb_number)
  where awb_number is not null;

-- One parcel, one order. A number pasted onto a second order by mistake would
-- send two clients to the same tracking page.
create unique index if not exists orders_awb_number_key
  on orders (awb_number)
  where awb_number is not null;
