-- SAMPLE PRODUCTS SEED
-- This script populates the "products" table with actual spare parts linked to the Indian motorcycle ecosystem.

DO $$
DECLARE
    v_shop_id uuid;
    v_supp_id uuid;
    
    -- Category IDs
    v_cat_engine_id uuid;
    v_cat_brakes_id uuid;
    v_cat_electrical_id uuid;
    v_cat_filters_id uuid;
    
    -- Subcategory IDs
    v_sub_spark_plug_id uuid;
    v_sub_brake_pads_id uuid;
    v_sub_air_filter_id uuid;
    v_sub_battery_id uuid;
    
    -- Bike IDs
    v_bike_splendor_id uuid;
    v_bike_pulsar_id uuid;
    v_bike_classic350_id uuid;
    v_bike_activa_id uuid;
    
    -- Product IDs
    v_prod_spark_splendor_id uuid;
    v_prod_brake_pulsar_id uuid;
    v_prod_filter_re_id uuid;
    v_prod_batt_universal_id uuid;

BEGIN
    -- 0. Identify Context
    SELECT id INTO v_shop_id FROM shops LIMIT 1;
    IF v_shop_id IS NULL THEN RAISE EXCEPTION 'No shop found.'; END IF;

    -- 1. Create a Default Supplier if none exists
    INSERT INTO suppliers (shop_id, name, contact_person, city)
    VALUES (v_shop_id, 'Standard Auto Spares', 'Rajesh Kumar', 'New Delhi')
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_supp_id;
    
    IF v_supp_id IS NULL THEN
        SELECT id INTO v_supp_id FROM suppliers WHERE shop_id = v_shop_id LIMIT 1;
    END IF;

    -- 2. Retrieve IDs from prior seed
    SELECT id INTO v_cat_engine_id FROM categories WHERE name = 'Engine' AND shop_id = v_shop_id;
    SELECT id INTO v_cat_brakes_id FROM categories WHERE name = 'Brakes' AND shop_id = v_shop_id;
    SELECT id INTO v_cat_electrical_id FROM categories WHERE name = 'Electrical' AND shop_id = v_shop_id;
    SELECT id INTO v_cat_filters_id FROM categories WHERE name = 'Filters' AND shop_id = v_shop_id;

    SELECT id INTO v_sub_spark_plug_id FROM subcategories WHERE name = 'Spark Plug' AND category_id = v_cat_engine_id;
    SELECT id INTO v_sub_brake_pads_id FROM subcategories WHERE name = 'Brake Pads' AND category_id = v_cat_brakes_id;
    SELECT id INTO v_sub_air_filter_id FROM subcategories WHERE name = 'Air Filter' AND category_id = v_cat_filters_id;
    SELECT id INTO v_sub_battery_id FROM subcategories WHERE name = 'Battery' AND category_id = v_cat_electrical_id;

    SELECT id INTO v_bike_splendor_id FROM bikes WHERE model_name = 'Splendor Plus' AND shop_id = v_shop_id;
    SELECT id INTO v_bike_pulsar_id FROM bikes WHERE model_name = 'Pulsar 150' AND shop_id = v_shop_id;
    SELECT id INTO v_bike_classic350_id FROM bikes WHERE model_name = 'Classic 350' AND shop_id = v_shop_id;
    SELECT id INTO v_bike_activa_id FROM bikes WHERE model_name = 'Activa 6G' AND shop_id = v_shop_id;

    -- 3. Insert Products
    -- Hero Splendor Spark Plug
    INSERT INTO products (shop_id, name, part_number, sku, category_id, subcategory_id, supplier_id, cost_price, selling_price, stock_quantity, low_stock_threshold, is_universal)
    VALUES (v_shop_id, 'NGK Spark Plug CPR7EA-9', 'CPR7EA-9', 'HERO-SP-001', v_cat_engine_id, v_sub_spark_plug_id, v_supp_id, 85, 120, 45, 10, false)
    RETURNING id INTO v_prod_spark_splendor_id;
    INSERT INTO product_bikes (product_id, bike_id) VALUES (v_prod_spark_splendor_id, v_bike_splendor_id);

    -- Bajaj Pulsar Brake Pads
    INSERT INTO products (shop_id, name, part_number, sku, category_id, subcategory_id, supplier_id, cost_price, selling_price, stock_quantity, low_stock_threshold, is_universal)
    VALUES (v_shop_id, 'Disc Brake Pads - Front (Pulsar)', 'BA-BRAKE-09', 'BAJ-BP-150', v_cat_brakes_id, v_sub_brake_pads_id, v_supp_id, 180, 290, 12, 5, false)
    RETURNING id INTO v_prod_brake_pulsar_id;
    INSERT INTO product_bikes (product_id, bike_id) VALUES (v_prod_brake_pulsar_id, v_bike_pulsar_id);

    -- Royal Enfield Air Filter
    INSERT INTO products (shop_id, name, part_number, sku, category_id, subcategory_id, supplier_id, cost_price, selling_price, stock_quantity, low_stock_threshold, is_universal)
    VALUES (v_shop_id, 'Air Filter Element (RE Classic)', 'RE-FLT-350', 'RE-AF-CL', v_cat_filters_id, v_sub_air_filter_id, v_supp_id, 210, 350, 8, 3, false)
    RETURNING id INTO v_prod_filter_re_id;
    INSERT INTO product_bikes (product_id, bike_id) VALUES (v_prod_filter_re_id, v_bike_classic350_id);

    -- Universal Exide Battery
    INSERT INTO products (shop_id, name, part_number, sku, category_id, subcategory_id, supplier_id, cost_price, selling_price, stock_quantity, low_stock_threshold, is_universal)
    VALUES (v_shop_id, 'Exide XLTZ4 Battery (Universal)', 'XLTZ4', 'BATT-EX-01', v_cat_electrical_id, v_sub_battery_id, v_supp_id, 850, 1150, 4, 2, true)
    RETURNING id INTO v_prod_batt_universal_id;

    RAISE NOTICE 'Sample products seeded successfully.';
END $$;
