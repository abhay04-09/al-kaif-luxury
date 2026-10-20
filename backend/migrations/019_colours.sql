-- A piece that comes in more than one colour.
--
-- Each colour stays its own product, because each one has its own
-- photographs, its own price and its own shelf — rose gold can sell out while
-- gold is still there. What was missing was the thread between them: a shared
-- group name, so the shop page can offer the others.
--
--   colour_name   what this one is called: "Rose Gold", "Silver"
--   colour_group  the same word on every colour of one design, in any form
--                 the shop likes — "butterfly stud", "DE19" — matched exactly
--                 but ignoring case and surrounding space
--
-- Both empty means a piece with one colour, which is most of them, and
-- nothing about it changes.
--
-- Run this once in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run

alter table products add column if not exists colour_name text;
alter table products add column if not exists colour_group text;

-- The shop page looks pieces up by their group, so it is worth an index.
create index if not exists products_colour_group_idx
  on products (lower(trim(colour_group)))
  where colour_group is not null and colour_group <> '';
