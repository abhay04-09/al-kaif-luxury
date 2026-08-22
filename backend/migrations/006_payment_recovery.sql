-- Recovering orders whose payment succeeded but whose browser never came back.
--
-- The order used to be written only when the client's browser posted the
-- Razorpay result. A closed tab, a dead battery or a dropped connection between
-- paying and returning meant the money was taken and no order existed at all.
--
-- The basket is now parked here before the payment window opens, so Razorpay's
-- webhook can complete the order on its own if the browser never returns.
--
-- Run this once in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run

create table if not exists pending_checkouts (
  razorpay_order_id text primary key,
  user_id uuid references users(id) on delete set null,
  customer_name text not null,
  customer_email text not null default '',
  customer_phone text not null,
  shipping_address jsonb not null,
  items jsonb not null,
  gift_wrapped boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

-- The rows are short-lived working state; this makes clearing out abandoned
-- checkouts cheap.
create index if not exists pending_checkouts_created_at_idx
  on pending_checkouts (created_at);

-- One payment can settle exactly one order. This is what stops the browser and
-- the webhook from both writing an order when they arrive at the same moment,
-- and it is the last line of defence against a replayed payment.
create unique index if not exists orders_razorpay_payment_id_key
  on orders (razorpay_payment_id)
  where razorpay_payment_id is not null;
