-- Shorter order numbers, and an end to a real hazard.
--
-- Numbers were ALK-2026-1111: a random four-digit number on a column that is
-- unique. By roughly a hundred and twenty orders it is a coin flip that two
-- collide, and the code read that collision as "this payment has already been
-- used" — so a client would have been charged, shown an error, and left with
-- no order on file. A counter cannot collide.
--
-- Existing orders keep the numbers they were given. A client holding
-- ALK-2026-2895 must still be able to quote it.
--
-- Run this once in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run

create sequence if not exists order_number_seq start with 1000;

-- Handed out one at a time by the database, so two orders placed in the same
-- second cannot be given the same number.
create or replace function next_order_number()
returns text
language sql
volatile
as $$
  select 'AK' || nextval('order_number_seq')::text;
$$;
