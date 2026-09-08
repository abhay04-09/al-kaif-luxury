-- The price a piece is listed at, before the discount.
--
-- Until now the storefront invented one: every card showed the selling price
-- times 1.35 struck through, and a flat "25% OFF" badge, regardless of what
-- anything actually cost. That is a fabricated reference price, which the Legal
-- Metrology rules do not allow, so the number now has to come from the shop.
--
-- Null means the piece is simply sold at its price, with nothing struck out.
--
-- Run this once in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run

alter table products add column if not exists mrp_inr integer;

-- An MRP at or below the selling price would print a "0% OFF" badge and a
-- strikethrough that flatters nothing. Only a genuine reduction is stored.
alter table products drop constraint if exists products_mrp_above_price;
alter table products add constraint products_mrp_above_price
  check (mrp_inr is null or mrp_inr > price_inr);
