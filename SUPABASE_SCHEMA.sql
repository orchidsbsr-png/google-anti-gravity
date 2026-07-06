-- ============================================================
-- FARM FRESH — Supabase schema (v2, matches the current app)
-- Run this whole file in: Supabase Dashboard → SQL Editor → New query
-- Safe to re-run: drops and recreates everything.
-- ============================================================

-- ---------- Reset (safe on a fresh project) ----------
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- ---------- 1. Inventory (one row per variety) ----------
-- pack_sizes: [{ "weight": 5, "stock": 50, "price": 1995 }, ...]
CREATE TABLE inventory (
  variety_id INTEGER PRIMARY KEY,
  is_active BOOLEAN DEFAULT true,
  is_bestseller BOOLEAN DEFAULT false,
  price_per_kg NUMERIC(10, 2) DEFAULT 0,
  pack_sizes JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- 2. Settings (single row) ----------
CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  shop_open BOOLEAN DEFAULT true,
  now_picking TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- 3. Orders ----------
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  customer_details JSONB NOT NULL,
  cart_items JSONB NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_details JSONB,
  is_gift BOOLEAN DEFAULT false,
  gift_note TEXT DEFAULT '',
  awb_number TEXT,
  cancellation_requested BOOLEAN DEFAULT false,
  cancellation_requested_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX idx_orders_user_id ON orders (user_id);
CREATE INDEX idx_orders_email ON orders ((customer_details->>'email'));
CREATE INDEX idx_orders_awb ON orders (awb_number);

-- ---------- 4. Addresses (one row per saved address) ----------
-- data: { name, phone, pincode, addressLine1, addressLine2, city, state, addressType }
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_addresses_user_id ON addresses (user_id);

-- ---------- 5. Carts (one row per cart line) ----------
-- item_id: "<varietyId>-<weightKg>" (same key the app used before)
CREATE TABLE carts (
  user_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, item_id)
);

-- ---------- 5b. Push subscriptions (web push, one row per device) ----------
CREATE TABLE push_subscriptions (
  endpoint TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_push_user ON push_subscriptions (user_id);

-- ---------- 5c. Abandoned-cart reminder log (server-only) ----------
CREATE TABLE cart_reminders (
  user_id TEXT PRIMARY KEY,
  sent_at TIMESTAMPTZ NOT NULL
);

-- ---------- 6. Row Level Security ----------
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

-- Everyone can read the catalog state
CREATE POLICY "read inventory" ON inventory FOR SELECT USING (true);
CREATE POLICY "read settings" ON settings FOR SELECT USING (true);

-- NOTE: the admin dashboard runs in the browser behind a client-side
-- password, exactly like the Firestore version did. These write policies
-- mirror that existing behavior. When you later move admin auth
-- server-side, tighten these to a role check.
CREATE POLICY "write inventory" ON inventory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "write settings" ON settings FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "update orders" ON orders FOR UPDATE USING (true);
CREATE POLICY "delete orders" ON orders FOR DELETE USING (true);

-- Addresses/carts: owner (or shared guest account) only
CREATE POLICY "own addresses" ON addresses FOR ALL
  USING (user_id = auth.uid()::text OR user_id LIKE 'guest%')
  WITH CHECK (user_id = auth.uid()::text OR user_id LIKE 'guest%');

CREATE POLICY "own carts" ON carts FOR ALL
  USING (user_id = auth.uid()::text OR user_id LIKE 'guest%')
  WITH CHECK (user_id = auth.uid()::text OR user_id LIKE 'guest%');

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own push subscriptions" ON push_subscriptions FOR ALL
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

ALTER TABLE cart_reminders ENABLE ROW LEVEL SECURITY; -- service-role only

-- ---------- 7. Realtime (live updates like Firestore onSnapshot) ----------
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE settings;
ALTER PUBLICATION supabase_realtime ADD TABLE carts;
ALTER PUBLICATION supabase_realtime ADD TABLE addresses;

-- ---------- 8. Seed data ----------
INSERT INTO settings (id, shop_open, now_picking) VALUES (1, true, NULL);

-- variety_ids must match src/data/mockData.js
INSERT INTO inventory (variety_id, is_active, is_bestseller, price_per_kg, pack_sizes) VALUES
(1,  true, true,  399, '[{"weight":5,"stock":50,"price":1995},{"weight":10,"stock":30,"price":3990}]'),
(2,  true, false, 429, '[{"weight":5,"stock":40,"price":2145},{"weight":10,"stock":25,"price":4290}]'),
(3,  true, false, 449, '[{"weight":5,"stock":35,"price":2245},{"weight":10,"stock":20,"price":4490}]'),
(4,  true, false, 419, '[{"weight":5,"stock":45,"price":2095},{"weight":10,"stock":28,"price":4190}]'),
(5,  true, false, 449, '[{"weight":5,"stock":30,"price":2245},{"weight":10,"stock":15,"price":4490}]'),
(6,  true, false, 479, '[{"weight":5,"stock":25,"price":2395},{"weight":10,"stock":12,"price":4790}]'),
(7,  true, false, 499, '[{"weight":5,"stock":20,"price":2495},{"weight":10,"stock":10,"price":4990}]'),
(8,  true, false, 529, '[{"weight":5,"stock":15,"price":2645},{"weight":10,"stock":8,"price":5290}]'),
(9,  true, false, 649, '[{"weight":5,"stock":30,"price":3245},{"weight":10,"stock":15,"price":6490}]'),
(10, true, false, 479, '[{"weight":5,"stock":25,"price":2395},{"weight":10,"stock":12,"price":4790}]'),
(11, true, false, 299, '[{"weight":5,"stock":40,"price":1495},{"weight":10,"stock":20,"price":2990}]'),
(12, true, false, 599, '[{"weight":5,"stock":20,"price":2995},{"weight":10,"stock":10,"price":5990}]'),
(13, true, false, 649, '[{"weight":5,"stock":25,"price":3245},{"weight":10,"stock":12,"price":6490}]');
