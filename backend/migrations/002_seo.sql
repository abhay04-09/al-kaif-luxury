-- SEO fields for products
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run

alter table products add column if not exists seo_title text;
alter table products add column if not exists seo_description text;
alter table products add column if not exists seo_keywords text;
