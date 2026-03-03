-- Step 1: Update the ENUM type
-- Run this script ALONE first.
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'customer';
