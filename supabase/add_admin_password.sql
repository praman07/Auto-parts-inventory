-- Migration: Add Admin Password to Settings Table
-- Adds a secure password column for the admin dashboard gateway.

ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS admin_password TEXT DEFAULT 'admin123';

-- Update existing row if needed to ensure there is a default password
UPDATE public.settings SET admin_password = 'admin123' WHERE admin_password IS NULL;
