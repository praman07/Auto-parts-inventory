-- Add image_url column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Seed some categories if they don't exist
INSERT INTO categories (name, shop_id) 
SELECT 'Motorcycle Tyres', id FROM shops LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO categories (name, shop_id) 
SELECT 'Racing Oils', id FROM shops LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO categories (name, shop_id) 
SELECT 'Braking Systems', id FROM shops LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO categories (name, shop_id) 
SELECT 'Performance Exhaust', id FROM shops LIMIT 1
ON CONFLICT DO NOTHING;

-- Seed Products with images
WITH first_shop AS (SELECT id FROM shops LIMIT 1),
     cat_tyres AS (SELECT id FROM categories WHERE name = 'Motorcycle Tyres' LIMIT 1),
     cat_oil AS (SELECT id FROM categories WHERE name = 'Racing Oils' LIMIT 1),
     cat_brakes AS (SELECT id FROM categories WHERE name = 'Braking Systems' LIMIT 1),
     cat_exhaust AS (SELECT id FROM categories WHERE name = 'Performance Exhaust' LIMIT 1)
INSERT INTO products (shop_id, name, description, selling_price, cost_price, stock_quantity, category_id, sku, image_url)
VALUES 
( (SELECT id FROM first_shop), 'Pirelli Diablo Rosso IV', 'The ultimate motorcycle tyre for sportive use on road.', 18500, 14000, 15, (SELECT id FROM cat_tyres), 'BIKE-TYRE-001', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800'),
( (SELECT id FROM first_shop), 'Motul 300V Factory Line', '100% Synthetic racing lubricant based on Double Ester technology.', 2400, 1800, 60, (SELECT id FROM cat_oil), 'BIKE-OIL-001', 'https://images.unsplash.com/photo-1635073910827-82857209bc2c?auto=format&fit=crop&q=80&w=800'),
( (SELECT id FROM first_shop), 'Brembo Oro Brake Disc', 'Floating front brake disc for superior stopping power and heat dissipation.', 12000, 9000, 8, (SELECT id FROM cat_brakes), 'BIKE-BRK-001', 'https://images.unsplash.com/photo-1611634701235-95079a4055f7?auto=format&fit=crop&q=80&w=800'),
( (SELECT id FROM first_shop), 'Akrapovič Slip-On Exhaust', 'Performance exhaust system offering a deep racing sound and weight reduction.', 45000, 35000, 5, (SELECT id FROM cat_exhaust), 'BIKE-EXH-001', 'https://images.unsplash.com/photo-1591438960548-6a5664112674?auto=format&fit=crop&q=80&w=800'),
( (SELECT id FROM first_shop), 'Michelin Road 6', 'The new must-have Michelin tyre for road use, offering longevity and wet grip.', 16500, 12500, 20, (SELECT id FROM cat_tyres), 'BIKE-TYRE-002', 'https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&q=80&w=800'),
( (SELECT id FROM first_shop), 'Öhlins TTX Rear Shock', 'World-class suspension technology for ultimate handling and control.', 85000, 65000, 3, (SELECT id FROM cat_tyres), 'BIKE-SUSP-001', 'https://images.unsplash.com/photo-1622321453265-22442220f188?auto=format&fit=crop&q=80&w=800');
