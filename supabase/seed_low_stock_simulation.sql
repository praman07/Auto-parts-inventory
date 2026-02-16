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
    keyword TEXT;
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
                    r.shop_id, r.id, 'adjustment', -(r.stock_quantity - 5), 'Forced Low Stock', NOW()
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
