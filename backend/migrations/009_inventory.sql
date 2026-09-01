-- Stock counts, so the maison knows what it still has.
--
-- Until now a piece was either "in stock" or not, set by hand. Nothing counted
-- down as pieces sold, so the only way to know what was left was to go and look
-- in the drawer.
--
-- stock_quantity is deliberately nullable: null means "not counted", and such a
-- piece behaves exactly as it does today, governed by in_stock alone. That lets
-- the maison start counting one piece at a time instead of having to inventory
-- the whole catalogue before anything works.
--
-- Run this once in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run

alter table products add column if not exists stock_quantity integer;
alter table products add column if not exists low_stock_threshold integer not null default 3;

-- Nothing may sell more of a piece than exists.
alter table products drop constraint if exists products_stock_quantity_non_negative;
alter table products add constraint products_stock_quantity_non_negative
  check (stock_quantity is null or stock_quantity >= 0);

/*
 * Takes stock off a piece, atomically.
 *
 * Two clients paying in the same second would both read the same count and both
 * write one less, selling a piece twice. The condition lives inside the UPDATE
 * so the database settles it: the second caller matches no row and is told so.
 *
 * Returns true when the stock was taken (or the piece is not counted at all),
 * false when there was not enough.
 */
create or replace function decrement_stock(p_product_id text, p_quantity integer)
returns boolean
language plpgsql
as $$
declare
  affected integer;
  untracked integer;
begin
  update products
     set stock_quantity = stock_quantity - p_quantity,
         in_stock = (stock_quantity - p_quantity) > 0
   where id = p_product_id
     and stock_quantity is not null
     and stock_quantity >= p_quantity;

  get diagnostics affected = row_count;
  if affected > 0 then
    return true;
  end if;

  -- A piece nobody counts is always available.
  select count(*) into untracked
    from products
   where id = p_product_id and stock_quantity is null;

  return untracked > 0;
end;
$$;

/* Puts stock back when an order is cancelled. */
create or replace function increment_stock(p_product_id text, p_quantity integer)
returns boolean
language plpgsql
as $$
begin
  update products
     set stock_quantity = stock_quantity + p_quantity,
         in_stock = true
   where id = p_product_id
     and stock_quantity is not null;
  return found;
end;
$$;
