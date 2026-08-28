-- One shape for every mobile number on file.
--
-- The unique index compares the stored text, so '8347016843' and
-- '+918347016843' were two different numbers as far as the database was
-- concerned — and the same person could end up holding two accounts. Numbers
-- typed by hand before this are normalised to the E.164 form that OTP sign-in
-- already produces.
--
-- Run this once in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run

update users
set phone = '+91' || regexp_replace(phone, '\D', '', 'g')
where phone is not null
  and length(regexp_replace(phone, '\D', '', 'g')) = 10;

update users
set phone = '+' || regexp_replace(phone, '\D', '', 'g')
where phone is not null
  and phone not like '+%'
  and length(regexp_replace(phone, '\D', '', 'g')) > 10;
