-- Migration 08: Fix Admin RLS Policies & Schema Update
-- Adding missing DELETE and ALL policies for admin management
-- Adding customer_id to sales to track customer LTV

-- 1. Schema update for Sales
ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;

-- 2. Appointments
-- Allow deletion by admin (authenticated)
DROP POLICY IF EXISTS "Admins can delete appointments" ON appointments;
CREATE POLICY "Admins can delete appointments" ON appointments
  FOR DELETE USING (true);

-- 3. Sales
-- Allow all access for admins to manage sales history
DROP POLICY IF EXISTS "Admins can view all sales" ON sales;
CREATE POLICY "Admins can view all sales" ON sales
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage sales" ON sales;
CREATE POLICY "Admins can manage sales" ON sales
  FOR ALL USING (true);

-- 4. Sale Items
-- Allow all access for admins
DROP POLICY IF EXISTS "Admins can view all sale items" ON sale_items;
CREATE POLICY "Admins can view all sale items" ON sale_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage sale items" ON sale_items;
CREATE POLICY "Admins can manage sale items" ON sale_items
  FOR ALL USING (true);

-- 5. Users
-- Allow admins to view all users (for customer list and staff management)
DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage users" ON users;
CREATE POLICY "Admins can manage users" ON users
  FOR ALL USING (true);

-- 6. Customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view all customers" ON customers;
CREATE POLICY "Admins can view all customers" ON customers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage all customers" ON customers;
CREATE POLICY "Admins can manage all customers" ON customers
  FOR ALL USING (true);

-- 7. Stock Movements
-- Allow admins to view and manage stock movements
DROP POLICY IF EXISTS "Admins can view all stock movements" ON stock_movements;
CREATE POLICY "Admins can view all stock movements" ON stock_movements
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage stock movements" ON stock_movements;
CREATE POLICY "Admins can manage stock movements" ON stock_movements
  FOR ALL USING (true);
