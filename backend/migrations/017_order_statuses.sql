-- The order statuses the shop actually works in.
--
-- The old set described a workshop — "In Artisan Crafting", "Quality Assured",
-- "Shipped via Express" — rather than what a client wants to know about a
-- parcel. The new set is: Placed, Accepted, In Process, Shipped,
-- Out for Delivery, Delivered, and Cancelled.
--
-- Orders already on file are moved to the nearest new status, so nobody's
-- order page is left showing a step that no longer exists.
--
-- Run this once in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run

update orders set order_status = 'In Process'
  where order_status in ('In Artisan Crafting', 'Quality Assured');

update orders set order_status = 'Shipped'
  where order_status = 'Shipped via Express';
