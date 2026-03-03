-- ============================================================
-- FINAL FIX: Open SELECT on appointments & sales for anon
-- Run this in Supabase SQL Editor
-- ============================================================

-- Drop any conflicting policies first
DROP POLICY IF EXISTS "Allow anon read for dashboard" ON appointments;
DROP POLICY IF EXISTS "Allow anon sales read for dashboard" ON sales;
DROP POLICY IF EXISTS "Admins can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can view all sales" ON sales;
DROP POLICY IF EXISTS "Users can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Allow users to view own appointments" ON appointments;

-- Allow ALL SELECT on appointments (dashboard is protected by its own login)
CREATE POLICY "Allow public read appointments"
ON appointments FOR SELECT
USING (true);

-- Allow ALL SELECT on sales
CREATE POLICY "Allow public read sales"
ON sales FOR SELECT
USING (true);

-- Verify data exists
SELECT 
    'appointments' as table_name,
    COUNT(*) as total_rows,
    COUNT(user_id) as with_user_id,
    COUNT(user_email) as with_email
FROM appointments
UNION ALL
SELECT 
    'sales',
    COUNT(*),
    COUNT(user_id),
    0
FROM sales;
