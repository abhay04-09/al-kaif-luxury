-- AL-KAIFF database schema for Supabase (PostgreSQL)
-- Run this once in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  password_hash text not null,
  role text not null default 'customer', -- 'customer' | 'admin'
  avatar text,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id text primary key,
  name text not null,
  subtitle text not null default '',
  category text not null, -- 'jewellery' | 'perfumes' | 'watches'
  price_inr numeric(12,2) not null,
  price_usd numeric(12,2) not null,
  image text not null,
  secondary_images jsonb not null default '[]',
  description text not null default '',
  featured boolean not null default false,
  is_new_arrival boolean not null default false,
  in_stock boolean not null default true,
  specifications jsonb not null default '{}',
  artisan_story text,
  sku text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id text primary key,
  order_number text not null unique,
  user_id uuid references users(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address jsonb not null,
  subtotal_inr numeric(12,2) not null,
  tax_inr numeric(12,2) not null,
  discount_inr numeric(12,2) not null default 0,
  total_inr numeric(12,2) not null,
  total_usd numeric(12,2) not null,
  payment_method text not null default 'COD',
  payment_status text not null default 'Pending', -- 'Pending' | 'Paid' | 'Failed'
  order_status text not null default 'Placed',
  razorpay_order_id text,
  razorpay_payment_id text,
  gift_wrapped boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id bigserial primary key,
  order_id text not null references orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  quantity integer not null,
  price_inr numeric(12,2) not null,
  price_usd numeric(12,2) not null,
  image text,
  selected_metal text,
  selected_size text
);

create table if not exists newsletter_subscribers (
  id bigserial primary key,
  email text not null unique,
  subscribed_at timestamptz not null default now()
);

create index if not exists idx_products_category on products(category);
create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_order_items_order on order_items(order_id);

-- The API talks to the database with the service_role key (server side only),
-- so lock the tables down from anonymous/public access:
alter table users enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table newsletter_subscribers enable row level security;
