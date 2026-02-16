-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enums
create type user_role as enum ('owner', 'staff');
create type stock_movement_type as enum ('purchase', 'sale', 'adjustment', 'return', 'initial');

-- 1. Shops (Tenants)
create table shops (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  currency_symbol text default '$',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Users (Profiles linked to Auth)
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  shop_id uuid references shops(id) on delete restrict,
  full_name text,
  role user_role default 'staff',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Categories (Level 1)
create table categories (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references shops(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Subcategories (Level 2 - Strict)
create table subcategories (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references shops(id) on delete cascade not null,
  category_id uuid references categories(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Suppliers
create table suppliers (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references shops(id) on delete cascade not null,
  name text not null,
  contact_person text,
  phone text,
  email text,
  address text,
  city text,
  gst_number text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Products
create table products (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references shops(id) on delete cascade not null,
  name text not null,
  description text,
  category_id uuid references categories(id) on delete restrict,
  subcategory_id uuid references subcategories(id) on delete restrict,
  supplier_id uuid references suppliers(id) on delete set null,
  sku text,
  cost_price numeric(10, 2) not null default 0,
  selling_price numeric(10, 2) not null default 0,
  stock_quantity integer not null default 0, -- Cached value, updated by triggers
  low_stock_threshold integer default 5,
  is_universal boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Sales (Head)
create table sales (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references shops(id) on delete cascade not null,
  user_id uuid references users(id) on delete set null, -- Who made the sale
  total_amount numeric(10, 2) not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Sale Items (Lines)
create table sale_items (
  id uuid primary key default uuid_generate_v4(),
  sale_id uuid references sales(id) on delete cascade not null,
  product_id uuid references products(id) on delete restrict not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null, -- Snapshot price at time of sale
  subtotal numeric(10, 2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Stock Movements (The Ledger - Immutable)
create table stock_movements (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references shops(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  type stock_movement_type not null,
  quantity integer not null, -- Positive for in, negative for out
  reference_id uuid, -- Can be sale_id, or null for manual
  notes text,
  user_id uuid references users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Daily Records (Financial Snapshot)
create table daily_records (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references shops(id) on delete cascade not null,
  date date not null default CURRENT_DATE,
  total_sales numeric(10, 2) default 0,
  total_profit numeric(10, 2) default 0,
  cash_in_hand numeric(10, 2),
  status text default 'open', -- 'open', 'closed'
  closed_at timestamp with time zone,
  closed_by uuid references users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(shop_id, date)
);

-- Indexes for performance
create index idx_products_shop_id on products(shop_id);
create index idx_products_category_id on products(category_id);
create index idx_sales_shop_id on sales(shop_id);
create index idx_stock_movements_product_id on stock_movements(product_id);
create index idx_stock_movements_shop_id on stock_movements(shop_id);

-- RLS (Row Level Security) - Basic template
-- For now, we assume authenticated users access data for their shop.
-- Detailed policies to be added after initial setup.
alter table shops enable row level security;
alter table users enable row level security;
alter table categories enable row level security;
alter table subcategories enable row level security;
alter table suppliers enable row level security;
alter table products enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table stock_movements enable row level security;
alter table daily_records enable row level security;

-- 11. Companies
create table companies (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references shops(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. Bikes
create table bikes (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references shops(id) on delete cascade not null,
  company_id uuid references companies(id) on delete cascade not null,
  model_name text not null,
  year_optional text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. Product Bikes (Pivot)
create table product_bikes (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade not null,
  bike_id uuid references bikes(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(product_id, bike_id)
);

create index idx_companies_shop_id on companies(shop_id);
create index idx_bikes_company_id on bikes(company_id);
create index idx_bikes_shop_id on bikes(shop_id);
create index idx_product_bikes_product_id on product_bikes(product_id);
create index idx_product_bikes_bike_id on product_bikes(bike_id);

alter table companies enable row level security;
alter table bikes enable row level security;
alter table product_bikes enable row level security;
