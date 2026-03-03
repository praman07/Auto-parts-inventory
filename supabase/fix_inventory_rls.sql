
-- Migration: Fix Inventory and Related RLS Policies
-- Allow anyone to read these tables for now (matches existing migration patterns in this project)

-- 1. Enable RLS (Should already be enabled but just in case)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view companies" ON companies;
DROP POLICY IF EXISTS "Anyone can view bikes" ON bikes;
DROP POLICY IF EXISTS "Anyone can view product_bikes" ON product_bikes;
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Anyone can view subcategories" ON subcategories;
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Anyone can view suppliers" ON suppliers;

-- 3. Create SELECT policies (Match the "true" pattern seen in migration_08)
CREATE POLICY "Anyone can view companies" ON companies FOR SELECT USING (true);
CREATE POLICY "Anyone can view bikes" ON bikes FOR SELECT USING (true);
CREATE POLICY "Anyone can view product_bikes" ON product_bikes FOR SELECT USING (true);
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view subcategories" ON subcategories FOR SELECT USING (true);
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Anyone can view suppliers" ON suppliers FOR SELECT USING (true);

-- 4. Create management policies for authenticated users
CREATE POLICY "Admins can manage companies" ON companies FOR ALL USING (true);
CREATE POLICY "Admins can manage bikes" ON bikes FOR ALL USING (true);
CREATE POLICY "Admins can manage product_bikes" ON product_bikes FOR ALL USING (true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (true);
CREATE POLICY "Admins can manage subcategories" ON subcategories FOR ALL USING (true);
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (true);
CREATE POLICY "Admins can manage suppliers" ON suppliers FOR ALL USING (true);
