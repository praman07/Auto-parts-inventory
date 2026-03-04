-- Add notes column to appointments (for customer notes + selected parts)
-- Run this in Supabase SQL Editor

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes TEXT;
