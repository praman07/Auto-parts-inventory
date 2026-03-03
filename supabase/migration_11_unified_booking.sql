-- Add sale_id to appointments table to link parts selected from shop
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS sale_id UUID REFERENCES sales(id) ON DELETE SET NULL;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_appointments_sale_id ON appointments(sale_id);
