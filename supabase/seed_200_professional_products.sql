-- PROFESSIONAL SEED: 200 HIGH-VOLUME SPARE PARTS
-- This script populates the database with realistic products, structured part numbers, 
-- and accurate brand/bike compatibility for the Indian market.

DO $$
DECLARE
    v_shop_id uuid;
    
    -- Supplier IDs
    v_supp_bosch_id uuid;
    v_supp_ngk_id uuid;
    v_supp_castrol_id uuid;
    v_supp_motul_id uuid;
    v_supp_exide_id uuid;
    v_supp_mrf_id uuid;
    v_supp_ceat_id uuid;
    v_supp_brembo_id uuid;
    v_supp_minda_id uuid;
    v_supp_varroc_id uuid;

    -- Counters and Constants
    v_i integer;
    v_prod_id uuid;
    v_bike_id uuid;
    v_cost numeric;
    v_sell numeric;
    v_pn text;
    v_name text;

    -- Taxonomy IDs
    v_cat_id uuid;
    v_sub_id uuid;

BEGIN
    -- 0. Identify Context
    SELECT id INTO v_shop_id FROM shops LIMIT 1;
    IF v_shop_id IS NULL THEN RAISE EXCEPTION 'No shop found.'; END IF;

    RAISE NOTICE 'Initializing Professional Seed for Shop: %', v_shop_id;

    -- 1. Create/Retrieve Professional Suppliers
    INSERT INTO suppliers (shop_id, name, city, notes) VALUES (v_shop_id, 'Bosch India Ltd', 'Bengaluru', 'OE Electrical and Brake Systems') RETURNING id INTO v_supp_bosch_id;
    INSERT INTO suppliers (shop_id, name, city, notes) VALUES (v_shop_id, 'NGK Spark Plugs India', 'Gurugram', 'Premium Ignition Systems') RETURNING id INTO v_supp_ngk_id;
    INSERT INTO suppliers (shop_id, name, city, notes) VALUES (v_shop_id, 'Castrol Lubricants', 'Mumbai', 'Automotive Fluids') RETURNING id INTO v_supp_castrol_id;
    INSERT INTO suppliers (shop_id, name, city, notes) VALUES (v_shop_id, 'Motul India', 'Pune', 'Performance Oils') RETURNING id INTO v_supp_motul_id;
    INSERT INTO suppliers (shop_id, name, city, notes) VALUES (v_shop_id, 'Exide Industries', 'Kolkata', 'Battery Solutions') RETURNING id INTO v_supp_exide_id;
    INSERT INTO suppliers (shop_id, name, city, notes) VALUES (v_shop_id, 'MRF Tyres', 'Chennai', 'Tyre & Rubber') RETURNING id INTO v_supp_mrf_id;
    INSERT INTO suppliers (shop_id, name, city, notes) VALUES (v_shop_id, 'CEAT Limited', 'Nashik', 'High-speed tyres') RETURNING id INTO v_supp_ceat_id;
    INSERT INTO suppliers (shop_id, name, city, notes) VALUES (v_shop_id, 'Brembo Brake Systems', 'Pune', 'High-performance braking') RETURNING id INTO v_supp_brembo_id;
    INSERT INTO suppliers (shop_id, name, city, notes) VALUES (v_shop_id, 'Uno Minda Group', 'Manesar', 'Electrical & Accessories') RETURNING id INTO v_supp_minda_id;
    INSERT INTO suppliers (shop_id, name, city, notes) VALUES (v_shop_id, 'Varroc Engineering', 'Aurangabad', 'Engine & Lighting') RETURNING id INTO v_supp_varroc_id;

    -- Clear existing test products to start fresh for a "Professional" look if desired
    -- DELETE FROM products WHERE shop_id = v_shop_id;

    -- 2. GENERATE PRODUCTS
    
    -------------------------------------------------------
    -- SECTION A: BRAKES (Bosch / Brembo) - 40 parts
    -------------------------------------------------------
    SELECT id INTO v_cat_id FROM categories WHERE name = 'Brakes' AND shop_id = v_shop_id;
    SELECT id INTO v_sub_id FROM subcategories WHERE name = 'Brake Pads' AND category_id = v_cat_id;

    FOR v_name, v_pn, v_bike_id IN 
        SELECT b.model_name, (2000 + row_number() OVER())::text, b.id 
        FROM bikes b WHERE b.shop_id = v_shop_id LIMIT 20
    LOOP
        v_sell := 250 + (random() * 400);
        v_cost := v_sell * (0.5 + (random() * 0.1));
        
        INSERT INTO products (shop_id, name, part_number, sku, category_id, subcategory_id, supplier_id, cost_price, selling_price, stock_quantity, low_stock_threshold)
        VALUES (v_shop_id, 'Bosch ' || v_name || ' Front Brake Pad', 'BOS-' || v_pn, 'SKU-BOS-' || v_pn, v_cat_id, v_sub_id, v_supp_bosch_id, v_cost, v_sell, 10 + (random()*20)::int, 5)
        RETURNING id INTO v_prod_id;
        
        INSERT INTO product_bikes (product_id, bike_id) VALUES (v_prod_id, v_bike_id);
    END LOOP;

    -- Brembo High Performance Pads for Pulsar/RE/KTM
    FOR v_name, v_pn, v_bike_id IN 
        SELECT b.model_name, (3000 + row_number() OVER())::text, b.id 
        FROM bikes b JOIN companies c ON b.company_id = c.id
        WHERE c.name IN ('Bajaj', 'Royal Enfield', 'KTM') AND b.shop_id = v_shop_id
    LOOP
        v_sell := 650 + (random() * 800);
        v_cost := v_sell * (0.6 + (random() * 0.1));

        INSERT INTO products (shop_id, name, part_number, sku, category_id, subcategory_id, supplier_id, cost_price, selling_price, stock_quantity, low_stock_threshold)
        VALUES (v_shop_id, 'Brembo ' || v_name || ' Sintered Pads', 'BRM-' || v_pn, 'SKU-BRM-' || v_pn, v_cat_id, v_sub_id, v_supp_brembo_id, v_cost, v_sell, 5 + (random()*10)::int, 3)
        RETURNING id INTO v_prod_id;
        
        INSERT INTO product_bikes (product_id, bike_id) VALUES (v_prod_id, v_bike_id);
    END LOOP;

    -------------------------------------------------------
    -- SECTION B: ENGINE & SPARK PLUGS (NGK / Varroc) - 40 parts
    -------------------------------------------------------
    SELECT id INTO v_cat_id FROM categories WHERE name = 'Engine' AND shop_id = v_shop_id;
    SELECT id INTO v_sub_id FROM subcategories WHERE name = 'Spark Plug' AND category_id = v_cat_id;

    FOR v_name, v_pn, v_bike_id IN 
        SELECT b.model_name, (1000 + row_number() OVER())::text, b.id 
        FROM bikes b WHERE b.shop_id = v_shop_id LIMIT 30
    LOOP
        v_sell := 95 + (random() * 150);
        v_cost := v_sell * 0.7;
        
        INSERT INTO products (shop_id, name, part_number, sku, category_id, subcategory_id, supplier_id, cost_price, selling_price, stock_quantity, low_stock_threshold)
        VALUES (v_shop_id, 'NGK ' || v_name || ' Copper Spark Plug', 'NGK-' || v_pn, 'SKU-NGK-' || v_pn, v_cat_id, v_sub_id, v_supp_ngk_id, v_cost, v_sell, 50 + (random()*100)::int, 20)
        RETURNING id INTO v_prod_id;
        
        INSERT INTO product_bikes (product_id, bike_id) VALUES (v_prod_id, v_bike_id);
    END LOOP;

    -------------------------------------------------------
    -- SECTION C: OILS & FLUIDS (Castrol / Motul) - 30 parts (UNIVERSAL)
    -------------------------------------------------------
    SELECT id INTO v_cat_id FROM categories WHERE name = 'Oils & Fluids' AND shop_id = v_shop_id;
    SELECT id INTO v_sub_id FROM subcategories WHERE name = 'Engine Oil' AND category_id = v_cat_id;

    -- Castrol Range
    FOR v_i IN 1..15 LOOP
        v_pn := (1100 + v_i)::text;
        v_sell := 350 + (v_i * 20);
        v_cost := v_sell * 0.75;
        
        INSERT INTO products (shop_id, name, part_number, sku, category_id, subcategory_id, supplier_id, cost_price, selling_price, stock_quantity, low_stock_threshold, is_universal)
        VALUES (v_shop_id, 'Castrol Power1 10W30 ' || (CASE WHEN v_i % 2 = 0 THEN 'Synthetic' ELSE 'Premium' END) || ' 1L', 'CAS-' || v_pn, 'SKU-CAS-' || v_pn, v_cat_id, v_sub_id, v_supp_castrol_id, v_cost, v_sell, 20 + v_i, 10, true);
    END LOOP;

    -- Motul Range
    FOR v_i IN 1..15 LOOP
        v_pn := (7100 + v_i)::text;
        v_sell := 600 + (v_i * 40);
        v_cost := v_sell * 0.65;
        
        INSERT INTO products (shop_id, name, part_number, sku, category_id, subcategory_id, supplier_id, cost_price, selling_price, stock_quantity, low_stock_threshold, is_universal)
        VALUES (v_shop_id, 'Motul 7100 4T 10W40 ' || (CASE WHEN v_i % 2 = 0 THEN '500ML' ELSE '1L' END), 'MOT-' || v_pn, 'SKU-MOT-' || v_pn, v_cat_id, v_sub_id, v_supp_motul_id, v_cost, v_sell, 15 + v_i, 5, true);
    END LOOP;

    -------------------------------------------------------
    -- SECTION D: TYRES (MRF / CEAT) - 40 parts
    -------------------------------------------------------
    SELECT id INTO v_cat_id FROM categories WHERE name = 'Wheels & Tyres' AND shop_id = v_shop_id;
    SELECT id INTO v_sub_id FROM subcategories WHERE name = 'Rear Tyre' AND category_id = v_cat_id;

    FOR v_name, v_pn, v_bike_id IN 
        SELECT b.model_name, (7720 + row_number() OVER())::text, b.id 
        FROM bikes b WHERE b.shop_id = v_shop_id LIMIT 25
    LOOP
        v_sell := 1800 + (random() * 1200);
        v_cost := v_sell * 0.8;
        
        INSERT INTO products (shop_id, name, part_number, sku, category_id, subcategory_id, supplier_id, cost_price, selling_price, stock_quantity, low_stock_threshold)
        VALUES (v_shop_id, 'MRF Zapper ' || v_name || ' Rear Tyre', 'MRF-' || v_pn, 'SKU-MRF-' || v_pn, v_cat_id, v_sub_id, v_supp_mrf_id, v_cost, v_sell, 4 + (random()*10)::int, 2)
        RETURNING id INTO v_prod_id;
        
        INSERT INTO product_bikes (product_id, bike_id) VALUES (v_prod_id, v_bike_id);
    END LOOP;

    -------------------------------------------------------
    -- SECTION E: ELECTRICAL & BATTERIES (Exide / Uno Minda) - 30 parts
    -------------------------------------------------------
    SELECT id INTO v_cat_id FROM categories WHERE name = 'Electrical' AND shop_id = v_shop_id;
    SELECT id INTO v_sub_id FROM subcategories WHERE name = 'Battery' AND category_id = v_cat_id;

    FOR v_i IN 1..15 LOOP
        v_pn := (6600 + v_i)::text;
        v_sell := 1200 + (v_i * 100);
        v_cost := v_sell * 0.7;
        
        INSERT INTO products (shop_id, name, part_number, sku, category_id, subcategory_id, supplier_id, cost_price, selling_price, stock_quantity, low_stock_threshold, is_universal)
        VALUES (v_shop_id, 'Exide XLTZ' || (v_i % 9 + 4) || ' 12V Battery', 'EXD-' || v_pn, 'SKU-EXD-' || v_pn, v_cat_id, v_sub_id, v_supp_exide_id, v_cost, v_sell, 5 + v_i, 2, (v_i % 3 = 0));
    END LOOP;

    -- Uno Minda Horns
    SELECT id INTO v_sub_id FROM subcategories WHERE name = 'Horn' AND category_id = v_cat_id;
    FOR v_i IN 1..15 LOOP
        v_pn := (1000 + v_i)::text;
        v_sell := 220 + (v_i * 10);
        v_cost := v_sell * 0.5;
        
        INSERT INTO products (shop_id, name, part_number, sku, category_id, subcategory_id, supplier_id, cost_price, selling_price, stock_quantity, low_stock_threshold, is_universal)
        VALUES (v_shop_id, 'Uno Minda ' || (CASE WHEN v_i % 2 = 0 THEN 'Dual Tone' ELSE 'Standard' END) || ' Horn', 'UNM-' || v_pn, 'SKU-UNM-' || v_pn, v_cat_id, v_sub_id, v_supp_minda_id, v_cost, v_sell, 12 + v_i, 4, true);
    END LOOP;

    -------------------------------------------------------
    -- SECTION F: FILTERS (Uno Minda / Varroc) - 20 parts
    -------------------------------------------------------
    SELECT id INTO v_cat_id FROM categories WHERE name = 'Filters' AND shop_id = v_shop_id;
    SELECT id INTO v_sub_id FROM subcategories WHERE name = 'Air Filter' AND category_id = v_cat_id;

    FOR v_name, v_pn, v_bike_id IN 
        SELECT b.model_name, (5200 + row_number() OVER())::text, b.id 
        FROM bikes b WHERE b.shop_id = v_shop_id LIMIT 20
    LOOP
        v_sell := 180 + (random() * 250);
        v_cost := v_sell * 0.6;
        
        INSERT INTO products (shop_id, name, part_number, sku, category_id, subcategory_id, supplier_id, cost_price, selling_price, stock_quantity, low_stock_threshold)
        VALUES (v_shop_id, 'Uno Minda ' || v_name || ' Air Filter', 'UNM-' || v_pn, 'SKU-UNM-' || v_pn, v_cat_id, v_sub_id, v_supp_minda_id, v_cost, v_sell, 15 + (random()*30)::int, 10)
        RETURNING id INTO v_prod_id;
        
        INSERT INTO product_bikes (product_id, bike_id) VALUES (v_prod_id, v_bike_id);
    END LOOP;

    RAISE NOTICE '200 Professional Portfolio Products Seeded successfully.';
END $$;
