-- REALISTIC INDIAN SPARE PARTS SYSTEM SEED
-- This script populates the database with authentic Category, Subcategory, Company, and Bike model data.

DO $$
DECLARE
    v_shop_id uuid;
    
    -- Category IDs
    v_cat_engine_id uuid;
    v_cat_brakes_id uuid;
    v_cat_suspension_id uuid;
    v_cat_electrical_id uuid;
    v_cat_transmission_id uuid;
    v_cat_wheels_id uuid;
    v_cat_body_id uuid;
    v_cat_filters_id uuid;
    v_cat_fluids_id uuid;
    v_cat_accessories_id uuid;
    
    -- Company IDs
    v_comp_hero_id uuid;
    v_comp_honda_id uuid;
    v_comp_bajaj_id uuid;
    v_comp_tvs_id uuid;
    v_comp_yamaha_id uuid;
    v_comp_suzuki_id uuid;
    v_comp_re_id uuid;
    v_comp_ktm_id uuid;
    v_comp_jawa_id uuid;
    v_comp_ather_id uuid;
BEGIN
    -- 0. Context Identification
    SELECT id INTO v_shop_id FROM shops LIMIT 1;
    
    IF v_shop_id IS NULL THEN
        RAISE EXCEPTION 'No shop found. Please ensure at least one shop exists in the "shops" table before seeding.';
    END IF;

    RAISE NOTICE 'Seeding database for Shop ID: %', v_shop_id;

    -- STEP 1: CREATE CATEGORIES (Top-level taxonomy)
    INSERT INTO categories (shop_id, name) VALUES (v_shop_id, 'Engine') RETURNING id INTO v_cat_engine_id;
    INSERT INTO categories (shop_id, name) VALUES (v_shop_id, 'Brakes') RETURNING id INTO v_cat_brakes_id;
    INSERT INTO categories (shop_id, name) VALUES (v_shop_id, 'Suspension') RETURNING id INTO v_cat_suspension_id;
    INSERT INTO categories (shop_id, name) VALUES (v_shop_id, 'Electrical') RETURNING id INTO v_cat_electrical_id;
    INSERT INTO categories (shop_id, name) VALUES (v_shop_id, 'Transmission') RETURNING id INTO v_cat_transmission_id;
    INSERT INTO categories (shop_id, name) VALUES (v_shop_id, 'Wheels & Tyres') RETURNING id INTO v_cat_wheels_id;
    INSERT INTO categories (shop_id, name) VALUES (v_shop_id, 'Body Parts') RETURNING id INTO v_cat_body_id;
    INSERT INTO categories (shop_id, name) VALUES (v_shop_id, 'Filters') RETURNING id INTO v_cat_filters_id;
    INSERT INTO categories (shop_id, name) VALUES (v_shop_id, 'Oils & Fluids') RETURNING id INTO v_cat_fluids_id;
    INSERT INTO categories (shop_id, name) VALUES (v_shop_id, 'Accessories') RETURNING id INTO v_cat_accessories_id;

    -- STEP 2: CREATE SUBCATEGORIES (Granular part classification)
    -- Engine
    INSERT INTO subcategories (shop_id, category_id, name) VALUES 
        (v_shop_id, v_cat_engine_id, 'Spark Plug'),
        (v_shop_id, v_cat_engine_id, 'Piston'),
        (v_shop_id, v_cat_engine_id, 'Cylinder Kit'),
        (v_shop_id, v_cat_engine_id, 'Gasket'),
        (v_shop_id, v_cat_engine_id, 'Valve Set'),
        (v_shop_id, v_cat_engine_id, 'Timing Chain');

    -- Brakes
    INSERT INTO subcategories (shop_id, category_id, name) VALUES 
        (v_shop_id, v_cat_brakes_id, 'Brake Pads'),
        (v_shop_id, v_cat_brakes_id, 'Brake Shoes'),
        (v_shop_id, v_cat_brakes_id, 'Brake Disc'),
        (v_shop_id, v_cat_brakes_id, 'Brake Drum'),
        (v_shop_id, v_cat_brakes_id, 'Brake Cable'),
        (v_shop_id, v_cat_brakes_id, 'Master Cylinder'),
        (v_shop_id, v_cat_brakes_id, 'Caliper'),
        (v_shop_id, v_cat_brakes_id, 'Brake Lever');

    -- Suspension
    INSERT INTO subcategories (shop_id, category_id, name) VALUES 
        (v_shop_id, v_cat_suspension_id, 'Front Fork'),
        (v_shop_id, v_cat_suspension_id, 'Rear Shock Absorber'),
        (v_shop_id, v_cat_suspension_id, 'Swing Arm'),
        (v_shop_id, v_cat_suspension_id, 'Fork Oil Seal');

    -- Electrical
    INSERT INTO subcategories (shop_id, category_id, name) VALUES 
        (v_shop_id, v_cat_electrical_id, 'Battery'),
        (v_shop_id, v_cat_electrical_id, 'Headlight'),
        (v_shop_id, v_cat_electrical_id, 'Tail Light'),
        (v_shop_id, v_cat_electrical_id, 'Indicator'),
        (v_shop_id, v_cat_electrical_id, 'Ignition Coil'),
        (v_shop_id, v_cat_electrical_id, 'Horn'),
        (v_shop_id, v_cat_electrical_id, 'Wiring Kit');

    -- Transmission
    INSERT INTO subcategories (shop_id, category_id, name) VALUES 
        (v_shop_id, v_cat_transmission_id, 'Clutch Plate'),
        (v_shop_id, v_cat_transmission_id, 'Clutch Cable'),
        (v_shop_id, v_cat_transmission_id, 'Gear Set'),
        (v_shop_id, v_cat_transmission_id, 'Chain Sprocket Kit');

    -- Wheels & Tyres
    INSERT INTO subcategories (shop_id, category_id, name) VALUES 
        (v_shop_id, v_cat_wheels_id, 'Front Tyre'),
        (v_shop_id, v_cat_wheels_id, 'Rear Tyre'),
        (v_shop_id, v_cat_wheels_id, 'Alloy Wheel'),
        (v_shop_id, v_cat_wheels_id, 'Spoke Wheel'),
        (v_shop_id, v_cat_wheels_id, 'Tube');

    -- Body Parts
    INSERT INTO subcategories (shop_id, category_id, name) VALUES 
        (v_shop_id, v_cat_body_id, 'Front Fender'),
        (v_shop_id, v_cat_body_id, 'Rear Fender'),
        (v_shop_id, v_cat_body_id, 'Fuel Tank'),
        (v_shop_id, v_cat_body_id, 'Side Panel'),
        (v_shop_id, v_cat_body_id, 'Seat'),
        (v_shop_id, v_cat_body_id, 'Mirrors');

    -- Filters
    INSERT INTO subcategories (shop_id, category_id, name) VALUES 
        (v_shop_id, v_cat_filters_id, 'Air Filter'),
        (v_shop_id, v_cat_filters_id, 'Oil Filter'),
        (v_shop_id, v_cat_filters_id, 'Fuel Filter');

    -- Oils & Fluids
    INSERT INTO subcategories (shop_id, category_id, name) VALUES 
        (v_shop_id, v_cat_fluids_id, 'Engine Oil'),
        (v_shop_id, v_cat_fluids_id, 'Brake Fluid'),
        (v_shop_id, v_cat_fluids_id, 'Coolant');

    -- Accessories
    INSERT INTO subcategories (shop_id, category_id, name) VALUES 
        (v_shop_id, v_cat_accessories_id, 'Mobile Holder'),
        (v_shop_id, v_cat_accessories_id, 'Seat Cover'),
        (v_shop_id, v_cat_accessories_id, 'Leg Guard'),
        (v_shop_id, v_cat_accessories_id, 'Crash Guard'),
        (v_shop_id, v_cat_accessories_id, 'Foot Mat');

    -- STEP 3: CREATE COMPANIES (Major Indian & Global Players)
    INSERT INTO companies (shop_id, name) VALUES (v_shop_id, 'Hero') RETURNING id INTO v_comp_hero_id;
    INSERT INTO companies (shop_id, name) VALUES (v_shop_id, 'Honda') RETURNING id INTO v_comp_honda_id;
    INSERT INTO companies (shop_id, name) VALUES (v_shop_id, 'Bajaj') RETURNING id INTO v_comp_bajaj_id;
    INSERT INTO companies (shop_id, name) VALUES (v_shop_id, 'TVS') RETURNING id INTO v_comp_tvs_id;
    INSERT INTO companies (shop_id, name) VALUES (v_shop_id, 'Yamaha') RETURNING id INTO v_comp_yamaha_id;
    INSERT INTO companies (shop_id, name) VALUES (v_shop_id, 'Suzuki') RETURNING id INTO v_comp_suzuki_id;
    INSERT INTO companies (shop_id, name) VALUES (v_shop_id, 'Royal Enfield') RETURNING id INTO v_comp_re_id;
    INSERT INTO companies (shop_id, name) VALUES (v_shop_id, 'KTM') RETURNING id INTO v_comp_ktm_id;
    INSERT INTO companies (shop_id, name) VALUES (v_shop_id, 'Jawa') RETURNING id INTO v_comp_jawa_id;
    INSERT INTO companies (shop_id, name) VALUES (v_shop_id, 'Ather') RETURNING id INTO v_comp_ather_id;

    -- STEP 4: CREATE BIKES (High-Frequency Professional Models)
    -- Hero
    INSERT INTO bikes (shop_id, company_id, model_name) VALUES 
        (v_shop_id, v_comp_hero_id, 'Splendor Plus'),
        (v_shop_id, v_comp_hero_id, 'HF Deluxe'),
        (v_shop_id, v_comp_hero_id, 'Glamour'),
        (v_shop_id, v_comp_hero_id, 'Passion Pro'),
        (v_shop_id, v_comp_hero_id, 'Xtreme 160R');

    -- Honda
    INSERT INTO bikes (shop_id, company_id, model_name) VALUES 
        (v_shop_id, v_comp_honda_id, 'Activa 6G'),
        (v_shop_id, v_comp_honda_id, 'Shine'),
        (v_shop_id, v_comp_honda_id, 'Unicorn'),
        (v_shop_id, v_comp_honda_id, 'SP 125'),
        (v_shop_id, v_comp_honda_id, 'Dio'),
        (v_shop_id, v_comp_honda_id, 'Hornet 2.0');

    -- Bajaj
    INSERT INTO bikes (shop_id, company_id, model_name) VALUES 
        (v_shop_id, v_comp_bajaj_id, 'Pulsar 125'),
        (v_shop_id, v_comp_bajaj_id, 'Pulsar 150'),
        (v_shop_id, v_comp_bajaj_id, 'Pulsar NS200'),
        (v_shop_id, v_comp_bajaj_id, 'Platina 110'),
        (v_shop_id, v_comp_bajaj_id, 'Avenger 160');

    -- TVS
    INSERT INTO bikes (shop_id, company_id, model_name) VALUES 
        (v_shop_id, v_comp_tvs_id, 'Apache RTR 160'),
        (v_shop_id, v_comp_tvs_id, 'Apache RTR 200'),
        (v_shop_id, v_comp_tvs_id, 'Jupiter'),
        (v_shop_id, v_comp_tvs_id, 'Ntorq 125'),
        (v_shop_id, v_comp_tvs_id, 'Raider 125'),
        (v_shop_id, v_comp_tvs_id, 'Sport');

    -- Yamaha
    INSERT INTO bikes (shop_id, company_id, model_name) VALUES 
        (v_shop_id, v_comp_yamaha_id, 'FZ-S V3'),
        (v_shop_id, v_comp_yamaha_id, 'R15 V4'),
        (v_shop_id, v_comp_yamaha_id, 'MT-15'),
        (v_shop_id, v_comp_yamaha_id, 'Fascino 125'),
        (v_shop_id, v_comp_yamaha_id, 'RayZR 125');

    -- Suzuki
    INSERT INTO bikes (shop_id, company_id, model_name) VALUES 
        (v_shop_id, v_comp_suzuki_id, 'Access 125'),
        (v_shop_id, v_comp_suzuki_id, 'Burgman Street'),
        (v_shop_id, v_comp_suzuki_id, 'Gixxer'),
        (v_shop_id, v_comp_suzuki_id, 'Gixxer SF');

    -- Royal Enfield
    INSERT INTO bikes (shop_id, company_id, model_name) VALUES 
        (v_shop_id, v_comp_re_id, 'Classic 350'),
        (v_shop_id, v_comp_re_id, 'Bullet 350'),
        (v_shop_id, v_comp_re_id, 'Meteor 350'),
        (v_shop_id, v_comp_re_id, 'Hunter 350');

    -- KTM
    INSERT INTO bikes (shop_id, company_id, model_name) VALUES 
        (v_shop_id, v_comp_ktm_id, 'Duke 125'),
        (v_shop_id, v_comp_ktm_id, 'Duke 200'),
        (v_shop_id, v_comp_ktm_id, 'RC 200');

    -- Jawa
    INSERT INTO bikes (shop_id, company_id, model_name) VALUES 
        (v_shop_id, v_comp_jawa_id, 'Jawa Classic'),
        (v_shop_id, v_comp_jawa_id, 'Jawa 42');

    -- Ather
    INSERT INTO bikes (shop_id, company_id, model_name) VALUES 
        (v_shop_id, v_comp_ather_id, 'Ather 450X');

    RAISE NOTICE 'Portfolio selection seed completed successfully.';
END $$;
