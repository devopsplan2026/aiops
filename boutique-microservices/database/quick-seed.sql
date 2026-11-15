\connect products_db

INSERT INTO categories (id, name, description) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Dresses', 'Elegant dresses for special occasions'),
  ('10000000-0000-0000-0000-000000000002', 'Accessories', 'Luxury accessories and fashion items'),
  ('10000000-0000-0000-0000-000000000003', 'Bags', 'Designer handbags and tote bags'),
  ('10000000-0000-0000-0000-000000000004', 'Outerwear', 'Coats and jackets'),
  ('10000000-0000-0000-0000-000000000005', 'Shoes', 'Designer footwear and heels'),
  ('10000000-0000-0000-0000-000000000006', 'Clothing', 'Elevated wardrobe essentials'),
  ('10000000-0000-0000-0000-000000000007', 'Jewelry', 'Fine jewelry and statement pieces')
ON CONFLICT (id) DO NOTHING;

WITH seed_products (name, slug, description, short_description, sku, category_id, price, compare_price, inventory_quantity, is_featured) AS (
  VALUES
    ('Silk Evening Gown', 'silk-evening-gown', 'Beautiful floor-length gown crafted from premium silk', 'Luxurious silk evening gown', 'LEG-001', '10000000-0000-0000-0000-000000000001'::uuid, 1899.00, 2299.00, 15, true),
    ('Cashmere Coat', 'cashmere-coat', 'Elegant wool and cashmere blend coat for winter', 'Warm luxury coat', 'COAT-001', '10000000-0000-0000-0000-000000000004'::uuid, 899.00, 1200.00, 20, true),
    ('Leather Handbag', 'leather-handbag', 'Premium Italian leather tote bag', 'Luxury leather tote', 'BAG-001', '10000000-0000-0000-0000-000000000003'::uuid, 599.00, 799.00, 25, true),
    ('Diamond Necklace', 'diamond-necklace', 'Stunning diamond pendant necklace', 'Elegant diamond jewelry', 'JWL-001', '10000000-0000-0000-0000-000000000007'::uuid, 2999.00, 3999.00, 10, true),
    ('Designer Heels', 'designer-heels', 'Elegant stiletto heels in premium leather', 'Luxury high heels', 'SHOES-001', '10000000-0000-0000-0000-000000000005'::uuid, 499.00, 699.00, 18, true),
    ('Satin Midi Dress', 'satin-midi-dress', 'A fluid satin midi dress with a softly draped neckline, made for evenings that call for understated glamour.', 'Fluid satin and an elegant drape', 'DRESS-002', '10000000-0000-0000-0000-000000000001'::uuid, 749.00, 895.00, 12, true),
    ('Silk Blouse', 'silk-blouse', 'A refined silk blouse with a relaxed fit and delicate mother-of-pearl buttons.', 'An everyday silk essential', 'TOP-001', '10000000-0000-0000-0000-000000000006'::uuid, 329.00, 395.00, 22, false),
    ('Tailored Wool Blazer', 'tailored-wool-blazer', 'A beautifully structured wool blazer with a clean single-button profile and considered finishing.', 'Modern tailoring in fine wool', 'BLAZER-001', '10000000-0000-0000-0000-000000000006'::uuid, 689.00, 820.00, 9, true),
    ('Pleated Midi Skirt', 'pleated-midi-skirt', 'A movement-rich pleated skirt cut from a lightweight fabric with a flattering high waist.', 'Soft movement, polished shape', 'SKIRT-001', '10000000-0000-0000-0000-000000000006'::uuid, 289.00, 345.00, 16, false),
    ('Classic Leather Clutch', 'classic-leather-clutch', 'A compact Italian leather clutch with a detachable chain strap and secure magnetic closure.', 'A polished finishing touch', 'BAG-002', '10000000-0000-0000-0000-000000000003'::uuid, 425.00, 510.00, 14, true),
    ('Cashmere Scarf', 'cashmere-scarf', 'A feather-soft pure cashmere scarf, finished with a subtle fringe and generous wrap.', 'Pure cashmere, endlessly versatile', 'ACC-001', '10000000-0000-0000-0000-000000000002'::uuid, 219.00, 260.00, 30, false),
    ('Sculpted Gold Hoop Earrings', 'sculpted-gold-hoop-earrings', 'Lightweight sculpted hoops with a softly polished gold finish for day-to-evening wear.', 'A modern jewelry signature', 'JWL-002', '10000000-0000-0000-0000-000000000007'::uuid, 189.00, 225.00, 25, true),
    ('Freshwater Pearl Bracelet', 'freshwater-pearl-bracelet', 'A delicate strand of luminous freshwater pearls finished with a fine gold-plated clasp.', 'Natural pearls, timeless appeal', 'JWL-003', '10000000-0000-0000-0000-000000000007'::uuid, 265.00, 315.00, 18, false),
    ('Leather Ankle Boots', 'leather-ankle-boots', 'Versatile ankle boots crafted in supple leather with a comfortable block heel.', 'The seasonless leather boot', 'SHOES-002', '10000000-0000-0000-0000-000000000005'::uuid, 579.00, 695.00, 11, true),
    ('Suede Loafers', 'suede-loafers', 'Soft suede loafers with a cushioned leather insole and refined apron stitching.', 'Comfort meets quiet luxury', 'SHOES-003', '10000000-0000-0000-0000-000000000005'::uuid, 395.00, 470.00, 20, false),
    ('Double-Faced Wool Coat', 'double-faced-wool-coat', 'A clean-lined, double-faced wool coat with a relaxed silhouette and a self-tie belt.', 'A forever outerwear piece', 'COAT-002', '10000000-0000-0000-0000-000000000004'::uuid, 1129.00, 1350.00, 7, true),
    ('Structured Mini Handbag', 'structured-mini-handbag', 'A compact structured handbag in smooth leather, sized for essentials and finished with gold-tone hardware.', 'Small silhouette, considered detail', 'BAG-003', '10000000-0000-0000-0000-000000000003'::uuid, 645.00, 770.00, 13, true)
)
INSERT INTO products (id, name, slug, description, short_description, sku, brand, category_id, price, compare_price, inventory_quantity, is_featured)
SELECT gen_random_uuid(), p.name, p.slug, p.description, p.short_description, p.sku, 'LUXE BOUTIQUE', p.category_id, p.price, p.compare_price, p.inventory_quantity, p.is_featured
FROM seed_products p
WHERE NOT EXISTS (SELECT 1 FROM products existing WHERE existing.sku = p.sku);
