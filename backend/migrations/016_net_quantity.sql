-- What is actually in the box.
--
-- India's Legal Metrology (Packaged Commodities) Rules require an online
-- listing to declare the net quantity of what is being sold — "1 pair",
-- "set of 4", "50 ml". The shop had nowhere to write it down, so a pair of
-- earrings and a single earring looked identical on the page.
--
-- Free text rather than a number and a unit, because jewellery is counted in
-- pairs and sets and perfume in millilitres, and one field has to hold both.
--
-- Run this once in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run

alter table products add column if not exists net_quantity text;
