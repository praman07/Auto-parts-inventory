-- Migration: Add Bike Compatibility System

-- 1. Add Universal flag to products
ALTER TABLE products ADD COLUMN is_universal boolean DEFAULT false;

-- 2. Create Companies table
CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Bikes table
CREATE TABLE bikes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  model_name text NOT NULL,
  year_optional text, -- User requested year_optional
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Product Bikes pivot table
CREATE TABLE product_bikes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  bike_id uuid REFERENCES bikes(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(product_id, bike_id)
);

-- 5. Add Indexes
CREATE INDEX idx_companies_shop_id ON companies(shop_id);
CREATE INDEX idx_bikes_company_id ON bikes(company_id);
CREATE INDEX idx_bikes_shop_id ON bikes(shop_id);
CREATE INDEX idx_product_bikes_product_id ON product_bikes(product_id);
CREATE INDEX idx_product_bikes_bike_id ON product_bikes(bike_id);

-- 6. Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_bikes ENABLE ROW LEVEL SECURITY;
