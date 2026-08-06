-- Categories & sub-categories
-- Run this in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run

create table if not exists categories (
  id text primary key,                                        -- slug, e.g. 'jewellery' or 'rings'
  name text not null,
  parent_id text references categories(id) on delete cascade, -- null = top-level category
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

alter table categories enable row level security;

alter table products add column if not exists subcategory text;

create index if not exists idx_categories_parent on categories(parent_id);
create index if not exists idx_products_subcategory on products(subcategory);
