-- Database initialization script for Boutique Microservices
-- This file will be executed when PostgreSQL container starts

-- ============================================================
-- AUTH DB
-- ============================================================
\c auth_db

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@boutique.com', '$2a$10$placeholder_hash', 'Admin', 'User', 'admin'),
('customer@boutique.com', '$2a$10$placeholder_hash', 'John', 'Doe', 'customer');

-- ============================================================
-- PRODUCTS DB
-- ============================================================
\c products_db

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    description TEXT,
    short_description TEXT,
    sku VARCHAR(100),
    brand VARCHAR(100),
    category_id UUID REFERENCES categories(id),
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2),
    materials TEXT,
    care_instructions TEXT,
    inventory_quantity INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (id, name, description) VALUES
('10000000-0000-0000-0000-000000000001', 'Dresses', 'Elegant dresses for special occasions'),
('10000000-0000-0000-0000-000000000002', 'Accessories', 'Luxury accessories and fashion items'),
('10000000-0000-0000-0000-000000000003', 'Bags', 'Designer handbags and tote bags'),
('10000000-0000-0000-0000-000000000004', 'Outerwear', 'Coats and jackets'),
('10000000-0000-0000-0000-000000000005', 'Shoes', 'Designer footwear and heels'),
('10000000-0000-0000-0000-000000000006', 'Clothing', 'Elevated wardrobe essentials'),
('10000000-0000-0000-0000-000000000007', 'Jewelry', 'Fine jewelry and statement pieces');

INSERT INTO products (id, name, slug, description, short_description, sku, brand, category_id, price, compare_price, inventory_quantity, is_featured) VALUES
(gen_random_uuid(), 'Silk Evening Gown', 'silk-evening-gown',
'Beautiful floor-length gown crafted from premium silk', 'Luxurious silk evening gown', 'LEG-001', 'LUXE BOUTIQUE',
'10000000-0000-0000-0000-000000000001', 1899.00, 2299.00, 15, true),

(gen_random_uuid(), 'Cashmere Coat', 'cashmere-coat',
'Elegant wool and cashmere blend coat for winter', 'Warm luxury coat', 'COAT-001', 'LUXE BOUTIQUE',
'10000000-0000-0000-0000-000000000004', 899.00, 1200.00, 20, true),

(gen_random_uuid(), 'Leather Handbag', 'leather-handbag',
'Premium Italian leather tote bag', 'Luxury leather tote', 'BAG-001', 'LUXE BOUTIQUE',
'10000000-0000-0000-0000-000000000003', 599.00, 799.00, 25, true),

(gen_random_uuid(), 'Diamond Necklace', 'diamond-necklace',
'Stunning diamond pendant necklace', 'Elegant diamond jewelry', 'JWL-001', 'LUXE BOUTIQUE',
'10000000-0000-0000-0000-000000000004', 2999.00, 3999.00, 10, true),

(gen_random_uuid(), 'Designer Heels', 'designer-heels',
'Elegant stiletto heels in premium leather', 'Luxury high heels', 'SHOES-001', 'LUXE BOUTIQUE',
'10000000-0000-0000-0000-000000000005', 499.00, 699.00, 18, true);

