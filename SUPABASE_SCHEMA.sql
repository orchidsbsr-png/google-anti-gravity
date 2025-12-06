-- 1. Products Table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  taste_profile TEXT,
  texture_profile TEXT,
  image_path VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Varieties Table
CREATE TABLE varieties (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price_per_kg DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Inventory Table
CREATE TABLE inventory (
  id SERIAL PRIMARY KEY,
  variety_id INTEGER NOT NULL REFERENCES varieties(id) ON DELETE CASCADE,
  stock_5kg INTEGER DEFAULT 0,
  stock_10kg INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(variety_id)
);

-- 4. Orders Table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_details JSONB NOT NULL,
  cart_items JSONB NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Settings Table
CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  shop_open BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- 6. Indexes
CREATE INDEX idx_varieties_product_id ON varieties(product_id);
CREATE INDEX idx_inventory_variety_id ON inventory(variety_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- 7. Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE varieties ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies
CREATE POLICY "Public can read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public can read varieties" ON varieties FOR SELECT USING (true);
CREATE POLICY "Public can read inventory" ON inventory FOR SELECT USING (true);
CREATE POLICY "Public can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Public can update inventory" ON inventory FOR UPDATE USING (true);
CREATE POLICY "Public can update settings" ON settings FOR UPDATE USING (true);
CREATE POLICY "Public can insert inventory" ON inventory FOR INSERT WITH CHECK (true);

-- 9. Insert Sample Products
INSERT INTO products (name, category, description, taste_profile, texture_profile, image_path) VALUES
('Red Apples', 'apples', 'Fresh, crisp, and sweet red apples. Hand-picked from our orchard, perfect for snacking or baking.', 'Sweet with a hint of tartness', 'Crisp and juicy', '/images/products/Red Delicious.png'),
('Orange Persimmons', 'persimmons', 'Sweet and juicy orange persimmons. Rich in vitamins and perfect for a healthy snack.', 'Very sweet with honey-like flavor and subtle cinnamon notes', 'Smooth and custard-like when ripe, jelly-like interior', '/images/products/Orange Persimmons.png'),
('Fuzzy Kiwis', 'kiwis', 'Tangy and sweet fuzzy kiwis. Rich in vitamin C, perfect for smoothies or eating fresh.', 'Tangy and sweet with tropical notes, slightly tart', 'Soft and juicy with tiny edible black seeds, smooth flesh', '/images/products/Fuzzy Kiwis.png'),
('Plums', 'plums', 'Sweet and tart plums. Perfect for snacking or making preserves.', 'Sweet with a pleasant tartness, slightly floral', 'Firm yet tender, juicy with smooth skin', '/images/products/Plums.png'),
('Pears', 'pears', 'Sweet, juicy, and crunchy with a hint of floral aroma. Hand-picked from our family orchard.', 'Sweet with a hint of floral aroma', 'Juicy and crunchy', '/images/products/landscape.jpg'),
('Cherries', 'cherries', 'Sweet and juicy cherries. Perfect for snacking, baking, or making preserves.', 'Sweet and slightly tart with a rich, fruity flavor', 'Firm and crisp, bursting with juice', '/images/products/Cherries.png');

-- 10. Insert Varieties
-- Apples
INSERT INTO varieties (product_id, name, price_per_kg) VALUES
(1, 'Red Delicious', 399),
(1, 'Granny Smith', 429),
(1, 'Gala', 449),
(1, 'Golden Delicious', 419);

-- Pears
INSERT INTO varieties (product_id, name, price_per_kg) VALUES
(5, 'Nashpati Pear', 449),
(5, 'Bosc Pear', 479),
(5, 'Concorde Pear', 499),
(5, 'French Butter Pear', 529);

-- Products without varieties (create single variety for each)
INSERT INTO varieties (product_id, name, price_per_kg) VALUES
(2, 'Orange Persimmons', 649),
(3, 'Fuzzy Kiwis', 479),
(4, 'Plums', 299),
(6, 'Cherries', 599);

-- 11. Insert Initial Inventory
INSERT INTO inventory (variety_id, stock_5kg, stock_10kg, is_active) VALUES
(1, 50, 30, true),  -- Red Delicious
(2, 40, 25, true),  -- Granny Smith
(3, 35, 20, true),  -- Gala
(4, 45, 28, true),  -- Golden Delicious
(5, 30, 15, true),  -- Nashpati Pear
(6, 25, 12, true),  -- Bosc Pear
(7, 20, 10, true),  -- Concorde Pear
(8, 15, 8, true),   -- French Butter Pear
(9, 30, 15, true),  -- Orange Persimmons
(10, 25, 12, true), -- Fuzzy Kiwis
(11, 40, 20, true), -- Plums
(12, 20, 10, true); -- Cherries

-- 12. Initialize Settings
INSERT INTO settings (id, shop_open) VALUES (1, true);
