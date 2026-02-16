-- 1. SCHEMA MIGRATION: Purchase Order System
-- Create Purchase Orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    order_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'received', 'cancelled'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Purchase Order Items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity_ordered INTEGER NOT NULL,
    quantity_received INTEGER DEFAULT 0,
    unit_cost NUMERIC(10, 2), -- Snapshot of cost at time of order
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_order_id ON purchase_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_product_id ON purchase_order_items(product_id);


-- 2. DATA SIMULATION: Low Stock Adjustments
-- Create a function and trigger to update product stock on movement
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET stock_quantity = stock_quantity + NEW.quantity
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_stock ON stock_movements;
CREATE TRIGGER trg_update_stock
AFTER INSERT ON stock_movements
FOR EACH ROW
EXECUTE FUNCTION update_product_stock();

DO $$
DECLARE
    r RECORD;
    fast_movers TEXT[] := ARRAY[
        'Brake Pad', 'Spark Plug', 'Engine Oil', 'Air Filter', 'Clutch Cable', 
        'Brake Shoe', 'Horn', 'Battery', 'Tyre'
    ];
    new_stock INT;
    new_threshold INT;
    reduction_qty INT;
BEGIN
    -- Loop through fast-moving products
    FOR r IN 
        SELECT p.id, p.name, p.stock_quantity, p.shop_id 
        FROM products p
        WHERE 
            -- Match keywords
            EXISTS (SELECT 1 FROM unnest(fast_movers) k WHERE p.name ILIKE '%' || k || '%')
            -- Take ~40% random sample
            AND random() < 0.4
    LOOP
        -- Determine target stock (0-5)
        new_stock := floor(random() * 6)::INT;
        
        -- Determine new threshold (6-15)
        new_threshold := floor(random() * 10 + 6)::INT;
        
        -- Calculate reduction needed
        reduction_qty := r.stock_quantity - new_stock;

        -- Update threshold
        UPDATE products 
        SET low_stock_threshold = new_threshold 
        WHERE id = r.id;

        -- Insert movement ONLY if stock needs reduction
        IF reduction_qty > 0 THEN
            INSERT INTO stock_movements (
                shop_id, 
                product_id, 
                type, 
                quantity, 
                notes, 
                created_at
            ) VALUES (
                r.shop_id, 
                r.id, 
                'adjustment', -- Using 'adjustment' or 'sale' as requested
                -reduction_qty, -- Negative quantity reduces stock
                'Low Stock Simulation: Auto-adjustment',
                NOW()
            );
        ELSIF reduction_qty < 0 THEN
             -- If current stock is ALREADY lower than target (unlikely if starting fresh, but possible),
             -- we could increase it, but goal is LOW stock. 
             -- Let's just create a small adjustment to ensure it hits exactly new_stock if needed,
             -- or leave it if it's already low.
             IF r.stock_quantity > 5 THEN
                 -- Force it down to 5
                 INSERT INTO stock_movements (
                    shop_id, product_id, type, quantity, notes, created_at
                 ) VALUES (
                    r.shop_id, r.id, 'adjustment', - (r.stock_quantity - 5), 'Forced Low Stock', NOW()
                 );
             END IF;
        END IF;
        
    END LOOP;
    
    -- Ensure some items are strictly 0 stock (Out of Stock)
    FOR r IN 
        SELECT p.id, p.stock_quantity, p.shop_id
        FROM products p
        WHERE random() < 0.05 -- 5% of products
    LOOP
        IF r.stock_quantity > 0 THEN
             INSERT INTO stock_movements (
                shop_id, product_id, type, quantity, notes, created_at
             ) VALUES (
                r.shop_id, r.id, 'adjustment', -r.stock_quantity, 'Out of Stock Simulation', NOW()
             );
        END IF;
         UPDATE products SET low_stock_threshold = floor(random() * 5 + 5)::INT WHERE id = r.id;
    END LOOP;

END $$;
