-- SAFE DELTA MIGRATION: Add Bike Compatibility System
-- Use this script instead of the full schema.sql to avoid "already exists" errors.

-- 1. Add Universal flag to products (if not already there)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='is_universal') THEN
    ALTER TABLE products ADD COLUMN is_universal boolean DEFAULT false;
  END IF;
END $$;

-- 2. Create Companies table (if not exists)
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Bikes table (if not exists)
CREATE TABLE IF NOT EXISTS bikes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  model_name text NOT NULL,
  year_optional text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Product Bikes pivot table (if not exists)
CREATE TABLE IF NOT EXISTS product_bikes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  bike_id uuid REFERENCES bikes(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(product_id, bike_id)
);

-- 5. Add Indexes (if not exists)
CREATE INDEX IF NOT EXISTS idx_companies_shop_id ON companies(shop_id);
CREATE INDEX IF NOT EXISTS idx_bikes_company_id ON bikes(company_id);
CREATE INDEX IF NOT EXISTS idx_bikes_shop_id ON bikes(shop_id);
CREATE INDEX IF NOT EXISTS idx_product_bikes_product_id ON product_bikes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_bikes_bike_id ON product_bikes(bike_id);

-- 6. Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_bikes ENABLE ROW LEVEL SECURITY;

-- 7. Disable RLS for development (Recommended for your current setup)
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE bikes DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_bikes DISABLE ROW LEVEL SECURITY;
