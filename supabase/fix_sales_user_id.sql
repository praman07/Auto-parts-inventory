-- ============================================================
-- CRITICAL FIX: Make sales.user_id nullable
-- Admin quick sales don't have a Supabase auth user
-- Run this in Supabase SQL Editor
-- ============================================================

-- Make user_id nullable so admin quick sales work without a user
ALTER TABLE sales ALTER COLUMN user_id DROP NOT NULL;

-- Also ensure appointments sale_id column exists (for checkout flow)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS sale_id UUID REFERENCES sales(id) ON DELETE SET NULL;

-- Open up RLS on sales for insert (service role bypasses, but anon may need this)
DROP POLICY IF EXISTS "Allow insert sales" ON sales;
CREATE POLICY "Allow insert sales"
ON sales FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow read sales" ON sales;
CREATE POLICY "Allow read sales"
ON sales FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow update sales" ON sales;
CREATE POLICY "Allow update sales"
ON sales FOR UPDATE
USING (true);

-- Verify
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'sales' AND column_name = 'user_id';