INSERT INTO products (id, name, slug, description, short_description, sku, brand, category_id, price, compare_price, inventory_quantity, is_featured) VALUES
(gen_random_uuid(), 'Satin Midi Dress', 'satin-midi-dress', 'A fluid satin midi dress with a softly draped neckline, made for evenings that call for understated glamour.', 'Fluid satin and an elegant drape', 'DRESS-002', 'LUXE BOUTIQUE', '10000000-0000-0000-0000-000000000001', 749.00, 895.00, 12, true),
(gen_random_uuid(), 'Silk Blouse', 'silk-blouse', 'A refined silk blouse with a relaxed fit and delicate mother-of-pearl buttons.', 'An everyday silk essential', 'TOP-001', 'LUXE BOUTIQUE', '10000000-0000-0000-0000-000000000006', 329.00, 395.00, 22, false),
(gen_random_uuid(), 'Tailored Wool Blazer', 'tailored-wool-blazer', 'A beautifully structured wool blazer with a clean single-button profile and considered finishing.', 'Modern tailoring in fine wool', 'BLAZER-001', 'LUXE BOUTIQUE', '10000000-0000-0000-0000-000000000006', 689.00, 820.00, 9, true),
(gen_random_uuid(), 'Pleated Midi Skirt', 'pleated-midi-skirt', 'A movement-rich pleated skirt cut from a lightweight fabric with a flattering high waist.', 'Soft movement, polished shape', 'SKIRT-001', 'LUXE BOUTIQUE', '10000000-0000-0000-0000-000000000006', 289.00, 345.00, 16, false),
(gen_random_uuid(), 'Classic Leather Clutch', 'classic-leather-clutch', 'A compact Italian leather clutch with a detachable chain strap and secure magnetic closure.', 'A polished finishing touch', 'BAG-002', 'LUXE BOUTIQUE', '10000000-0000-0000-0000-000000000003', 425.00, 510.00, 14, true),
(gen_random_uuid(), 'Cashmere Scarf', 'cashmere-scarf', 'A feather-soft pure cashmere scarf, finished with a subtle fringe and generous wrap.', 'Pure cashmere, endlessly versatile', 'ACC-001', 'LUXE BOUTIQUE', '10000000-0000-0000-0000-000000000002', 219.00, 260.00, 30, false),
(gen_random_uuid(), 'Sculpted Gold Hoop Earrings', 'sculpted-gold-hoop-earrings', 'Lightweight sculpted hoops with a softly polished gold finish for day-to-evening wear.', 'A modern jewelry signature', 'JWL-002', 'LUXE BOUTIQUE', '10000000-0000-0000-0000-000000000007', 189.00, 225.00, 25, true),
(gen_random_uuid(), 'Freshwater Pearl Bracelet', 'freshwater-pearl-bracelet', 'A delicate strand of luminous freshwater pearls finished with a fine gold-plated clasp.', 'Natural pearls, timeless appeal', 'JWL-003', 'LUXE BOUTIQUE', '10000000-0000-0000-0000-000000000007', 265.00, 315.00, 18, false),
(gen_random_uuid(), 'Leather Ankle Boots', 'leather-ankle-boots', 'Versatile ankle boots crafted in supple leather with a comfortable block heel.', 'The seasonless leather boot', 'SHOES-002', 'LUXE BOUTIQUE', '10000000-0000-0000-0000-000000000005', 579.00, 695.00, 11, true),
(gen_random_uuid(), 'Suede Loafers', 'suede-loafers', 'Soft suede loafers with a cushioned leather insole and refined apron stitching.', 'Comfort meets quiet luxury', 'SHOES-003', 'LUXE BOUTIQUE', '10000000-0000-0000-0000-000000000005', 395.00, 470.00, 20, false),
(gen_random_uuid(), 'Double-Faced Wool Coat', 'double-faced-wool-coat', 'A clean-lined, double-faced wool coat with a relaxed silhouette and a self-tie belt.', 'A forever outerwear piece', 'COAT-002', 'LUXE BOUTIQUE', '10000000-0000-0000-0000-000000000004', 1129.00, 1350.00, 7, true),
(gen_random_uuid(), 'Structured Mini Handbag', 'structured-mini-handbag', 'A compact structured handbag in smooth leather, sized for essentials and finished with gold-tone hardware.', 'Small silhouette, considered detail', 'BAG-003', 'LUXE BOUTIQUE', '10000000-0000-0000-0000-000000000003', 645.00, 770.00, 13, true);

-- ============================================================
-- ORDERS DB
-- ============================================================
\c orders_db

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    shipping_address TEXT,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50) NOT NULL DEFAULT 'cash_on_delivery',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
