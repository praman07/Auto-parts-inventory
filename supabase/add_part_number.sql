-- Migration to add part_number field to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS part_number text;
CREATE INDEX IF NOT EXISTS idx_products_part_number ON products(part_number);
