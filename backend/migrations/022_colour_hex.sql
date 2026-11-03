-- The exact shade of a colour.
--
-- Until now the round colour swatch on the product page was guessed from the
-- colour's name, which works for "Gold" or "Pastel pink" but not for a name the
-- shop has just invented. This lets the shop pick the shade itself.
--
--   colour_hex   "#RRGGBB", optional. Empty means "work it out from the name",
--                which is exactly what happens today, so nothing changes for a
--                piece that does not set one.
--
-- Run this once in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run

alter table products add column if not exists colour_hex text;

-- Only a well-formed colour may be stored; anything else would paint nothing.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_colour_hex_format'
  ) then
    alter table products
      add constraint products_colour_hex_format
      check (colour_hex is null or colour_hex ~ '^#[0-9A-Fa-f]{6}$');
  end if;
end $$;
