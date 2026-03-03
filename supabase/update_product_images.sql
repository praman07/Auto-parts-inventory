-- ============================================================
-- UPDATE PRODUCT IMAGES
-- Assigns real, working Unsplash image URLs to all products
-- by matching category/name keywords.
-- Run this in your Supabase SQL Editor.
-- ============================================================

-- BRAKE PADS & BRAKE-RELATED
UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800'
WHERE image_url IS NULL
  AND (name ILIKE '%brake pad%' OR name ILIKE '%brake shoe%' OR name ILIKE '%sintered pad%');

-- BRAKE DISCS / ROTORS
UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&q=80&w=800'
WHERE image_url IS NULL
  AND (name ILIKE '%brake disc%' OR name ILIKE '%rotor%');

-- SPARK PLUGS
UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&q=80&w=800'
WHERE image_url IS NULL
  AND (name ILIKE '%spark plug%' OR name ILIKE '%NGK%' OR name ILIKE '%plug%');

-- ENGINE OIL / LUBRICANTS (Castrol / Motul)
UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800'
WHERE image_url IS NULL
  AND (name ILIKE '%engine oil%' OR name ILIKE '%Castrol%' OR name ILIKE '%Motul%' OR name ILIKE '%lubricant%' OR name ILIKE '%10W%' OR name ILIKE '%4T%');

-- TYRES
UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1600661653561-629509216228?auto=format&fit=crop&q=80&w=800'
WHERE image_url IS NULL
  AND (name ILIKE '%tyre%' OR name ILIKE '%tire%' OR name ILIKE '%MRF%' OR name ILIKE '%CEAT%' OR name ILIKE '%Zapper%');

-- BATTERIES
UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1604754742629-3e5728249d73?auto=format&fit=crop&q=80&w=800'
WHERE image_url IS NULL
  AND (name ILIKE '%battery%' OR name ILIKE '%Exide%' OR name ILIKE '%XLTZ%');

-- HORNS
UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800'
WHERE image_url IS NULL
  AND (name ILIKE '%horn%' OR name ILIKE '%dual tone%');

-- AIR FILTERS
UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=800'
WHERE image_url IS NULL
  AND (name ILIKE '%air filter%' OR name ILIKE '%filter%');

-- CLUTCH CABLES / BRAKE CABLES
UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1490902931801-d6f80ca94fe4?auto=format&fit=crop&q=80&w=800'
WHERE image_url IS NULL
  AND (name ILIKE '%cable%' OR name ILIKE '%clutch cable%' OR name ILIKE '%brake cable%');

-- CHAINS
UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1597781914982-0ce5e6f4eaf6?auto=format&fit=crop&q=80&w=800'
WHERE image_url IS NULL
  AND (name ILIKE '%chain%');

-- HEADLIGHTS / BULBS / LIGHTING
UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800'
WHERE image_url IS NULL
  AND (name ILIKE '%headlight%' OR name ILIKE '%bulb%' OR name ILIKE '%LED%' OR name ILIKE '%light%');

-- SHOCKS / SUSPENSION
UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800'
WHERE image_url IS NULL
  AND (name ILIKE '%shock%' OR name ILIKE '%suspension%' OR name ILIKE '%absorber%');

-- CARBURETOR / FUEL SYSTEM
UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1657197745735-e2cbfd919e16?auto=format&fit=crop&q=80&w=800'
WHERE image_url IS NULL
  AND (name ILIKE '%carburett%' OR name ILIKE '%fuel%' OR name ILIKE '%injector%');

-- CATCH-ALL: Any remaining products with NULL image_url
-- Use a generic auto parts / workshop image
UPDATE products
SET image_url = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&q=80&w=800'
WHERE image_url IS NULL;

-- Verification: Show count of updated products
SELECT COUNT(*) AS total_products,
       COUNT(image_url) AS with_image,
       COUNT(*) - COUNT(image_url) AS still_without_image
FROM products;
