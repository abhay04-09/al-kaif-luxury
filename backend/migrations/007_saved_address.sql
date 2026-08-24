-- A delivery address that belongs to the client rather than to one order.
--
-- Until now the only place an address existed was on an order, so a returning
-- client retyped the whole thing at every checkout and had no way to correct it
-- from their account.
--
-- Run this once in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run

alter table users add column if not exists address text;
