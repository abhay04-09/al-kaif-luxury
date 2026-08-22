-- Mobile sign-in: an account created from a phone number has no email address,
-- so email can no longer be required.
--
-- Run this once in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run

alter table users alter column email drop not null;

-- A phone number now identifies an account, so it has to be unique. The index is
-- partial because most existing rows have no number at all, and those nulls must
-- not collide with one another.
create unique index if not exists users_phone_key
  on users (phone)
  where phone is not null;
